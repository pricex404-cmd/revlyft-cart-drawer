import { BlockStack, Text, Box, InlineStack, Button } from "@shopify/polaris";
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

// Compact version for individual products
export const ProductPricingMethodSelector = ({
    pricingMethod,
    onPricingMethodChange,
    isTestStarted,
    currency
}) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
                fontSize: '13px', 
                color: '#6b7280', 
                fontWeight: '500',
                whiteSpace: 'nowrap'
            }}>
                Pricing:
            </span>
            
            <div style={{
                display: 'flex',
                background: '#f3f4f6',
                borderRadius: '6px',
                padding: '2px',
                border: '1px solid #e5e7eb'
            }}>
                <button
                    onClick={() => !isTestStarted && onPricingMethodChange('percentage')}
                    disabled={isTestStarted}
                    style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isTestStarted ? 'not-allowed' : 'pointer',
                        background: pricingMethod === 'percentage' ? '#ffffff' : 'transparent',
                        color: pricingMethod === 'percentage' ? '#1f2937' : '#6b7280',
                        boxShadow: pricingMethod === 'percentage' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
                        transition: 'all 0.2s ease',
                        minWidth: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                    }}
                >
                    <span style={{ fontSize: '14px', fontWeight: '700' }}>%</span>
                    <span>Discount</span>
                </button>
                
                <button
                    onClick={() => !isTestStarted && onPricingMethodChange('fixedPrice')}
                    disabled={isTestStarted}
                    style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isTestStarted ? 'not-allowed' : 'pointer',
                        background: pricingMethod === 'fixedPrice' ? '#ffffff' : 'transparent',
                        color: pricingMethod === 'fixedPrice' ? '#1f2937' : '#6b7280',
                        boxShadow: pricingMethod === 'fixedPrice' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
                        transition: 'all 0.2s ease',
                        minWidth: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                    }}
                >
                    <span style={{ fontSize: '14px', fontWeight: '700' }}>₹</span>
                    <span>Fixed</span>
                </button>
            </div>
        </div>
    );
};

export default PricingMethodSelector; 