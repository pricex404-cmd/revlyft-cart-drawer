import { BlockStack, Text, InlineStack } from "@shopify/polaris";
import { getCurrencySymbol } from "../../../utils/currencyFormatter";

// Color theme
const colors = {
    border: '#D1D5DB',
    surface: '#F9FAFB'
};
import { formatNumberInput , numberInputCSS,formatDisplayValue } from "../../../utils/numberInputUtils";
// CSS to remove spinner arrows from number inputs



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
            <style>{numberInputCSS}</style>
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
                                            max="99"
                                            value={formatDisplayValue(group.products?.[numericProductId]?.discountPercentage)}
                                            onChange={(e) => onPriceChange(product.productId, group.id, e.target.value, null, 'percentage')}
                                            onBlur={(e) => {
                                                const formattedValue = formatNumberInput(e.target.value);
                                                if (formattedValue !== e.target.value) {
                                                    onPriceChange(product.productId, group.id, formattedValue, null, 'percentage');
                                                }
                                            }}
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
                                                Final price: {getCurrencySymbol(currency)}{group.products[numericProductId].modifiedPrice?.toFixed(2) || '0.00'}
                                            </Text>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <input
                                            type="number"
                                            value={formatDisplayValue(currentPrice)}
                                            onChange={(e) => onPriceChange(product.productId, group.id, e.target.value)}
                                            onBlur={(e) => {
                                                const formattedValue = formatNumberInput(e.target.value);
                                                if (formattedValue !== e.target.value) {
                                                    onPriceChange(product.productId, group.id, formattedValue);
                                                }
                                            }}
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