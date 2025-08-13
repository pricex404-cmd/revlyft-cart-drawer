import { useState } from "react";
import { useNavigate } from "@remix-run/react";
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
    Badge,
    Banner
} from "@shopify/polaris";
import {
    CodeIcon,
    EmailIcon,
    QuestionCircleIcon,
    CheckCircleIcon,
    PlayIcon,
    ClockIcon
} from '@shopify/polaris-icons';

export default function SetupGuide() {
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState(null);

    const handleOptionSelect = (option) => {
        setSelectedOption(option);

        // Auto-proceed after selection for better UX
        setTimeout(() => {
            if (option === 'manual') {
                navigate('/app/setup-guide/script-installation');
            } else if (option === 'contact') {
                window.open('mailto:support@causalfunnel.com?subject=A/B Test Setup Assistance', '_blank');
            }
        }, 500);
    };

    return (
        <Page>
            <Layout>
                <Layout.Section>
                    <BlockStack gap="600">
                        {/* Hero Section */}
                        <Card>
                            <BlockStack gap="400" align="center">
                                <Icon source={PlayIcon} tone="info" />
                                <BlockStack gap="200" align="center">
                                    <Text variant="headingXl" as="h1" alignment="center">
                                        Setup Your A/B Testing
                                    </Text>
                                    <Text variant="bodyLg" tone="subdued" alignment="center">
                                        Choose how you'd like to get started with A/B testing on your store
                                    </Text>
                                </BlockStack>
                            </BlockStack>
                        </Card>

                        {/* Setup Options */}
                        <BlockStack gap="400">
                            <Text variant="headingLg" as="h2" alignment="center">
                                Choose Your Setup Method
                            </Text>

                            <InlineStack gap="400" align="center" distribution="fillEvenly">
                                {/* Manual Setup Option */}
                                <div style={{ flex: 1, maxWidth: '500px' }}>
                                    <Card>
                                        <Box
                                            padding="500"
                                            background={selectedOption === 'manual' ? 'bg-surface-success' : 'bg-surface'}
                                            borderRadius="300"
                                            style={{
                                                cursor: 'pointer',
                                                border: selectedOption === 'manual' ? '2px solid var(--p-color-border-success)' : '2px solid transparent',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onClick={() => handleOptionSelect('manual')}
                                        >
                                            <BlockStack gap="400" align="center">
                                                <InlineStack gap="200" blockAlign="center">
                                                    <Icon source={CodeIcon} tone="info" />
                                                    <Badge tone="success">Recommended</Badge>
                                                </InlineStack>

                                                <BlockStack gap="300" align="center">
                                                    <Text variant="headingMd" as="h3" alignment="center">
                                                        Manual Setup
                                                    </Text>
                                                    <Text variant="bodyMd" tone="subdued" alignment="center">
                                                        Follow our step-by-step guide to set up A/B testing yourself
                                                    </Text>
                                                </BlockStack>

                                                <BlockStack gap="200">
                                                    <InlineStack gap="200" blockAlign="center">

                                                        <Text variant="bodyMd">Complete control over setup</Text>
                                                    </InlineStack>
                                                    <InlineStack gap="200" blockAlign="center">

                                                        <Text variant="bodyMd">15-30 minutes</Text>
                                                    </InlineStack>
                                                </BlockStack>

                                                <Button
                                                    variant="primary"
                                                    size="large"
                                                    fullWidth
                                                    loading={selectedOption === 'manual'}
                                                >
                                                    {selectedOption === 'manual' ? 'Starting Setup...' : 'Start Manual Setup'}
                                                </Button>
                                            </BlockStack>
                                        </Box>
                                    </Card>
                                </div>

                                {/* Contact Us Option */}
                                <div style={{ flex: 1, maxWidth: '500px' }}>
                                    <Card>
                                        <Box
                                            padding="500"
                                            background={selectedOption === 'contact' ? 'bg-surface-warning' : 'bg-surface'}
                                            borderRadius="300"
                                            style={{
                                                cursor: 'pointer',
                                                border: selectedOption === 'contact' ? '2px solid var(--p-color-border-warning)' : '2px solid transparent',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onClick={() => handleOptionSelect('contact')}
                                        >
                                            <BlockStack gap="400" align="center">
                                                <Icon source={EmailIcon} tone="warning" />

                                                <BlockStack gap="300" align="center">
                                                    <Text variant="headingMd" as="h3" alignment="center">
                                                        Contact Us for Setup
                                                    </Text>
                                                    <Text variant="bodyMd" tone="subdued" alignment="center">
                                                        Let our team handle the technical setup for you
                                                    </Text>
                                                </BlockStack>

                                                <BlockStack gap="200">
                                                    <InlineStack gap="200" blockAlign="center">

                                                        <Text variant="bodyMd">Professional setup</Text>
                                                    </InlineStack>
                                                    <InlineStack gap="200" blockAlign="center">

                                                        <Text variant="bodyMd">1-2 business days</Text>
                                                    </InlineStack>
                                                </BlockStack>

                                                <Button
                                                    variant="secondary"
                                                    size="large"
                                                    fullWidth
                                                    loading={selectedOption === 'contact'}
                                                >
                                                    {selectedOption === 'contact' ? 'Opening Email...' : 'Contact Support Team'}
                                                </Button>
                                            </BlockStack>
                                        </Box>
                                    </Card>
                                </div>
                            </InlineStack>
                        </BlockStack>

                        {/* Manual Setup Preview */}
                        <Card>
                            <BlockStack gap="400">
                                <Text variant="headingMd" as="h2" alignment="center">
                                    What's Included in Manual Setup
                                </Text>

                                <Layout>
                                    <Layout.Section oneHalf>
                                        <Card background="bg-surface-secondary">
                                            <BlockStack gap="300" align="center">
                                                <Badge tone="info">Step 1</Badge>
                                                <Text variant="headingSm" as="h3" alignment="center">
                                                    Script Installation
                                                </Text>
                                                <Text variant="bodyMd" tone="subdued" alignment="center">
                                                    Add tracking and modification scripts to your theme files
                                                </Text>
                                            </BlockStack>
                                        </Card>
                                    </Layout.Section>

                                    <Layout.Section oneHalf>
                                        <Card background="bg-surface-secondary">
                                            <BlockStack gap="300" align="center">
                                                <Badge tone="info">Step 2</Badge>
                                                <Text variant="headingSm" as="h3" alignment="center">
                                                    DOM Configuration
                                                </Text>
                                                <Text variant="bodyMd" tone="subdued" alignment="center">
                                                    Configure elements for A/B test variations and verification
                                                </Text>
                                            </BlockStack>
                                        </Card>
                                    </Layout.Section>
                                </Layout>
                            </BlockStack>
                        </Card>

                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
} 