import { BlockStack, Text, Box, InlineStack } from "@shopify/polaris";
import { formatMoney } from "../../../utils/formatMoney";

// Color theme
const colors = {
    primary: '#6B7280',
    primaryLight: '#F3F4F6',
    border: '#D1D5DB',
    surface: '#F9FAFB'
};

export const MultiVariantPricing = ({
    product,
    testGroups,
    pricingMethod,
    currency,
    onPriceChange,
    onVariantSelectionInPricing,
    isTestStarted,
    extractShopifyProductId
}) => {
    if (product.isMultiVariant && product.samePrice) {
        // Same price multi-variant: show simple interface like normal product
        return (
            <div style={{ overflowX: 'auto' }}>
                <InlineStack gap="400" wrap={false}>
                    {testGroups.map(group => {
                        const numericProductId = extractShopifyProductId(product.productId);
                        const currentPrice = group.products?.[numericProductId]?.modifiedPrice ?? product.originalPrice;
                        const isControlGroup = group.name.toLowerCase().includes('control');

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
                                                    backgroundColor: (isControlGroup || isTestStarted) ? colors.surface : 'white'
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
                                                    backgroundColor: (isControlGroup || isTestStarted) ? colors.surface : 'white'
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
    }

    // Different prices multi-variant: show variant selection and pricing
    return (
        <BlockStack gap="400">
            <Text variant="headingSm" as="h4" style={{ color: colors.primary }}>
                Select variants to include in test:
            </Text>

            {/* Variant Selection Section */}
            <Box padding="400" background="bg-surface-secondary">
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    {product.allVariants?.map((variant) => {
                        const isVariantSelected = product.variants?.some(v => v.variantId === variant.variantId) || false;

                        return (
                            <div key={variant.variantId} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                minWidth: '250px',
                                flex: '1 1 auto',
                                maxWidth: '400px'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={isVariantSelected}
                                    onChange={() => onVariantSelectionInPricing(product, variant)}
                                    disabled={isTestStarted}
                                    style={{
                                        cursor: isTestStarted ? 'not-allowed' : 'pointer',
                                        transform: 'scale(1.1)',
                                        flexShrink: 0
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <Text variant="headingSm" as="h5" style={{ marginBottom: '4px' }}>
                                        {variant.title}
                                    </Text>
                                    <Text variant="bodyMd" as="p" color="subdued">
                                        Original Price: {formatMoney(variant.price, currency)}
                                    </Text>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Box>

            {/* Pricing Section for Selected Variants */}
            {product.variants && product.variants.length > 0 && (
                <div style={{
                    marginTop: '24px',
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: `2px solid ${colors.primary}`
                }}>
                    <BlockStack gap="400">
                        {product.variants.map((variant) => (
                            <Box key={variant.variantId} padding="400" background="bg-surface-secondary">
                                <BlockStack gap="400">
                                    <InlineStack align="space-between">
                                        <InlineStack gap="400">
                                            <img
                                                src={product.imageUrl}
                                                alt={variant.title}
                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                            />
                                            <BlockStack gap="100">
                                                <Text variant="headingSm" as="h3">{variant.title}</Text>
                                                <Text variant="bodyMd" as="p" color="subdued">
                                                    Original Price: {formatMoney(variant.price, currency)}
                                                </Text>
                                            </BlockStack>
                                        </InlineStack>
                                    </InlineStack>

                                    {/* Price inputs for each test group - single variant style */}
                                    <div style={{ overflowX: 'auto' }}>
                                        <InlineStack gap="400" wrap={false}>
                                            {testGroups.map(group => {
                                                const numericProductId = extractShopifyProductId(product.productId);
                                                const numericVariantId = extractShopifyProductId(variant.variantId);
                                                const currentPrice = group.products?.[numericProductId]?.variants?.[numericVariantId]?.modifiedPrice ?? variant.price;
                                                const isControlGroup = group.name.toLowerCase().includes('control');

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
                                                                        value={group.products?.[numericProductId]?.variants?.[numericVariantId]?.discountPercentage || 0}
                                                                        onChange={(e) => onPriceChange(product.productId, group.id, e.target.value, variant.variantId, 'percentage')}
                                                                        disabled={isControlGroup || isTestStarted}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '8px 24px 8px 8px',
                                                                            border: `1px solid ${colors.border}`,
                                                                            borderRadius: '4px',
                                                                            backgroundColor: (isControlGroup || isTestStarted) ? colors.surface : 'white'
                                                                        }}
                                                                    />

                                                                    {group.products?.[numericProductId]?.variants?.[numericVariantId]?.modifiedPrice !== undefined && (
                                                                        <Text variant="bodySm" as="p" color="subdued" style={{ marginTop: '4px' }}>
                                                                            Final price: {formatMoney(group.products[numericProductId].variants[numericVariantId].modifiedPrice, currency)}
                                                                        </Text>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <input
                                                                        type="number"
                                                                        value={currentPrice || 0}
                                                                        onChange={(e) => onPriceChange(product.productId, group.id, e.target.value, variant.variantId)}
                                                                        disabled={isControlGroup || isTestStarted}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '8px',
                                                                            border: `1px solid ${colors.border}`,
                                                                            borderRadius: '4px',
                                                                            backgroundColor: (isControlGroup || isTestStarted) ? colors.surface : 'white'
                                                                        }}
                                                                    />

                                                                    <Text variant="bodySm" as="p" color="subdued" style={{ marginTop: '4px' }}>
                                                                        Discount: {(group.products?.[numericProductId]?.variants?.[numericVariantId]?.discountPercentage) ? group.products[numericProductId].variants[numericVariantId].discountPercentage.toFixed(1) : 0}<span style={{ fontSize: '0.9em' }}>%</span>
                                                                    </Text>
                                                                </div>
                                                            )}
                                                        </BlockStack>
                                                    </div>
                                                );
                                            })}
                                        </InlineStack>
                                    </div>
                                </BlockStack>
                            </Box>
                        ))}
                    </BlockStack>
                </div>
            )}
        </BlockStack>
    );
};

export default MultiVariantPricing; 