import { BlockStack, Text, InlineStack, Button } from "@shopify/polaris";

// Color theme
const colors = {
    primary: '#6B7280',
};

export const EmptyProductsState = ({ onAddProducts, isTestStarted }) => {
    return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <BlockStack gap="400" align="center">
                <Text variant="headingLg" as="h2">
                    Start by choosing which products you'd like to test.
                </Text>
                <Text variant="bodyMd" as="p" color="subdued">
                    Next, you'll set the test prices.
                </Text>
                <InlineStack align="center" fullWidth>
                    <Button
                        variant="primary"
                        onClick={() => isTestStarted ? null : onAddProducts()}
                        size="large"
                        disabled={isTestStarted}
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
    );
};

export default EmptyProductsState; 