import { useState } from "react";
import {
    Text,
    BlockStack,
    Card,
    InlineStack,
    Box,
    Button,
    Icon,
    Modal,
    TextField,
    RadioButton,
} from "@shopify/polaris";
import { StarFilledIcon } from '@shopify/polaris-icons';

export const ConfigureAnalyticsContent = ({
    analyticsState,
    setAnalyticsState
}) => {
    const [hoveredMetric, setHoveredMetric] = useState(null);
    const [isAddMetricModalOpen, setIsAddMetricModalOpen] = useState(false);
    const [newMetricTitle, setNewMetricTitle] = useState('');
    const [newMetricDescription, setNewMetricDescription] = useState('');

    const defaultMetricsList = [
        {
            id: 'visitors',
            title: 'Visitors, Orders & Revenue',
            description: 'These metrics are shown by default in every test',
            isDefault: true
        },
        {
            id: 'conversion',
            title: 'Conversion Rate',
            description: 'Orders divided by unique visitors'
        },
        {
            id: 'revenue',
            title: 'Revenue per Visitor',
            description: 'Net revenue divided by number of unique visitors. Net revenue includes product and shipping revenue, net of discounts'
        },
        {
            id: 'profit',
            title: 'Profit per Visitor',
            description: 'Gross profit (net revenue COGS, cost of shipping, and transaction fees) divided by number of unique visitors',
            hasWarning: true
        },
        {
            id: 'aov',
            title: 'Average Order Value',
            description: 'Net revenue divided by number of orders (also known as average order value, AOV)'
        }
    ];

    const [metrics, setMetrics] = useState(defaultMetricsList);

    const handleSetPrimary = (metricId) => {
        setAnalyticsState(prev => ({
            ...prev,
            primaryMetric: metricId
        }));
    };

    const handleRemovePrimary = (e) => {
        e.stopPropagation();
        setAnalyticsState(prev => ({
            ...prev,
            primaryMetric: null
        }));
    };

    const handleRemoveMetric = (e, metricId) => {
        e.stopPropagation();
        setMetrics(metrics.filter(metric => metric.id !== metricId));
        if (analyticsState.primaryMetric === metricId) {
            setAnalyticsState(prev => ({
                ...prev,
                primaryMetric: null
            }));
        }
    };

    const handleAddMetric = () => {
        if (!newMetricTitle.trim()) return;

        const newMetric = {
            id: `custom-${Date.now()}`,
            title: newMetricTitle,
            description: newMetricDescription,
            isDefault: false
        };

        setMetrics([...metrics, newMetric]);
        setNewMetricTitle('');
        setNewMetricDescription('');
        setIsAddMetricModalOpen(false);
    };

    return (
        <BlockStack gap="500">
            <BlockStack gap="200">
                <Text variant="headingLg" as="h1">Choose your Key Metrics and Primary Metric</Text>
                <Text variant="bodyMd" as="p" color="subdued">
                    Intelligems records 20+ metrics on every test. Choose up to 8 Key Metrics to appear on the front page of your test results. After the test starts, you can still access other metrics and add them to your Key Metrics.
                </Text>
            </BlockStack>

            <Card>
                <BlockStack gap="400">
                    {metrics.map((metric) => (
                        <Box
                            key={metric.id}
                            padding="400"
                            background="bg-surface"
                            borderColor="border"
                            borderWidth="025"
                            borderRadius="200"
                            onMouseEnter={() => setHoveredMetric(metric.id)}
                            onMouseLeave={() => setHoveredMetric(null)}
                        >
                            <InlineStack align="space-between" gap="400">
                                <BlockStack gap="100">
                                    <InlineStack gap="200" align="start">
                                        {metric.id === 'visitors' ? (
                                            <InlineStack gap="200" align="center">
                                                <Text variant="headingMd" as="h1" tone="success">✓</Text>
                                                <Text variant="headingMd" as="h2">{metric.title}</Text>
                                            </InlineStack>
                                        ) : (
                                            <Text variant="headingMd" as="h2">{metric.title}</Text>
                                        )}
                                        {metric.hasWarning && (
                                            <Text variant="bodyMd" as="span" color="warning">⚠️</Text>
                                        )}
                                    </InlineStack>
                                    <Text variant="bodyMd" as="p" color="subdued">
                                        {metric.description}
                                    </Text>
                                </BlockStack>
                                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    {analyticsState.primaryMetric === metric.id ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Icon source={StarFilledIcon} tone="warning" fill="warning" />
                                            <Text variant="bodyMd" tone="caution">PRIMARY</Text>
                                        </div>
                                    ) : (
                                        hoveredMetric === metric.id && !metric.isDefault && (
                                            <Button
                                                plain
                                                onClick={() => handleSetPrimary(metric.id)}
                                            >
                                                Make Primary
                                            </Button>
                                        )
                                    )}
                                    {!metric.isDefault && (
                                        <Button
                                            plain
                                            onClick={(e) => handleRemoveMetric(e, metric.id)}
                                        >
                                            ×
                                        </Button>
                                    )}
                                </div>
                            </InlineStack>
                        </Box>
                    ))}

                    <Button onClick={() => setIsAddMetricModalOpen(true)}>+ ADD KEY METRIC</Button>
                </BlockStack>
            </Card>

            {/* <Card>
                <BlockStack gap="400">
                    <Text variant="headingMd" as="h2">Choose Custom Metrics</Text>
                    <Text variant="bodyMd" as="p" color="subdued">
                        Compare and filter results by clicks, page visits, and custom javascript behavior. These must be chosen before you start your test.
                    </Text>
                    <Button>+ ADD CUSTOM METRIC</Button>
                </BlockStack>
            </Card> */}

            <Card>
                <BlockStack gap="400">
                    <Text variant="headingMd" as="h2">How would you like to measure conversions when viewing results?</Text>
                    <Text variant="bodyMd" as="p" color="subdued">
                        You can always change this later.
                    </Text>
                    <BlockStack gap="200">
                        <RadioButton
                            label="Count all orders, regardless of products in the order"
                            checked={analyticsState.conversionType === 'all'}
                            onChange={() => setAnalyticsState(prev => ({ ...prev, conversionType: 'all' }))}
                        />
                        <RadioButton
                            label="Count only orders containing tested products"
                            checked={analyticsState.conversionType === 'tested'}
                            onChange={() => setAnalyticsState(prev => ({ ...prev, conversionType: 'tested' }))}
                        />
                    </BlockStack>
                </BlockStack>
            </Card>

            <Modal
                open={isAddMetricModalOpen}
                onClose={() => setIsAddMetricModalOpen(false)}
                title="Add New Key Metric"
                primaryAction={{
                    content: 'Add Metric',
                    onAction: handleAddMetric,
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: () => setIsAddMetricModalOpen(false),
                    },
                ]}
            >
                <Modal.Section>
                    <BlockStack gap="400">
                        <TextField
                            label="Metric Title"
                            value={newMetricTitle}
                            onChange={setNewMetricTitle}
                            autoComplete="off"
                        />
                        <TextField
                            label="Description"
                            value={newMetricDescription}
                            onChange={setNewMetricDescription}
                            multiline={3}
                            autoComplete="off"
                        />
                    </BlockStack>
                </Modal.Section>
            </Modal>
        </BlockStack>
    );
};

export default ConfigureAnalyticsContent;