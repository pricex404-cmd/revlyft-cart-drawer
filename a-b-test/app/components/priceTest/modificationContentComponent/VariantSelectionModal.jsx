import { BlockStack, Text, Box, InlineStack, Button } from "@shopify/polaris";
import { getCurrencySymbol } from "../../../utils/currencyFormatter";

export const VariantSelectionModal = ({
    showVariantSelection,
    currentMultiVariantProduct,
    selectedVariants,
    currency,
    onVariantToggle,
    onConfirm,
    onCancel,
    productSelectionError,
    setProductSelectionError
}) => {
    if (!showVariantSelection || !currentMultiVariantProduct) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 20000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto'
            }}>
                <BlockStack gap="400">
                    <BlockStack gap="200">
                        <Text variant="headingLg" as="h2">
                            Select Variants for {currentMultiVariantProduct.title}
                        </Text>
                        <Text variant="bodyMd" as="p" color="subdued">
                            Choose which variants you want to include in your test
                        </Text>
                    </BlockStack>

                    <BlockStack gap="300">
                        {currentMultiVariantProduct.variants.edges.map(({ node: variant }) => (
                            <Box key={variant.id} padding="300" background="bg-surface-secondary">
                                <InlineStack align="space-between">
                                    <InlineStack gap="300">
                                        <input
                                            type="checkbox"
                                            checked={selectedVariants.includes(variant.id)}
                                            onChange={() => onVariantToggle(variant.id)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <BlockStack gap="100">
                                            <Text variant="headingSm" as="h3">
                                                {variant.title}
                                            </Text>
                                            <Text variant="bodyMd" as="p" color="subdued">
                                                Price: {getCurrencySymbol(currency)}{variant.price?.toFixed(2) || '0.00'}
                                            </Text>
                                        </BlockStack>
                                    </InlineStack>
                                </InlineStack>
                            </Box>
                        ))}
                    </BlockStack>

                    <InlineStack align="end" gap="300">
                        <Button onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={onConfirm}
                            disabled={selectedVariants.length === 0}
                        >
                            Add Selected Variants ({selectedVariants.length})
                        </Button>
                    </InlineStack>
                </BlockStack>
            </div>
        </div>
    );
};

export default VariantSelectionModal; 