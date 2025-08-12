import { Text, BlockStack, Card, EmptyState, InlineStack } from "@shopify/polaris";

export const ResultsContentDiscount = ({ testGroups = [] }) => {
    if (!testGroups || testGroups.length === 0) {
        return (
            <BlockStack gap="400">
                <EmptyState
                    heading="No test results available"
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                    <p>Start the test to collect and view resultss.</p>
                </EmptyState>
            </BlockStack>
        );
    }

    // Function to validate and correct analytics data
    const validateAnalytics = (views, addToCart, saleDone) => {
        views = parseInt(views) || 0;
        addToCart = parseInt(addToCart) || 0;
        saleDone = parseInt(saleDone) || 0;

        if (addToCart > views) {
            addToCart = views;
        }
        if (saleDone > addToCart) {
            saleDone = addToCart;
        }

        return { views, addToCart, saleDone };
    };

    // Helper function to count analytics data for product details tests
    const countAnalyticsProductDetails = (analyticsData) => {
        if (!analyticsData) return 0;
        if (Array.isArray(analyticsData)) {
            return analyticsData.filter(a => a !== '').length;
        }
        return 0;
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
        }
    };

    // Render the simple table for product details tests
    const renderTable = () => {
        const rows = [];

        testGroups.forEach((group) => {
            // For product details tests, analytics are simple arrays
            const rawViews = countAnalyticsProductDetails(group.analytics?.views);
            const rawAddToCart = countAnalyticsProductDetails(group.analytics?.addToCart);
            const rawSaleDone = countAnalyticsProductDetails(group.analytics?.saleDone);
            const validatedMetrics = validateAnalytics(rawViews, rawAddToCart, rawSaleDone);

            // Group row
            rows.push(
                <tr key={`group-${group.id}`} style={tableStyles.groupRow}>
                    <td style={tableStyles.cell}>
                        <InlineStack gap="200" align="start">
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
                    <td style={tableStyles.cellCenter}>{validatedMetrics.views}</td>
                    <td style={tableStyles.cellCenter}>{validatedMetrics.addToCart}</td>
                    <td style={tableStyles.cellCenter}>{validatedMetrics.saleDone}</td>
                </tr>
            );
        });

        return rows;
    };

    return (
        <BlockStack gap="400">
            <Text variant="headingLg" as="h2">Product Details Test Results</Text>

            <Card padding="0">
                <table style={tableStyles.table}>
                    <thead>
                        <tr style={tableStyles.headerRow}>
                            <th style={tableStyles.headerCell}>Test Groups</th>
                            <th style={tableStyles.headerCellCenter}>Views</th>
                            <th style={tableStyles.headerCellCenter}>Add to Cart</th>
                            <th style={tableStyles.headerCellCenter}>Sale Done</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderTable()}
                    </tbody>
                </table>
            </Card>
        </BlockStack>
    );
};

export default ResultsContentDiscount; 