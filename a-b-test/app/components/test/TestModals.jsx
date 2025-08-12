import { Modal, BlockStack, Text, Banner } from "@shopify/polaris";

export const WelcomeModal = ({ isOpen, onClose, onGetStarted }) => (
    <Modal
        open={isOpen}
        onClose={onClose}
        title="Welcome to Your New A/B Test"
        primaryAction={{
            content: 'Get Started',
            onAction: onGetStarted,
        }}
    >
        <Modal.Section>
            <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Test Setup Instructions</Text>
                <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">
                        1. <strong>Test Groups:</strong> Create and configure your test groups, including control and variant groups.
                    </Text>
                    <Text variant="bodyMd" as="p">
                        2. <strong>Modifications:</strong> Set up the specific changes you want to test for each group.
                    </Text>
                    <Text variant="bodyMd" as="p">
                        3. <strong>Preview:</strong> Review how your test will appear to visitors.
                    </Text>
                    <Text variant="bodyMd" as="p">
                        4. <strong>Results:</strong> Monitor and analyze your test results once it's running.
                    </Text>
                </BlockStack>
                <Text variant="bodyMd" as="p" color="subdued">
                    You can navigate between these sections using the menu on the left. Let's get started!
                </Text>
                <Text variant="bodyMd" as="p" color="critical">
                    <strong>Important:</strong> Once you start the test, you won't be able to modify its configuration. Make sure all settings are correct before starting.
                </Text>
            </BlockStack>
        </Modal.Section>
    </Modal>
);

export const StartTestConfirmationModal = ({ isOpen, onClose, onConfirm, testType }) => (
    <Modal
        open={isOpen}
        onClose={onClose}
        title="Confirm Start Test"
        primaryAction={{
            content: 'Start Test',
            onAction: onConfirm,
            destructive: true
        }}
        secondaryActions={[
            {
                content: 'Cancel',
                onAction: onClose
            }
        ]}
    >
        <Modal.Section>
            <BlockStack gap="400">
                <Text variant="bodyMd" as="p">
                    Are you sure you want to start this test? Please review the following implications:
                </Text>
                <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">
                        • Once started, you won't be able to modify the test configuration
                    </Text>
                    {testType === 'pricing' && (
                        <Text variant="bodyMd" as="p">
                            • Any currently active test will be automatically deactivated
                        </Text>
                    )}
                    <Text variant="bodyMd" as="p">
                        • The test will begin collecting data immediately
                    </Text>
                    <Text variant="bodyMd" as="p">
                        • Test results will be available in the Results tab
                    </Text>
                </BlockStack>
            </BlockStack>
        </Modal.Section>
    </Modal>
);

export const InventoryValidationModal = ({ isOpen, onClose, inventoryIssues }) => {
    const renderInventoryIssueDetails = (issue) => {
        const action = issue.difference > 0 ? 'Distribute' : 'Reduce';
        const amount = Math.abs(issue.difference);

        return (
            <BlockStack gap="200">
                <Text variant="headingSm" as="h3">{issue.productTitle}</Text>
                <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">
                        Original Inventory: {issue.originalInventory} units
                    </Text>
                    <Text variant="bodyMd" as="p">
                        Currently Distributed: {issue.currentTotal} units
                    </Text>
                    <Text variant="bodyMd" as="p" color={issue.difference > 0 ? "warning" : "critical"}>
                        Action Required: {action} {amount} units
                    </Text>
                    <Text variant="bodyMd" as="p">Current Distribution:</Text>
                    {issue.groupDistribution.map(group => (
                        <Text key={group.groupName} variant="bodyMd" as="p" color="subdued">
                            • {group.groupName}: {group.inventory} units
                        </Text>
                    ))}
                </BlockStack>
            </BlockStack>
        );
    };

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            title="Inventory Distribution Issues"
            primaryAction={{
                content: 'OK',
                onAction: onClose
            }}
        >
            <Modal.Section>
                <BlockStack gap="400">
                    <Banner status="warning">
                        <p>Please adjust the inventory distribution before saving. The total inventory across all groups should match the original inventory.</p>
                    </Banner>

                    {inventoryIssues.map((issue, index) => (
                        <div key={index}>
                            {renderInventoryIssueDetails(issue)}
                            {index < inventoryIssues.length - 1 && <div style={{ margin: '16px 0', borderBottom: '1px solid #ddd' }} />}
                        </div>
                    ))}
                </BlockStack>
            </Modal.Section>
        </Modal>
    );
}; 