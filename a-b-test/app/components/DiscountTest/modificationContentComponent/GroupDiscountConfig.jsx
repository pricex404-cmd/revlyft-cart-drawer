import { BlockStack, Box, Card, InlineStack, Text, TextField, Banner, List, InlineGrid } from "@shopify/polaris";

export function GroupDiscountConfig({
    testGroups,
    onDiscountChange,
    discountType,
    threshold
}) {
    return (
        <Card>
            <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Group Discount Configuration</Text>
                <Text variant="bodyMd" as="p" color="subdued">
                    Set the discount percentage for each test group. The control group will always have 0% discount.
                </Text>

                <BlockStack gap="400">
                    {testGroups.map(group => {
                        const isControlGroup = group.name.toLowerCase().includes('control');

                        return (
                            <TextField
                                placeholder="Enter Discount Value"
                                key={group.id}
                                label={group.name}
                                type="text"
                                suffix="%"
                                value={group.discountPercentageValue || ""}
                                onChange={(value) => {
                                    // Only allow numbers and empty string
                                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                        onDiscountChange(group.id, value);
                                    }
                                }}
                                error={group.discountError}
                                disabled={isControlGroup}
                                helpText={isControlGroup ? "Control group discount cannot be modified" : "Enter a discount percentage between 0 and 100"}
                                autoComplete="off"
                                inputMode="decimal"
                            />
                        );
                    })}
                </BlockStack>

                <Text variant="bodyMd" as="p" color="subdued">
                    {discountType === 'value'
                        ? "Customers in each group will receive the specified percentage off in their cart total."
                        : "Customers in each group will receive the specified percentage off when they meet the quantity threshold."}
                </Text>
            </BlockStack>
        </Card>
    );
} 