import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getDiscountsByTestId, deleteDiscount } from "../functions/discount";

const FIREBASE_DB_URL = "https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app";

export const action = async ({ request }) => {
    if (request.method !== 'DELETE') {
        return json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        const { admin } = await authenticate.admin(request);
        const url = new URL(request.url);
        const discountId = url.searchParams.get('discountId');
        const shop = url.searchParams.get('shop');

        
        

        if (!discountId || !shop) {
            
            return json({ error: 'Discount ID and shop are required' }, { status: 400 });
        }

        

        // Delete the discount directly using the discountId
        const deleteResult = await deleteDiscount(admin, discountId);
        

        if (!deleteResult.discountDeleted) {
            const error = deleteResult.errors[0]?.message || 'Unknown error';
            console.error('Failed to delete discount:', error);
            return json({ error: `Failed to delete discount: ${error}` }, { status: 500 });
        }

        
        

        return json({ success: true });
    } catch (error) {
        console.error('Error in delete discounts API:', error);
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
                'Access-Control-Allow-Methods': 'DELETE',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }
    return json({ error: 'Method not allowed' }, { status: 405 });
}; 