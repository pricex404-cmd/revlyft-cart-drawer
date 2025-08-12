import { useState } from "react";
import { Text, Button, BlockStack, InlineStack, Box, LegacyCard, Modal, Banner } from "@shopify/polaris";
import TestGroupCircle from "./TestGroupCircle";
import PercentageSlider from "./PercentageSlider";

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

export const TestGroupsContent = ({ testGroups, setTestGroups, isTestStarted }) => {
    const [removingGroupId, setRemovingGroupId] = useState(null);
    const groupColors = [colors.primary, colors.secondary, colors.accent, colors.warning]; // Colors for test groups


    // Check if modifications are disabled
    const isModificationsDisabled = isTestStarted;

    // Function to handle modification attempts when disabled


    const handleAddGroup = () => {
        if (testGroups.length >= 5) return; // Maximum 5 groups

        const newGroupNumber = testGroups.length;
        const equalPercentage = Math.floor(100 / (testGroups.length + 1));

        // Update existing groups with new equal percentage
        const updatedGroups = testGroups.map(group => ({
            ...group,
            percentage: equalPercentage,
            style: {
                backgroundColor: group.color,
                border: `2px solid ${group.color}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }
        }));

        // Calculate next sequential ID (should be 3 for the third group, 4 for fourth, etc.)
        const nextId = newGroupNumber + 1; // +2 because we start with Control Group (1) and count up

        // Add new group with sequential ID
        const newGroup = {
            id: nextId,
            name: `New Group ${newGroupNumber}`,
            percentage: equalPercentage,
            color: groupColors[newGroupNumber - 1],
            style: {
                backgroundColor: groupColors[newGroupNumber - 1],
                border: `2px solid ${groupColors[newGroupNumber - 1]}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            },
            products: {},
            analytics: {
                views: {},
                addToCart: {},
                saleDone: {}
            }
        };

        // Copy product data from control group to new group
        const controlGroup = testGroups.find(group => group.name.toLowerCase().includes('control'));
        if (controlGroup && controlGroup.products) {
            Object.entries(controlGroup.products).forEach(([productId, productData]) => {
                // Add defensive checks to ensure productData exists and has required properties
                if (productData && typeof productData === 'object') {
                    newGroup.products[productId] = {
                        ...productData,
                        modifiedTitle: productData.originalTitle || productData.title || '',
                        modifiedDescription: productData.originalDescription || productData.description || '',
                        modifiedImages: productData.originalImages || productData.images || [],
                        modifiedInventory: 0,  // Set modified inventory to 0 for new groups
                        originalInventory: productData.originalInventory || productData.inventory || 0
                    };
                }
            });
        }

        // Adjust percentages to ensure total is 100%
        const remainder = 100 - (equalPercentage * (testGroups.length + 1));
        if (remainder > 0) {
            updatedGroups[0].percentage += remainder;
        }

        setTestGroups([...updatedGroups, newGroup]);
    };

    const handleEdit = (groupId, newName) => {
        const updatedGroups = testGroups.map(group =>
            group.id === groupId
                ? { ...group, name: newName }
                : group
        );
        setTestGroups(updatedGroups);
    };

    const handleRemoveConfirm = () => {
        if (removingGroupId) {
            // Filter out the group to remove
            const remainingGroups = testGroups.filter(group => group.id !== removingGroupId);

            // Recalculate percentages for remaining groups
            const equalPercentage = Math.floor(100 / remainingGroups.length);
            const updatedGroups = remainingGroups.map(group => ({
                ...group,
                percentage: equalPercentage
            }));

            // Adjust for any remainder to ensure total is 100%
            const remainder = 100 - (equalPercentage * remainingGroups.length);
            if (remainder > 0) {
                updatedGroups[0].percentage += remainder;
            }

            setTestGroups(updatedGroups);
            setRemovingGroupId(null);
        }
    };

    const handleRemoveCancel = () => {
        setRemovingGroupId(null);
    };

    return (
        <BlockStack gap="400">
            <InlineStack align="space-between">
                <BlockStack gap="200">
                    <Text variant="headingLg" as="h1">TEST GROUPS</Text>
                    <Text variant="bodyMd" as="p" color="subdued">
                        Add up to 5 test groups, naming each one, and allocate a percent of site traffic to each.
                    </Text>
                </BlockStack>
            </InlineStack>



            {/* Remove Group Confirmation Modal */}
            <Modal
                open={removingGroupId !== null}
                onClose={handleRemoveCancel}
                title="Remove Test Group"
                primaryAction={{
                    content: 'Remove',
                    onAction: handleRemoveConfirm,
                    destructive: true
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: handleRemoveCancel
                    }
                ]}
            >
                <Modal.Section>
                    <Text>
                        Are you sure you want to remove this test group? This action cannot be undone.
                    </Text>
                </Modal.Section>
            </Modal>

            <LegacyCard>
                <LegacyCard.Section>
                    <BlockStack gap="400">
                        {/* Test Groups Visualization */}
                        <Box style={{
                            padding: '30px',
                            backgroundColor: colors.surface,
                            border: `2px solid ${colors.border}`,
                            borderRadius: '8px'
                        }}>
                            <InlineStack align="center" gap="500">
                                {testGroups.map((group) => (
                                    <TestGroupCircle
                                        key={group.id}
                                        percentage={group.percentage}
                                        name={group.name}
                                        color={group.color}
                                        onEdit={(newName) => handleEdit(group.id, newName)}
                                        onRemove={() => setRemovingGroupId(group.id)}
                                        totalGroups={testGroups.length}
                                        disabled={isModificationsDisabled}
                                    />
                                ))}
                                {testGroups.length < 5 && (
                                    <Button
                                        size="large"
                                        onClick={handleAddGroup}
                                        disabled={isModificationsDisabled}
                                    >
                                        +
                                    </Button>
                                )}
                            </InlineStack>
                        </Box>

                        {/* Percentage Slider */}
                        <PercentageSlider
                            testGroups={testGroups}
                            onGroupPercentagesChange={setTestGroups}
                            disabled={isModificationsDisabled}
                        />

                        {/* Group Labels */}
                        <InlineStack align="space-between">
                            {testGroups.map((group) => (
                                <Text key={group.id} variant="bodyMd" as="p">{group.name}</Text>
                            ))}
                        </InlineStack>
                    </BlockStack>
                </LegacyCard.Section>
            </LegacyCard>
        </BlockStack>
    );
};

export default TestGroupsContent; 