import { authenticate } from "../shopify.server";
import { GET_SHOP_DATA } from "../utils/graphqlQueries";

export const loader = async ({ request }) => {
    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(GET_SHOP_DATA);

    const { data } = await response.json();

    return new Response(JSON.stringify(data), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}; 