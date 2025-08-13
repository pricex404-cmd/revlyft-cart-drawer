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

    // Helper to aggregate discount analytics
    const aggregateDiscountAnalytics = (userBehavior) => {
        if (!userBehavior) return {
            users: 0,
            sessions: 0,
            events: 0,
            sales: 0
        };
        const userIds = Object.keys(userBehavior);
        let sessions = 0;
        let events = 0;
        let sales = 0;
        userIds.forEach(uid => {
            const sessionArr = userBehavior[uid];
            sessions += sessionArr.length;
            sessionArr.forEach(session => {
                if (Array.isArray(session.events)) {
                    events += session.events.length;
                }
                // FIX: Count sales if saleDone is a non-null object
                if (session.saleDone && typeof session.saleDone === 'object' && !Array.isArray(session.saleDone)) {
                    sales += 1;
                }
            });
        });
        return {
            users: userIds.length,
            sessions,
            events,
            sales
        };
    };

    // Helper to check if threshold reached in a session
    const isThresholdReached = (session) => {
        if (!Array.isArray(session.events) || session.events.length === 0) return false;
        const lastEvent = session.events[session.events.length - 1];
        return lastEvent && lastEvent.itemsToThreshold === 0;
    };

    // Helper to calculate AOV (Average Order Value) for a group
    const calculateAOV = (userBehavior) => {
        if (!userBehavior) return 0;
        let totalRevenue = 0;
        let orderCount = 0;
        Object.values(userBehavior).forEach(sessions => {
            sessions.forEach(session => {
                if (session.saleDone && session.saleDone.total_price) {
                    const price = parseFloat(session.saleDone.total_price);
                    if (!isNaN(price)) {
                        totalRevenue += price;
                        orderCount += 1;
                    }
                }
            });
        });
        return orderCount > 0 ? (totalRevenue / orderCount) : null;
    };

    // Render user/session details for a group
    const renderGroupDetails = (group) => {
        if (!group.analytics || !group.analytics.userBehavior) return null;
        const userBehavior = group.analytics.userBehavior;
        return (
            <tr>
                <td colSpan={6} style={{ background: '#f9fafb', padding: 0 }}>
                    <div style={{ padding: '12px 24px' }}>
                        <Text variant="bodyMd" fontWeight="medium">User Sessions Details</Text>
                        <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f6f6f7' }}>
                                    <th style={{ padding: '6px 12px', textAlign: 'left', fontSize: 13 }}>User ID</th>
                                    <th style={{ padding: '6px 12px', textAlign: 'center', fontSize: 13 }}>Session</th>
                                    <th style={{ padding: '6px 12px', textAlign: 'center', fontSize: 13 }}>Events</th>
                                    <th style={{ padding: '6px 12px', textAlign: 'center', fontSize: 13 }}>Sale Done</th>
                                    <th style={{ padding: '6px 12px', textAlign: 'center', fontSize: 13 }}>Threshold Reached</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(userBehavior).map(([userId, sessions]) =>
                                    sessions.map((session, idx) => (
                                        <tr key={userId + '-' + idx}>
                                            <td style={{ padding: '6px 12px', fontSize: 13 }}>{userId}</td>
                                            <td style={{ padding: '6px 12px', textAlign: 'center', fontSize: 13 }}>{idx + 1}</td>
                                            <td style={{ padding: '6px 12px', textAlign: 'center', fontSize: 13 }}>{Array.isArray(session.events) ? session.events.length : 0}</td>
                                            <td style={{ padding: '6px 12px', textAlign: 'center', fontSize: 13 }}>{session.hasOwnProperty('saleDone') ? 'Yes' : 'No'}</td>
                                            <td style={{ padding: '6px 12px', textAlign: 'center', fontSize: 13 }}>{isThresholdReached(session) ? 'Yes' : 'No'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </td>
            </tr>
        );
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

    // Render the analytics table for discount test type
    const renderDiscountTable = () => {
        const rows = [];
        testGroups.forEach((group) => {
            let analytics = { users: 0, sessions: 0, events: 0, sales: 0 };
            let aov = null;
            if (group.analytics && group.analytics.userBehavior) {
                analytics = aggregateDiscountAnalytics(group.analytics.userBehavior);
                aov = calculateAOV(group.analytics.userBehavior);
            }
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
                    <td style={tableStyles.cellCenter}>{group.discountPercentageValue || '0'}%</td>
                    <td style={tableStyles.cellCenter}>{analytics.users}</td>
                    <td style={tableStyles.cellCenter}>{analytics.sessions}</td>
                    <td style={tableStyles.cellCenter}>{analytics.events}</td>
                    <td style={tableStyles.cellCenter}>{analytics.sales}</td>
                    <td style={tableStyles.cellCenter}>{aov !== null ? `$${aov.toFixed(2)}` : '-'}</td>
                </tr>
            );
            // Add details row if analytics present
            if (group.analytics && group.analytics.userBehavior) {
                rows.push(renderGroupDetails(group));
            }
        });
        return rows;
    };

    return (
        <BlockStack gap="400">
            <Text variant="headingLg" as="h2">Discount Test Results</Text>
            <Card padding="0">
                <table style={tableStyles.table}>
                    <thead>
                        <tr style={tableStyles.headerRow}>
                            <th style={tableStyles.headerCell}>Test Groups</th>
                            <th style={tableStyles.headerCellCenter}>Discount</th>
                            <th style={tableStyles.headerCellCenter}>Unique Users</th>
                            <th style={tableStyles.headerCellCenter}>Sessions</th>
                            <th style={tableStyles.headerCellCenter}>Events</th>
                            <th style={tableStyles.headerCellCenter}>Sales Done</th>
                            <th style={tableStyles.headerCellCenter}>AOV</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderDiscountTable()}
                    </tbody>
                </table>
            </Card>
        </BlockStack>
    );
};

export default ResultsContentDiscount; 