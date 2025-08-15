import { useState, useEffect } from "react";
import { Text, BlockStack, InlineStack, Box, LegacyCard, Button, Banner, TextField, Spinner, Thumbnail } from "@shopify/polaris";
import extractShopifyProductId from "../../utils/extractProductId";
import {
    handleProductSelect,
    handleRemoveProduct,
    handleModificationChange,
    handleMultipleImageUpload
} from "../../functions/productdetails";

// Color theme
const colors = {
    primary: '#00A47C',
    primaryLight: '#E5F4F0', // Light background
    secondary: '#FFA500',
    accent: '#9C27B0',
    warning: '#FF5722',
    surface: '#F6F6F7',
    border: '#DDD'
};

// Add heading styles
const StyledHeading = ({ children }) => (
    <div style={{
        fontSize: '1.4rem',
        backgroundColor: colors.primaryLight,
        padding: '12px 16px',
        borderRadius: '4px',
        marginBottom: '16px',
        width: '100%',
        borderLeft: `4px solid ${colors.primary}`
    }}>
        <Text variant="headingMd" as="h2" style={{ color: colors.primary }}>
            {children}
        </Text>
    </div>
);

export const ModificationsContentProductDetails = ({ products, testGroups, setTestGroups, selectedProducts, setSelectedProducts, onModificationsMade, isTestStarted, AllProductIdsInTests, multiVariantProductIds }) => {
    const [showProductList, setShowProductList] = useState(false);
    const [showModificationWarning, setShowModificationWarning] = useState(false);
    const [uploadingImages, setUploadingImages] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const [productSelectionError, setProductSelectionError] = useState('');

    // Removed useEffect that was checking modifications - this is now handled at the main test file level

    const handleProductSelectWrapper = (product) => {
        if (isTestStarted) return;

        // Check if product has multiple variants
        const productId = product.id.split('/').pop();
        if (multiVariantProductIds.includes(productId)) {
            setProductSelectionError(`This product has multiple variants and cannot be used in a product detail A/B test.`);
            setTimeout(() => setProductSelectionError(''), 6000); // Clear error after 3 seconds
            return;
        }

        // Check if product is already in another test
        if (AllProductIdsInTests.includes(productId)) {
            setProductSelectionError(`This product is already being used in another test. Please end that test before using this product.`);
            setTimeout(() => setProductSelectionError(''), 3000); // Clear error after 3 seconds
            return;
        }

        handleProductSelect(product, selectedProducts, setSelectedProducts, testGroups, setTestGroups);
    };

    const handleRemoveProductWrapper = (product) => {
        if (isTestStarted) return;
        handleRemoveProduct(product, selectedProducts, setSelectedProducts, testGroups, setTestGroups);
    };

    const handleModificationChangeWrapper = (productId, groupId, field, value) => {
        if (isTestStarted) return;
        handleModificationChange(productId, groupId, field, value, testGroups, setTestGroups);
    };

    const handleImageUploadWrapper = async (productId, groupId, event) => {
        if (isTestStarted) return;
        const files = Array.from(event.target.files);
        if (!files.length) return;

        const success = await handleMultipleImageUpload(
            productId,
            groupId,
            files,
            testGroups,
            setTestGroups,
            setUploadingImages,
            setErrorMessage,
            setShowModificationWarning
        );

        // Clear the file input regardless of success
        event.target.value = '';
    };

    const handleDone = () => {
        setShowProductList(false);
    };

    const renderModificationFields = (product, group) => {
        const numericProductId = extractShopifyProductId(product.productId);
        const productData = group.products?.[numericProductId] || {};
        const isControlGroup = group.name.toLowerCase().includes('control');

        // Initialize modifiedImages if not present
        if (!productData.modifiedImages && !isControlGroup) {
            handleModificationChangeWrapper(
                product.productId,
                group.id,
                'modifiedImages',
                productData.originalImages || product.imageUrls || []
            );
        }

        // Get all images - if modified images exist use those, otherwise use original images
        const imageUrls = productData.modifiedImages ||
            (productData.originalImages || product.imageUrls || []);

        const handleImageRemove = (index) => {
            if (isControlGroup || isTestStarted) return;

            // Always work with a copy of the current images
            const currentImages = [...imageUrls];
            currentImages.splice(index, 1);

            // Update the modified images
            handleModificationChangeWrapper(
                product.productId,
                group.id,
                'modifiedImages',
                currentImages
            );
        };

        return (
            <BlockStack gap="400">
                <BlockStack gap="200">
                    <TextField
                        label="Title"
                        value={productData.modifiedTitle || product.title}
                        onChange={(value) => handleModificationChangeWrapper(product.productId, group.id, 'modifiedTitle', value)}
                        disabled={isControlGroup || isTestStarted}
                    />
                    <TextField
                        label="Description"
                        value={productData.modifiedDescription || product.description}
                        onChange={(value) => handleModificationChangeWrapper(product.productId, group.id, 'modifiedDescription', value)}
                        disabled={isControlGroup || isTestStarted}
                        multiline={4}
                    />
                    <TextField
                        label="Inventory Quantity"
                        type="number"
                        min="0"
                        value={productData.modifiedInventory ?? productData.originalInventory ?? product.inventory_quantity ?? 0}
                        onChange={(value) => handleModificationChangeWrapper(product.productId, group.id, 'modifiedInventory', parseInt(value, 10))}
                        disabled={isTestStarted}
                        helpText="Set the inventory quantity for this variant"
                    />
                </BlockStack>
                <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">Product Images</Text>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                        {imageUrls.map((url, index) => (
                            <div key={index} style={{ position: 'relative', width: '100px' }}>
                                <img
                                    src={url}
                                    alt={`Product image ${index + 1}`}
                                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                />
                                {!isControlGroup && !isTestStarted && (
                                    <Button
                                        plain
                                        destructive
                                        onClick={() => handleImageRemove(index)}
                                        style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            right: '-8px',
                                            padding: '4px',
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            backgroundColor: 'white',
                                            boxShadow: '0 0 4px rgba(0,0,0,0.2)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 10
                                        }}
                                    >
                                        ×
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                    {!isControlGroup && !isTestStarted && (
                        <div>
                            <Text variant="bodyMd" as="p" color="subdued">Upload images:</Text>
                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleImageUploadWrapper(product.productId, group.id, e)}
                                    disabled={uploadingImages[`${product.productId}-${group.id}`] || isTestStarted}
                                    style={{ marginTop: '8px' }}
                                />
                                {uploadingImages[`${product.productId}-${group.id}`] && (
                                    <div style={{ display: 'inline-block' }}>
                                        <Spinner size="small" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {showModificationWarning && (
                        <Banner
                            title="Error uploading image"
                            status="critical"
                            onDismiss={() => {
                                setShowModificationWarning(false);
                                setErrorMessage('');
                            }}
                        >
                            <p>{errorMessage || 'There was an error uploading your image. Please try again.'}</p>
                        </Banner>
                    )}
                </BlockStack>
            </BlockStack>
        );
    };

    return (
        <BlockStack gap="400">
            {productSelectionError && (
                <div style={{
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    zIndex: 1000,
                    padding: '16px',

                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Banner status="warning" onDismiss={() => setProductSelectionError('')}>
                        <p>{productSelectionError}</p>
                    </Banner>
                </div>
            )}

            <InlineStack align="space-between">
                <BlockStack gap="200">
                    <Text variant="headingLg" as="h1">PRODUCT DETAILS</Text>
                    <Text variant="bodyMd" as="p" color="subdued">
                        Modify product details like title, description, and images for different test groups.
                    </Text>
                </BlockStack>
            </InlineStack>

            <LegacyCard>
                <LegacyCard.Section>
                    <BlockStack gap="400" align="center">
                        {showProductList ? (
                            <BlockStack gap="400">
                                <InlineStack align="space-between">
                                    <StyledHeading>Select Products</StyledHeading>
                                    <Button onClick={handleDone} variant="primary">
                                        Save Products
                                    </Button>
                                </InlineStack>

                                <BlockStack gap="400">
                                    {products.map((product) => {
                                        const productId = product.id.split('/').pop();
                                        const isInOtherTest = AllProductIdsInTests.includes(productId);
                                        const hasMultipleVariants = multiVariantProductIds.includes(productId);

                                        return (
                                            <Box key={product.id} padding="400">
                                                <InlineStack gap="400">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedProducts.some(p => p.productId === product.id)}
                                                        onChange={() => handleProductSelectWrapper(product)}
                                                        style={{
                                                            cursor: (isInOtherTest || hasMultipleVariants) ? 'not-allowed' : 'pointer',
                                                            opacity: (isInOtherTest || hasMultipleVariants) ? 0.5 : 1
                                                        }}
                                                    />
                                                    {product.images.edges[0] && (
                                                        <img
                                                            src={product.images.edges[0].node.url}
                                                            alt={product.title}
                                                            style={{
                                                                width: '50px',
                                                                height: '50px',
                                                                objectFit: 'cover',
                                                                opacity: (isInOtherTest || hasMultipleVariants) ? 0.5 : 1
                                                            }}
                                                        />
                                                    )}
                                                    <BlockStack gap="100">
                                                        <Text variant="headingSm" as="h3">{product.title}</Text>
                                                    </BlockStack>
                                                </InlineStack>
                                            </Box>
                                        );
                                    })}
                                </BlockStack>
                            </BlockStack>
                        ) : selectedProducts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <BlockStack gap="400" align="center">
                                    <Text variant="headingLg" as="h2">
                                        Start by choosing which products you'd like to test.
                                    </Text>
                                    <Text variant="bodyMd" as="p" color="subdued">
                                        Next, you'll set the test modifications.
                                    </Text>
                                    <InlineStack align="center" fullWidth>
                                        <Button
                                            variant="primary"
                                            onClick={() => setShowProductList(true)}
                                            size="large"
                                            style={{
                                                backgroundColor: `${colors.primary} !important`,
                                                borderColor: `${colors.primary} !important`,
                                                color: 'white !important'
                                            }}
                                        >
                                            + Add / Remove Products
                                        </Button>
                                    </InlineStack>
                                </BlockStack>
                            </div>
                        ) : null}

                        {selectedProducts.length > 0 && !showProductList && (
                            <BlockStack gap="400">
                                <InlineStack align="space-between">
                                    <Button
                                        onClick={() => setShowProductList(true)}
                                        plain
                                        style={{ minWidth: '150px' }}
                                    >
                                        + Add / Remove Products
                                    </Button>
                                </InlineStack>

                                {selectedProducts.map((product) => (
                                    <Box key={product.productId} padding="400" background="bg-surface-secondary">
                                        <BlockStack gap="400">
                                            <InlineStack align="space-between">
                                                <InlineStack gap="400">
                                                    <img
                                                        src={product.imageUrls[0] || ''}
                                                        alt={product.title}
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    />
                                                    <BlockStack gap="100">
                                                        <Text variant="headingSm" as="h3">{product.title}</Text>
                                                    </BlockStack>
                                                </InlineStack>
                                                <Button
                                                    plain
                                                    onClick={() => handleRemoveProductWrapper(product)}
                                                >
                                                    ×
                                                </Button>
                                            </InlineStack>

                                            <div style={{ overflowX: 'auto' }}>
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                                    gap: '16px',
                                                    width: '100%'
                                                }}>
                                                    {testGroups.map(group => (
                                                        <div key={group.id} style={{
                                                            width: '100%',
                                                            padding: '16px',
                                                            border: `1px solid ${colors.border}`,
                                                            borderRadius: '8px',
                                                            backgroundColor: colors.surface
                                                        }}>
                                                            <BlockStack gap="200">
                                                                <Text variant="bodyMd" as="p" fontWeight="bold">{group.name}</Text>
                                                                {renderModificationFields(product, group)}
                                                            </BlockStack>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {showModificationWarning && errorMessage && (
                                                <Banner
                                                    title="Inventory Distribution Warning"
                                                    status="warning"
                                                    onDismiss={() => {
                                                        setShowModificationWarning(false);
                                                        setErrorMessage('');
                                                    }}
                                                >
                                                    <p>{errorMessage}</p>
                                                </Banner>
                                            )}
                                        </BlockStack>
                                    </Box>
                                ))}
                            </BlockStack>
                        )}
                    </BlockStack>
                </LegacyCard.Section>
            </LegacyCard>
        </BlockStack>
    );
};

export default ModificationsContentProductDetails; 