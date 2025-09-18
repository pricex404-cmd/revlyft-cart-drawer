/**
 * Functions related to product discount creation
 */

import {
  DISCOUNT_AUTOMATIC_DELETE,
  GET_DISCOUNT_AUTOMATIC_APP,
  GET_DISCOUNT_AUTOMATIC_APPS,
  DISCOUNT_AUTOMATIC_ACTIVATE,
  DISCOUNT_AUTOMATIC_DEACTIVATE
} from "../utils/graphqlQueries";
import { closeOpenSessions } from "./timer";

/**
 * Optimizes testVariants data by keeping only fields that are actually used in run.js
 * This significantly reduces metafield size for large test configurations
 * 
 * @param {Array} testVariants - Array of test variants with discount and user percentages
 * @returns {string} The formatted GraphQL query
 */
export function formatGQLQuery(functionId, title, productId, startsAt, endsAt, method, testVariants) {
  try {
    // Log input parameters


    // Optimize test variants to reduce metafield size (simple optimization only)
    const optimizedTestVariants = testVariants.map(variant => ({
      // Only keep percentage - used for variant selection
      percentage: variant.percentage,

      // Only keep products with optimized structure
      products: Object.entries(variant.products || {}).reduce((acc, [productId, productData]) => {
        const optimizedProduct = {
          // Keep isMultiVariant - used to determine product type
          isMultiVariant: productData.isMultiVariant
        };

        // For single variant products, keep discountPercentage at product level
        if (!productData.isMultiVariant) {
          optimizedProduct.discountPercentage = productData.discountPercentage;
        }

        // For all products, keep optimized variants (only discountPercentage)
        if (productData.variants) {
          optimizedProduct.variants = Object.entries(productData.variants).reduce((variantAcc, [variantId, variantData]) => {
            variantAcc[variantId] = {
              // Only keep discountPercentage - used for discount calculation
              discountPercentage: variantData.discountPercentage
            };
            return variantAcc;
          }, {});
        }

        acc[productId] = optimizedProduct;
        return acc;
      }, {})
    }));



    // Create the metafield configuration object
    const metafieldConfig = { testVariants: optimizedTestVariants };


    // Convert to JSON string and properly escape for GraphQL
    const metafieldJsonString = JSON.stringify(metafieldConfig);
    const escapedJsonString = metafieldJsonString.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    // Debug: Log the final metafield value that will be saved
    console.log('💾 Optimized metafield value:', metafieldJsonString);
    console.log('📏 Optimized metafield length:', metafieldJsonString.length);
    console.log('🎯 Original vs Optimized size reduction:',
      `${JSON.stringify({ testVariants }).length} -> ${metafieldJsonString.length} bytes`);

    // Log size information but don't throw error (handled upstream)
    if (metafieldJsonString.length > 10000) {

      console.warn('⚠️ Warning: Metafield size exceeds 10KB limit for discount functions:', metafieldJsonString.length, 'bytes');
    } else if (metafieldJsonString.length > 8000) {

      console.warn('⚠️ Warning: Metafield size is approaching the 10KB limit:', metafieldJsonString.length, 'bytes');
    }

    const graphqlQuery = `
      mutation {
        discountAutomaticAppCreate(
          automaticAppDiscount: {
            title: "${title.replace(/"/g, '\\"')}"
            functionId: "${functionId}"
            startsAt: "${startsAt}"
            endsAt: "${endsAt}"
            metafields: [
              {
                namespace: "$app:product-discount"
                key: "function-configuration"
                type: "json"
                value: "${escapedJsonString}"
              }
            ]
          }
        ) {
          automaticAppDiscount {
            discountId
            title
            startsAt
            endsAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;



    return graphqlQuery;
  } catch (error) {

    console.error('❌ Error formatting GraphQL query:', error);
    throw new Error(`Failed to format GraphQL query: ${error.message}`);
  }
}



/**
 * Creates a product discount with test variants
 * 
 * @param {Object} admin - The Shopify admin client
 * @param {string} title - The title of the discount
 * @param {string} functionId - The ID of the discount function
 * @param {Array} testVariants - Array of test variants with discount and user percentages
 * @param {string|Date} [startDate] - Optional start date (ISO string or Date object)
 * @param {string|Date} [endDate] - Optional end date (ISO string or Date object)
 * @returns {Object} The result of the discount creation
 */
export async function createProductDiscount(admin, title, functionId, testVariants, startDate, endDate) {
  try {


    // Pre-check metafield size before attempting to create discount
    // Use original optimization without ultra-optimization to avoid run.js changes
    const optimizedTestVariants = testVariants.map(variant => ({
      // Only keep percentage - used for variant selection
      percentage: variant.percentage,

      // Only keep products with optimized structure
      products: Object.entries(variant.products || {}).reduce((acc, [productId, productData]) => {
        const optimizedProduct = {
          // Keep isMultiVariant - used to determine product type
          isMultiVariant: productData.isMultiVariant
        };

        // For single variant products, keep discountPercentage at product level
        if (!productData.isMultiVariant) {
          optimizedProduct.discountPercentage = productData.discountPercentage;
        }

        // For all products, keep optimized variants (only discountPercentage)
        if (productData.variants) {
          optimizedProduct.variants = Object.entries(productData.variants).reduce((variantAcc, [variantId, variantData]) => {
            variantAcc[variantId] = {
              // Only keep discountPercentage - used for discount calculation
              discountPercentage: variantData.discountPercentage
            };
            return variantAcc;
          }, {});
        }

        acc[productId] = optimizedProduct;
        return acc;
      }, {})
    }));

    const metafieldConfig = { testVariants: optimizedTestVariants };
    const metafieldJsonString = JSON.stringify(metafieldConfig);


    // If metafield exceeds 10KB limit, don't create discount and return error
    if (metafieldJsonString.length > 10000) {
      const errorMessage = `Cannot Start the Test: Please reduce the number of products or test groups to continue.`;


      console.error('❌ Preventing discount creation due to size limit:', metafieldJsonString.length, 'bytes');

      return {
        discountCreated: false,
        errors: [{
          field: 'metafield_size',
          message: errorMessage,
          code: 'METAFIELD_SIZE_EXCEEDED'
        }],
        sizeLimitExceeded: true,
        currentSize: metafieldJsonString.length,
        maxSize: 10000,
        discount: null
      };
    }

    // Format dates in ISO format without timezone information
    let startsAt, endsAt;
    console.log('🎯 Creating discount with', testVariants.length, 'test variants');

    // Use provided startDate or default to now
    if (startDate) {
      startsAt = startDate instanceof Date ? startDate.toISOString() : startDate;
    } else {
      const now = new Date();
      startsAt = now.toISOString();
    }

    // Use provided endDate or default to 30 days from now
    if (endDate) {
      endsAt = endDate instanceof Date ? endDate.toISOString() : endDate;
    } else {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      endsAt = futureDate.toISOString();
    }


    // Generate the GraphQL query (we know it's under 10KB at this point)
    const graphqlQuery = formatGQLQuery(functionId, title, null, startsAt, endsAt, "AUTOMATIC", testVariants);


    console.log('🚀 Sending GraphQL mutation to Shopify...');

    // Create the discount with timeout
    const response = await Promise.race([
      admin.graphql(graphqlQuery),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      )
    ]);

    const responseJson = await response.json();



    console.log('✅ GraphQL response received:', {
      hasErrors: !!responseJson.data?.discountAutomaticAppCreate?.userErrors?.length,
      errorCount: responseJson.data?.discountAutomaticAppCreate?.userErrors?.length || 0
    });

    // Check for GraphQL errors first
    if (responseJson.errors) {

      console.error('❌ GraphQL errors:', responseJson.errors);
      throw new Error(`GraphQL Error: ${responseJson.errors.map(err => err.message).join(', ')}`);
    }

    // Check for user errors
    if (responseJson.data?.discountAutomaticAppCreate?.userErrors?.length > 0) {

      console.error('❌ Shopify API errors:', responseJson.data.discountAutomaticAppCreate.userErrors);
      const errorMessages = responseJson.data.discountAutomaticAppCreate.userErrors.map(err => err.message).join(', ');
      throw new Error(`Shopify API Error: ${errorMessages}`);
    }

    // Validate that we got a proper discount object back
    if (!responseJson.data?.discountAutomaticAppCreate?.automaticAppDiscount?.discountId) {

      console.error('❌ No discount ID returned from Shopify API');
      throw new Error('Discount creation failed: No discount ID returned from Shopify API');
    }

    const createdDiscount = responseJson.data.discountAutomaticAppCreate.automaticAppDiscount;



    return {
      discountCreated: true,
      errors: [],
      sizeLimitExceeded: false,
      currentSize: metafieldJsonString.length,
      maxSize: 10000,
      discount: createdDiscount
    };
  } catch (error) {


    console.error('❌ Error creating discount:', error);

    // Don't expose the 10KB limit error since we handle it above
    if (error.message.includes('10KB limit')) {
      // This shouldn't happen anymore since we check upfront, but just in case
      return {
        discountCreated: false,
        errors: [{
          field: 'metafield_size',
          message: 'Configuration is too large. Please reduce the number of products or test groups.',
          code: 'METAFIELD_SIZE_EXCEEDED'
        }],
        sizeLimitExceeded: true,
        discount: null
      };
    }

    // Provide more specific error information for other errors
    if (error.message.includes('terminated')) {
      throw new Error('Network request was terminated. This may be due to network timeout or Shopify API rate limits. Please try again.');
    } else if (error.message.includes('timeout')) {
      throw new Error('Request timeout. The discount creation took too long. Please try again.');
    } else if (error.message.includes('GraphQL Error') || error.message.includes('Shopify API Error')) {
      // Re-throw API errors as-is
      throw error;
    } else {
      throw new Error(`Discount creation failed: ${error.message}`);
    }
  }
}

/**
 * Deletes a discount by its ID
 * 
 * @param {Object} admin - The Shopify admin client
 * @param {string} discountId - The ID of the discount to delete
 * @returns {Object} The result of the discount deletion
 */
export async function deleteDiscount(admin, discountId) {
  console.log('Attempting to delete discount with ID:', discountId);

  try {
    const response = await admin.graphql(DISCOUNT_AUTOMATIC_DELETE, {
      variables: {
        id: discountId
      }
    });

    const responseJson = await response.json();
    console.log('Delete discount response:', JSON.stringify(responseJson, null, 2));

    if (responseJson.errors) {
      console.error('GraphQL errors:', responseJson.errors);
      throw new Error(responseJson.errors[0]?.message || 'Unknown GraphQL error');
    }

    return {
      discountDeleted: !responseJson.data?.discountAutomaticDelete?.userErrors?.length,
      errors: responseJson.data?.discountAutomaticDelete?.userErrors || [],
      deletedId: responseJson.data?.discountAutomaticDelete?.deletedAutomaticDiscountId
    };
  } catch (error) {
    console.error('Error in deleteDiscount:', error);
    throw error;
  }
}

/**
 * Gets all discounts associated with a test ID
 * 
 * @param {Object} admin - The Shopify admin client
 * @param {string} testId - The ID of the test to find discounts for
 * @param {string} [storedDiscountId] - Optional stored discount ID from Firebase
 * @returns {Array} Array of discounts associated with the test
 */
export async function getDiscountsByTestId(admin, testId, storedDiscountId) {
  // If we have a stored discount ID, try to get that specific discount first
  if (storedDiscountId) {
    try {
      const response = await admin.graphql(GET_DISCOUNT_AUTOMATIC_APP, {
        variables: {
          id: storedDiscountId
        }
      });
      const responseJson = await response.json();

      if (responseJson.data?.discountAutomaticApp) {
        console.log('Found discount using stored ID:', responseJson.data.discountAutomaticApp);
        return [responseJson.data.discountAutomaticApp];
      }
    } catch (error) {
      console.error('Error fetching discount by stored ID:', error);
    }
  }

  // Fall back to searching all discounts if stored ID doesn't work
  const response = await admin.graphql(GET_DISCOUNT_AUTOMATIC_APPS);
  const responseJson = await response.json();

  console.log('All discounts:', JSON.stringify(responseJson.data.discountAutomaticApps.edges, null, 2));

  // Filter discounts that have the test ID in their configuration
  const discounts = responseJson.data.discountAutomaticApps.edges
    .map(edge => edge.node)
    .filter(discount => {
      try {
        const config = discount.metafields.edges[0]?.node?.value;
        if (!config) return false;
        const parsedConfig = JSON.parse(config);
        console.log('Parsed config:', parsedConfig);
        // Check if the discount title contains the test ID
        return discount.title.includes(testId);
      } catch (error) {
        console.error('Error parsing discount configuration:', error);
        return false;
      }
    });

  console.log('Filtered discounts:', JSON.stringify(discounts, null, 2));
  return discounts;
}

export async function activateDiscount(admin, discountId) {
  console.log('Attempting to activate discount with ID:', discountId);

  try {
    const response = await admin.graphql(DISCOUNT_AUTOMATIC_ACTIVATE, {
      variables: {
        id: discountId
      }
    });

    const responseJson = await response.json();
    console.log('Activate discount response:', JSON.stringify(responseJson, null, 2));

    if (responseJson.errors) {
      console.error('GraphQL errors:', responseJson.errors);
      throw new Error(responseJson.errors[0]?.message || 'Unknown GraphQL error');
    }

    const userErrors = responseJson.data?.discountAutomaticActivate?.userErrors || [];
    if (userErrors.length > 0) {
      console.error('User errors:', userErrors);
      throw new Error(userErrors[0]?.message || 'Failed to activate discount');
    }

    return {
      success: true,
      errors: [],
      discount: responseJson.data?.discountAutomaticActivate?.automaticDiscountNode
    };
  } catch (error) {
    console.error('Error in activateDiscount:', error);
    throw error;
  }
}

export async function deactivateDiscount(admin, discountId) {
  console.log('Attempting to deactivate discount with ID:', discountId);

  try {
    const response = await admin.graphql(DISCOUNT_AUTOMATIC_DEACTIVATE, {
      variables: {
        id: discountId
      }
    });

    const responseJson = await response.json();
    console.log('Deactivate discount response:', JSON.stringify(responseJson, null, 2));

    if (responseJson.errors) {
      console.error('GraphQL errors:', responseJson.errors);
      throw new Error(responseJson.errors[0]?.message || 'Unknown GraphQL error');
    }

    const userErrors = responseJson.data?.discountAutomaticDeactivate?.userErrors || [];
    if (userErrors.length > 0) {
      console.error('User errors:', userErrors);
      throw new Error(userErrors[0]?.message || 'Failed to deactivate discount');
    }

    return {
      success: true,
      errors: [],
      discount: responseJson.data?.discountAutomaticDeactivate?.automaticDiscountNode
    };
  } catch (error) {
    console.error('Error in deactivateDiscount:', error);
    throw error;
  }
}

const FIREBASE_DB_URL = "https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app";

/**
 * Deactivates all active tests except for the specified test
 * @param {string} sanitizedDomain - The sanitized shop domain
 * @param {string} shop - The shop URL
 * @param {string} [currentTestId] - Optional ID of the test to exclude from deactivation
 * @returns {Promise<boolean>} - Returns true if successful
 */
/**
 * Deactivates all active pricing tests except for the specified test
 * @param {string} sanitizedDomain - The sanitized shop domain
 * @param {string} shop - The shop URL
 * @param {string} [currentTestId] - Optional ID of the test to exclude from deactivation
 * @returns {Promise<boolean>} - Returns true if successful
 */
export async function deactivateAllActivePriceTests(sanitizedDomain, shop, currentTestId = null) {
  try {
    console.log('🎯 Starting deactivation of all active pricing tests except:', currentTestId);

    // Fetch all tests
    const response = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}.json`);
    const allTests = await response.json();

    if (!response.ok || !allTests) {
      throw new Error('Failed to fetch tests');
    }

    // Find all active PRICING tests except the current one
    const activePricingTests = Object.entries(allTests).filter(([testId, test]) =>
      test.basicInfo?.status === 'active' &&
      test.basicInfo?.type === 'pricing' &&
      testId !== currentTestId
    );

    console.log(`📊 Found ${activePricingTests.length} active pricing tests to deactivate`);

    // Deactivate each active pricing test
    for (const [testId, test] of activePricingTests) {
      const discountId = test.basicInfo?.discountId;
      if (discountId) {
        console.log(`🔄 Deactivating pricing test ${testId} with discount ID ${discountId}`);

        // Call the deactivate API
        const deactivateResponse = await fetch(`/api/mutate-discount?discountId=${discountId}&shop=${shop}&action=deactivate`, {
          method: 'POST'
        });

        if (!deactivateResponse.ok) {
          throw new Error(`Failed to deactivate test ${testId}`);
        }

        // Handle session tracking - close any open sessions
        const currentTime = new Date().toISOString();
        let updatedSessions = test.sessions || [];

        // Close any open sessions
        updatedSessions = closeOpenSessions(updatedSessions, currentTime);

        // Update test status and sessions in Firebase
        const updatedTestData = {
          ...test,
          basicInfo: {
            ...test.basicInfo,
            status: 'deactive',
            lastStatusChange: currentTime
          },
          sessions: updatedSessions
        };

        await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedTestData)
        });

        console.log(`✅ Successfully deactivated pricing test ${testId}`);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Error deactivating pricing tests:', error);
    throw error;
  }
}

/**
 * Deactivates all active discount tests except for the specified test
 * @param {string} sanitizedDomain - The sanitized shop domain
 * @param {string} shop - The shop URL
 * @param {string} [currentTestId] - Optional ID of the test to exclude from deactivation
 * @returns {Promise<boolean>} - Returns true if successful
 */
export async function deactivateAllActiveDiscountTests(sanitizedDomain, shop, currentTestId = null) {
  try {
    console.log('🎯 Starting deactivation of all active discount tests except:', currentTestId);

    // Fetch all tests
    const response = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}.json`);
    const allTests = await response.json();

    if (!response.ok || !allTests) {
      throw new Error('Failed to fetch tests');
    }

    // Find all active discount tests except the current one
    const activeDiscountTests = Object.entries(allTests).filter(([testId, test]) =>
      test.basicInfo?.status === 'active' &&
      test.basicInfo?.type === 'discount' &&
      testId !== currentTestId
    );

    console.log(`📊 Found ${activeDiscountTests.length} active discount tests to deactivate`);

    // Deactivate each active discount test
    for (const [testId, test] of activeDiscountTests) {
      const discountId = test.basicInfo?.discountId;
      if (discountId) {
        console.log(`🔄 Deactivating discount test ${testId} with discount ID ${discountId}`);

        // Call the deactivate API
        const deactivateResponse = await fetch(`/api/mutate-discount?discountId=${discountId}&shop=${shop}&action=deactivate`, {
          method: 'POST'
        });

        if (!deactivateResponse.ok) {
          throw new Error(`Failed to deactivate test ${testId}`);
        }

        // Handle session tracking - close any open sessions
        const currentTime = new Date().toISOString();
        let updatedSessions = test.sessions || [];

        // Close any open sessions
        updatedSessions = closeOpenSessions(updatedSessions, currentTime);

        // Update test status and sessions in Firebase
        const updatedTestData = {
          ...test,
          basicInfo: {
            ...test.basicInfo,
            status: 'deactive',
            lastStatusChange: currentTime
          },
          sessions: updatedSessions
        };

        await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedTestData)
        });

        console.log(`✅ Successfully deactivated discount test ${testId}`);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Error deactivating discount tests:', error);
    throw error;
  }
}

/**
 * Creates a cart discount with test variants
 * 
 * @param {Object} admin - The Shopify admin client
 * @param {string} title - The title of the discount
 * @param {string} functionId - The ID of the discount function
 * @param {Array} testVariants - Array of test variants with discount and user percentages
 * @param {Object} discountConfig - Configuration for the discount (type and threshold)
 * @returns {Object} The result of the discount creation
 */
export async function createCartDiscount(admin, title, functionId, testVariants, discountConfig) {
  try {
    console.log('🛒 Starting cart discount creation:', {
      title,
      functionId,
      testVariantsCount: testVariants.length,
      discountType: discountConfig.type,
      threshold: discountConfig.threshold
    });

    // Create the metafield configuration object
    const metafieldConfig = {
      testVariants: testVariants.map(variant => ({
        name: variant.name,
        percentage: variant.percentage,
        discountPercentageValue: variant.discountPercentageValue
      })),
      discountConfig: {
        type: discountConfig.type || 'value',
        threshold: discountConfig.threshold || '',
        showTimer: typeof discountConfig.showTimer === 'boolean' ? discountConfig.showTimer : false,
        timerMinutes: discountConfig.timerMinutes ?? '30'
      }
    };

    console.log('📊 Cart discount configuration:', {
      variantCount: metafieldConfig.testVariants.length,
      variants: metafieldConfig.testVariants.map(v => ({
        name: v.name,
        percentage: v.percentage
      })),
      discountType: metafieldConfig.discountConfig.type,
      threshold: metafieldConfig.discountConfig.threshold,
      showTimer: metafieldConfig.discountConfig.showTimer,
      timerMinutes: metafieldConfig.discountConfig.timerMinutes
    });

    // Convert to JSON string and properly escape for GraphQL
    const metafieldJsonString = JSON.stringify(metafieldConfig);
    const escapedJsonString = metafieldJsonString.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    // Debug: Log the final metafield value that will be saved
    console.log('💾 Cart discount metafield:', {
      length: metafieldJsonString.length,
      sizeInKB: (metafieldJsonString.length / 1024).toFixed(2)
    });

    // Check metafield size limit
    if (metafieldJsonString.length > 10000) {
      console.error('❌ Cart discount metafield exceeds size limit:', {
        size: metafieldJsonString.length,
        limit: 10000,
        exceededBy: metafieldJsonString.length - 10000
      });
      return {
        discountCreated: false,
        errors: [{
          field: 'metafield_size',
          message: 'Configuration is too large. Please reduce the number of test groups.',
          code: 'METAFIELD_SIZE_EXCEEDED'
        }],
        sizeLimitExceeded: true,
        discount: null
      };
    }

    const graphqlQuery = `
      mutation {
        discountAutomaticAppCreate(
          automaticAppDiscount: {
            title: "${title.replace(/"/g, '\\"')}"
            functionId: "${functionId}"
            startsAt: "${new Date().toISOString()}"
            discountClasses: [ORDER]
            metafields: [
              {
                namespace: "$app:cart-discount"
                key: "function-configuration"
                type: "json"
                value: "${escapedJsonString}"
              }
            ]
          }
        ) {
          automaticAppDiscount {
            discountId
            title
            startsAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await admin.graphql(graphqlQuery);
    const responseJson = await response.json();

    console.log('📡 Cart discount API response received:', {
      hasErrors: !!responseJson.data?.discountAutomaticAppCreate?.userErrors?.length,
      errorCount: responseJson.data?.discountAutomaticAppCreate?.userErrors?.length || 0,
      discountId: responseJson.data?.discountAutomaticAppCreate?.automaticAppDiscount?.discountId
    });

    // Check for user errors
    if (responseJson.data?.discountAutomaticAppCreate?.userErrors?.length > 0) {
      console.error('❌ Cart discount creation failed:', {
        errors: responseJson.data.discountAutomaticAppCreate.userErrors,
        errorMessages: responseJson.data.discountAutomaticAppCreate.userErrors.map(err => err.message)
      });
      const errorMessages = responseJson.data.discountAutomaticAppCreate.userErrors.map(err => err.message).join(', ');
      throw new Error(`Shopify API Error: ${errorMessages}`);
    }

    // Validate that we got a proper discount object back
    if (!responseJson.data?.discountAutomaticAppCreate?.automaticAppDiscount?.discountId) {
      console.error('❌ Cart discount creation failed: No discount ID returned');
      throw new Error('Discount creation failed: No discount ID returned from Shopify API');
    }

    const createdDiscount = responseJson.data.discountAutomaticAppCreate.automaticAppDiscount;
    console.log('✅ Cart discount created successfully:', {
      discountId: createdDiscount.discountId,
      title: createdDiscount.title,
      startsAt: createdDiscount.startsAt
    });

    return {
      discountCreated: true,
      errors: [],
      sizeLimitExceeded: false,
      currentSize: metafieldJsonString.length,
      maxSize: 10000,
      discount: createdDiscount
    };
  } catch (error) {
    console.error('❌ Cart discount creation error:', {
      error: error.message,
      stack: error.stack
    });

    if (error.message.includes('10KB limit')) {
      return {
        discountCreated: false,
        errors: [{
          field: 'metafield_size',
          message: 'Configuration is too large. Please reduce the number of test groups.',
          code: 'METAFIELD_SIZE_EXCEEDED'
        }],
        sizeLimitExceeded: true,
        discount: null
      };
    }

    throw error;
  }
} 