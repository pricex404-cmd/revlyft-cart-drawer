import { BlockStack, Text, InlineStack } from "@shopify/polaris";
import { formatMoney } from "../../../utils/formatMoney";

// Color theme
const colors = {
    border: '#D1D5DB',
    surface: '#F9FAFB'
};

// CSS to remove spin arrows from number inputs
const inputStyles = `
  /* Remove spin arrows from number input fields */
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button, 
  input::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0 !important;
  }

  /* Firefox */
  input[type=number] {
    -moz-appearance: textfield !important;
  }

  /* Additional specificity for all browsers */
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0 !important;
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = inputStyles;
    document.head.appendChild(styleSheet);
}

export const SingleVariantPricing = ({
    product,
    testGroups,
    pricingMethod,
    currency,
    onPriceChange,
    isTestStarted,
    extractShopifyProductId
}) => {
    return (
        <div style={{ overflowX: 'auto' }}>
            <InlineStack gap="400" wrap={false}>
                {testGroups.map(group => {
                    const numericProductId = extractShopifyProductId(product.productId);
                    const isControlGroup = group.name.toLowerCase().includes('control');
                    const currentPrice = group.products?.[numericProductId]?.modifiedPrice ?? product.originalPrice;

                    return (
                        <div key={group.id} style={{ minWidth: '150px' }}>
                            <BlockStack gap="200">
                                <Text variant="bodyMd" as="p">{group.name}</Text>
                                {pricingMethod === 'percentage' ? (
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="number"
                                            placeholder="Enter discount %"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={group.products?.[numericProductId]?.discountPercentage || 0}
                                            onChange={(e) => onPriceChange(product.productId, group.id, e.target.value, null, 'percentage')}
                                            disabled={isControlGroup || isTestStarted}
                                            style={{
                                                width: '100%',
                                                padding: '8px 24px 8px 8px',
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '4px',
                                                backgroundColor: (isControlGroup || isTestStarted) ? colors.surface : 'white',
                                                WebkitAppearance: 'none !important',
                                                MozAppearance: 'textfield !important'
                                            }}
                                        />

                                        {group.products?.[numericProductId]?.modifiedPrice !== undefined && (
                                            <Text variant="bodySm" as="p" color="subdued" style={{ marginTop: '4px' }}>
                                                Final price: {formatMoney(group.products[numericProductId].modifiedPrice, currency)}
                                            </Text>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <input
                                            type="number"
                                            value={currentPrice || 0}
                                            onChange={(e) => onPriceChange(product.productId, group.id, e.target.value)}
                                            disabled={isControlGroup || isTestStarted}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '4px',
                                                backgroundColor: (isControlGroup || isTestStarted) ? colors.surface : 'white',
                                                WebkitAppearance: 'none !important',
                                                MozAppearance: 'textfield !important'
                                            }}
                                        />

                                        <Text variant="bodySm" as="p" color="subdued" style={{ marginTop: '4px' }}>
                                            Discount: {(group?.products?.[numericProductId]?.discountPercentage) ? group.products[numericProductId].discountPercentage.toFixed(1) : 0}<span style={{ fontSize: '0.9em' }}>%</span>
                                        </Text>
                                    </div>
                                )}
                            </BlockStack>
                        </div>
                    );
                })}
            </InlineStack>
        </div>
    );
};

export default SingleVariantPricing; 