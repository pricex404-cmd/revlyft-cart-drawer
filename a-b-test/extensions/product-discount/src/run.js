// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.All,
  discounts: [],
};

/**
 * Generate a consistent hash for a user identifier to ensure consistent test group assignment
 * @param {string} identifier - The user identifier to hash (IP address, customer ID, etc.)
 * @returns {number} - A value between 0 and 100
 */
function generateConsistentHash(identifier) {
  let hash = 0;
  if (identifier.length === 0) return hash;

  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to a value between 0 and 100
  return Math.abs(hash % 100);
}

/**
 * Check if user is excluded from pricing tests based on targeting attributes
 * @param {RunInput} input - The Shopify function input
 * @returns {boolean} - True if user should be excluded from pricing tests
 */
function isUserExcludedFromPricingTestsTargetingCheck(input) {
  const testTargetingAttribute = input?.cart?.testTargetingAttribute?.value;
  
  if (!testTargetingAttribute) {
    return false;
  }

  try {
    const testData = JSON.parse(testTargetingAttribute);

    // Check if user is NOT targeted for any active pricing tests
    for (const [testKey, isTargeted] of Object.entries(testData)) {
      if (isTargeted === 'false' && testKey.includes('_pricing_active')) {
        return true;
      }
    }
  } catch (error) {
    // Continue processing if test data parsing fails
    return false;
  }

  return false;
}

/**
 * Determine which test group the user belongs to based on IP and hash attributes
 * @param {RunInput} input - The Shopify function input
 * @param {any[]} testGroups - Array of test groups with percentage distributions
 * @returns {any|null} - The assigned test group or null if no group assigned
 */
function getUserTestGroup(input, testGroups) {
  const userIpAttribute = input?.cart?.userIpAttribute?.value;

  // Calculate user hash value
  const userHashValue = input?.cart?.hashValueAttribute?.value 
    ? parseInt(input.cart.hashValueAttribute.value, 10)
    : userIpAttribute 
      ? generateConsistentHash(userIpAttribute)
      : 0;

  // Use weighted random assignment based on percentages
  let percentageThreshold = 0;
  for (const testGroup of testGroups) {
    percentageThreshold += testGroup.percentage;
    
    if (userHashValue < percentageThreshold) {
      return testGroup;
    }
  }

  return null;
}

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  // Try to get configuration from metafield or use default value
  let configuration = {};

  try {
    configuration = JSON.parse(
      input?.discountNode?.metafield?.value ?? "{}"
    );
  } catch (error) {
    configuration = {};
  }

  // Get test groups from configuration or use default
  // @ts-ignore - configuration is parsed JSON object
  const testGroups = configuration.testVariants || [];

  if (testGroups.length === 0) {
    return EMPTY_DISCOUNT;
  }

  // Check if user should be excluded from pricing tests based ON TARGETING AUDIENCE JSON
  if (isUserExcludedFromPricingTestsTargetingCheck(input)) {
    return EMPTY_DISCOUNT;
  }

  // Determine which test group the user belongs to
  const assignedTestGroup = getUserTestGroup(input, testGroups);

  // If no test group was assigned, return empty discount
  if (!assignedTestGroup) {
    return EMPTY_DISCOUNT;
  }

  // Check if user is in control group (no discounts)
  const isControlGroup = assignedTestGroup === testGroups[0];

  // Get cart lines and process discounts
  const lines = input?.cart?.lines || [];
  const discounts = [];

  // Check each line to see if it's eligible for a discount
  for (const line of lines) {
    // Skip if not a product variant
    if (line?.merchandise?.__typename !== "ProductVariant") {
      continue;
    }

    // Skip applying discounts if it's the control group
    if (isControlGroup) {
      continue;
    }

    const productId = line?.merchandise?.product?.id || "";
    const variantId = line?.merchandise?.id || "";
    const lineQuantity = line?.quantity || 1;

    // Extract the numeric part from the product ID and variant ID
    const numericProductId = productId.split("/").pop();
    const numericVariantId = variantId.split("/").pop();

    if (!numericProductId || !assignedTestGroup.products ||
      !(numericProductId in assignedTestGroup.products)) {
      continue;
    }

    const productConfig = assignedTestGroup.products[numericProductId];

    if (!productConfig || typeof productConfig !== 'object') {
      continue;
    }

    let discountPercentage;
    let fixedAmountOff;

    // Get the actual price per item from the cart
    // @ts-ignore - cart line cost property exists at runtime
    let cartPrice = parseFloat(line?.cost?.amountPerQuantity?.amount || '0');

    // If line cost is not available, calculate price per item from this line's total
    if (cartPrice === 0) {
      // @ts-ignore - cart line cost property exists at runtime
      const lineTotalAmount = parseFloat(line?.cost?.totalAmount?.amount || '0');
      const lineQuantity = line?.quantity || 1;
      cartPrice = lineQuantity > 0 ? lineTotalAmount / lineQuantity : 0;
    }

    // Check if this is a multi-variant product
    if (productConfig.isMultiVariant && productConfig.variants && numericVariantId) {
      // Handle multi-variant product - get variant-specific discount data
      const variantConfig = productConfig.variants[numericVariantId];

      if (!variantConfig || typeof variantConfig !== 'object') {
        continue;
      }

      discountPercentage = Number(variantConfig.discountPercentage);
      fixedAmountOff = Number(variantConfig.fixedAmountOff);
    } else {
      // Handle single variant product - use existing logic
      discountPercentage = Number(productConfig.discountPercentage);
      fixedAmountOff = Number(productConfig.fixedAmountOff);
    }

    // Skip if cart price is invalid
    if (isNaN(cartPrice) || cartPrice <= 0) {
      continue;
    }

    // Apply fixed amount discount only
    if (!isNaN(fixedAmountOff) && fixedAmountOff > 0) {
      // Calculate total discount amount by multiplying by quantity
      const totalDiscountAmount = fixedAmountOff * lineQuantity;
      
      discounts.push({
        value: {
          fixedAmount: {
            amount: totalDiscountAmount.toString()
          }
        },
        targets: [{
          productVariant: {
            id: line.merchandise.id
          }
        }],
        message: `Exclusive offer for you`
      });
    }
  }

  // If there are no eligible discounts, return empty discount
  if (discounts.length === 0) {
    return EMPTY_DISCOUNT;
  }

  // Return all discounts
  return {
    discountApplicationStrategy: DiscountApplicationStrategy.All,
    discounts: discounts
  };
}