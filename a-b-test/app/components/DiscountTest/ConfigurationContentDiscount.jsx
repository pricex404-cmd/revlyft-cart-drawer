import { useState, useEffect } from "react";
import {
    Text,
    BlockStack,
    Card,
    InlineStack,
    Box,
    Button,
    Icon,
    Modal,
    TextField,
    RadioButton,
    LegacyCard,
    Banner,
    ChoiceList,
    Badge,
    TextContainer,
    List,
    Link,
} from "@shopify/polaris";
import { SettingsIcon, ExternalIcon, XCircleIcon, StatusActiveIcon } from '@shopify/polaris-icons';

 const ConfigurationContentDiscount = ({ shop, testId }) => {
    const [scriptStatus, setScriptStatus] = useState(null);
    const [error, setError] = useState(null);
    const [storeUrl, setStoreUrl] = useState(null);
    const [priceVisibility, setPriceVisibility] = useState(null);
    const [priceVisibilityAfterQuerySelector, setPriceVisibilityAfterQuerySelector] = useState(null);

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
    // useEffect(() => {
    //     const fetchScriptStatus = async () => {
    //         const response = await fetch('/api/script-tags');
    //         const data = await response.json();
    //         // setScriptStatus(data.status);
    //     };
    //     fetchScriptStatus();
    // }, []);
    useEffect(() => {
        const fetchTestInfo = async () => {
            if (!shop?.domain || !testId) return;
            const sanitizedDomain = shop.domain.replace(/\./g, '_');
            const response = await fetch(
                `https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app/abTests/${sanitizedDomain}/${testId}/basicInfo.json`
            );
            const data = await response.json();
            if (data) {
                setPriceVisibility(data.priceVisibility ?? null);
                setPriceVisibilityAfterQuerySelector(data.priceVisibilityAfterQuerySelector ?? null);
            }
        };
        fetchTestInfo();
    }, [shop, testId]);

    const saveTestInfo = async (newFields) => {
        
        if (newFields.priceVisibility === 'yes') {
            newFields.priceVisibilityAfterQuerySelector = null
            setPriceVisibilityAfterQuerySelector(null)
        }

        if (!shop?.domain || !testId) return;
        const sanitizedDomain = shop.domain.replace(/\./g, '_');
        await fetch(
            `https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app/abTests/${sanitizedDomain}/${testId}/basicInfo.json`,
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFields),
            }
        );
    };

    const handleViewStore = () => {
        if (storeUrl) {
            const url = new URL(storeUrl);
            url.searchParams.set('price_tagging', 'true');
            url.searchParams.set('source', 'ab_test');
            window.open(url.toString(), '_blank');
        }
    };

    const renderQuerySelectorInstructions = () => {
        return (
            <BlockStack gap="200">
                <TextContainer>
                    <Text variant="headingMd" as="h3">How to configure query selectors:</Text>
                    <InlineStack align="space-between">
                        <Button
                            icon={ExternalIcon}
                            onClick={handleViewStore}
                            disabled={!storeUrl}
                        >
                            configure query selectors to Store
                        </Button>
                    </InlineStack>
                    <List type="bullet">
                        <List.Item>Use the <b>Selector Widget</b> (top right of your store) to highlight and select all price elements on your store.</List.Item>
                        <List.Item>Hover over price elements to see them highlighted. Click to add a selector for that element.</List.Item>
                        <List.Item>The widget will automatically suggest and save the best selector for each price element you pick.</List.Item>

                        <List.Item>You can add multiple selectors if your store displays prices in different ways or locations.</List.Item>
                        <List.Item>All your selected price selectors will be listed in the widget. You can remove any selector from the list if needed.</List.Item>
                    </List>
                </TextContainer>
                <Banner status="info">
                    After configuring, check if prices are modified from the <b>Preview</b> tab.
                </Banner>
            </BlockStack>
        );
    };

    const renderContactTeam = () => {
        const handleContactSupport = () => {
            window.open(`https://${shop.domain}/admin/settings/account/new`, '_blank');
        };

        return (
            <BlockStack gap="400">
                <TextContainer>
                    <Text variant="headingMd" as="h3">Need Help?</Text>
                    <Text>Our team is here to help you set up and configure your price modifications. Please add pricex404@gmail.comas a collaborator.</Text>
                </TextContainer>
                <Button primary onClick={handleContactSupport}>Give us collaborator access</Button>
            </BlockStack>
        );
    };

    const renderMainQuestion = () => {
        return (
            <Card>
                <BlockStack gap="400">
                    <Text variant="headingMd" as="h3">Store Price Visibility</Text>
                    <InlineStack gap="400" >
                        <Text>Are you able to see modified prices in your store?</Text>
                    </InlineStack>
                    <Box paddingBlockStart="200">
                        <InlineStack gap="400">
                            <RadioButton
                                label="Yes"
                                checked={priceVisibility === 'yes'}
                                id="priceVisibilityYes"
                                name="priceVisibility"
                                onChange={() => {
                                    setPriceVisibility('yes');
                                    saveTestInfo({ priceVisibility: 'yes' });
                                }}
                            />
                            <RadioButton
                                label="No"
                                checked={priceVisibility === 'no'}
                                id="priceVisibilityNo"
                                name="priceVisibility"
                                onChange={() => {
                                    setPriceVisibility('no');
                                    saveTestInfo({ priceVisibility: 'no' });
                                }}
                            />
                        </InlineStack>
                    </Box>
                </BlockStack>
            </Card>
        );
    };

    const renderQuerySelectorSection = () => {
        if (priceVisibility !== 'no') return null;
        return (
            <Card>
                <BlockStack gap="400">
                    <Text variant="headingMd" as="h3">Configure Query Selectors</Text>
                    <InlineStack gap="400" >
                        <Text>Configure the query selector at your store for each place where prices are shown</Text>
                    </InlineStack>
                    {renderQuerySelectorInstructions()}
                    <Box paddingBlockStart="200">
                        <InlineStack gap="400">
                            <RadioButton
                                label="Yes"
                                checked={priceVisibilityAfterQuerySelector === 'yes'}
                                id="priceVisibilityAfterQuerySelectorYes"
                                name="priceVisibilityAfterQuerySelector"
                                onChange={() => {
                                    setPriceVisibilityAfterQuerySelector('yes');
                                    saveTestInfo({ priceVisibilityAfterQuerySelector: 'yes' });
                                }}
                            />
                            <RadioButton
                                label="No"
                                checked={priceVisibilityAfterQuerySelector === 'no'}
                                id="priceVisibilityAfterQuerySelectorNo"
                                name="priceVisibilityAfterQuerySelector"
                                onChange={() => {
                                    setPriceVisibilityAfterQuerySelector('no');
                                    saveTestInfo({ priceVisibilityAfterQuerySelector: 'no' });
                                }}
                            />
                        </InlineStack>
                    </Box>
                </BlockStack>
            </Card>
        );
    };

    const renderContactTeamCard = () => {
        if (!(priceVisibility === 'no' && priceVisibilityAfterQuerySelector === 'no')) return null;
        return (
            <Card>
                {renderContactTeam()}
            </Card>
        );
    };

    return (
        <BlockStack gap="400">
            {error && (
                <Banner status="critical">
                    <p>{error}</p>
                </Banner>
            )}

            {scriptStatus && (
                <Banner status="success">
                    <p>Script {scriptStatus === 'created' ? 'injected' : 'already exists'} successfully!</p>
                </Banner>
            )}

            <BlockStack gap="400">
                {renderMainQuestion()}

                {renderQuerySelectorSection()}
                {renderContactTeamCard()}
                {(priceVisibility === 'yes' || priceVisibilityAfterQuerySelector === 'yes') && (
                    <Banner status="success" title="Awesome! 🎉">
                        <p>Modified prices are visible in your store. Everything is set up correctly!</p>
                    </Banner>
                )}
            </BlockStack>
        </BlockStack>
    );
};

export default ConfigurationContentDiscount; 