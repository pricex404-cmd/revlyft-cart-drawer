import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import logger from "../utils/logger";
import { closeOpenSessions } from "../functions/timer";
import {
    GET_PRODUCT,
    GET_PRODUCT_VARIANT,
    ADJUST_INVENTORY,
    DUPLICATE_PRODUCT,
    UPDATE_PRODUCT,
    CREATE_PRODUCT_MEDIA
} from "../utils/graphqlQueries";

const FIREBASE_DB_URL = "https://abtest-6b299-default-rtdb.firebaseio.com"
export const action = async ({ request }) => {
    try {
        const { admin } = await authenticate.admin(request);
        const formData = await request.formData();

        // Validate required form data
        const testId = formData.get("testId");
        const shop = formData.get("shop");
        const testDataStr = formData.get("testData");

        await logger.info('Starting product duplication process', { testId, shop });

        if (!testId || !shop || !testDataStr) {
            await logger.error('Missing required form data', { testId, shop, testDataStr: !!testDataStr });
            throw new Error('Missing required form data: testId, shop, or testData');
        }

        // Deactivate all other active product details tests before starting this one
        const sanitizedDomain = shop.replace(/\./g, '_');
        await logger.info('Deactivating other active product details tests', { testId });

        try {
            // Fetch all tests
            const allTestsResponse = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}.json`);
            const allTests = await allTestsResponse.json();

            if (allTestsResponse.ok && allTests) {
                // Find all active product details tests except the current one
                const activeProductDetailsTests = Object.entries(allTests).filter(([currentTestId, test]) =>
                    test.basicInfo?.status === 'active' &&
                    test.basicInfo?.type === 'productDetails' &&
                    currentTestId !== testId
                );

                // Deactivate each active product details test
                for (const [currentTestId, test] of activeProductDetailsTests) {
                    await logger.info('Deactivating product details test', { currentTestId });

                    // Call the deactivate API
                    const deactivateResponse = await fetch(`/api/product-details-activate-deactivate?testId=${currentTestId}&shop=${shop}&action=deactivate`, {
                        method: 'POST'
                    });

                    if (!deactivateResponse.ok) {
                        await logger.warn('Failed to deactivate product details test', { currentTestId });
                        continue;
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

                    const updateResponse = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${currentTestId}.json`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedTestData)
                    });

                    if (updateResponse.ok) {
                        await logger.info('Successfully deactivated and closed sessions for test', { currentTestId });
                    } else {
                        await logger.warn('Failed to update test status in Firebase', { currentTestId });
                    }
                }
            }
        } catch (deactivateError) {
            await logger.warn('Error during deactivation of other tests', { error: deactivateError.message });
            // Continue with the current test creation even if deactivation fails
        }

        let testData;
        try {
            testData = JSON.parse(testDataStr);
            await logger.debug('Parsed test data', { testData });
        } catch (e) {
            await logger.error('Failed to parse testData JSON', { error: e.message });
            throw new Error('Invalid testData JSON format');
        }

        let hasErrors = false;
        const errors = [];

        // Process each selected product
        for (const product of testData.selectedProducts) {
            try {
                const productId = product.productId;
                await logger.info(`Processing product`, { productId });

                // Get all variants and options from the original product
                const response = await admin.graphql(GET_PRODUCT, {
                    variables: {
                        id: productId
                    }
                });

                const responseJson = await response.json();
                if (responseJson.errors) {
                    await logger.error('GraphQL error fetching product', {
                        productId,
                        errors: responseJson.errors
                    });
                    throw new Error(`GraphQL error: ${responseJson.errors[0].message}`);
                }

                const originalProduct = responseJson.data.product;
                if (!originalProduct) {
                    await logger.error('Product not found', { productId });
                    throw new Error(`Product not found: ${productId}`);
                }

                await logger.info('Retrieved original product data', {
                    productId,
                    title: originalProduct.title
                });

                // Handle inventory adjustment for control group (original product)
                const controlGroup = testData.testGroups.find(group => group.name === "Control Group");
                const originalInventory = controlGroup.products[product.productId.split('/').pop()]?.originalInventory;
                const modifiedInventory = controlGroup.products[product.productId.split('/').pop()]?.modifiedInventory;
                const actualinventoryforcontrol = modifiedInventory - originalInventory;
                if (controlGroup) {
                    // const originalInventory = controlGroup.products[product.productId.split('/').pop()]?.originalInventory;
                    // const modifiedInventory = controlGroup.products[product.productId.split('/').pop()]?.modifiedInventory;
                    // const actualinventoryforcontrol = modifiedInventory - originalInventory;
                    if (modifiedInventory !== undefined) {

                        // Get the variant and inventory information for original product
                        const getVariantResponse = await admin.graphql(GET_PRODUCT_VARIANT, {
                            variables: {
                                productId: productId
                            }
                        });

                        const variantJson = await getVariantResponse.json();
                        if (!variantJson.errors) {
                            const inventoryItemId = variantJson.data.product.variants.edges[0]?.node.inventoryItem.id;
                            const locationId = variantJson.data.product.variants.edges[0]?.node.inventoryItem.inventoryLevels.edges[0]?.node.location.id;

                            if (inventoryItemId && locationId) {
                                const adjustInventoryResponse = await admin.graphql(ADJUST_INVENTORY, {
                                    variables: {
                                        input: {
                                            reason: "correction",
                                            name: "available",
                                            changes: [{
                                                delta: actualinventoryforcontrol,
                                                inventoryItemId: inventoryItemId,
                                                locationId: locationId
                                            }]
                                        }
                                    }
                                });

                                const adjustInventoryJson = await adjustInventoryResponse.json();
                                if (adjustInventoryJson.errors ||
                                    !adjustInventoryJson.data?.inventoryAdjustQuantities?.inventoryAdjustmentGroup ||
                                    adjustInventoryJson.data.inventoryAdjustQuantities.userErrors.length > 0) {
                                    await logger.warn('Failed to adjust inventory for control group', {
                                        productId: productId,
                                        error: adjustInventoryJson.errors?.[0]?.message ||
                                            adjustInventoryJson.data?.inventoryAdjustQuantities?.userErrors[0]?.message ||
                                            'Unknown error during inventory adjustment'
                                    });
                                } else {
                                    const changes = adjustInventoryJson.data.inventoryAdjustQuantities.inventoryAdjustmentGroup.changes || [];
                                    await logger.info('Successfully adjusted inventory for control group', {
                                        productId: productId,
                                        newQuantity: actualinventoryforcontrol,
                                        changes: changes
                                    });
                                }
                            }
                        }
                    }
                }

                // Create duplicates for each test group
                for (const group of testData.testGroups) {
                    if (group.name === "Control Group") {
                        await logger.info('Skipping control group', { groupName: group.name });
                        continue;
                    }

                    await logger.info('Creating duplicate for group', {
                        groupName: group.name,
                        productId
                    });

                    // Use productDuplicate mutation to create an exact copy
                    const createProductResponse = await admin.graphql(DUPLICATE_PRODUCT, {
                        variables: {
                            productId: productId,
                            newTitle: group.products[product.productId.split('/').pop()]?.modifiedTitle || originalProduct.title,
                            includeImages: false,
                            newStatus: "ACTIVE"
                        }
                    });

                    const createProductJson = await createProductResponse.json();
                    if (createProductJson.errors) {
                        await logger.error('GraphQL error creating product', {
                            productId,
                            groupName: group.name,
                            errors: createProductJson.errors
                        });
                        throw new Error(`GraphQL error: ${createProductJson.errors[0].message}`);
                    }

                    if (createProductJson.data.productDuplicate.userErrors.length > 0) {
                        await logger.error('User errors creating product', {
                            productId,
                            groupName: group.name,
                            errors: createProductJson.data.productDuplicate.userErrors
                        });
                        throw new Error(createProductJson.data.productDuplicate.userErrors[0].message);
                    }

                    const newProductId = createProductJson.data.productDuplicate.newProduct.id;
                    await logger.info('Created duplicate product', {
                        originalProductId: productId,
                        newProductId,
                        groupName: group.name
                    });

                    // Update the description if modifiedconst

                    const originalInventory = group.products[product.productId.split('/').pop()]?.originalInventory;
                    const modifiedInventory = group.products[product.productId.split('/').pop()]?.modifiedInventory;
                    if (modifiedInventory) {
                        logger.info("actualinventoryforcontrolL", actualinventoryforcontrol);
                        const actualinventory = modifiedInventory - originalInventory - actualinventoryforcontrol;
                        // First get the variant and inventory information
                        const getVariantResponse = await admin.graphql(GET_PRODUCT_VARIANT, {
                            variables: {
                                productId: newProductId
                            }
                        });

                        const variantJson = await getVariantResponse.json();
                        if (!variantJson.errors) {
                            const inventoryItemId = variantJson.data.product.variants.edges[0]?.node.inventoryItem.id;
                            const locationId = variantJson.data.product.variants.edges[0]?.node.inventoryItem.inventoryLevels.edges[0]?.node.location.id;

                            if (inventoryItemId && locationId) {
                                const adjustInventoryResponse = await admin.graphql(ADJUST_INVENTORY, {
                                    variables: {
                                        input: {
                                            reason: "correction",
                                            name: "available",
                                            changes: [{
                                                delta: actualinventory,
                                                inventoryItemId: inventoryItemId,
                                                locationId: locationId
                                            }]
                                        }
                                    }
                                });

                                const adjustInventoryJson = await adjustInventoryResponse.json();
                                if (adjustInventoryJson.errors ||
                                    !adjustInventoryJson.data?.inventoryAdjustQuantities?.inventoryAdjustmentGroup ||
                                    adjustInventoryJson.data.inventoryAdjustQuantities.userErrors.length > 0) {
                                    await logger.warn('Failed to adjust inventory', {
                                        productId: newProductId,
                                        error: adjustInventoryJson.errors?.[0]?.message ||
                                            adjustInventoryJson.data?.inventoryAdjustQuantities?.userErrors[0]?.message ||
                                            'Unknown error during inventory adjustment'
                                    });
                                } else {
                                    const changes = adjustInventoryJson.data.inventoryAdjustQuantities.inventoryAdjustmentGroup.changes || [];
                                    await logger.info('Successfully adjusted inventory', {
                                        productId: newProductId,
                                        newQuantity: actualinventory,
                                        changes: changes
                                    });
                                }
                            }
                        }
                    }

                    const modifiedDescription = group.products[product.productId.split('/').pop()]?.modifiedDescription;
                    if (modifiedDescription) {
                        const updateResponse = await admin.graphql(UPDATE_PRODUCT, {
                            variables: {
                                input: {
                                    id: newProductId,
                                    descriptionHtml: modifiedDescription
                                }
                            }
                        });

                        const updateJson = await updateResponse.json();
                        if (updateJson.errors || updateJson.data.productUpdate.userErrors.length > 0) {
                            await logger.warn('Failed to update product description', {
                                productId: newProductId,
                                error: updateJson.errors?.[0]?.message || updateJson.data.productUpdate.userErrors[0]?.message
                            });
                        }
                    }

                    // Add the modified images if they exist
                    const imageUrls = group.products[product.productId.split('/').pop()]?.modifiedImages || [];
                    if (imageUrls.length > 0) {
                        await logger.info('Adding images to duplicate product', {
                            productId: newProductId,
                            imageCount: imageUrls.length
                        });

                        for (const imageUrl of imageUrls) {
                            const createImageResponse = await admin.graphql(CREATE_PRODUCT_MEDIA, {
                                variables: {
                                    productId: newProductId,
                                    media: [{
                                        mediaContentType: "IMAGE",
                                        originalSource: imageUrl
                                    }]
                                }
                            });

                            const createImageJson = await createImageResponse.json();
                            if (createImageJson.errors) {
                                await logger.warn('GraphQL error adding image', {
                                    productId: newProductId,
                                    imageUrl,
                                    error: createImageJson.errors[0].message
                                });
                                errors.push(`Failed to add image to product ${newProductId}: ${createImageJson.errors[0].message}`);
                                hasErrors = true;
                            } else if (createImageJson.data.productCreateMedia.mediaUserErrors.length > 0) {
                                await logger.warn('Failed to add image', {
                                    productId: newProductId,
                                    imageUrl,
                                    error: createImageJson.data.productCreateMedia.mediaUserErrors[0].message
                                });
                                errors.push(`Failed to add image to product ${newProductId}: ${createImageJson.data.productCreateMedia.mediaUserErrors[0].message}`);
                                hasErrors = true;
                            } else {
                                await logger.info('Successfully added image to product', {
                                    productId: newProductId,
                                    imageUrl
                                });
                            }
                        }
                    }

                    // Store the duplicate product ID in Firebase using PATCH
                    const productIdWithoutPrefix = product.productId.split('/').pop();

                    // Create the patch path targeting the specific product in the specific group
                    const patchPath = `testGroups/${group.id - 1}/products/${productIdWithoutPrefix}/createdProductId`;

                    // Update Firebase with just the new product ID
                    const firebaseResponse = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}/${patchPath}.json`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(newProductId)
                    });

                    if (!firebaseResponse.ok) {
                        await logger.error('Failed to update Firebase with duplicate product ID', {
                            originalProductId: productId,
                            newProductId,
                            groupName: group.name,
                            error: await firebaseResponse.text()
                        });
                        errors.push(`Failed to store duplicate product reference in Firebase`);
                        hasErrors = true;
                    } else {
                        await logger.info('Stored duplicate product reference', {
                            originalProductId: productId,
                            newProductId,
                            groupName: group.name
                        });
                    }
                }
            } catch (productError) {
                await logger.error('Error processing product', {
                    productId: product.productId,
                    error: productError.message
                });
                errors.push(productError.message);
                hasErrors = true;
            }
        }


        if (hasErrors) {
            await logger.warn('Completed with some errors', { errors });
            return json({
                success: false,
                warning: 'Some operations failed',
                errors: errors,
                testGroups: testData.testGroups,
                basicInfo: {
                    ...testData.basicInfo,
                    status: 'pending'
                }
            });
        } else {
            await logger.info('Successfully completed product duplication');
            return json({
                success: true,
                testGroups: testData.testGroups,
                basicInfo: {
                    ...testData.basicInfo,
                    status: 'active'
                }
            });
        }

    } catch (error) {
        await logger.error('Fatal error in create-product-duplicates', {
            error: error.message
        });
        return json({
            success: false,
            error: error.message || 'An unexpected error occurred'
        }, { status: 500 });
    }
}; 