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

export function cartLinesDiscountsGenerateRun(input) {
  // Get the test configuration from the metafield
  const configuration = JSON.parse(input.discount.metafield?.value ?? "{}");
  const testVariants = configuration.testVariants ?? [];
  const timeFrame = configuration.timeFrame ?? 30;
  // Log which discount is being processed
  console.log('Processing discount with configuration:', JSON.stringify({
    testVariants: testVariants.map(v => ({
      name: v.name,
      percentage: v.percentage
    })),
    discountConfig: configuration.discountConfig
  }));

  // Check test targeting from testDataAttribute
  const testData = JSON.parse(input.cart.testDataAttribute?.value ?? "{}");
  console.log('Test data attribute:', testData);

  // Check if discount test is active for this user
  let isDiscountTestActive = false;
  for (const [key, value] of Object.entries(testData)) {
    if (key.includes('discount_active') && value === "true") {
      isDiscountTestActive = true;
      console.log('Discount test is active:', key);
      break;
    }
  }

  // If discount test is not active, treat user as control group
  if (!isDiscountTestActive) {
    console.log('No discount applied: User not in active discount test targeting');
    return { operations: [] };
  }

  // Check if we're within the 30-minute test window using frontend-provided current time
  const testTimer = input.cart.testTimerAttribute?.value;
  const currentTimeStr = input.cart.currentTimeAttribute?.value;

  if (!testTimer || !currentTimeStr) {
    console.log('No discount applied: Missing test timer or current time');
    return { operations: [] };
  }

  try {
    // Parse the timer JSON structure
    const timerData = JSON.parse(testTimer);
    const discountKey = `discount_${Object.keys(testData)[0].split('_discount_active')[0]}`;
    const startTime = timerData.starttimer[discountKey];

    if (!startTime) {
      console.log('No discount applied: No start time found for this discount test');
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

    // Check if within 30 minutes
    if (timeDifferenceMinutes > timeFrame) {
      console.log(`No discount applied: Test timer exceeded ${timeFrame} minutes`, {
        testStartTime: testStartTime.toISOString(),
        currentTime: currentTime.toISOString(),
        timeDifferenceMinutes: Math.floor(timeDifferenceMinutes)
      });
      return { operations: [] };
    }

    console.log('Test timer check passed - discount will be applied');
  } catch (error) {
    console.log('Error processing test timer:', error.message);
    return { operations: [] };
  }

  // Get the device ID and hash value from cart attributes
  const deviceId = input.cart.deviceIdAttribute?.value ?? "";
  let hashValue = parseInt(input.cart.hashValueAttribute?.value ?? "0", 10);

  // If hash value is not available or invalid, calculate it from device ID
  if (isNaN(hashValue) || hashValue === 0) {
    if (deviceId) {
      hashValue = generateConsistentHash(deviceId) % 100; // Convert to 0-99 range for percentage-based selection
      console.log('Calculated hash value from device ID:', { deviceId, hashValue });
    } else {
      console.log('No discount applied: No hash value or device ID available');
      return { operations: [] };
    }
  }

  // If no test variants, return no discount
  if (testVariants.length === 0) {
    console.log('No discount applied: No test variants');
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
    console.log('No discount applied: Control group');
    return { operations: [] };
  }

  const operations = [];

  // Get the discount percentage from the selected variant
  const discountPercentage = parseFloat(selectedVariant.discountPercentageValue);
  if (isNaN(discountPercentage) || discountPercentage <= 0 || discountPercentage > 100) {
    console.log('No discount applied: Invalid discount percentage');
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

  // Create appropriate messages based on threshold type
  let qualifyingMessage, activeMessage;
  if (type === 'value') {
    const remainingAmount = thresholdValue - cartTotal;
    qualifyingMessage = `Add $${remainingAmount.toFixed(2)} more to get ${discountPercentage}% off your order`;
    activeMessage = `${discountPercentage}% off orders over $${thresholdValue}`;
  } else {
    const remainingItems = thresholdValue - totalItems;
    qualifyingMessage = `Add ${remainingItems} more item${remainingItems > 1 ? 's' : ''} to get ${discountPercentage}% off your order`;
    activeMessage = `${discountPercentage}% off orders with ${thresholdValue}+ items`;
  }

  // Check threshold based on type
  if (thresholdValue > 0) {
    if (type === 'quantity' && totalItems < thresholdValue) {
      console.log(`No discount applied: Total quantity (${totalItems}) is less than threshold (${thresholdValue})`);
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
      console.log(`No discount applied: Cart total ($${cartTotal}) is less than threshold ($${thresholdValue})`);
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