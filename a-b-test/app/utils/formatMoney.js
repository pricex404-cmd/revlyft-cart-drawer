/**
 * Format price with currency symbol
 * @param {number} price - The price to format
 * @param {string} currencyCode - The currency code (e.g., 'USD', 'EUR', 'GBP', 'INR')
 * @returns {string} Formatted price with currency symbol
 */
export const formatMoney = (price, currencyCode) => {
    // Check if Shopify.formatMoney is available (for frontend usage)
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney && currencyCode) {
        // For Shopify.formatMoney, we need to multiply by 100 (cents)
        return Shopify.formatMoney(price * 100);
    }

    // Use Intl.NumberFormat for proper currency formatting
    if (!currencyCode) {
        console.warn('No currency code provided to formatMoney, using USD as fallback');
        currencyCode = 'USD';
    }

    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode.toUpperCase(),
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    } catch (error) {
        console.error('Error formatting currency:', error);
        // If currency code is invalid, fallback to USD
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    }
};

export default formatMoney; 