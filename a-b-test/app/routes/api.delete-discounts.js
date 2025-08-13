import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getDiscountsByTestId, deleteDiscount } from "../functions/discount";

const FIREBASE_DB_URL = "https://abtest-6b299-default-rtdb.firebaseio.com";

export const action = async ({ request }) => {
    if (request.method !== 'DELETE') {
        return json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        const { admin } = await authenticate.admin(request);
        const url = new URL(request.url);
        const discountId = url.searchParams.get('discountId');
        const shop = url.searchParams.get('shop');

        console.log('========== DELETE DISCOUNTS API ==========');
        console.log('Request parameters:', { discountId, shop });

        if (!discountId || !shop) {
            console.log('Missing required parameters');
            return json({ error: 'Discount ID and shop are required' }, { status: 400 });
        }

        console.log('Attempting to delete discount:', discountId);

        // Delete the discount directly using the discountId
        const deleteResult = await deleteDiscount(admin, discountId);
        console.log('Delete result:', JSON.stringify(deleteResult, null, 2));

        if (!deleteResult.discountDeleted) {
            const error = deleteResult.errors[0]?.message || 'Unknown error';
            console.error('Failed to delete discount:', error);
            return json({ error: `Failed to delete discount: ${error}` }, { status: 500 });
        }

        console.log('Discount successfully deleted');
        console.log('=====================================');

        return json({ success: true });
    } catch (error) {
        console.error('Error in delete discounts API:', error);
        console.error('Error stack:', error.stack);
        console.log('=====================================');
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