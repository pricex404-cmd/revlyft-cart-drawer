import { BlockStack, Text, Box } from "@shopify/polaris";
import { formatMoney } from "../../../utils/formatMoney";

// Color theme
const colors = {
    primary: '#6B7280',
    primaryLight: '#F3F4F6',
};

export const PricingMethodSelector = ({
    pricingMethod,
    onPricingMethodChange,
    isTestStarted,
    currency
}) => {
    return (
        <Box padding="400" background="bg-surface-secondary" borderRadius="200">
            <BlockStack gap="300">
                <Text variant="headingMd" as="h3" style={{ color: colors.primary }}>
                    Pricing Method<span style={{ fontSize: '0.9em', color: colors.primary }}>
                        <span> </span>       (Choose how you want to set your test prices)
                    </span>
                </Text>

                <BlockStack gap="200">
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            borderRadius: '6px',
                            backgroundColor: pricingMethod === 'percentage' ? colors.primaryLight : 'transparent',
                            border: `1px solid ${pricingMethod === 'percentage' ? colors.primary : 'transparent'}`,
                            cursor: isTestStarted ? 'not-allowed' : 'pointer',
                            opacity: isTestStarted ? 0.6 : 1
                        }}
                        onClick={() => !isTestStarted && onPricingMethodChange('percentage')}
                    >
                        <input
                            type="radio"
                            checked={pricingMethod === 'percentage'}
                            onChange={() => !isTestStarted && onPricingMethodChange('percentage')}
                            disabled={isTestStarted}
                            style={{
                                cursor: isTestStarted ? 'not-allowed' : 'pointer',
                                transform: 'scale(1.1)'
                            }}
                        />
                        <div>
                            <Text variant="bodyMd" as="span" style={{ fontWeight: '500' }}>
                                Percentage Discount
                            </Text>
                            <Text variant="bodySm" as="p" color="subdued" style={{ margin: '2px 0 0 0' }}>
                                Enter discount % and final price is calculated automatically
                            </Text>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            borderRadius: '6px',
                            backgroundColor: pricingMethod === 'fixedPrice' ? colors.primaryLight : 'transparent',
                            border: `1px solid ${pricingMethod === 'fixedPrice' ? colors.primary : 'transparent'}`,
                            cursor: isTestStarted ? 'not-allowed' : 'pointer',
                            opacity: isTestStarted ? 0.6 : 1
                        }}
                        onClick={() => !isTestStarted && onPricingMethodChange('fixedPrice')}
                    >
                        <input
                            type="radio"
                            checked={pricingMethod === 'fixedPrice'}
                            onChange={() => !isTestStarted && onPricingMethodChange('fixedPrice')}
                            disabled={isTestStarted}
                            style={{
                                cursor: isTestStarted ? 'not-allowed' : 'pointer',
                                transform: 'scale(1.1)'
                            }}
                        />
                        <div>
                            <Text variant="bodyMd" as="span" style={{ fontWeight: '500' }}>
                                Fixed Price
                            </Text>
                            <Text variant="bodySm" as="p" color="subdued" style={{ margin: '2px 0 0 0' }}>
                                Enter the exact price you want to test (e.g., {formatMoney(19.99, currency)})
                            </Text>
                        </div>
                    </div>
                </BlockStack>
            </BlockStack>
        </Box>
    );
};

export default PricingMethodSelector; 