import { authenticate } from "../shopify.server";
import { GET_SHOP_CURRENCY } from "../utils/graphqlQueries";

export const loader = async ({ request }) => {
    try {
        const { admin } = await authenticate.admin(request);

        const response = await admin.graphql(GET_SHOP_CURRENCY);
        const data = await response.json();

        // Check for GraphQL errors
        if (data.errors) {
            return new Response(JSON.stringify({
                error: 'Failed to fetch shop currency',
                details: data.errors
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({
            currencyCode: data.data.shop.currencyCode
        }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error('Shop currency error:', error);
        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}; 