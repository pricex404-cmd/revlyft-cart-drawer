import { useState, useEffect } from "react";
import { Text, BlockStack, InlineStack, Box, Icon, Button, Banner, Spinner, LegacyCard } from "@shopify/polaris";
import { AlertTriangleIcon } from '@shopify/polaris-icons';
import extractShopifyProductId from "../../utils/extractProductId";

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

export const PreviewContentProductDetails = ({ testId, shop, currentTestData }) => {
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
                selectedProducts: currentTestData.selectedProducts
            });
            const savedDataStr = JSON.stringify({
                basicInfo: testData.basicInfo,
                testGroups: testData.testGroups,
                selectedProducts: testData.selectedProducts
            });

            const hasChanges = currentDataStr !== savedDataStr;
            setHasUnsavedChanges(hasChanges);
        }
    }, []);

    const getPreviewUrl = (group) => {
        if (!testData || !testData.selectedProducts) return `https://${shop.domain}`;

        // Calculate a hash value that will always fall within this group's range
        const groupIndex = testData.testGroups.findIndex(g => g.id === group.id);
        let hashValue;

        if (groupIndex === 0) {
            // For first group, use a value between 0 and its percentage
            hashValue = Math.floor(Math.random() * group.percentage);
        } else {
            // For other groups, use a value between previous group's end and this group's end
            const previousGroupsEnd = testData.testGroups
                .slice(0, groupIndex)
                .reduce((sum, g) => sum + g.percentage, 0);
            hashValue = previousGroupsEnd + Math.floor(Math.random() * group.percentage);
        }

        // Encrypt the hash value
        const encryptedHash = encryptValue(hashValue.toString());
        return `https://${shop.domain}?cf_preview_hash=${encryptedHash}`;
    };

    // Add encryption function
    const encryptValue = (value) => {
        const ENCRYPTION_KEY = 'abtest-secret-key-2025';

        // Convert value to a fixed-length string (pad with zeros if needed)
        const paddedValue = value.toString().padStart(3, '0');

        // Generate a random prefix and suffix
        const prefix = generateRandomString(4);
        const suffix = generateRandomString(4);

        // Create the base string with dots
        const baseString = `${prefix}.${paddedValue}.${suffix}`;

        // Apply XOR encryption
        let result = '';
        for (let i = 0; i < baseString.length; i++) {
            const charCode = baseString.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
            result += String.fromCharCode(charCode);
        }

        // Convert to base64 and remove any non-alphanumeric characters
        return btoa(result).replace(/[^a-zA-Z0-9]/g, '');
    };

    // Add helper function for random string generation
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

    // Check if any products have been configured for modifications
    const hasProductModifications = testData.testGroups.some(group =>
        group.products && Object.keys(group.products).length > 0
    );

    if (!hasProductModifications) {
        return (
            <BlockStack gap="400">
                <Banner
                    title="Product Modifications Required"
                    tone="warning"
                >
                    <p>Please create at least one product modification first before previewing. Return to the previous step to configure your test groups.</p>
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
                        Store Preview
                    </Text>
                    <Text variant="bodyMd" as="p" color="subdued">
                        Preview how your store will look for test. Only saved changes will be reflected in the preview.
                    </Text>
                </BlockStack>
            </InlineStack>

            <BlockStack gap="400">
                {testData.testGroups.map((group) => (
                    <Box
                        key={group.id}
                        padding="400"
                        background="bg-surface-secondary"
                    >
                        <BlockStack gap="400">
                            {/* Group Header */}
                            <Text variant="headingMd" as="h2">{group.name}</Text>

                            {/* Store Preview Card */}
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
                                        {/* Shopify Store Preview */}
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

                                {/* Product Modifications Summary */}
                                <Box padding="400" background="bg-surface">
                                    <BlockStack gap="200">
                                        <Text variant="headingSm" as="h3">Modified Products in this Group:</Text>
                                        {!group.products || Object.keys(group.products).length === 0 ? (
                                            <Text variant="bodyMd">No product modifications in this group.</Text>
                                        ) : (
                                            testData.selectedProducts.map(product => {
                                                if (!product.productId) return null;

                                                const numericProductId = extractShopifyProductId(product.productId);
                                                const modifiedProduct = group.products && group.products[numericProductId];

                                                // Get image: prefer modifiedImages, then originalImages, then selectedProducts.imageUrls
                                                const imageSrc =
                                                    (modifiedProduct?.modifiedImages && modifiedProduct.modifiedImages[0]) ||
                                                    (modifiedProduct?.originalImages && modifiedProduct.originalImages[0]) ||
                                                    (product.imageUrls && product.imageUrls[0]);

                                                // Get title, description, inventory
                                                const title = modifiedProduct?.modifiedTitle || modifiedProduct?.originalTitle || product.title;
                                                const description = modifiedProduct?.modifiedDescription || modifiedProduct?.originalDescription || product.description;


                                                return (
                                                    <BlockStack key={product.productId} gap="400">
                                                        <InlineStack gap="400" align="start">
                                                            {/* Product Image */}
                                                            {imageSrc && (
                                                                <div style={{
                                                                    width: '180px',
                                                                    height: '180px',
                                                                    borderRadius: '8px',
                                                                    overflow: 'hidden',
                                                                    flexShrink: 0,
                                                                    background: '#eee',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}>
                                                                    <img
                                                                        src={imageSrc}
                                                                        alt={title}
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'cover',
                                                                            display: 'block'
                                                                        }}
                                                                        onError={e => {
                                                                            e.target.onerror = null;
                                                                            e.target.src = 'https://via.placeholder.com/180?text=Image+Not+Found';
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Product Details */}
                                                            <BlockStack gap="200" style={{ flex: 1 }}>
                                                                <BlockStack gap="100">
                                                                    <Text variant="headingMd" as="h3">{title}</Text>
                                                                    {description && (
                                                                        <Text variant="bodyMd" color="subdued">
                                                                            {description}
                                                                        </Text>
                                                                    )}
                                                                </BlockStack>
                                                            </BlockStack>
                                                        </InlineStack>
                                                    </BlockStack>
                                                );
                                            })
                                        )}
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

export default PreviewContentProductDetails; 