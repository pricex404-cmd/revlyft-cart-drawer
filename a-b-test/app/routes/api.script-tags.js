import { authenticate } from "../shopify.server";
import { GET_SCRIPT_TAGS, CREATE_SCRIPT_TAG_ALTERNATIVE } from "../utils/graphqlQueries";

export const loader = async ({ request }) => {
    try {
        const { admin } = await authenticate.admin(request);

        // First, check if our script tag already exists
        const scriptTagsResponse = await admin.graphql(GET_SCRIPT_TAGS);

        const scriptTagsData = await scriptTagsResponse.json();

        // Check for GraphQL errors
        if (scriptTagsData.errors) {
            return new Response(JSON.stringify({
                error: 'Failed to fetch script tags',
                details: scriptTagsData.errors
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Find our script tag by checking the src URL
        const existingScriptTag = scriptTagsData.data.scriptTags.edges.find(
            edge => edge.node.src.includes('/assets/price-query-selector-script.js')
        );

        if (existingScriptTag) {
            return new Response(JSON.stringify({
                scriptTag: existingScriptTag.node,
                status: 'active'
            }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // If no script tag exists, create one
        const createScriptTagResponse = await admin.graphql(
            CREATE_SCRIPT_TAG_ALTERNATIVE,
            {
                variables: {
                    input: {
                        src: `${process.env.SHOPIFY_APP_URL}/assets/price-query-selector-script.js`,
                        displayScope: "ONLINE_STORE",
                        cache: false
                    }
                }
            }
        );

        const createScriptTagData = await createScriptTagResponse.json();

        // Check for GraphQL errors in creation
        if (createScriptTagData.errors) {
            return new Response(JSON.stringify({
                error: 'Failed to create script tag',
                details: createScriptTagData.errors
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Check for user errors in creation
        if (createScriptTagData.data.scriptTagCreate.userErrors.length > 0) {
            return new Response(JSON.stringify({
                error: 'Script tag creation failed',
                userErrors: createScriptTagData.data.scriptTagCreate.userErrors
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({
            scriptTag: createScriptTagData.data.scriptTagCreate.scriptTag,
            status: 'created'
        }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error('Script tag error:', error);
        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}; 