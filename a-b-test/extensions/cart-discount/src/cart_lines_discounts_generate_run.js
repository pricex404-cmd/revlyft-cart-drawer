import {
  DiscountClass,
  OrderDiscountSelectionStrategy,
  ProductDiscountSelectionStrategy,
} from '../generated/api';


/**
  * @typedef {import("../generated/api").CartInput} RunInput
  * @typedef {import("../generated/api").CartLinesDiscountsGenerateRunResult} CartLinesDiscountsGenerateRunResult
  */

/**
  * @param {RunInput} input
  * @returns {CartLinesDiscountsGenerateRunResult}
  */
// Official Shopify currency symbols function
// Based on the exact symbols from Shopify admin interface
function getCurrencySymbol(currencyCode) {
  const currencySymbols = {
    // From official Shopify admin currency list
    'AFN': '؋',
    'ARS': '$',
    'AMD': '֏',
    'AUD': '$',
    'AZN': '₼',
    'BDT': '৳',
    'BBD': '$',
    'BSD': '$',
    'BZD': '$',
    'BMD': '$',
    'BAM': 'KM',
    'BRL': 'R$',
    'BOB': 'Bs',
    'BWP': 'P',
    'BND': '$',
    'MMK': 'K',
    'KHR': '៛',
    'KYD': '$',
    'XAF': 'FCFA',
    'CLP': '$',
    'CNY': '¥',
    'COP': '$',
    'KMF': 'CF',
    'CRC': '₡',
    'HRK': 'kn',
    'CZK': 'Kč',
    'DKK': 'kr',
    'DOP': '$',
    'XCD': '$',
    'EGP': 'E£',
    'FKP': '£',
    'XPF': 'CFPF',
    'FJD': '$',
    'GIP': '£',
    'GHS': '₵',
    'GTQ': 'Q',
    'GYD': '$',
    'GEL': '₾',
    'GNF': 'FG',
    'HNL': 'L',
    'HKD': 'HK$',
    'HUF': 'Ft',
    'ISK': 'kr',
    'INR': 'Rs',        // ✅ Official Shopify shows ₹ not Rs
    'IDR': 'Rp',
    'ILS': '₪',
    'JMD': '$',
    'JPY': '¥',
    'KZT': '₸',
    'KGS': '⃀',
    'LAK': '₭',
    'LBP': 'L£',
    'LRD': '$',
    'MGA': 'Ar',
    'MXN': '$',
    'MYR': 'RM',
    'MUR': 'Rs',
    'MNT': '₮',
    'NAD': '$',
    'NPR': 'Rs',
    'NZD': '$',
    'NIO': 'C$',
    'NGN': '₦',
    'NOK': 'kr',
    'PKR': 'Rs',
    'PYG': '₲',
    'PHP': '₱',
    'PLN': 'zł',
    'RON': 'lei',
    'RUB': '₽',
    'RWF': 'RF',
    'SHP': '£',
    'SGD': '$',
    'SBD': '$',
    'LKR': 'Rs',
    'SRD': '$',
    'SEK': 'kr',
    'CHF': 'CHF',
    'TWD': '$',
    'THB': '฿',
    'TOP': 'T$',
    'TTD': '$',
    'TRY': '₺',
    'UAH': '₴',
    'UYU': '$',
    'VND': '₫',
    'XOF': 'F CFA',
    'ZAR': 'R',
    'KRW': '₩',
    'SSP': '£',
    'STN': 'Db',
    
    // Major currencies
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': '$',
    
    // Common additions
    'AED': 'AED',
    'SAR': 'SAR',
    'QAR': 'QAR',
    'KWD': 'KWD',
    'BHD': 'BHD',
    'OMR': 'OMR',
    'JOD': 'JOD'
  };
  
  return currencySymbols[currencyCode] || currencyCode;
}


export function cartLinesDiscountsGenerateRun(input) {
  // Get the test configuration from the metafield
  const configuration = JSON.parse(input.discount.metafield?.value ?? "{}");
  const testVariants = configuration.testVariants ?? [];
  const { showTimer = false, timerMinutes } = configuration.discountConfig || {};
  const parsedTimerMinutes = Number(timerMinutes);
  const timeFrame = Number.isFinite(parsedTimerMinutes) && parsedTimerMinutes > 0 ? parsedTimerMinutes : 30;
  // Log which discount is being processed
  console.log('Processing discount with configuration:', JSON.stringify({
    testVariants: testVariants.map(v => ({
      name: v.name,
      percentage: v.percentage
    })),
    discountConfig: configuration.discountConfig
  }));

  // Check test targeting from testTargetingAttribute
  const testData = JSON.parse(input.cart.testTargetingAttribute?.value ?? "{}");
  

  // Check if discount test is active for this user
  let isDiscountTestActive = false;
  for (const [key, value] of Object.entries(testData)) {
    if (key.includes('discount_active') && value === "true") {
      isDiscountTestActive = true;
      
      break;
    }
  }

  // If discount test is not active, treat user as control group
  if (!isDiscountTestActive) {
    
    return { operations: [] };
  }

  // Timer enforcement (only when enabled via metafield config)
  const shouldEnforceTimer = showTimer === true && Number.isFinite(parsedTimerMinutes) && parsedTimerMinutes > 0;
  if (shouldEnforceTimer) {
    // Check if we're within the configured test window using frontend-provided current time
    const testTimer = input.cart.testTimerAttribute?.value;
    const currentTimeStr = input.cart.currentTimeAttribute?.value;

    if (!testTimer || !currentTimeStr) {
      
      return { operations: [] };
    }

    try {
      // Parse the timer JSON structure (now flat)
      const timerData = JSON.parse(testTimer);
      // Find the active discount test key
      const activeDiscountKey = Object.entries(testData)
        .find(([key, value]) => key.includes('discount_active') && value === "true")?.[0];
      if (!activeDiscountKey) {
        
        return { operations: [] };
      }
      const startTime = timerData[activeDiscountKey];
      if (!startTime) {
        
        return { operations: [] };
      }

      const testStartTime = new Date(startTime);
      const currentTime = new Date(currentTimeStr);

      // Calculate time difference in minutes
      const timeDifferenceMinutes = Math.abs(currentTime.getTime() - testStartTime.getTime()) / (1000 * 60);

      console.log('Timer check details:', {
        testStartTime: testStartTime.toISOString(),
        currentTime: currentTime.toISOString(),
        timeDifferenceMinutes: Math.floor(timeDifferenceMinutes),
        isWithinWindow: timeDifferenceMinutes <= timeFrame
      });

      // Check if within allowed minutes
      if (timeDifferenceMinutes > timeFrame) {
        console.log(`No discount appliedd: Test timer exceeded ${timeFrame} minutes`, {
          testStartTime: testStartTime.toISOString(),
          currentTime: currentTime.toISOString(),
          timeDifferenceMinutes: Math.floor(timeDifferenceMinutes)
        });
        return { operations: [] };
      }

      
    } catch (error) {
      
      return { operations: [] };
    }
  } else {
    
  }

  // Get the device ID and hash value from cart attributes
  const userIp = input.cart.userIpAttribute?.value ?? "";
  let hashValue = parseInt(input.cart.hashValueAttribute?.value ?? "0", 10);

  // If hash value is not available or invalid, calculate it from device ID
  if (isNaN(hashValue) || hashValue === 0) {
    if (userIp) {
      hashValue = generateConsistentHash(userIp) % 100; // Convert to 0-99 range for percentage-based selection
      
    } else {
      
      return { operations: [] };
    }
  }

  // If no test variants, return no discount
  if (testVariants.length === 0) {
    
    return { operations: [] };
  }

  // Find the appropriate variant based on hash value
  let currentPercentage = 0;
  let selectedVariant = null;

  for (const variant of testVariants) {
    currentPercentage += variant.percentage;
    if (hashValue <= currentPercentage) {
      selectedVariant = variant;
      break;
    }
  }

  // If no variant selected, return no discount
  if (!selectedVariant) {
    return { operations: [] };
  }

  // Check if this is the control group (0% discount)
  const isControlGroup = selectedVariant.discountPercentageValue === "0";
  if (isControlGroup) {
    
    return { operations: [] };
  }

  const operations = [];

  // Get the discount percentage from the selected variant
  const discountPercentage = parseFloat(selectedVariant.discountPercentageValue);
  if (isNaN(discountPercentage) || discountPercentage <= 0 || discountPercentage > 100) {
    
    return { operations: [] };
  }

  // Get the discount type and threshold from configuration
  const { type = 'quantity', threshold = '0' } = configuration.discountConfig || {};
  const thresholdValue = parseFloat(threshold);

  // Calculate total items and cart value
  const totalItems = input.cart.lines.reduce((sum, line) => {
    const quantity = parseInt(line.quantity, 10) || 0;
    return sum + quantity;
  }, 0);

  const cartTotal = input.cart.lines.reduce((sum, line) => {
    const amount = parseFloat(line.cost?.subtotalAmount?.amount) || 0;
    return sum + amount;
  }, 0);

  // Log detailed cart information
  console.log('Checking threshold:', {
    type,
    thresholdValue,
    totalItemsInCart: totalItems,
    cartTotal: cartTotal,
    numberOfLines: input.cart.lines.length,
    cartLines: input.cart.lines.map(line => ({
      id: line.merchandise?.id,
      title: line.merchandise?.title,
      quantity: line.quantity,
      cost: line.cost?.subtotalAmount?.amount
    }))
  });
  const currencyCode = input.cart.lines?.[0]?.cost?.subtotalAmount?.currencyCode || 
  input.cart.cost?.subtotalAmount?.currencyCode || 'USD';
const currencySymbol = getCurrencySymbol(currencyCode);
  // Create appropriate messages based on threshold type
  let qualifyingMessage, activeMessage;
  if (type === 'value') {
    const remainingAmount = thresholdValue - cartTotal;
    qualifyingMessage = `Add ${currencySymbol} ${remainingAmount.toFixed(2)} more to get ${discountPercentage}% off your order`;
    activeMessage = `${discountPercentage}% off orders over ${currencySymbol} ${thresholdValue}`;
  } else {
    const remainingItems = thresholdValue - totalItems;
    qualifyingMessage = `Add ${remainingItems} more item${remainingItems > 1 ? 's' : ''} to get ${discountPercentage}% off your order`;
    activeMessage = `${discountPercentage}% off orders with ${thresholdValue}+ items`;
  }

  // Check threshold based on type
  if (thresholdValue > 0) {
    if (type === 'quantity' && totalItems < thresholdValue) {
    
      return {
        operations: [{
          orderDiscountsAdd: {
            candidates: [{
              message: qualifyingMessage,
              targets: [
                {
                  orderSubtotal: {
                    excludedCartLineIds: [],
                  },
                },
              ],
              value: { percentage: { value: 0 } }
            }],
            selectionStrategy: "FIRST"
          }
        }]
      };
    }
    if (type === 'value' && cartTotal < thresholdValue) {

      return {
        operations: [{
          orderDiscountsAdd: {
            candidates: [{
              message: qualifyingMessage,
              targets: [
                {
                  orderSubtotal: {
                    excludedCartLineIds: [],
                  },
                },
              ],
              value: { percentage: { value: 0 } }
            }],
            selectionStrategy: "FIRST"
          }
        }]
      };
    }
  }

  // Add order-level discount when threshold is met
  operations.push({
    orderDiscountsAdd: {
      candidates: [
        {
          message: activeMessage,
          targets: [
            {
              orderSubtotal: {
                excludedCartLineIds: [],
              },
            },
          ],
          value: {
            percentage: {
              value: discountPercentage,
            },
          }
        },
      ],
      selectionStrategy: "FIRST",
    },
  });

  console.log('Applying discount:', {
    discountPercentage,
    totalItems,
    cartTotal,
    message: activeMessage
  });

  return {
    operations,
  };
}

// Function to generate a consistent hash from a string
function generateConsistentHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}