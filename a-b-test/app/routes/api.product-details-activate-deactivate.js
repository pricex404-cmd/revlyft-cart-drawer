import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { createLogger } from "../utils/logToFile";
import extractShopifyProductId from "../utils/extractProductId";
import { UPDATE_PRODUCT } from "../utils/graphqlQueries";
import { sanitizeShopDomain } from "../utils/sanitizeShopDomain";

const webhookLogger = createLogger('activate-deactivate-logs');

const FIREBASE_DB_URL = "https://abtest-6b299-default-rtdb.firebaseio.com/";

export const action = async ({ request }) => {
    try {
        const { admin } = await authenticate.admin(request);
        const url = new URL(request.url);
        const testId = url.searchParams.get('testId');
        const shop = url.searchParams.get('shop');
        const action = url.searchParams.get('action'); // 'activate' or 'deactivate'

        if (!testId || !shop || !action) {
            return json({ error: 'Missing required parameters: testId, shop, or action' }, { status: 400 });
        }

        const sanitizedDomain = sanitizeShopDomain(shop);

        // Get test data from Firebase
        const testResponse = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`);
        const testData = await testResponse.json();

        if (!testResponse.ok || !testData) {
            return json({ error: 'Test not found' }, { status: 404 });
        }

        // Verify this is a product details test
        if (testData.basicInfo?.type !== 'productDetails') {
            return json({ error: 'This action is only available for product details tests' }, { status: 400 });
        }

        if (action === 'activate') {
            // Activate product details test logic
            // For product details tests, we need to make the duplicate products visible/active
            if (testData.testGroups) {
                for (const group of testData.testGroups) {
                    if (group.products) {
                        for (const [productId, productData] of Object.entries(group.products)) {
                            if (productData.createdProductId) {
                                // Update product status to active/published
                                const productUpdateQuery = `
                                    mutation productUpdate($input: ProductInput!) {
                                        productUpdate(input: $input) {
                                            product {
                                                id
                                                status
                                            }
                                            userErrors {
                                                field
                                                message
                                            }
                                        }
                                    }
                                `;

                                const response = await admin.graphql(productUpdateQuery, {
                                    variables: {
                                        input: {
                                            id: productData.createdProductId,
                                            status: "ACTIVE"
                                        }
                                    }
                                });

                                const result = await response.json();
                                if (result.data?.productUpdate?.userErrors?.length > 0) {
                                    console.error('Error activating product:', result.data.productUpdate.userErrors);
                                }
                            }
                        }
                    }
                }
            }
        } else if (action === 'deactivate') {
            // Deactivate product details test logic
            // Make the duplicate products inactive/draft
            if (testData.testGroups) {
                for (const group of testData.testGroups) {
                    if (group.products) {
                        for (const [productId, productData] of Object.entries(group.products)) {
                            if (productData.createdProductId) {
                                // Update product status to draft/inactive
                                const productUpdateQuery = `
                                    mutation productUpdate($input: ProductInput!) {
                                        productUpdate(input: $input) {
                                            product {
                                                id
                                                status
                                            }
                                            userErrors {
                                                field
                                                message
                                            }
                                        }
                                    }
                                `;

                                const response = await admin.graphql(productUpdateQuery, {
                                    variables: {
                                        input: {
                                            id: productData.createdProductId,
                                            status: "DRAFT"
                                        }
                                    }
                                });

                                const result = await response.json();
                                if (result.data?.productUpdate?.userErrors?.length > 0) {
                                    console.error('Error deactivating product:', result.data.productUpdate.userErrors);
                                }
                            }
                        }
                    }
                }
            }
        }

        return json({
            success: true,
            message: `Product details test ${action}d successfully`,
            action
        });

    } catch (error) {
        console.error(`Error ${action}ing product details test:`, error);
        return json({
            error: `Failed to ${action} product details test: ${error.message}`
        }, { status: 500 });
    }
}; 