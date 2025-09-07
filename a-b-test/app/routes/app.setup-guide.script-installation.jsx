import { useState } from "react";
import { useNavigate, useLoaderData } from "@remix-run/react";
import {
    Page,
    Layout,
    Card,
    Text,
    Button,
    BlockStack,
    InlineStack,
    Icon,
    Box,
    Banner,
    List,
    Collapsible
} from "@shopify/polaris";
import {
    CheckCircleIcon,
    ViewIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@shopify/polaris-icons';
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
    const { admin, session } = await authenticate.admin(request);
    return { shop: session.shop };
};

export default function ScriptInstallation() {
    const navigate = useNavigate();
    const { shop } = useLoaderData();
    const [openSections, setOpenSections] = useState({ step1: true });

    const toggleSection = (sectionId) => {
        setOpenSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const handleNextStep = () => {
        navigate('/app/setup-guide/dom-injection');
    };

    return (
        <Page>
            <Layout>
                <Layout.Section>
                    <BlockStack gap="500">
                        {/* Header */}
                        <Banner status="success">
                            <BlockStack gap="200">
                                <Text variant="headingMd" as="h2">
                                    <Icon source={CheckCircleIcon} tone="success" /> 
                                    Revlyft Script Installation
                                </Text>
                                <Text>
                                    Install Revlyft's A/B testing scripts to start running experiments on your store.
                                    Follow the simple steps below to get started.
                                </Text>
                            </BlockStack>
                        </Banner>

                        {/* Installation Steps */}
                        <Card>
                            <BlockStack gap="300">
                                <Button
                                    plain
                                    onClick={() => toggleSection('step1')}
                                    fullWidth
                                    textAlign="left"
                                >
                                    <InlineStack gap="200" blockAlign="center">
                                        <Icon source={openSections['step1'] ? ChevronDownIcon : ChevronUpIcon} />
                                        <Text variant="headingMd" as="h3">Step 1: Enable Revlyft Scripts</Text>
                                    </InlineStack>
                                </Button>

                                <Collapsible open={openSections['step1']}>
                                    <BlockStack gap="300">
                                        <Box padding="300" borderRadius="200">
                                            <BlockStack gap="200">
                                                <Text variant="headingSm" as="h4">Go to Your Theme Customizer</Text>
                                                <List type="number">
                                                    <List.Item>Go to <strong>Online Store → Themes</strong></List.Item>
                                                    <List.Item>Click <strong>"Customize"</strong> on your active theme</List.Item>
                                                </List>
                                            </BlockStack>
                                        </Box>

                                        <Box padding="300" borderRadius="200">
                                            <BlockStack gap="200">
                                                <Text variant="headingSm" as="h4">Find App Embeds</Text>
                                                <List type="number">
                                                    <List.Item>Look for <strong>"App embeds"</strong> in the left sidebar</List.Item>
                                                    <List.Item>Click on it to open the section</List.Item>
                                                </List>
                                            </BlockStack>
                                        </Box>

                                        <Box padding="300" borderRadius="200">
                                            <BlockStack gap="200">
                                                <Text variant="headingSm" as="h4">Enable Revlyft Scripts</Text>
                                                <List type="number">
                                                    <List.Item>Find <strong>"Revlyft Scripts"</strong> in the list</List.Item>
                                                    <List.Item>Toggle the switch to <strong>ON</strong></List.Item>
                                                    <List.Item>Click <strong>"Save"</strong></List.Item>
                                                </List>
                                            </BlockStack>
                                        </Box>

                                        <Banner tone="success">
                                            <Text>
                                                <strong>Done!</strong> Your Revlyft scripts are now active on your store.
                                            </Text>
                                        </Banner>
                                    </BlockStack>
                                </Collapsible>
                            </BlockStack>
                        </Card>

                        {/* Verification */}
                        <Card>
                            <BlockStack gap="300">
                                <Button
                                    plain
                                    onClick={() => toggleSection('step2')}
                                    fullWidth
                                    textAlign="left"
                                >
                                    <InlineStack gap="200" blockAlign="center">
                                        <Icon source={openSections['step2'] ? ChevronDownIcon : ChevronUpIcon} />
                                        <Text variant="headingMd" as="h3">Step 2: Test Installation</Text>
                                    </InlineStack>
                                </Button>

                                <Collapsible open={openSections['step2']}>
                                    <BlockStack gap="300">
                                        <Box padding="300" borderRadius="200">
                                            <BlockStack gap="200">
                                                <Text variant="headingSm" as="h4">Verify Scripts Are Working</Text>
                                                <Text>
                                                    Click the button below to test your installation.
                                                </Text>
                                                <InlineStack align="start">
                                                    <Button
                                                        icon={ViewIcon}
                                                        url={`https://${shop}?config=verification`}
                                                        external
                                                        target="_blank"
                                                    >
                                                        Test Installation
                                                    </Button>
                                                </InlineStack>
                                            </BlockStack>
                                        </Box>

                                        <Box padding="300" borderRadius="200">
                                            <BlockStack gap="200">
                                                <Text variant="headingSm" as="h4">Check Results</Text>
                                                <List type="number">
                                                    <List.Item>Your store will open in a new tab</List.Item>
                                                    <List.Item>Press <strong>F12</strong> to open developer tools</List.Item>
                                                    <List.Item>Click the <strong>"Console"</strong> tab</List.Item>
                                                    <List.Item>Look for: <Text as="span" fontFamily="mono">"revlyft initialized - Theme App Extension working correctly!"</Text></List.Item>
                                                </List>
                                            </BlockStack>
                                        </Box>

                                        <Banner tone="success">
                                            <Text>
                                                <strong>Perfect!</strong> If you see the message, your scripts are working and ready for A/B testing.
                                            </Text>
                                        </Banner>
                                    </BlockStack>
                                </Collapsible>
                            </BlockStack>
                        </Card>

                        {/* What's Next */}
                        <Card>
                            <BlockStack gap="300">
                                <Text variant="headingMd" as="h2">What's Next?</Text>
                                
                                <Box padding="300" borderRadius="200">
                                    <BlockStack gap="200">
                                        <Text variant="headingSm" as="h4">Your Scripts Are Now Active</Text>
                                        <List type="bullet">
                                            <List.Item><strong>Price Testing:</strong> Ready to test different product prices</List.Item>
                                            <List.Item><strong>A/B Testing:</strong> Ready to run experiments on your store</List.Item>
                                            <List.Item><strong>Discount Testing:</strong> Ready to test discount strategies</List.Item>
                                        </List>
                                    </BlockStack>
                                </Box>

                                <Box padding="300" borderRadius="200">
                                    <BlockStack gap="200">
                                        <Text variant="headingSm" as="h4">Easy Management</Text>
                                        <List type="bullet">
                                            <List.Item>Turn scripts ON/OFF anytime in theme customizer</List.Item>
                                            <List.Item>No need to edit theme files</List.Item>
                                            <List.Item>Uninstalling the app removes all scripts automatically</List.Item>
                                        </List>
                                    </BlockStack>
                                </Box>
                            </BlockStack>
                        </Card>

                        {/* Navigation */}
                        <Card>
                            <InlineStack align="space-between">
                                <Button onClick={() => navigate('/app/setup-guide')}>
                                    ← Back to Setup Guide
                                </Button>
                                <Button variant="primary" onClick={handleNextStep}>
                                    Next: Configure query selectors →
                                </Button>
                            </InlineStack>
                        </Card>
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
}