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

    // Helper functions (unchanged)
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

    const getProductInfo = (productId) => {
        if (!selectedProducts || !productId) return null;
        const cleanProductId = productId.toString().replace('gid://shopify/Product/', '');
        return selectedProducts.find(p => {
            if (!p.productId) return false;
            const cleanPId = p.productId.toString().replace('gid://shopify/Product/', '');
            return cleanPId === cleanProductId ||
                p.productId === productId ||
                cleanPId === productId ||
                p.productId === cleanProductId;
        });
    };

    const toggleGroupProducts = (groupId) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId);
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

    // Updated styles for sticky header
    const tableStyles = {
        container: {
            position: 'relative',
            height: '400px', // Set desired height
            overflow: 'hidden',
            border: '1px solid #e1e3e5',
            borderRadius: '8px'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse'
        },
        thead: {
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: '#f6f6f7'
        },
        tbody: {
            display: 'block',
            height: '340px', // Adjust based on header height
            overflowY: 'auto',
            overflowX: 'hidden'
        },
        headerRow: {
            display: 'table',
            width: '100%',
            tableLayout: 'fixed',
            backgroundColor: '#f6f6f7',
            borderBottom: '2px solid #e1e3e5'
        },
        headerCell: {
            display: 'table-cell',
            padding: '16px 20px',
            textAlign: 'left',
            fontWeight: '600',
            fontSize: '14px',
            color: '#202223',
            backgroundColor: '#f6f6f7',
            borderBottom: '2px solid #e1e3e5'
        },
        headerCellCenter: {
            display: 'table-cell',
            padding: '16px 20px',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '14px',
            color: '#202223',
            backgroundColor: '#f6f6f7',
            borderBottom: '2px solid #e1e3e5'
        },
        bodyRow: {
            display: 'table',
            width: '100%',
            tableLayout: 'fixed'
        },
        groupRow: {
            display: 'table',
            width: '100%',
            tableLayout: 'fixed',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e1e3e5',
            cursor: 'pointer'
        },
        productRow: {
            display: 'table',
            width: '100%',
            tableLayout: 'fixed',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e1e3e5'
        },
        variantRow: {
            display: 'table',
            width: '100%',
            tableLayout: 'fixed',
            backgroundColor: '#f1f2f3',
            borderBottom: '1px solid #e1e3e5'
        },
        cell: {
            display: 'table-cell',
            padding: '16px 20px',
            fontSize: '14px',
            color: '#202223'
        },
        cellCenter: {
            display: 'table-cell',
            padding: '16px 20px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#202223'
        },
        indentedCell: {
            display: 'table-cell',
            padding: '16px 20px 16px 40px',
            fontSize: '14px',
            color: '#202223'
        },
        doubleIndentedCell: {
            display: 'table-cell',
            padding: '16px 20px 16px 60px',
            fontSize: '14px',
            color: '#202223'
        }
    };

    const renderHierarchicalTable = () => {
        const rows = [];

        testGroups.forEach((group) => {
            const views = countAnalytics(group.analytics?.views) || 0;
            const addToCart = countAnalytics(group.analytics?.addToCart) || 0;
            const saleDone = countAnalytics(group.analytics?.saleDone) || 0;
            const isGroupExpanded = expandedGroups.has(group.id);
            const products = group.products || {};
            const hasProducts = Object.keys(products).length > 0;

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

            if (isGroupExpanded && hasProducts) {
                Object.entries(products).forEach(([productId, productData]) => {
                    const productInfo = getProductInfo(productId);
                    const productKey = `${group.id}_${productId}`;
                    const isProductExpanded = expandedProducts.has(productKey);
                    const hasVariants = productInfo?.isMultiVariant && productData?.variants;

                    let productViews = countAnalyticsForKeys(group.analytics?.views, `productId_${productId}`);
                    let productAddToCart = countAnalyticsForKeys(group.analytics?.addToCart, `productId_${productId}`);
                    let productSaleDone = countAnalyticsForKeys(group.analytics?.saleDone, `productId_${productId}`);

                    if (productData?.variants) {
                        Object.keys(productData.variants).forEach(variantKey => {
                            const variantId = productData.variants[variantKey]?.variantId?.replace('gid://shopify/ProductVariant/', '') || variantKey;
                            productViews += countAnalyticsForKeys(group.analytics?.views, `variantId_${variantId}`);
                            productAddToCart += countAnalyticsForKeys(group.analytics?.addToCart, `variantId_${variantId}`);
                            productSaleDone += countAnalyticsForKeys(group.analytics?.saleDone, `variantId_${variantId}`);
                        });
                    }

                    const productMetrics = {
                        views: productViews || 0,
                        addToCart: productAddToCart || 0,
                        saleDone: productSaleDone || 0
                    };

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

                    if (isProductExpanded && hasVariants) {
                        Object.entries(productData.variants).forEach(([variantKey, variantData]) => {
                            const variantId = variantData.variantId?.replace('gid://shopify/ProductVariant/', '') || variantKey;
                            const variantViews = countAnalyticsForKeys(group.analytics?.views, `variantId_${variantId}`);
                            const variantAddToCart = countAnalyticsForKeys(group.analytics?.addToCart, `variantId_${variantId}`);
                            const variantSaleDone = countAnalyticsForKeys(group.analytics?.saleDone, `variantId_${variantId}`);
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
            <Card>
                <BlockStack gap="400">
                    <Text variant="headingLg" as="h2">Test Results</Text>
                    <Card padding="0">
                        <div style={tableStyles.container}>
                            <table style={tableStyles.table}>
                                <thead style={tableStyles.thead}>
                                    <tr style={tableStyles.headerRow}>
                                        <th style={tableStyles.headerCell}>Test Groups / Products / Variants</th>
                                        <th style={tableStyles.headerCellCenter}>Views</th>
                                        <th style={tableStyles.headerCellCenter}>Add to Cart</th>
                                        <th style={tableStyles.headerCellCenter}>Sale Done</th>
                                    </tr>
                                </thead>
                                <tbody style={tableStyles.tbody}>
                                    {renderHierarchicalTable()}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </BlockStack>
            </Card>
        </BlockStack>
    );
};

export default ResultsContent;
