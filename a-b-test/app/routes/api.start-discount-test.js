import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { createCartDiscount } from "../functions/discount";
import { GET_SHOPIFY_FUNCTIONS } from "../utils/graphqlQueries";

export const action = async ({ request }) => {
    const { admin } = await authenticate.admin(request);

    try {
        // Get test data from request body
        const testData = await request.json();
        const url = new URL(request.url);
        const testId = url.searchParams.get('testId');
        const shop = url.searchParams.get('shop');

        if (!testData || !testId || !shop) {
            throw new Error('Missing required parameters');
        }

        // Get the function ID for cart discount
        const functionResponse = await admin.graphql(GET_SHOPIFY_FUNCTIONS);
        const functionResponseJson = await functionResponse.json();
        const functions = functionResponseJson.data.shopifyFunctions.nodes;

        // Log available functions for debugging
        console.log('Available functions:', functions.map(f => ({ title: f.title, type: f.apiType })));

        // Try to find cart discount function with correct type
        const cartDiscountFunction = functions.find(
            (func) => (func.apiType === "discount" || func.apiType === "cart_discounts") &&
                func.title === "cart-discount"
        );

        if (!cartDiscountFunction) {
            throw new Error('Cart discount function not found. Available functions: ' +
                JSON.stringify(functions.map(f => ({ title: f.title, type: f.apiType })), null, 2));
        }

        // Prepare test variants
        const testVariants = testData.testGroups.map(group => ({
            name: group.name,
            percentage: group.percentage,
            discountPercentageValue: group.discountPercentageValue
        }));

        // Create the cart discount
        const result = await createCartDiscount(
            admin,
            `${testData.basicInfo.testName} - ${testId}`,
            cartDiscountFunction.id,
            testVariants,
            testData.discountConfig
        );

        if (!result.discountCreated || !result.discount?.discountId) {
            throw new Error(result.errors?.[0]?.message || 'Failed to create cart discount');
        }

        return json({
            success: true,
            discountId: result.discount.discountId,
            message: 'Cart discount created successfully'
        });

    } catch (error) {
        console.error('Error in start-discount-test:', error);
        return json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}; 