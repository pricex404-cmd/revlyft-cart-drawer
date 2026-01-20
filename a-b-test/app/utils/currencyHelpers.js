// Get currency symbol from currency code
export function getCurrencySymbol(currencyCode) {
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'JPY': '¥',
    'CNY': '¥',
    'AUD': 'A$',
    'CAD': 'C$',
    'CHF': 'CHF',
    'SEK': 'kr',
    'NZD': 'NZ$',
    'KRW': '₩',
    'SGD': 'S$',
    'NOK': 'kr',
    'MXN': 'MX$',
    'ZAR': 'R',
    'BRL': 'R$',
    'AED': 'د.إ',
    'SAR': 'ر.س',
    'THB': '฿',
    'IDR': 'Rp',
    'MYR': 'RM',
    'PHP': '₱',
    'PLN': 'zł',
    'TRY': '₺',
    'RUB': '₽',
    'HKD': 'HK$',
    'TWD': 'NT$',
    'DKK': 'kr',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'ILS': '₪',
  };

  return symbols[currencyCode] || currencyCode;
}

// Get icon for reward type
export function getRewardTypeIcon(rewardType) {
  const icons = {
    'shipping': '�',
    'free_gift': '🎁',
    'discount': '💵',
    'custom': '⭐' // Fixed emoji for custom
  };

  return icons[rewardType] || '🎉';
}

// Get reward type label without emoji
export function getRewardTypeLabel(rewardType) {
  const labels = {
    'shipping': 'Shipping',
    'free_gift': 'Free Gift',
    'discount': 'Discount',
    'custom': 'Custom'
  };
  
  return labels[rewardType] || 'Custom';
}
