import { BlockStack, Text, Box, InlineStack, Button } from "@shopify/polaris";
import SingleVariantPricing from './SingleVariantPricing';
import MultiVariantPricing from './MultiVariantPricing';
import { ProductPricingMethodSelector } from './PricingMethodSelector';

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
    extractShopifyProductId,
    onProductPricingMethodChange
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

            {selectedProducts.map((product) => {
                // Get the pricing method for this specific product, fallback to global method
                const productPricingMethod = product.pricingMethod || pricingMethod;
                
                return (
                    <Box key={product.productId} padding="400" background="bg-surface-secondary" style={{ borderRadius: '8px', border: '1px solid #e5e7eb' ,padding: '4px'}}>
                        <BlockStack gap="400">
                            <InlineStack align="space-between">
                                <InlineStack gap="400">
                                    
                                        <img
                                            src={product.imageUrl}
                                            alt={product.title}
                                            style={{ 
                                                width: '60px', 
                                                height: '60px', 
                                                objectFit: 'cover',
                                                borderRadius: '6px',
                                                border: '1px solid #e5e7eb'
                                            }}
                                        />
                               
                                    <BlockStack gap="100">
                                        <Text variant="headingSm" as="h3" style={{ fontWeight: '600' }}>{product.title}</Text>
                                        {product.isMultiVariant && product.samePrice ? (
                                            <BlockStack gap="50">
                                                <Text variant="bodyMd" as="p" color="subdued">
                                                    Multi-variant product (all {product.variants?.length || 0} variants selected)
                                                </Text>
                                                <Text variant="bodyMd" as="p" color="subdued" style={{ fontWeight: '500' }}>
                                                    Original Price: ${product.originalPrice?.toFixed(2) || '0.00'}
                                                </Text>
                                            </BlockStack>
                                        ) : product.isMultiVariant ? (
                                            <Text variant="bodyMd" as="p" color="subdued">
                                                Multi-variant product ({product.variants?.length || 0} selected variants)
                                            </Text>
                                        ) : (
                                            <Text variant="bodyMd" as="p" color="subdued" style={{ fontWeight: '500' }}>
                                                Original Price: ${product.originalPrice?.toFixed(2) || '0.00'}
                                            </Text>
                                        )}
                                    </BlockStack>
                                </InlineStack>
                                <InlineStack gap="400" align="center">
                                    <ProductPricingMethodSelector
                                        pricingMethod={productPricingMethod}
                                        onPricingMethodChange={(method) => onProductPricingMethodChange(product.productId, method)}
                                        isTestStarted={isTestStarted}
                                        currency={currency}
                                    />
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        margin: '0px, 0px'
                                    }}>
                                    <Button
                                        plain
                                        onClick={() => onRemoveProduct(product)}
                                            disabled={isTestStarted}
                                            class="remove-product-button"
                                            style={{
                                                padding: '89px, 0px'
                                            }}
                                        
                                    >
                                        ×
                                        </Button>
                                        </div>
                                </InlineStack>
                            </InlineStack>

                            {/* Price inputs for each test group */}
                            {product.isMultiVariant ? (
                                <MultiVariantPricing
                                    product={product}
                                    testGroups={testGroups}
                                    pricingMethod={productPricingMethod}
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
                                    pricingMethod={productPricingMethod}
                                    currency={currency}
                                    onPriceChange={onPriceChange}
                                    isTestStarted={isTestStarted}
                                    extractShopifyProductId={extractShopifyProductId}
                                />
                            )}
                        </BlockStack>
                    </Box>
                );
            })}
        </BlockStack>
    );
};

export default ProductPricingInterface; 