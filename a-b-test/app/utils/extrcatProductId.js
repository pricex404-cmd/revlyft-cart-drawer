function extractShopifyProductId(url) {
    // Check if input exists
    if (!url) return null;

    // Remove 'gid://' prefix if exists
    const cleanUrl = url.replace('gid://', '');

    // Extract the last part after the final slash
    const productId = cleanUrl.split('/').pop();

    // Convert to number and return
    return parseInt(productId);
}