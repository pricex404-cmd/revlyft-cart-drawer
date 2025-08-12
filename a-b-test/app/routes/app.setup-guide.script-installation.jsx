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
    CodeIcon,
    CheckCircleIcon,
    AlertTriangleIcon,
    DuplicateIcon,
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
    const [openSections, setOpenSections] = useState({});

    const toggleSection = (sectionId) => {
        setOpenSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const combinedScript = `<!-- CausalFunnel A/B Testing Script -->
<script src="https://abtest.causalfunnel.org/assets/causalfunnel-price-query-selector-script.js?shop=${shop}" defer></script>
<script src="https://abtest.causalfunnel.org/assets/causalfunnel-abtest-script.js?shop=${shop}" defer></script>`;

    const handleNextStep = () => {
        navigate('/app/setup-guide/dom-injection');
    };

    return (
        <Page>
            <Layout>
                <Layout.Section>
                    <BlockStack gap="500">
                        {/* Header */}
                        <Banner status="info">
                            <BlockStack gap="200">
                                <Text variant="headingMd" as="h2">Script Installation</Text>
                                <Text>
                                    Install the required JavaScript files to enable A/B testing functionality on your Shopify store.
                                    These scripts will track user interactions and apply test variations automatically.
                                </Text>
                            </BlockStack>
                        </Banner>

                        {/* Overview Card */}
                        <Card>
                            <BlockStack gap="400">
                                <Text variant="headingMd" as="h2">Complete Script Installation Guide</Text>
                                <Text>
                                    This guide will walk you through installing the CausalFunnel A/B testing script in your Shopify theme.
                                    Follow each section to ensure proper functionality.
                                </Text>
                                <Box background="bg-surface-brand" padding="400" borderRadius="200">
                                    <InlineStack gap="200">
                                        <Icon source={AlertTriangleIcon} tone="info" />
                                        <Text variant="bodyMd" tone="subdued">
                                            <strong>What this script does:</strong> Enables A/B testing on your store by tracking user interactions,
                                            managing test variations, and collecting analytics data for your experiments.
                                        </Text>
                                    </InlineStack>
                                </Box>
                            </BlockStack>
                        </Card>

                        {/* Step 1: Script Installation Process */}
                        <Card>
                            <BlockStack gap="400">
                                <Text variant="headingLg" as="h2">Step 1: Script Installation Process</Text>

                                {/* Step 1.1: Script Preparation */}
                                <Card>
                                    <BlockStack gap="300">
                                        <Button
                                            plain
                                            onClick={() => toggleSection('step1-1')}
                                            fullWidth
                                            textAlign="left"
                                        >
                                            <InlineStack gap="200" blockAlign="center">
                                                <Icon source={openSections['step1-1'] ? ChevronDownIcon : ChevronUpIcon} />
                                                <Text variant="headingMd" as="h3">Step 1.1: Ready-to-use Script</Text>
                                            </InlineStack>
                                        </Button>

                                        <Collapsible open={openSections['step1-1']}>
                                            <BlockStack gap="300">
                                                <Text>
                                                    Your CausalFunnel script is ready to use with your store domain automatically configured.
                                                </Text>

                                                <Box padding="300" borderRadius="200">
                                                    <BlockStack gap="200">
                                                        <Text variant="headingSm" as="h4">Copy Your CausalFunnel Script</Text>
                                                        <Text variant="bodyMd">
                                                            The script below is automatically configured for your store: <Text as="span" fontFamily="mono" fontWeight="bold">{shop}</Text>
                                                        </Text>
                                                        <Banner tone="success">
                                                            <Text variant="bodyMd">
                                                                ✅ No customization needed! This script is ready to use with your store domain.
                                                            </Text>
                                                        </Banner>
                                                        <InlineStack align="start">
                                                            <Button
                                                                icon={DuplicateIcon}
                                                                onClick={() => copyToClipboard(combinedScript)}
                                                            >
                                                                Copy Ready Script
                                                            </Button>
                                                        </InlineStack>
                                                    </BlockStack>
                                                </Box>

                                                <Box padding="300" borderRadius="200">
                                                    <BlockStack gap="200">
                                                        <InlineStack align="space-between" blockAlign="center">
                                                            <Text variant="headingSm" as="h4">Your CausalFunnel Script:</Text>
                                                            <Button
                                                                size="micro"
                                                                icon={DuplicateIcon}
                                                                onClick={() => copyToClipboard(combinedScript)}
                                                            >
                                                                Copy Script
                                                            </Button>
                                                        </InlineStack>
                                                        <Text variant="bodyMd" tone="subdued">
                                                            <strong>Ready to use:</strong> This script is configured for your store domain: <Text as="span" fontFamily="mono">{shop}</Text>
                                                        </Text>
                                                        <Box padding="200" borderRadius="100">
                                                            <pre style={{ fontSize: '12px', lineHeight: '1.4', margin: 0, overflow: 'auto' }}>
                                                                <code>{combinedScript}</code>
                                                            </pre>
                                                        </Box>
                                                    </BlockStack>
                                                </Box>
                                            </BlockStack>
                                        </Collapsible>
                                    </BlockStack>
                                </Card>

                                {/* Step 1.2: Theme Editor Access */}
                                <Card>
                                    <BlockStack gap="300">
                                        <Button
                                            plain
                                            onClick={() => toggleSection('step1-2')}
                                            fullWidth
                                            textAlign="left"
                                        >
                                            <InlineStack gap="200" blockAlign="center">
                                                <Icon source={openSections['step1-2'] ? ChevronDownIcon : ChevronUpIcon} />
                                                <Text variant="headingMd" as="h3">Step 1.2: Theme Editor Access</Text>
                                            </InlineStack>
                                        </Button>

                                        <Collapsible open={openSections['step1-2']}>
                                            <BlockStack gap="300">
                                                <Text>
                                                    Navigate to your Shopify theme editor to access the code files.
                                                </Text>

                                                <Box padding="300" borderRadius="200">
                                                    <BlockStack gap="200">
                                                        <Text variant="headingSm" as="h4">Navigate to Your Theme Editor</Text>
                                                        <List type="number">
                                                            <List.Item>Go to your <strong>Shopify Admin</strong></List.Item>
                                                            <List.Item>Navigate to <strong>Online Store → Themes</strong></List.Item>
                                                            <List.Item>Find your active theme and click <strong>"Actions" → "Edit code"</strong></List.Item>
                                                        </List>
                                                    </BlockStack>
                                                </Box>
                                            </BlockStack>
                                        </Collapsible>
                                    </BlockStack>
                                </Card>

                                {/* Step 1.3: Script Installation */}
                                <Card>
                                    <BlockStack gap="300">
                                        <Button
                                            plain
                                            onClick={() => toggleSection('step1-3')}
                                            fullWidth
                                            textAlign="left"
                                        >
                                            <InlineStack gap="200" blockAlign="center">
                                                <Icon source={openSections['step1-3'] ? ChevronDownIcon : ChevronUpIcon} />
                                                <Text variant="headingMd" as="h3">Step 1.3: Script Installation</Text>
                                            </InlineStack>
                                        </Button>

                                        <Collapsible open={openSections['step1-3']}>
                                            <BlockStack gap="300">
                                                <Text>
                                                    Add the CausalFunnel script to your theme files and save your changes.
                                                </Text>

                                                <Box padding="300" borderRadius="200">
                                                    <BlockStack gap="200">
                                                        <Text variant="headingSm" as="h4">Add Script to Theme Files</Text>
                                                        <Text variant="bodyMd">
                                                            Paste the CausalFunnel script in the <Text as="span" fontFamily="mono">&lt;head&gt;</Text> section of these files:
                                                        </Text>
                                                        <List type="bullet">
                                                            <List.Item><Text as="span" fontFamily="mono">layout/theme.liquid</Text> (required)</List.Item>
                                                            <List.Item>Any other <Text as="span" fontFamily="mono">theme.*.liquid</Text> files (e.g., theme.gempages.liquid if you have this file)</List.Item>
                                                            <List.Item><Text as="span" fontFamily="mono">layout/checkout.liquid</Text> (if you have this file; most themes do not)</List.Item>
                                                        </List>
                                                        <Text variant="bodyMd" color="subdued">
                                                            <strong>Important:</strong> Make sure to paste the script just before the closing <Text as="span" fontFamily="mono">&lt;/head&gt;</Text> tag in each file.
                                                        </Text>
                                                    </BlockStack>
                                                </Box>

                                                <Box padding="300" borderRadius="200">
                                                    <BlockStack gap="200">
                                                        <Text variant="headingSm" as="h4">Save Your Changes</Text>
                                                        <Text variant="bodyMd">
                                                            Click <strong>"Save"</strong> for each file you've modified. Your CausalFunnel script is now installed!
                                                        </Text>
                                                    </BlockStack>
                                                </Box>
                                            </BlockStack>
                                        </Collapsible>
                                    </BlockStack>
                                </Card>

                                {/* Step 1.4: Verification */}
                                <Card>
                                    <BlockStack gap="300">
                                        <Button
                                            plain
                                            onClick={() => toggleSection('step1-4')}
                                            fullWidth
                                            textAlign="left"
                                        >
                                            <InlineStack gap="200" blockAlign="center">
                                                <Icon source={openSections['step1-4'] ? ChevronDownIcon : ChevronUpIcon} />
                                                <Text variant="headingMd" as="h3">Step 1.4: Installation Verification</Text>
                                            </InlineStack>
                                        </Button>

                                        <Collapsible open={openSections['step1-4']}>
                                            <BlockStack gap="300">
                                                <Text>
                                                    Verify that your script installation is working correctly.
                                                </Text>

                                                <Box padding="300" borderRadius="200">
                                                    <BlockStack gap="200">
                                                        <Text variant="headingSm" as="h4">Verify Installation</Text>
                                                        <Text variant="bodyMd" color="subdued">
                                                            After installing the script, verify it's working correctly:
                                                        </Text>
                                                        <List type="bullet">
                                                            <List.Item>Open your store in a new browser tab</List.Item>
                                                            <List.Item>Open browser developer tools (F12 or right-click → Inspect)</List.Item>
                                                            <List.Item>Check for the script in elements</List.Item>

                                                        </List>
                                                    </BlockStack>
                                                </Box>

                                                <Box padding="300" borderRadius="200">
                                                    <BlockStack gap="200">
                                                        <Text variant="headingSm" as="h4">Test Script Installation</Text>
                                                        <Text variant="bodyMd" color="subdued">
                                                            Click the button below to test your script installation. This will open your store with special parameters that verify the script is working.
                                                        </Text>
                                                        <InlineStack align="start">
                                                            <Button
                                                                icon={ViewIcon}
                                                                url={`https://${shop}?config=verification`}
                                                                external
                                                                target="_blank"
                                                            >
                                                                Test Script Installation
                                                            </Button>
                                                        </InlineStack>
                                                        <Text variant="bodyMd" color="subdued" tone="subdued">
                                                            After clicking, check the browser console for "CausalFunnel initialized" message to confirm successful installation.
                                                        </Text>
                                                    </BlockStack>
                                                </Box>

                                                <Banner tone="success">
                                                    <Text variant="bodyMd">
                                                        <strong>Success!</strong> If you see "CausalFunnel initialized" in the console, your script is working correctly and ready for A/B testing!
                                                    </Text>
                                                </Banner>
                                            </BlockStack>
                                        </Collapsible>
                                    </BlockStack>
                                </Card>
                            </BlockStack>
                        </Card>



                        {/* Navigation */}
                        <Card>
                            <InlineStack align="space-between">
                                <Button
                                    onClick={() => navigate('/app/setup-guide')}
                                >
                                    ← Back to Setup Guide
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleNextStep}
                                >
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