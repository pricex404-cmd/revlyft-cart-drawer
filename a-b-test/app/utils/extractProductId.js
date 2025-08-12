/**
 * Extracts the numeric product ID from a Shopify gid URL or returns the ID if already numeric
 * 
 * @param {string} shopifyId - The Shopify product ID, either as a gid URL or numeric ID
 * @returns {string|null} - The extracted numeric product ID or null if invalid
 */
export default function extractShopifyProductId(shopifyId) {
    // Check if input exists
    if (!shopifyId) return null;

    // If it's already a numeric ID, return it
    if (/^\d+$/.test(shopifyId)) {
        return shopifyId;
    }

    // Remove 'gid://' prefix if exists
    const cleanUrl = shopifyId.replace('gid://', '');

    // Extract the last part after the final slash
    const productId = cleanUrl.split('/').pop();

    // Return the extracted ID
    return productId;
} 