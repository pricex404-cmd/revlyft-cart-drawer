import { BlockStack, Card, Text, RadioButton, InlineStack } from "@shopify/polaris";

export function DiscountTypeSelector({ discountType, setDiscountType }) {
    return (
        <Card>
            <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Discount Configuration</Text>

                <InlineStack gap="600" align="start">
                    <div>
                        <RadioButton
                            label="Cart Value Based"
                            checked={discountType === "value"}
                            id="value"
                            name="discountType"
                            onChange={() => setDiscountType("value")}
                        />
                        <Text variant="bodySm" color="subdued" as="p" tone="subdued">
                            Apply discount when cart value reaches threshold
                        </Text>
                    </div>

                    <div>
                        <RadioButton
                            label="Cart Quantity Based"
                            checked={discountType === "quantity"}
                            id="quantity"
                            name="discountType"
                            onChange={() => setDiscountType("quantity")}
                        />
                        <Text variant="bodySm" color="subdued" as="p" tone="subdued">
                            Apply discount when cart quantity reaches threshold
                        </Text>
                    </div>
                </InlineStack>
            </BlockStack>
        </Card>
    );
} 