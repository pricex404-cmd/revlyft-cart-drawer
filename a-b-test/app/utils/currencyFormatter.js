/**
 * Global currency formatter function
 * @param {number} value - The price value to format
 * @param {string} currencyCode - The currency code (e.g., 'USD', 'EUR', 'GBP', 'INR')
 * @param {boolean} showSymbolOnly - If true, returns only the currency symbol
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currencyCode, showSymbolOnly = false) => {
    if (!currencyCode) return showSymbolOnly ? '₹' : '₹0.00'; // Default to rupee
    
    try {
        if (showSymbolOnly) {
            // Return only the currency symbol
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currencyCode.toUpperCase(),
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(0).replace(/[0-9]/g, '').trim();
        } else {
            // Return full formatted price
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currencyCode.toUpperCase(),
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value || 0);
        }
    } catch (error) {
        console.error('Error formatting currency:', error);
        return showSymbolOnly ? '₹' : '₹0.00'; // Fallback to rupee
    }
};

/**
 * Get only the currency symbol
 * @param {string} currencyCode - The currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currencyCode) => {
    return formatCurrency(0, currencyCode, true);
};

/**
 * Format price with currency
 * @param {number} value - The price value
 * @param {string} currencyCode - The currency code
 * @returns {string} Formatted price with currency
 */
export const formatPrice = (value, currencyCode) => {
    return formatCurrency(value, currencyCode, false);
};

/**
 * Get currency code (e.g., 'USD', 'INR', 'EUR')
 * @param {string} currencyCode - The currency code
 * @returns {string} Currency code in uppercase
 */
export const getCurrencyCode = (currencyCode) => {
    if (!currencyCode) return 'INR'; // Default to INR
    return currencyCode.toUpperCase();
};

export default formatCurrency;
