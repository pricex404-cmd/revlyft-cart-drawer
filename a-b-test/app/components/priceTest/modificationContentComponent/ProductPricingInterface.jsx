import { BlockStack, Text, Box, InlineStack, Button } from "@shopify/polaris";
import SingleVariantPricing from './SingleVariantPricing';
import MultiVariantPricing from './MultiVariantPricing';

export const ProductPricingInterface = ({
    selectedProducts,
    testGroups,
    pricingMethod,
    currency,
    onPriceChange,
    onVariantSelectionInPricing,
    onRemoveProduct,
    onShowProductList,
    isTestStarted,
    extractShopifyProductId
}) => {
    return (
        <BlockStack gap="400">
            <InlineStack align="space-between">
                <Button
                    onClick={onShowProductList}
                    plain
                    style={{ minWidth: '150px' }}
                >
                    + Add / Remove Products
                </Button>
            </InlineStack>

            {/* Header for price columns */}
            <Box padding="400" style={{ overflowX: 'auto' }}>
                <div style={{ paddingRight: '32px' }}>
                    <InlineStack align="end" gap="800" wrap={false}>
                        <Box style={{ minWidth: '300px', flexShrink: 0 }}></Box>
                        {testGroups.map(group => (
                            <Box key={group.id} style={{ minWidth: '100px', flexShrink: 0, textAlign: 'center' }}>
                                <Text variant="bodyMd" as="p">{group.name}</Text>
                            </Box>
                        ))}
                    </InlineStack>
                </div>
            </Box>

            {selectedProducts.map((product) => (
                <Box key={product.productId} padding="400" background="bg-surface-secondary">
                    <BlockStack gap="400">
                        <InlineStack align="space-between">
                            <InlineStack gap="400">
                                <img
                                    src={product.imageUrl}
                                    alt={product.title}
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                />
                                <BlockStack gap="100">
                                    <Text variant="headingSm" as="h3">{product.title}</Text>
                                    {product.isMultiVariant && product.samePrice ? (
                                        <BlockStack gap="50">
                                            <Text variant="bodyMd" as="p" color="subdued">
                                                Multi-variant product (all {product.variants?.length || 0} variants selected)
                                            </Text>
                                            <Text variant="bodyMd" as="p" color="subdued">
                                                Original Price: ${product.originalPrice?.toFixed(2) || '0.00'}
                                            </Text>
                                        </BlockStack>
                                    ) : product.isMultiVariant ? (
                                        <Text variant="bodyMd" as="p" color="subdued">
                                            Multi-variant product ({product.variants?.length || 0} selected variants)
                                        </Text>
                                    ) : (
                                        <Text variant="bodyMd" as="p" color="subdued">
                                            Original Price: ${product.originalPrice?.toFixed(2) || '0.00'}
                                        </Text>
                                    )}
                                </BlockStack>
                            </InlineStack>
                            <Button
                                plain
                                onClick={() => onRemoveProduct(product)}
                                disabled={isTestStarted}
                            >
                                ×
                            </Button>
                        </InlineStack>

                        {/* Price inputs for each test group */}
                        {product.isMultiVariant ? (
                            <MultiVariantPricing
                                product={product}
                                testGroups={testGroups}
                                pricingMethod={pricingMethod}
                                currency={currency}
                                onPriceChange={onPriceChange}
                                onVariantSelectionInPricing={onVariantSelectionInPricing}
                                isTestStarted={isTestStarted}
                                extractShopifyProductId={extractShopifyProductId}
                            />
                        ) : (
                            <SingleVariantPricing
                                product={product}
                                testGroups={testGroups}
                                pricingMethod={pricingMethod}
                                currency={currency}
                                onPriceChange={onPriceChange}
                                isTestStarted={isTestStarted}
                                extractShopifyProductId={extractShopifyProductId}
                            />
                        )}
                    </BlockStack>
                </Box>
            ))}
        </BlockStack>
    );
};

export default ProductPricingInterface; 