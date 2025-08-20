import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import logger from "../utils/logger";
import { createLogger } from "../utils/logToFile";
import {
    GET_PRODUCT_INVENTORY,
    GET_ORIGINAL_PRODUCT_INVENTORY,
    DELETE_PRODUCT,
    ADJUST_INVENTORY
} from "../utils/graphqlQueries";

const FIREBASE_DB_URL = "https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app";

const logToFile = createLogger('cleanup-product-duplicates');
export const action = async ({ request }) => {
    console.log('========== DELETE PRODUCT DUPLICATES API ==========');
    try {
        const { admin } = await authenticate.admin(request);
        const url = new URL(request.url);
        const testId = url.searchParams.get("testId");
        const shop = url.searchParams.get("shop");

        console.log('Request parameters:', { testId, shop });
        await logToFile('Delete product duplicates request received', { testId, shop });

        if (!testId || !shop) {
            const error = 'Missing required parameters: testId or shop';
            console.error(error, { testId, shop });
            await logToFile(error, { testId, shop });
            throw new Error(error);
        }

        // Get test data from Firebase
        const sanitizedDomain = shop.replace(/\./g, '_');
        console.log('Fetching test data from Firebase:', { sanitizedDomain, testId });
        await logToFile('Fetching test data from Firebase', { sanitizedDomain, testId });

        const testResponse = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`);
        const testData = await testResponse.json();

        if (!testResponse.ok) {
            const error = 'Failed to fetch test data';
            console.error(error, { testId, status: testResponse.status });
            await logToFile(error, { testId, status: testResponse.status });
            throw new Error(error);
        }

        console.log('Test data retrieved successfully');
        await logToFile('Test data retrieved successfully', {
            testName: testData?.basicInfo?.testName,
            testType: testData?.basicInfo?.type,
            groupCount: testData?.testGroups?.length
        });

        let hasErrors = false;
        const errors = [];
        let deletedProductsCount = 0;
        let allOperationsSuccessful = true; // Track if all operations were successful

        // Process each test group
        for (const group of testData.testGroups) {
            console.log(`Processing group: ${group.name}`);
            await logToFile('Processing test group', { groupName: group.name });

            if (group.name === "Control Group") {
                console.log('Skipping control group');
                await logToFile('Skipping control group', { groupName: group.name });
                continue;
            }

            // Process each product in the group
            for (const [productId, productData] of Object.entries(group.products || {})) {
                if (productData.createdProductId) {
                    try {
                        console.log('Deleting duplicate product:', {
                            productId: productData.createdProductId,
                            groupName: group.name
                        });
                        await logToFile('Attempting to delete duplicate product', {
                            productId: productData.createdProductId,
                            groupName: group.name,
                            originalProductId: productId
                        });

                        // Get the duplicate product's inventory before deletion
                        const duplicateProductResponse = await admin.graphql(
                            GET_PRODUCT_INVENTORY,
                            {
                                variables: {
                                    id: productData.createdProductId
                                }
                            }
                        );

                        const duplicateProductData = await duplicateProductResponse.json();

                        if (duplicateProductData.errors) {
                            throw new Error(`Failed to fetch inventory: ${duplicateProductData.errors[0].message}`);
                        }

                        const variant = duplicateProductData.data.product.variants.edges[0]?.node;
                        if (!variant || !variant.inventoryItem) {
                            throw new Error('Failed to get variant or inventory item information');
                        }

                        const inventoryLevel = variant.inventoryItem.inventoryLevels.edges[0]?.node;
                        if (!inventoryLevel) {
                            throw new Error('Failed to get inventory level information');
                        }

                        const duplicateInventory = variant.inventoryQuantity || 0;
                        const inventoryItemId = variant.inventoryItem.id;
                        const locationId = inventoryLevel.location.id;

                        // Get the original product's inventory information
                        const originalProductResponse = await admin.graphql(
                            GET_ORIGINAL_PRODUCT_INVENTORY,
                            {
                                variables: {
                                    id: `gid://shopify/Product/${productId}`
                                }
                            }
                        );

                        const originalProductData = await originalProductResponse.json();
                        if (originalProductData.errors) {
                            throw new Error(`Failed to fetch original product inventory: ${originalProductData.errors[0].message}`);
                        }

                        const originalVariant = originalProductData.data.product.variants.edges[0]?.node;
                        if (!originalVariant || !originalVariant.inventoryItem) {
                            throw new Error('Failed to get original variant or inventory item information');
                        }

                        const originalInventoryLevel = originalVariant.inventoryItem.inventoryLevels.edges[0]?.node;
                        if (!originalInventoryLevel) {
                            throw new Error('Failed to get original inventory level information');
                        }

                        const originalInventoryItemId = originalVariant.inventoryItem.id;
                        const originalLocationId = originalInventoryLevel.location.id;

                        // Delete the product using Shopify Admin API
                        const deleteResponse = await admin.graphql(
                            DELETE_PRODUCT,
                            {
                                variables: {
                                    id: productData.createdProductId
                                }
                            }
                        );

                        const deleteJson = await deleteResponse.json();
                        if (deleteJson.errors || deleteJson.data.productDelete.userErrors.length > 0) {
                            const error = deleteJson.errors?.[0]?.message || deleteJson.data.productDelete.userErrors[0]?.message;
                            console.error('Failed to delete product:', {
                                productId: productData.createdProductId,
                                error
                            });
                            await logToFile('Failed to delete product', {
                                productId: productData.createdProductId,
                                groupName: group.name,
                                error
                            });
                            errors.push(`Failed to delete product ${productData.createdProductId}: ${error}`);
                            hasErrors = true;
                            allOperationsSuccessful = false;
                            continue;
                        }

                        deletedProductsCount++;

                        // Update the original product's inventory
                        if (originalInventoryItemId && originalLocationId) {
                            const adjustInventoryResponse = await admin.graphql(
                                ADJUST_INVENTORY,
                                {
                                    variables: {
                                        input: {
                                            reason: "correction",
                                            name: "available",
                                            changes: [{
                                                delta: duplicateInventory,
                                                inventoryItemId: originalInventoryItemId,
                                                locationId: originalLocationId
                                            }]
                                        }
                                    }
                                }
                            );

                            const adjustInventoryJson = await adjustInventoryResponse.json();
                            if (adjustInventoryJson.errors ||
                                !adjustInventoryJson.data?.inventoryAdjustQuantities?.inventoryAdjustmentGroup ||
                                adjustInventoryJson.data.inventoryAdjustQuantities.userErrors.length > 0) {
                                const error = adjustInventoryJson.errors?.[0]?.message ||
                                    adjustInventoryJson.data?.inventoryAdjustQuantities?.userErrors[0]?.message ||
                                    'Unknown error during inventory adjustment';
                                console.error('Failed to update inventory:', {
                                    productId: `gid://shopify/Product/${productId}`,
                                    error
                                });
                                await logToFile('Failed to update inventory', {
                                    productId: `gid://shopify/Product/${productId}`,
                                    error
                                });
                                errors.push(`Failed to update inventory for product gid://shopify/Product/${productId}: ${error}`);
                                hasErrors = true;
                                allOperationsSuccessful = false;
                                continue;
                            } else {
                                const changes = adjustInventoryJson.data.inventoryAdjustQuantities.inventoryAdjustmentGroup.changes || [];
                                console.log('Successfully updated inventory:', {
                                    productId: `gid://shopify/Product/${productId}`,
                                    changes: changes
                                });
                                await logToFile('Successfully updated inventory', {
                                    productId: `gid://shopify/Product/${productId}`,
                                    changes: changes
                                });
                            }
                        }

                        console.log('Successfully deleted product:', {
                            productId: productData.createdProductId,
                            groupName: group.name,
                            inventoryAdded: duplicateInventory
                        });
                        await logToFile('Successfully deleted product', {
                            productId: productData.createdProductId,
                            groupName: group.name,
                            deletedProductId: deleteJson.data.productDelete.deletedProductId,
                            inventoryAdded: duplicateInventory
                        });
                    } catch (error) {
                        console.error('Error deleting product:', {
                            productId: productData.createdProductId,
                            error: error.message
                        });
                        await logToFile('Error deleting product', {
                            productId: productData.createdProductId,
                            groupName: group.name,
                            error: error.message,
                            stack: error.stack
                        });
                        errors.push(`Error deleting product ${productData.createdProductId}: ${error.message}`);
                        hasErrors = true;
                        allOperationsSuccessful = false;
                    }
                }
            }
        }

        console.log('Deletion process completed', {
            deletedProductsCount,
            hasErrors,
            errorCount: errors.length,
            allOperationsSuccessful
        });
        await logToFile('Deletion process completed', {
            deletedProductsCount,
            hasErrors,
            errorCount: errors.length,
            allOperationsSuccessful
        });

        if (!allOperationsSuccessful) {
            console.warn('Completed with some errors:', errors);
            await logToFile('Completed with some errors', { errors });
            return json({
                success: false,
                warning: 'Some operations failed',
                errors: errors,
                deletedProductsCount
            });
        }

        // Only delete from Firebase if all operations were successful
        // const deleteResponse = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`, {
        //     method: 'DELETE'
        // });

        // if (!deleteResponse.ok) {
        //     const error = 'Failed to delete test from Firebase';
        //     console.error(error);
        //     await logToFile(error);
        //     return json({
        //         success: false,
        //         error: error
        //     });
        // }

        console.log('Successfully completed product deletion');
        await logToFile('Successfully completed product deletion', { deletedProductsCount });

        // Get current test data to modify
        const getTestResponse = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`);
        if (!getTestResponse.ok) {
            const error = 'Failed to fetch test data for update';
            console.error(error);
            await logToFile(error);
            return json({
                success: false,
                error: error,
                deletedProductsCount
            });
        }

        const updatedTestData = await getTestResponse.json();

        // Remove createdProductId and update modifiedInventory for all groups
        if (updatedTestData.testGroups) {
            updatedTestData.testGroups.forEach(group => {
                if (group.products) {
                    Object.keys(group.products).forEach(productId => {
                        if (group.products[productId].createdProductId) {
                            delete group.products[productId].createdProductId;
                        }
                        // Set modifiedInventory based on group type
                        if (group.name === "Control Group") {
                            group.products[productId].modifiedInventory = group.products[productId].originalInventory;
                        } else {
                            group.products[productId].modifiedInventory = 0;
                        }
                    });
                }
            });
        }

        // Update test data and status
        const updateResponse = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...updatedTestData,
                basicInfo: {
                    ...updatedTestData.basicInfo,
                    status: "pending"
                }
            })
        });

        if (!updateResponse.ok) {
            const error = 'Failed to update test data in Firebase';
            console.error(error);
            await logToFile(error);
            return json({
                success: false,
                error: error,
                deletedProductsCount
            });
        }

        console.log('Successfully updated test data and status to pending');
        await logToFile('Successfully updated test data and status to pending');

        return json({
            success: true,
            deletedProductsCount
        });

    } catch (error) {
        console.error('Fatal error in delete-product-duplicates:', error);
        console.error('Error stack:', error.stack);
        await logToFile('Fatal error in delete-product-duplicates', {
            error: error.message,
            stack: error.stack
        });
        return json({
            success: false,
            error: error.message || 'An unexpected error occurred',
            details: error.stack
        }, { status: 500 });
    } finally {
        console.log('=====================================');
    }
}; 