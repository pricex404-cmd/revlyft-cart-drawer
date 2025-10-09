import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { activateDiscount, deactivateDiscount } from "../functions/discount";

export const action = async ({ request }) => {
    if (request.method !== 'POST') {
        return json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        const { admin } = await authenticate.admin(request);
        const url = new URL(request.url);
        const discountId = url.searchParams.get('discountId');
        const shop = url.searchParams.get('shop');
        const action = url.searchParams.get('action'); // 'activate' or 'deactivate'

        
        

        if (!discountId || !shop || !action) {
            
            return json({ error: 'Discount ID, shop, and action are required' }, { status: 400 });
        }

        let result;
        if (action === 'activate') {
            result = await activateDiscount(admin, discountId);
        } else if (action === 'deactivate') {
            result = await deactivateDiscount(admin, discountId);
        } else {
            return json({ error: 'Invalid action' }, { status: 400 });
        }

        

        if (!result.success) {
            const error = result.errors[0]?.message || 'Unknown error';
            console.error('Failed to perform operation:', error);
            return json({ error: `Failed to ${action} discount: ${error}` }, { status: 500 });
        }

        
        

        return json({ success: true });
    } catch (error) {
        console.error('Error in activate/deactivate discount API:', error);
        console.error('Error stack:', error.stack);
        
        return json({
            error: error.message || 'An unexpected error occurred',
            details: error.stack
        }, { status: 500 });
    }
};

// Handle preflight requests
export const loader = async ({ request }) => {
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }
    return json({ error: 'Method not allowed' }, { status: 405 });
}; 