import { useState, useEffect } from "react";
import { Text, BlockStack, InlineStack, Box, Banner, Spinner, LegacyCard } from "@shopify/polaris";
import extractShopifyProductId from "../../utils/extractProductId";
import { formatMoney } from "../../utils/formatMoney";

export const PreviewContent = ({ testId, shop, currentTestData }) => {
    const [isTestSaved, setIsTestSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [testData, setTestData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTestData = async () => {
            setIsLoading(true);
            try {
                const sanitizedDomain = shop.domain.replace(/\./g, '_');
                const response = await fetch(`https://abtest-6b299-default-rtdb.firebaseio.com/abTests/${sanitizedDomain}/${testId}.json`);
                const data = await response.json();

                if (!data) {
                    setError('Test not found');
                    setIsTestSaved(false);
                } else {
                    setTestData(data);
                    setIsTestSaved(true);
                }
            } catch (error) {
                console.error('Error fetching test data:', error);
                setError('Failed to fetch test data');
                setIsTestSaved(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTestData();
    }, [testId, shop.domain]);

    if (isLoading) {
        return (
            <BlockStack gap="400">
                <Box padding="400" background="bg-surface-secondary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <Spinner accessibilityLabel="Loading preview content" size="large" />
                </Box>
            </BlockStack>
        );
    }

    if (error) {
        return (
            <BlockStack gap="400">
                <Banner
                    title="Error Loading Test"
                    tone="critical"
                >
                    <p>{error}</p>
                </Banner>
            </BlockStack>
        );
    }

    if (!isTestSaved) {
        return (
            <BlockStack gap="400">
                <Banner
                    title="Save Test Required"
                    tone="warning"
                >
                    <p>Please save your test configuration before accessing the preview. Click the Save button at the top of the page to proceed.</p>
                </Banner>
            </BlockStack>
        );
    }

    if (!testData || !testData.selectedProducts || testData.selectedProducts.length === 0) {
        return (
            <BlockStack gap="400">
                <Banner
                    title="No Products Selected"
                    tone="warning"
                >
                    <p>Please select at least one product to test before previewing. Return to the previous step to configure your test products.</p>
                </Banner>
            </BlockStack>
        );
    }

    // Check if any products have been configured for price modifications
    const hasProductModifications = testData.testGroups.some(group =>
        group.products && Object.keys(group.products).length > 0
    );

    if (!hasProductModifications) {
        return (
            <BlockStack gap="400">
                <Banner
                    title="Product Price Modifications Required"
                    tone="warning"
                >
                    <p>Please create at least one product price modification first before previewing. Return to the previous step to configure product prices for your test groups.</p>
                </Banner>
            </BlockStack>
        );
    }

    return (
        <BlockStack gap="400">
            <Banner
                title="Save Test to View Preview"
                tone="info"
            >
                <p>Please save your test configuration to see the preview. Click the Save button at the top of the page to save your changes and view the preview.</p>
            </Banner>

            <InlineStack align="space-between">
                <BlockStack gap="200">
                    <Text variant="headingLg" as="h1">
                        Test Preview
                    </Text>
                    <Text variant="bodyMd" as="p" color="subdued">
                        Preview your test groups and their product configurations
                    </Text>
                </BlockStack>
            </InlineStack>

            <BlockStack gap="400">
                {testData.testGroups.map((group) => (
                    <LegacyCard key={group.id}>
                        <LegacyCard.Section>
                            <BlockStack gap="400">
                                {/* Group Header */}
                                <Text variant="headingMd" as="h2" style={{ fontWeight: '600', color: '#202223' }}>
                                    {group.name} ({group.percentage}% of traffic)
                                </Text>

                                {/* Products in this group */}
                                {testData.selectedProducts.map(product => {
                                    if (!product.productId) return null;

                                    const numericProductId = extractShopifyProductId(product.productId);
                                    const groupProductData = group.products && group.products[numericProductId];

                                    if (!groupProductData) return null;

                                    return (
                                        <Box key={product.productId} padding="400" background="bg-surface-secondary" style={{ borderRadius: '8px', border: '1px solid #e5e7eb',padding: '10px' }}>
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
                                                            <Text variant="headingSm" as="h3" style={{ fontWeight: '600' }}>
                                                                {product.title}
                                                            </Text>
                                                            {product.isMultiVariant && groupProductData.isMultiVariant ? (
                                                                <Text variant="bodyMd" as="p" color="subdued">
                                                                    Multi-variant product
                                                                </Text>
                                                            ) : (
                                                                <Text variant="bodyMd" as="p" color="subdued" style={{ fontWeight: '500' }}>
                                                                    Original Price: {formatMoney(product.originalPrice, testData?.basicInfo?.currency)}
                                                                </Text>
                                                            )}
                                                        </BlockStack>
                                                    </InlineStack>
                                                </InlineStack>

                                                {/* Price details */}
                                                {product.isMultiVariant && groupProductData.isMultiVariant ? (
                                                    // Multi-variant product pricing
                                                    <BlockStack gap="200">
                                                        <Text variant="bodyMd" as="h4" style={{ fontWeight: '500' }}>
                                                            Variant Prices:
                                                        </Text>
                                                        {product.variants?.map(productVariant => {
                                                            const numericVariantId = extractShopifyProductId(productVariant.variantId);
                                                            const variantData = groupProductData.variants?.[numericVariantId];
                                                            const modifiedPrice = variantData?.modifiedPrice !== undefined
                                                                ? parseFloat(variantData.modifiedPrice)
                                                                : parseFloat(productVariant.price);

                                                            return (
                                                                <InlineStack key={productVariant.variantId} align="space-between" style={{ marginLeft: '20px' }}>
                                                                    <Text variant="bodyMd" color="subdued">
                                                                        • {productVariant.title}
                                                                    </Text>
                                                                    <Text variant="bodyMd" style={{ fontWeight: '500' }}>
                                                                        {formatMoney(modifiedPrice, testData?.basicInfo?.currency)}
                                                                    </Text>
                                                                </InlineStack>
                                                            );
                                                        })}
                                                    </BlockStack>
                                                ) : (
                                                    // Single variant product pricing
                                                    <InlineStack align="space-between">
                                                        <Text variant="bodyMd" color="subdued">
                                                            Modified Price:
                                                        </Text>
                                                        <Text variant="bodyMd" style={{ fontWeight: '600', color: '#008060' }}>
                                                            {formatMoney(groupProductData.modifiedPrice, testData?.basicInfo?.currency)}
                                                        </Text>
                                                    </InlineStack>
                                                )}
                                            </BlockStack>
                                        </Box>
                                    );
                                })}
                            </BlockStack>
                        </LegacyCard.Section>
                    </LegacyCard>
                ))}
            </BlockStack>
        </BlockStack>
    );
};

export default PreviewContent; 