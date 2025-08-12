import { useState, useEffect } from "react";
import { Text, BlockStack, InlineStack, Box, Icon, Button, Banner, Spinner } from "@shopify/polaris";
import { AlertTriangleIcon } from '@shopify/polaris-icons';

const previewStyles = `
    .preview-container {
        position: relative;
    }
    .preview-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    }
    .preview-content {
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        z-index: 2;
    }
    .preview-container:hover .preview-content,
    .preview-container:hover .preview-overlay {
        opacity: 1;
        pointer-events: auto;
    }
`;

export const PreviewContentDiscount = ({ testId, shop, currentTestData }) => {
    const [isTestSaved, setIsTestSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [testData, setTestData] = useState(null);
    const [error, setError] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
        if (testData && currentTestData) {
            const currentDataStr = JSON.stringify({
                basicInfo: currentTestData.basicInfo,
                testGroups: currentTestData.testGroups,
                targeting: currentTestData.targeting,
                analytics: currentTestData.analytics,
                discountConfig: currentTestData.discountConfig
            });
            const savedDataStr = JSON.stringify({
                basicInfo: testData.basicInfo,
                testGroups: testData.testGroups,
                targeting: testData.targeting,
                analytics: testData.analytics,
                discountConfig: testData.discountConfig
            });

            const hasChanges = currentDataStr !== savedDataStr;
            setHasUnsavedChanges(hasChanges);
        }
    }, [testId, shop.domain, currentTestData]);

    const getPreviewUrl = (group) => {
        if (!testData) return `https://${shop.domain}`;

        // Calculate the hash value that will fall within this group's range
        const groupIndex = testData.testGroups.findIndex(g => g.id === group.id);
        let hashValue;

        if (groupIndex === 0) {
            // For first group (usually control), use a value in the middle of its range
            hashValue = Math.floor(group.percentage / 2);
        } else {
            // For other groups, calculate the sum of previous groups' percentages
            // and add half of current group's percentage
            const previousGroupsSum = testData.testGroups
                .slice(0, groupIndex)
                .reduce((sum, g) => sum + g.percentage, 0);

            // Add half of current group's percentage to ensure we fall in the middle of its range
            hashValue = previousGroupsSum + Math.floor(group.percentage / 2);
        }

        // Encrypt the hash value and test ID
        const encryptedHash = encryptValue(hashValue.toString());
        const encryptedTestId = encryptValue(testId);
        return `https://${shop.domain}?cf_preview_hash=${encryptedHash}&cf_test_id=${encryptedTestId}`;
    };

    const encryptValue = (value) => {
        const ENCRYPTION_KEY = 'abtest-secret-key-2025';
        const paddedValue = value.toString().padStart(3, '0');
        const prefix = generateRandomString(4);
        const suffix = generateRandomString(4);
        const baseString = `${prefix}.${paddedValue}.${suffix}`;

        let result = '';
        for (let i = 0; i < baseString.length; i++) {
            const charCode = baseString.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
            result += String.fromCharCode(charCode);
        }

        return btoa(result).replace(/[^a-zA-Z0-9]/g, '');
    };

    const generateRandomString = (length) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

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
                <Banner title="Error Loading Test" tone="critical">
                    <p>{error}</p>
                </Banner>
            </BlockStack>
        );
    }

    if (!isTestSaved) {
        return (
            <BlockStack gap="400">
                <Banner title="Save Test Required" tone="warning">
                    <p>Please save your test configuration before accessing the preview. Click the Save button at the top of the page to proceed.</p>
                </Banner>
            </BlockStack>
        );
    }

    if (!testData || !testData.discountConfig) {
        return (
            <BlockStack gap="400">
                <Banner title="No Discount Configuration" tone="warning">
                    <p>Please configure your discount settings before previewing. Return to the previous step to set up your discount configuration.</p>
                </Banner>
            </BlockStack>
        );
    }

    return (
        <BlockStack gap="400">
            <style>{previewStyles}</style>

            {hasUnsavedChanges && (
                <Banner
                    title="Unsaved Changes"
                    tone="warning"
                    icon={AlertTriangleIcon}
                >
                    <p>You have unsaved changes in your test configuration. The preview may not reflect your latest changes. Please save your test to see the updated preview.</p>
                </Banner>
            )}

            <InlineStack align="space-between">
                <BlockStack gap="200">
                    <Text variant="headingLg" as="h1">
                        Discount Preview
                    </Text>
                    <Text variant="bodyMd" as="p" color="subdued">
                        Preview how your discount test will appear for different test groups. Only saved changes will be reflected in the preview.
                    </Text>
                </BlockStack>
            </InlineStack>

            <Banner title="Important Note" tone="info">
                <p>You can test all active Discount Tests (Control & Test Groups).</p>
                <p>The discount will be applied based on the {testData.discountConfig.type} threshold of {testData.discountConfig.threshold}.</p>
                <p>Need help? Contact us at growth@abtest.com for assistance with your discount test configuration.</p>
            </Banner>

            <BlockStack gap="400">
                {testData.testGroups.map((group) => (
                    <Box
                        key={group.id}
                        padding="400"
                        background="bg-surface-secondary"
                    >
                        <BlockStack gap="400">
                            <Text variant="headingMd" as="h2">{group.name}</Text>

                            <div style={{ position: 'relative' }}>
                                <a
                                    href={getPreviewUrl(group)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div className="preview-container" style={{
                                        position: 'relative',
                                        width: '100%',
                                        height: '500px',
                                        backgroundColor: '#f6f6f7',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        backgroundImage: 'url("/shopify-login.jpeg")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}>
                                        <div className="preview-overlay"></div>
                                        <div className="preview-content" style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            textAlign: 'center',
                                            backgroundColor: 'rgba(255, 255, 255, 1)',
                                            padding: '2rem',
                                            borderRadius: '8px'
                                        }}>
                                            <BlockStack gap="200">
                                                <Text variant="headingLg" as="h2">{shop.name}</Text>
                                                <Text variant="bodyMd" as="p" color="subdued">
                                                    Click to preview this test group in your store
                                                </Text>
                                                <div style={{ marginTop: '20px' }}>
                                                    <Button primary>
                                                        Open Store Preview
                                                    </Button>
                                                </div>
                                            </BlockStack>
                                        </div>
                                    </div>
                                </a>

                                <Box padding="400" background="bg-surface">
                                    <BlockStack gap="200">
                                        <Text variant="headingSm" as="h3">Discount Configuration:</Text>
                                        <InlineStack align="space-between">
                                            <Text variant="bodyMd">Discount Type:</Text>
                                            <Text variant="bodyMd">{testData.discountConfig.type}</Text>
                                        </InlineStack>
                                        <InlineStack align="space-between">
                                            <Text variant="bodyMd">Threshold:</Text>
                                            <Text variant="bodyMd">{testData.discountConfig.threshold}</Text>
                                        </InlineStack>
                                        <InlineStack align="space-between">
                                            <Text variant="bodyMd">Discount Percentage:</Text>
                                            <Text variant="bodyMd">{group.discountPercentageValue}%</Text>
                                        </InlineStack>
                                        <InlineStack align="space-between">
                                            <Text variant="bodyMd">Traffic Allocation:</Text>
                                            <Text variant="bodyMd">{group.percentage}%</Text>
                                        </InlineStack>
                                    </BlockStack>
                                </Box>
                            </div>
                        </BlockStack>
                    </Box>
                ))}
            </BlockStack>
        </BlockStack>
    );
};

export default PreviewContentDiscount; 