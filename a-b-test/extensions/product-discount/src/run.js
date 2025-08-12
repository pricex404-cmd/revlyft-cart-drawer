// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.All,
  discounts: [],
};

/**
 * Generate a consistent hash for a customer ID to ensure consistent test group assignment
 * @param {string} customerId - The customer ID to hash
 * @returns {number} - A value between 0 and 100
 */
function generateConsistentHash(customerId) {
  let hash = 0;
  if (customerId.length === 0) return hash;

  for (let i = 0; i < customerId.length; i++) {
    const char = customerId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to a value between 0 and 100
  return Math.abs(hash % 100);
}

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  // Try to get configuration from metafield or use default value
  let configuration = {};

  try {
    configuration = JSON.parse(
      input?.discountNode?.metafield?.value ?? "{}"
    );
  } catch (error) {
    configuration = {};
  }

  // Get test variants from configuration or use default
  const testVariants = configuration.testVariants || [];

  if (testVariants.length === 0) {
    return EMPTY_DISCOUNT;
  }

  // Check if user is targeted for any active pricing tests
  const testDataAttribute = input?.cart?.testDataAttribute?.value;
  if (testDataAttribute) {
    try {
      const testData = JSON.parse(testDataAttribute);

      // Check if user is NOT targeted for any active pricing tests
      for (const [testKey, isTargeted] of Object.entries(testData)) {
        if (isTargeted === 'false' && testKey.includes('_pricing_active')) {
          return EMPTY_DISCOUNT;
        }
      }
    } catch (error) {
      // Continue processing if test data parsing fails
    }
  }

  // Get the hash value from the cart attribute if available
  const hashValueAttribute = input?.cart?.hashValueAttribute?.value;
  const deviceIdAttribute = input?.cart?.deviceIdAttribute?.value;

  // Use hash value if available, otherwise calculate it from device ID
  let userHashValue;
  if (hashValueAttribute) {
    userHashValue = parseInt(hashValueAttribute, 10);
  } else if (deviceIdAttribute) {
    userHashValue = generateConsistentHash(deviceIdAttribute);
  } else {
    userHashValue = 0;
  }

  // Select variant based on hash value
  let selectedVariant = null;
  let cumulativePercentage = 0;

  // FOR TESTING: Force selection of the first non-control variant when no device ID
  if (!deviceIdAttribute && testVariants.length > 1) {
    selectedVariant = testVariants[1]; // Use the first non-control variant
  } else {
    // Normal variant selection logic
    for (const variant of testVariants) {
      cumulativePercentage += variant.percentage;

      // If the user's hash value falls within this variant's range, select it
      if (userHashValue < cumulativePercentage) {
        selectedVariant = variant;
        break;
      }
    }
  }

  // If no variant was selected, return empty discount
  if (!selectedVariant) {
    return EMPTY_DISCOUNT;
  }

  // Check if we're in control group
  const isControlGroup = selectedVariant === testVariants[0];

  // Get cart lines and process discounts
  const lines = input?.cart?.lines || [];
  const discounts = [];

  // Check each line to see if it's eligible for a discount
  for (const line of lines) {
    // Skip if not a product variant
    if (line?.merchandise?.__typename !== "ProductVariant") {
      continue;
    }

    const productId = line?.merchandise?.product?.id || "";
    const variantId = line?.merchandise?.id || "";

    // Extract the numeric part from the product ID and variant ID
    const numericProductId = productId.split("/").pop();
    const numericVariantId = variantId.split("/").pop();

    if (!numericProductId || !selectedVariant.products ||
      !(numericProductId in selectedVariant.products)) {
      continue;
    }

    const productConfig = selectedVariant.products[numericProductId];

    if (!productConfig || typeof productConfig !== 'object') {
      continue;
    }

    // Skip applying discounts if it's the control group
    if (isControlGroup) {
      continue;
    }

    let discountPercentage;

    // Get the actual price per item from the cart
    // @ts-ignore - cart line cost property exists at runtime
    let cartPrice = parseFloat(line?.cost?.amountPerQuantity?.amount || '0');

    // If line cost is not available, calculate price per item from this line's total
    if (cartPrice === 0) {
      // @ts-ignore - cart line cost property exists at runtime
      const lineTotalAmount = parseFloat(line?.cost?.totalAmount?.amount || '0');
      const lineQuantity = line?.quantity || 1;
      cartPrice = lineQuantity > 0 ? lineTotalAmount / lineQuantity : 0;
    }

    // Check if this is a multi-variant product
    if (productConfig.isMultiVariant && productConfig.variants && numericVariantId) {
      // Handle multi-variant product - get variant-specific discount percentage
      const variantConfig = productConfig.variants[numericVariantId];

      if (!variantConfig || typeof variantConfig !== 'object') {
        continue;
      }

      discountPercentage = Number(variantConfig.discountPercentage);
    } else {
      // Handle single variant product - use existing logic
      discountPercentage = Number(productConfig.discountPercentage);
    }

    // Skip if discount percentage is not valid
    if (isNaN(discountPercentage) || discountPercentage <= 0 ||
      isNaN(cartPrice) || cartPrice <= 0) {
      continue;
    }

    // Round the discount percentage to 2 decimal places for consistency
    const roundedDiscountPercentage = Math.round(discountPercentage * 100) / 100;
    console.log('roundedDiscountPercentage', roundedDiscountPercentage);
    discounts.push({
      value: {
        percentage: {
          value: roundedDiscountPercentage.toString()
        }
      },
      targets: [{
        productVariant: {
          id: line.merchandise.id
        }
      }],
      message: `Exclusive offer for you`
    });
  }

  // If there are no eligible discounts, return empty discount
  if (discounts.length === 0) {
    return EMPTY_DISCOUNT;
  }

  // Return all discounts
  return {
    discountApplicationStrategy: DiscountApplicationStrategy.All,
    discounts: discounts
  };
}