import { useState } from "react";
import { Text, BlockStack, Card, EmptyState, Button, InlineStack, Badge } from "@shopify/polaris";
import { ChevronDownIcon, ChevronRightIcon } from '@shopify/polaris-icons';

export const ResultsContent = ({ testGroups = [], selectedProducts = [] }) => {
    const [expandedGroups, setExpandedGroups] = useState(new Set());
    const [expandedProducts, setExpandedProducts] = useState(new Set());
    if (!testGroups || testGroups.length === 0) {
        return (
            <BlockStack gap="400">
                <EmptyState
                    heading="No test results available"
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                    <p>Start the test to collect and view results.</p>
                </EmptyState>
            </BlockStack>
        );
    }



    // Helper function to count analytics data
    const countAnalytics = (analyticsData) => {
        if (!analyticsData) return 0;

        if (Array.isArray(analyticsData)) {
            return analyticsData.filter(a => a !== '').length;
        } else if (typeof analyticsData === 'object') {
            let total = 0;
            Object.values(analyticsData).forEach(arr => {
                if (Array.isArray(arr)) {
                    total += arr.filter(a => a !== '').length;
                }
            });
            return total;
        }
        return 0;
    };

    // Helper function to count analytics for specific keys (products/variants)
    const countAnalyticsForKeys = (analyticsData, keyPattern) => {
        if (!analyticsData || typeof analyticsData !== 'object') return 0;

        let total = 0;
        Object.entries(analyticsData).forEach(([key, arr]) => {
            if (key.includes(keyPattern) && Array.isArray(arr)) {
                total += arr.filter(a => a !== '').length;
            }
        });
        return total;
    };

    // Get product info by ID
    const getProductInfo = (productId) => {
        if (!selectedProducts || !productId) return null;

        // Clean up product ID - remove GQL prefix if present
        const cleanProductId = productId.toString().replace('gid://shopify/Product/', '');

        // Try to find the product by matching various ID formats
        return selectedProducts.find(p => {
            if (!p.productId) return false;

            // Clean up the product's ID
            const cleanPId = p.productId.toString().replace('gid://shopify/Product/', '');

            // Match by cleaned IDs or original IDs
            return cleanPId === cleanProductId ||
                p.productId === productId ||
                cleanPId === productId ||
                p.productId === cleanProductId;
        });
    };

    // Toggle functions for expand/collapse
    const toggleGroupProducts = (groupId) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId);
            // Also collapse all products in this group
            const newExpandedProducts = new Set(expandedProducts);
            expandedProducts.forEach(productKey => {
                if (productKey.startsWith(`${groupId}_`)) {
                    newExpandedProducts.delete(productKey);
                }
            });
            setExpandedProducts(newExpandedProducts);
        } else {
            newExpanded.add(groupId);
        }
        setExpandedGroups(newExpanded);
    };

    const toggleProductVariants = (groupId, productId) => {
        const productKey = `${groupId}_${productId}`;
        const newExpanded = new Set(expandedProducts);
        if (newExpanded.has(productKey)) {
            newExpanded.delete(productKey);
        } else {
            newExpanded.add(productKey);
        }
        setExpandedProducts(newExpanded);
    };

    const tableStyles = {
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #e1e3e5',
            borderRadius: '8px',
            overflow: 'hidden'
        },
        headerRow: {
            backgroundColor: '#f6f6f7',
            borderBottom: '2px solid #e1e3e5'
        },
        headerCell: {
            padding: '16px 20px',
            textAlign: 'left',
            fontWeight: '600',
            fontSize: '14px',
            color: '#202223'
        },
        headerCellCenter: {
            padding: '16px 20px',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '14px',
            color: '#202223'
        },
        groupRow: {
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e1e3e5',
            cursor: 'pointer'
        },
        productRow: {
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e1e3e5'
        },
        variantRow: {
            backgroundColor: '#f1f2f3',
            borderBottom: '1px solid #e1e3e5'
        },
        cell: {
            padding: '16px 20px',
            fontSize: '14px',
            color: '#202223'
        },
        cellCenter: {
            padding: '16px 20px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#202223'
        },
        indentedCell: {
            padding: '16px 20px 16px 40px',
            fontSize: '14px',
            color: '#202223'
        },
        doubleIndentedCell: {
            padding: '16px 20px 16px 60px',
            fontSize: '14px',
            color: '#202223'
        }
    };

    // Render the hierarchical table
    const renderHierarchicalTable = () => {
        const rows = [];

        testGroups.forEach((group) => {
            // Calculate group totals
            const views = countAnalytics(group.analytics?.views) || 0;
            const addToCart = countAnalytics(group.analytics?.addToCart) || 0;
            const saleDone = countAnalytics(group.analytics?.saleDone) || 0;

            const isGroupExpanded = expandedGroups.has(group.id);
            const products = group.products || {};
            const hasProducts = Object.keys(products).length > 0;

            // Group row
            rows.push(
                <tr key={`group-${group.id}`} style={tableStyles.groupRow}>
                    <td style={tableStyles.cell}>
                        <InlineStack gap="200" align="start">
                            {hasProducts && (
                                <Button
                                    plain
                                    size="slim"
                                    icon={isGroupExpanded ? ChevronDownIcon : ChevronRightIcon}
                                    onClick={() => toggleGroupProducts(group.id)}
                                />
                            )}
                            <div
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: group.color,
                                    marginTop: '4px'
                                }}
                            />
                            <Text variant="bodyMd" fontWeight="medium">{group.name}</Text>
                        </InlineStack>
                    </td>
                    <td style={tableStyles.cellCenter}>{views}</td>
                    <td style={tableStyles.cellCenter}>{addToCart}</td>
                    <td style={tableStyles.cellCenter}>{saleDone}</td>
                </tr>
            );

            // Product rows (if group is expanded)
            if (isGroupExpanded && hasProducts) {
                Object.entries(products).forEach(([productId, productData]) => {
                    const productInfo = getProductInfo(productId);
                    const productKey = `${group.id}_${productId}`;
                    const isProductExpanded = expandedProducts.has(productKey);
                    const hasVariants = productInfo?.isMultiVariant && productData?.variants;

                    // Calculate product analytics - sum up product-level + all variant analytics for this product
                    let productViews = countAnalyticsForKeys(group.analytics?.views, `productId_${productId}`);
                    let productAddToCart = countAnalyticsForKeys(group.analytics?.addToCart, `productId_${productId}`);
                    let productSaleDone = countAnalyticsForKeys(group.analytics?.saleDone, `productId_${productId}`);

                    // Add analytics from all variants of this product
                    if (productData?.variants) {
                        Object.keys(productData.variants).forEach(variantKey => {
                            const variantId = productData.variants[variantKey]?.variantId?.replace('gid://shopify/ProductVariant/', '') || variantKey;
                            productViews += countAnalyticsForKeys(group.analytics?.views, `variantId_${variantId}`);
                            productAddToCart += countAnalyticsForKeys(group.analytics?.addToCart, `variantId_${variantId}`);
                            productSaleDone += countAnalyticsForKeys(group.analytics?.saleDone, `variantId_${variantId}`);
                        });
                    }

                    // Use raw product metrics without validation
                    const productMetrics = {
                        views: productViews || 0,
                        addToCart: productAddToCart || 0,
                        saleDone: productSaleDone || 0
                    };

                    // Product row
                    rows.push(
                        <tr key={`product-${group.id}-${productId}`} style={tableStyles.productRow}>
                            <td style={tableStyles.indentedCell}>
                                <InlineStack gap="200" align="start">
                                    {hasVariants && (
                                        <Button
                                            plain
                                            size="slim"
                                            icon={isProductExpanded ? ChevronDownIcon : ChevronRightIcon}
                                            onClick={() => toggleProductVariants(group.id, productId)}
                                        />
                                    )}
                                    {productInfo?.imageUrl && (
                                        <img
                                            src={productInfo.imageUrl}
                                            alt={productInfo.title}
                                            style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                    )}
                                    <BlockStack gap="100">
                                        <Text variant="bodyMd" fontWeight="medium">
                                            {productInfo?.title || 'Unknown Product'}
                                        </Text>
                                        {productInfo?.isMultiVariant && (
                                            <Badge size="small">Multi-variant</Badge>
                                        )}
                                    </BlockStack>
                                </InlineStack>
                            </td>
                            <td style={tableStyles.cellCenter}>{productMetrics.views}</td>
                            <td style={tableStyles.cellCenter}>{productMetrics.addToCart}</td>
                            <td style={tableStyles.cellCenter}>{productMetrics.saleDone}</td>
                        </tr>
                    );

                    // Variant rows (if product is expanded and has variants)
                    if (isProductExpanded && hasVariants) {
                        Object.entries(productData.variants).forEach(([variantKey, variantData]) => {
                            const variantId = variantData.variantId?.replace('gid://shopify/ProductVariant/', '') || variantKey;

                            // Calculate variant analytics
                            const variantViews = countAnalyticsForKeys(group.analytics?.views, `variantId_${variantId}`);
                            const variantAddToCart = countAnalyticsForKeys(group.analytics?.addToCart, `variantId_${variantId}`);
                            const variantSaleDone = countAnalyticsForKeys(group.analytics?.saleDone, `variantId_${variantId}`);
                            // Use raw variant metrics without validation
                            const variantMetrics = {
                                views: variantViews || 0,
                                addToCart: variantAddToCart || 0,
                                saleDone: variantSaleDone || 0
                            };

                            rows.push(
                                <tr key={`variant-${group.id}-${productId}-${variantKey}`} style={tableStyles.variantRow}>
                                    <td style={tableStyles.doubleIndentedCell}>
                                        <BlockStack gap="100">
                                            <Text variant="bodyMd">
                                                {variantData.title || `Variant ${variantKey}`}
                                            </Text>
                                            <Text variant="bodySm" color="subdued">
                                                ${variantData.modifiedPrice || variantData.originalPrice || 'N/A'}
                                            </Text>
                                        </BlockStack>
                                    </td>
                                    <td style={tableStyles.cellCenter}>{variantMetrics.views}</td>
                                    <td style={tableStyles.cellCenter}>{variantMetrics.addToCart}</td>
                                    <td style={tableStyles.cellCenter}>{variantMetrics.saleDone}</td>
                                </tr>
                            );
                        });
                    }
                });
            }
        });

        return rows;
    };

    return (
        <BlockStack gap="400">
            <Text variant="headingLg" as="h2">Test Results</Text>
            <Card padding="0">
                <table style={tableStyles.table}>
                    <thead>
                        <tr style={tableStyles.headerRow}>
                            <th style={tableStyles.headerCell}>Test Groups / Products / Variants</th>
                            <th style={tableStyles.headerCellCenter}>Views</th>
                            <th style={tableStyles.headerCellCenter}>Add to Cart</th>
                            <th style={tableStyles.headerCellCenter}>Sale Done</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderHierarchicalTable()}
                    </tbody>
                </table>
            </Card>
        </BlockStack>
    );
};

export default ResultsContent; 