import { authenticate } from "../shopify.server";
import { GET_SHOP_INFO } from "../utils/graphqlQueries";

export const loader = async ({ request }) => {
    try {
        const { admin } = await authenticate.admin(request);

        // Fetch shop information using GraphQL
        const response = await admin.graphql(GET_SHOP_INFO);

        const data = await response.json();

        // Check for GraphQL errors
        if (data.errors) {
            return new Response(JSON.stringify({
                error: 'Failed to fetch store information',
                details: data.errors
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({
            storeUrl: data.data.shop.url,
            myshopifyDomain: data.data.shop.myshopifyDomain
        }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error('Store info error:', error);
        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}; 