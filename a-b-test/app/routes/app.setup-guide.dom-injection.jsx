import { useState, useEffect } from "react";
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
    List,
    Collapsible,
    Banner
} from "@shopify/polaris";
import {
    CodeIcon,
    CheckCircleIcon,
    AlertTriangleIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    DuplicateIcon,
    ViewIcon,
    CheckIcon,
    ChevronUpIcon,
    ExternalIcon
} from '@shopify/polaris-icons';

export default function DOMInjection() {
    const navigate = useNavigate();
    const [completedSteps, setCompletedSteps] = useState({});
    const [openSections, setOpenSections] = useState({});
    const [storeUrl, setStoreUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                const response = await fetch('/api/store-info');
                const data = await response.json();

                if (data.error) {
                    setError(data.error);
                    return;
                }

                setStoreUrl(data.storeUrl);
            } catch (err) {
                setError('Failed to fetch store information: ' + err.message);
            }
        };

        fetchStoreData();
    }, []);

    const toggleSection = (sectionId) => {
        setOpenSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const toggleStepCompletion = (stepId) => {
        setCompletedSteps(prev => ({
            ...prev,
            [stepId]: !prev[stepId]
        }));
    };

    const handleViewStore = () => {
        if (storeUrl) {
            const url = new URL(storeUrl);
            url.searchParams.set('price_tagging', 'true');
            url.searchParams.set('source', 'ab_test');
            window.open(url.toString(), '_blank');
        }
    };

    const handleCreateTest = () => {
        navigate('/app');
    };

    const handleFinishSetup = () => {
        navigate('/app');
    };

    return (
        <Page>
            <Layout>
                <Layout.Section>
                    <BlockStack gap="500">
                        {/* Progress Banner */}
                        <Banner status="info">
                            <BlockStack gap="200">
                                <Text variant="headingMd" as="h2">Step 2: DOM Element Configuration & Verification</Text>
                                <Text>Use our selector widget to configure elements and verify your A/B testing setup is working correctly.</Text>
                            </BlockStack>
                        </Banner>

                        {/* Overview Card */}
                        <Card>
                            <BlockStack gap="400">
                                <Text variant="headingMd" as="h2">Configure Query Selectors with Selector Widget</Text>
                                <Text>
                                    Use our powerful selector widget to easily identify and configure elements on your store for A/B testing.
                                    No manual coding required - simply point, click, and select!
                                </Text>
                                <Box background="bg-surface-info" padding="400" borderRadius="200">
                                    <InlineStack gap="200">
                                        <Icon source={AlertTriangleIcon} tone="info" />
                                        <Text variant="bodyMd" tone="subdued">
                                            <strong>How it works:</strong> The selector widget highlights elements in different colors -
                                            yellow for already selected elements, green for currently hovering elements, blue for detected but unselected elements, and purple for other page elements.
                                        </Text>
                                    </InlineStack>
                                </Box>
                            </BlockStack>
                        </Card>

                        {/* Step 1: Initial Setup Verification */}
                        <Card>
                            <BlockStack gap="400">
                                <Text variant="headingLg" as="h2">Step 1: Initial Setup Verification</Text>

                                {/* Step 1.1: Pre-Verification Checklist */}
                                <Card background="bg-surface-secondary">
                                    <BlockStack gap="300">
                                        <Button
                                            plain
                                            onClick={() => toggleSection('step1-1')}
                                            fullWidth
                                            textAlign="left"
                                        >
                                            <InlineStack gap="200" blockAlign="center">
                                                <Icon source={openSections['step1-1'] ? ChevronDownIcon : ChevronUpIcon} />
                                                <Text variant="headingMd" as="h3">Step 1.1: Pre-Verification Requirements</Text>
                                            </InlineStack>
                                        </Button>

                                        <Collapsible open={openSections['step1-1']}>
                                            <BlockStack gap="300">
                                                <Text>Before using the selector widget, confirm these integration requirements are met:</Text>
                                                <List type="bullet">
                                                    <List.Item>Confirm tracking script is installed and active in your live theme</List.Item>
                                                    <List.Item>Verify modification script is properly loaded in theme files</List.Item>
                                                    <List.Item>Ensure your store is accessible and ready for testing</List.Item>
                                                </List>
                                            </BlockStack>
                                        </Collapsible>
                                    </BlockStack>
                                </Card>

                                {/* Step 1.2: Access Selector Widget */}
                                <Card background="bg-surface-secondary">
                                    <BlockStack gap="300">
                                        <Button
                                            plain
                                            onClick={() => toggleSection('step1-2')}
                                            fullWidth
                                            textAlign="left"
                                        >
                                            <InlineStack gap="200" blockAlign="center">
                                                <Icon source={openSections['step1-2'] ? ChevronDownIcon : ChevronUpIcon} />
                                                <Text variant="headingMd" as="h3">Step 1.2: Access Selector Widget & Preview Mode</Text>
                                            </InlineStack>
                                        </Button>

                                        <Collapsible open={openSections['step1-2']}>
                                            <BlockStack gap="400">
                                                <Text>
                                                    Open your store with the selector widget enabled to start configuring elements for A/B testing.
                                                </Text>

                                                <Box background="bg-fill-tertiary" padding="300" borderRadius="200">
                                                    <BlockStack gap="300">
                                                        <Text variant="headingSm" as="h4">Open Store with Selector Widget</Text>
                                                        <Text variant="bodyMd">
                                                            Click the button below to open your store in a new tab with the selector widget activated.
                                                        </Text>
                                                        <InlineStack align="start">
                                                            <Button
                                                                icon={ExternalIcon}
                                                                onClick={handleViewStore}
                                                                disabled={!storeUrl}
                                                                variant="primary"
                                                            >
                                                                Configure Query Selectors in Store
                                                            </Button>
                                                        </InlineStack>
                                                    </BlockStack>
                                                </Box>

                                                <Box background="bg-surface-info" padding="300" borderRadius="200">
                                                    <BlockStack gap="200">
                                                        <Text variant="bodyMd" fontWeight="semibold">What you'll see:</Text>
                                                        <List type="bullet">
                                                            <List.Item><strong>Selectors Panel:</strong> Top-right corner with "Enable/Disable Selection Mode" buttons</List.Item>
                                                            <List.Item><strong>Color-coded elements:</strong> Yellow (already selected), Green (currently hovering)</List.Item>
                                                            <List.Item><strong>Element information:</strong> CSS selectors and element details in the panel</List.Item>
                                                        </List>
                                                    </BlockStack>
                                                </Box>
                                            </BlockStack>
                                        </Collapsible>
                                    </BlockStack>
                                </Card>
                            </BlockStack>
                        </Card>

                        {/* Step 2: Configure Elements with Selector Widget */}
                        <Card>
                            <BlockStack gap="400">
                                <Text variant="headingLg" as="h2">Step 2: Configure Elements with Selector Widget</Text>

                                {/* Step 2.1: Understanding the Selector Widget */}
                                <Card background="bg-surface-secondary">
                                    <BlockStack gap="300">
                                        <Button
                                            plain
                                            onClick={() => toggleSection('step2-1')}
                                            fullWidth
                                            textAlign="left"
                                        >
                                            <InlineStack gap="200" blockAlign="center">
                                                <Icon source={openSections['step2-1'] ? ChevronDownIcon : ChevronUpIcon} />
                                                <Text variant="headingMd" as="h3">Step 2.1: How to Use the Selector Widget</Text>
                                            </InlineStack>
                                        </Button>

                                        <Collapsible open={openSections['step2-1']}>
                                            <BlockStack gap="300">
                                                <Text>Learn how to effectively use the selector widget to configure your store elements:</Text>

                                                <Card background="bg-surface">
                                                    <BlockStack gap="300">
                                                        <Text variant="headingSm" as="h4">Configure Query Selectors</Text>
                                                        <Text variant="bodyMd">
                                                            Configure the query selector at your store for each place where prices or content should be modified during tests.
                                                        </Text>

                                                        <Box background="bg-surface-tertiary" padding="300" borderRadius="200">
                                                            <BlockStack gap="200">
                                                                <Text variant="bodyMd" fontWeight="semibold">How to configure query selectors:</Text>
                                                                <List type="number">
                                                                    <List.Item>Use the Selector Widget (top right of your store) to highlight and select elements</List.Item>
                                                                    <List.Item>Hover over elements to see them highlighted in different colors</List.Item>
                                                                    <List.Item>Click to add a selector for that element - the widget will automatically suggest and save the best selector</List.Item>
                                                                    <List.Item>Add multiple selectors if your store displays content in different ways or locations</List.Item>
                                                                    <List.Item>All your selected selectors will be listed in the widget panel</List.Item>
                                                                    <List.Item>Remove any selector from the list if needed</List.Item>
                                                                </List>
                                                            </BlockStack>
                                                        </Box>
                                                    </BlockStack>
                                                </Card>

                                                <Box background="bg-surface-info" padding="300" borderRadius="200">
                                                    <BlockStack gap="200">
                                                        <Text variant="bodyMd" fontWeight="semibold">Element Color Guide:</Text>
                                                        <List type="bullet">
                                                            <List.Item><Badge tone="warning">Yellow:</Badge> Elements already selected for your current test</List.Item>
                                                            <List.Item><Badge tone="success">Green:</Badge> Currently hovering/active element</List.Item>

                                                        </List>
                                                    </BlockStack>
                                                </Box>
                                            </BlockStack>
                                        </Collapsible>
                                    </BlockStack>
                                </Card>

                                {/* Step 2.2: Element Selection Strategy */}
                                <Card background="bg-surface-secondary">
                                    <BlockStack gap="300">
                                        <Button
                                            plain
                                            onClick={() => toggleSection('step2-2')}
                                            fullWidth
                                            textAlign="left"
                                        >
                                            <InlineStack gap="200" blockAlign="center">
                                                <Icon source={openSections['step2-2'] ? ChevronDownIcon : ChevronUpIcon} />
                                                <Text variant="headingMd" as="h3">Step 2.2: Element Selection Strategy</Text>
                                            </InlineStack>
                                        </Button>

                                        <Collapsible open={openSections['step2-2']}>
                                            <BlockStack gap="300">
                                                <Text>Follow this strategy to ensure comprehensive element coverage:</Text>

                                                <Box background="bg-fill-tertiary" padding="300" borderRadius="200">
                                                    <BlockStack gap="200">
                                                        <Text variant="headingSm" as="h4">Pages to Configure:</Text>
                                                        <List type="bullet">
                                                            <List.Item>Homepage - Featured products and promotional elements</List.Item>
                                                            <List.Item>Collection Pages - Product grid and filter elements</List.Item>
                                                            <List.Item>Search Results - Search result product elements</List.Item>
                                                            <List.Item>Product Pages - All product detail elements and variants</List.Item>

                                                            <List.Item>Recommended Items - "You May Also Like" or "Recently Viewed" sections</List.Item>
                                                        </List>
                                                    </BlockStack>
                                                </Box>

                                                <Banner tone="info">
                                                    <Text variant="bodyMd">
                                                        <strong>Pro Tip:</strong> Start with your most important pages (product pages, homepage)
                                                        and then expand to other areas. The widget will automatically save all your selections.
                                                    </Text>
                                                </Banner>
                                            </BlockStack>
                                        </Collapsible>
                                    </BlockStack>
                                </Card>
                            </BlockStack>
                        </Card>

                        {/* Step 3: Verification & Testing */}
                        <Card>
                            <BlockStack gap="400">
                                <Text variant="headingLg" as="h2">Step 3: Verification & Testing</Text>

                                {/* Step 3.1: Element Verification */}
                                <Card background="bg-surface-secondary">
                                    <BlockStack gap="300">
                                        <Button
                                            plain
                                            onClick={() => toggleSection('step3-1')}
                                            fullWidth
                                            textAlign="left"
                                        >
                                            <InlineStack gap="200" blockAlign="center">
                                                <Icon source={openSections['step3-1'] ? ChevronDownIcon : ChevronUpIcon} />
                                                <Text variant="headingMd" as="h3">Step 3.1: Verify Selected Elements</Text>
                                            </InlineStack>
                                        </Button>

                                        <Collapsible open={openSections['step3-1']}>
                                            <BlockStack gap="300">
                                                <Text>After configuring selectors, verify your selections are working correctly:</Text>

                                                <Box background="bg-fill-tertiary" padding="300" borderRadius="200">
                                                    <BlockStack gap="200">
                                                        <Text variant="headingSm" as="h4">Yellow Highlighted Elements (Already Selected for Testing):</Text>
                                                        <List type="bullet">
                                                            <List.Item>Confirm yellow elements are part of your test and should be modified</List.Item>
                                                            <List.Item>Verify yellow elements change correctly when switching test groups in preview mode</List.Item>
                                                            <List.Item>Check that all intended test elements are highlighted in yellow</List.Item>
                                                        </List>
                                                    </BlockStack>
                                                </Box>

                                                <Box background="bg-fill-tertiary" padding="300" borderRadius="200">
                                                    <BlockStack gap="200">
                                                        <Text variant="headingSm" as="h4">Blue Highlighted Elements (Detected but Not Selected):</Text>
                                                        <List type="bullet">
                                                            <List.Item>Confirm blue elements are NOT part of your current test</List.Item>
                                                            <List.Item>Verify these elements remain unchanged when switching test groups</List.Item>
                                                            <List.Item>Click on blue elements to select them if they should be part of your test (they will turn yellow once selected)</List.Item>
                                                        </List>
                                                    </BlockStack>
                                                </Box>

                                                <Banner tone="info">
                                                    <Text variant="bodyMd">
                                                        After configuring selectors, check if elements are properly modified from the Preview tab in your test.
                                                    </Text>
                                                </Banner>
                                            </BlockStack>
                                        </Collapsible>
                                    </BlockStack>
                                </Card>


                            </BlockStack>
                        </Card>

                        {/* Step 4: Create Your First Test */}
                        <Card>
                            <BlockStack gap="400">
                                <Text variant="headingLg" as="h2">Step 4: Create Your First Test</Text>

                                <Card background="bg-surface-secondary">
                                    <BlockStack gap="300">
                                        <Button
                                            plain
                                            onClick={() => toggleSection('step4-1')}
                                            fullWidth
                                            textAlign="left"
                                        >
                                            <InlineStack gap="200" blockAlign="center">
                                                <Icon source={openSections['step4-1'] ? ChevronDownIcon : ChevronUpIcon} />
                                                <Text variant="headingMd" as="h3">Step 4.1: Ready to Create Your Test</Text>
                                            </InlineStack>
                                        </Button>

                                        <Collapsible open={openSections['step4-1']}>
                                            <BlockStack gap="400">
                                                <Box background="bg-surface-success" padding="400" borderRadius="200">
                                                    <BlockStack gap="200">
                                                        <Text variant="bodyMd" fontWeight="semibold" tone="success">
                                                            🎉 Setup Complete!
                                                        </Text>
                                                        <Text variant="bodyMd">
                                                            You've successfully configured your elements using the selector widget.
                                                            Now it's time to create your first A/B test and start optimizing your store!
                                                        </Text>
                                                    </BlockStack>
                                                </Box>

                                                <Text>
                                                    With your elements properly configured, you can now create tests to experiment with:
                                                </Text>

                                                <List type="bullet">
                                                    <List.Item>Price variations and discounts</List.Item>
                                                    <List.Item>Product descriptions and titles</List.Item>
                                                    <List.Item>Product images and media</List.Item>
                                                    <List.Item>Call-to-action buttons and messaging</List.Item>
                                                    <List.Item>Shipping offers and thresholds</List.Item>
                                                </List>

                                                <Box background="bg-fill-tertiary" padding="300" borderRadius="200">
                                                    <BlockStack gap="300">
                                                        <Text variant="headingSm" as="h4">Create Your First Test</Text>
                                                        <Text variant="bodyMd">
                                                            Click the button below to navigate to the test creation page and start your A/B testing journey.
                                                        </Text>
                                                        <InlineStack align="start">
                                                            <Button
                                                                icon={ExternalIcon}
                                                                onClick={handleCreateTest}
                                                                variant="primary"
                                                            >
                                                                Create Your First Test
                                                            </Button>
                                                        </InlineStack>
                                                    </BlockStack>
                                                </Box>
                                            </BlockStack>
                                        </Collapsible>
                                    </BlockStack>
                                </Card>

                                {/* Step 4.2: Cross-Device & Cart Testing */}
                                <Card background="bg-surface-secondary">
                                    <BlockStack gap="300">
                                        <Button
                                            plain
                                            onClick={() => toggleSection('step4-2')}
                                            fullWidth
                                            textAlign="left"
                                        >
                                            <InlineStack gap="200" blockAlign="center">
                                                <Icon source={openSections['step4-2'] ? ChevronDownIcon : ChevronUpIcon} />
                                                <Text variant="headingMd" as="h3">Step 4.2: Cross-Device & Cart Testing</Text>
                                            </InlineStack>
                                        </Button>

                                        <Collapsible open={openSections['step4-2']}>
                                            <BlockStack gap="300">
                                                <Text>After creating your test, thoroughly test your configured elements across different devices and scenarios:</Text>

                                                <Box background="bg-fill-tertiary" padding="300" borderRadius="200">
                                                    <BlockStack gap="200">
                                                        <Text variant="headingSm" as="h4">Mobile Testing:</Text>
                                                        <List type="bullet">
                                                            <List.Item>Test on actual mobile devices</List.Item>
                                                            <List.Item>Use browser mobile simulation mode</List.Item>
                                                            <List.Item>Verify elements display correctly on small screens</List.Item>
                                                            <List.Item>Check touch interactions work properly</List.Item>
                                                        </List>
                                                    </BlockStack>
                                                </Box>

                                                <Box background="bg-fill-tertiary" padding="300" borderRadius="200">
                                                    <BlockStack gap="200">
                                                        <Text variant="headingSm" as="h4">Cart & Checkout Testing:</Text>
                                                        <List type="bullet">
                                                            <List.Item>Add test products to cart from different pages</List.Item>
                                                            <List.Item>Verify cart calculations are correct for each test group</List.Item>
                                                            <List.Item>Check mini-cart displays correct information</List.Item>
                                                            <List.Item>Test quantity changes maintain correct calculations</List.Item>
                                                        </List>
                                                    </BlockStack>
                                                </Box>
                                            </BlockStack>
                                        </Collapsible>
                                    </BlockStack>
                                </Card>
                            </BlockStack>
                        </Card>

                        {/* Navigation */}
                        <Card>
                            <InlineStack align="space-between">
                                <Button onClick={() => navigate('/app/setup-guide/script-installation')}>
                                    ← Back to Script Installation
                                </Button>
                                <Button variant="primary" onClick={() => navigate('/app')}>
                                    Complete Setup & Start Testing →
                                </Button>
                            </InlineStack>
                        </Card>
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
} 