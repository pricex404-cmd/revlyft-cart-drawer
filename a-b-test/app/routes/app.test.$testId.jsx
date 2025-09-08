import { useState, useEffect } from "react";
import { useLoaderData, useParams, useSearchParams, useFetcher, useNavigate } from "@remix-run/react";
import { ResultsContentDiscount } from "../components/DiscountTest/ResultsContentDiscount";
import {
    Page,
    Text,
    Badge,
    BlockStack,
    InlineStack,
    Button,
    Toast,
    Layout,
    Modal,
    Loading,
    Banner,
    Icon,
    Card
} from "@shopify/polaris";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    ClockIcon
} from '@shopify/polaris-icons';
import { authenticate } from "../shopify.server";
import { formatGQLQuery, createProductDiscount, createCartDiscount, deactivateAllActiveDiscountTests, deactivateAllActivePriceTests } from "../functions/discount";
import { json } from "@remix-run/node";
import { GET_PRODUCTS_AND_SHOP, GET_SHOPIFY_FUNCTIONS } from "../utils/graphqlQueries";

// Import components
import { TestGroupsContent } from "../components/test/TestGroupsContent";
import ModificationsContentPrice from "../components/priceTest/ModificationsContentPrice";
import ModificationsContentProductDetails from "../components/productDetailTest/ModificationsContentProductDetails";
import { ModificationsContentDiscount } from "../components/DiscountTest/ModificationsContentDiscount";
import TargetingContent from "../components/test/TargetingContent";
import ConfigureAnalyticsContent from "../components/test/ConfigureAnalyticsContent";
import PreviewContent from "../components/priceTest/PreviewContent";
import PreviewContentProductDetails from "../components/productDetailTest/PreviewContentProductDetails";
import ResultsContent from "../components/test/ResultsContent";
import ResultsContentProductDetails from "../components/productDetailTest/ResultsContentProductDetails";
import ConfigurationContent from "../components/test/ConfigurationContent";
import { PreviewContentDiscount } from "../components/DiscountTest/PreviewContentDiscount";

// Import extracted components
import {
    WelcomeModal,
    StartTestConfirmationModal,
    InventoryValidationModal,
    PrevNextNavigationButtons,
    HorizontalNavigation
} from "../components/test";

// Import test functions
import {
    fetchTestData,
    updateTestStatus,
    getInitialTestGroups,
    getInitialTargetingState,
    getInitialAnalyticsState,
    isTestDataComplete,
    isDiscountTestDataComplete,
    handleSaveTest,
    handleStartTest,
    sanitizeShopDomain,
    isModificationsAllowed,
    validateTestConfiguration,
    checkIfPricesModified,
    checkIfProductDetailsModified,
    checkIfDiscountModified,
    createSaveTestHandler,
    createWelcomeHandler,
    createStartTestHandler
} from "../functions/test";

import { checkIfModificationsMade, validateInventoryDistribution } from "../functions/productdetails";

// Firebase configuration
const FIREBASE_DB_URL = "https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app";

// Add an action for creating discounts (handles both cart and product discounts)
export async function action({ request }) {
    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();
    const title = formData.get("title");
    const functionId = formData.get("functionId");
    const testVariants = formData.get("testVariants");
    const testId = formData.get("testId");
    const shop = formData.get("shop");
    const discountConfig = formData.get("discountConfig");
    const testType = formData.get("testType");

    console.log('🚀 Starting discount creation for test:', testId, 'type:', testType);

    try {
        // Validate basic required parameters
        if (!title || !functionId || !testVariants || !testId || !shop) {
            throw new Error('Missing required parameters for discount creation');
        }

        const testVariantsJson = JSON.parse(testVariants);

        // Validate test variants data
        if (!Array.isArray(testVariantsJson) || testVariantsJson.length === 0) {
            throw new Error('Invalid test variants data');
        }

        let result;
        let discountId;

        if (testType === 'discount') {
            // Handle discount tests (cart discounts)
            if (!discountConfig) {
                throw new Error('Missing discount configuration for discount test');
            }

            const discountConfigJson = JSON.parse(discountConfig);
            console.log('📊 Creating cart discount with variants:', testVariantsJson.length);

            result = await createCartDiscount(admin, title, functionId, testVariantsJson, discountConfigJson);

            if (!result.discountCreated || !result.discount?.discountId) {
                console.error('❌ Cart discount creation failed:', result.errors);
                if (result.errors && result.errors.length > 0) {
                    throw new Error(`Cart discount creation failed: ${result.errors.map(err => err.message).join(', ')}`);
                } else {
                    throw new Error('Cart discount was not created successfully or discount ID is missing');
                }
            }

            discountId = result.discount.discountId;
            console.log('✅ Cart discount created successfully with ID:', discountId);

        } else if (testType === 'pricing') {
            // Handle pricing tests (product discounts)
            console.log('🏷️ Creating product discount with variants:', testVariantsJson.length);

            // Deactivate all active price tests before creating the new one
            const sanitizedDomain = shop.replace(/\./g, '_');
            await deactivateAllActivePriceTests(sanitizedDomain, shop, testId);

            result = await createProductDiscount(admin, title, functionId, testVariantsJson);

            if (!result.discountCreated || !result.discount?.discountId) {
                console.error('❌ Product discount creation failed:', result.errors);
                if (result.errors && result.errors.length > 0) {
                    throw new Error(`Product discount creation failed: ${result.errors.map(err => err.message).join(', ')}`);
                } else {
                    throw new Error('Product discount was not created successfully or discount ID is missing');
                }
            }

            discountId = result.discount.discountId;
            console.log('✅ Product discount created successfully with ID:', discountId);

        } else {
            throw new Error(`Unsupported test type for discount creation: ${testType}`);
        }

        console.log('💾 Discount creation result:', {
            testType,
            discountCreated: result.discountCreated,
            hasDiscountId: !!discountId,
            errorCount: result.errors?.length || 0
        });

        // Update the test data in Firebase with the discount ID
        const sanitizedDomain = shop.replace(/\./g, '_');

        // First, get the current test data to preserve all existing information
        const currentTestResponse = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`);
        if (!currentTestResponse.ok) {
            throw new Error('Failed to fetch current test data for discount ID update');
        }

        const currentTestData = await currentTestResponse.json();
        if (!currentTestData) {
            throw new Error('Current test data not found');
        }

        // Update the test data with discount ID and active status
        const updatedTestData = {
            ...currentTestData,
            basicInfo: {
                ...currentTestData.basicInfo,
                discountId: discountId,
                status: 'active',
                lastStatusChange: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };

        // Update the entire test data in Firebase
        const updateResponse = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTestData)
        });

        if (!updateResponse.ok) {
            console.error('❌ Failed to update test data in Firebase');

            // CRITICAL: If we can't update Firebase, we need to clean up the created discount
            try {
                console.log('🧹 Attempting to clean up created discount due to Firebase update failure...');
                const { deleteDiscount } = await import("../functions/discount");
                await deleteDiscount(admin, discountId);
                console.log('✅ Successfully cleaned up discount after Firebase failure');
            } catch (cleanupError) {
                console.error('💥 Failed to clean up discount after Firebase failure:', cleanupError);
                // This is a critical state - discount exists but not tracked in our DB
            }

            throw new Error('Failed to update test data with discount ID. Discount has been cleaned up.');
        }

        console.log('🎉 Test successfully activated with discount ID:', discountId);

        return json({
            success: true,
            discountCreated: true,
            discountId: discountId,
            errors: [],
            discount: result.discount,
            message: `${testType === 'pricing' ? 'Pricing' : 'Discount'} test started successfully!`,
            newStatus: 'active'
        });

    } catch (error) {
        console.error("💥 Error in discount creation action:", error);

        // Make sure we return detailed error information
        return json({
            success: false,
            discountCreated: false,
            errors: [{ message: error.message }],
            discount: null,
            error: error.message
        });
    }
}

export const loader = async ({ request, params }) => {
    const { admin, session } = await authenticate.admin(request);
    const { testId } = params;

    // Fetch products
    const productsResponse = await admin.graphql(GET_PRODUCTS_AND_SHOP);

    const responseJson = await productsResponse.json();
    const shop = {
        ...responseJson.data.shop,
        domain: responseJson.data.shop.myshopifyDomain, // Use Shopify domain for Firebase paths
        primaryDomain: responseJson.data.shop.primaryDomain // Keep primary domain for other uses
    };

    // Fetch test data for current test
    const testData = await fetchTestData(shop, testId);

    // Fetch all tests data to collect all created product IDs
    const allTestsResponse = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizeShopDomain(shop.domain)}.json`);
    const allTestsData = await allTestsResponse.json();

    // Create a set of product IDs that are duplicates from all productDetails tests
    const duplicatedProductIds = new Set();
    const AllProductIdsInTests = new Set();
    if (allTestsData) {
        // Iterate through all tests
        Object.entries(allTestsData).forEach(([currentTestId, test]) => {
            // Skip current test ID and querySelectors
            if (currentTestId === testId || currentTestId === 'querySelectors') return;

            // Only process tests of type pricing or productDetails
            if (test.selectedProducts) {
                test.selectedProducts.forEach(product => {
                    const productId = product.productId.split('/').pop();
                    AllProductIdsInTests.add(productId);
                    console.log(`🔍 Added product ${productId} from test ${currentTestId} to AllProductIdsInTests`);
                });
            }
            if (test.testGroups) {
                Object.values(test.testGroups).forEach(group => {
                    if (group.products) {
                        Object.values(group.products).forEach(product => {
                            if (product.createdProductId) {
                                // Extract the numeric ID from the gid URL
                                const numericId = product.createdProductId.split('/').pop();
                                duplicatedProductIds.add(numericId);
                            }
                        });
                    }
                });
            }
        });
    }

    // Filter out the duplicated products from the response
    const filteredProducts = responseJson.data.products.nodes.filter(product => {
        const productId = product.id.split('/').pop();
        return !duplicatedProductIds.has(productId);
    });

    // Create a set of product IDs that have multiple variants from filtered products
    const multiVariantProductIds = new Set(
        filteredProducts
            .filter(product => product.variants.edges.length > 1)
            .map(product => product.id.split('/').pop())
    );

    // Create a set of product IDs that have compare at price greater than the actual price
    const compareAtPriceProductIds = new Set(
        filteredProducts
            .filter(product => {
                const hasValidComparePrice = product.variants.edges.some(edge => {
                    const price = parseFloat(edge.node.price);
                    const compareAtPrice = parseFloat(edge.node.compareAtPrice);

                    // Only include if compareAtPrice exists and is greater than price
                    return edge.node.compareAtPrice !== null &&
                        edge.node.compareAtPrice !== undefined &&
                        edge.node.compareAtPrice !== "" &&
                        !isNaN(compareAtPrice) &&
                        !isNaN(price) &&
                        compareAtPrice > price;
                });

                if (hasValidComparePrice) {
                    console.log(`🏷️ Product "${product.title}" has valid compare at price (greater than price):`,
                        product.variants.edges.map(edge => ({
                            id: edge.node.id,
                            price: edge.node.price,
                            compareAtPrice: edge.node.compareAtPrice,
                            isValid: parseFloat(edge.node.compareAtPrice) > parseFloat(edge.node.price)
                        }))
                    );
                }
                return hasValidComparePrice;
            })
            .map(product => product.id.split('/').pop())
    );

    console.log('🔍 Products with compare at price:', Array.from(compareAtPriceProductIds));

    // Get the function ID for product discount
    const functionResponse = await admin.graphql(GET_SHOPIFY_FUNCTIONS);

    const functionResponseJson = await functionResponse.json();
    const functions = functionResponseJson.data.shopifyFunctions.nodes;
    const productDiscountFunction = functions.find(
        (func) => func.apiType === "product_discounts" && func.title === "product-discount"
    );
    const functionId = productDiscountFunction?.id || "";

    console.log('🎯 Final AllProductIdsInTests for current test:', Array.from(AllProductIdsInTests));
    console.log('🆔 Current testId:', testId);

    return {
        products: filteredProducts,
        shop,
        testData,
        functionId,
        AllProductIdsInTests: Array.from(AllProductIdsInTests),
        multiVariantProductIds: Array.from(multiVariantProductIds),
        compareAtPriceProductIds: Array.from(compareAtPriceProductIds)
    };
};

export default function Test() {
    const navigate = useNavigate();
    const { products, shop, testData, functionId, AllProductIdsInTests, multiVariantProductIds, compareAtPriceProductIds } = useLoaderData();
    const { testId } = useParams();
    const fetcher = useFetcher();
    const [searchParams] = useSearchParams();
    const action = searchParams.get('action');
    const type = searchParams.get('type');
    const tabParam = searchParams.get('tab');
    const name = searchParams.get('name');
    const description = searchParams.get('description');

    // Define tab order for navigation
    const tabOrder = ['testGroups', 'modifications', 'targeting', 'preview', 'configuration', 'results'];

    // Add state for test status
    const [testStatus, setTestStatus] = useState(testData?.basicInfo?.status || 'pending');

    // Add state for welcome dialog
    const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
    const [showStartTestConfirmation, setShowStartTestConfirmation] = useState(false);
    const [hasModifications, setHasModifications] = useState(false);
    const [showInventoryValidationModal, setShowInventoryValidationModal] = useState(false);
    const [isDuplicatingProducts, setIsDuplicatingProducts] = useState(false);

    // Initialize states
    const [testGroups, setTestGroups] = useState(() =>
        getInitialTestGroups(testData, action === 'new')
    );
    const [targetingState, setTargetingState] = useState(() =>
        getInitialTargetingState(testData)
    );
    const [selectedProducts, setSelectedProducts] = useState(testData?.selectedProducts || []);
    const [analyticsState, setAnalyticsState] = useState(() =>
        getInitialAnalyticsState(testData)
    );
    const [basicInfo, setBasicInfo] = useState(testData?.basicInfo || {});
    // Add discount configuration state
    const [discountConfig, setDiscountConfig] = useState(testData?.discountConfig || {
        type: 'value',
        threshold: ''
    });

    const [currentTabId, setCurrentTabId] = useState(tabParam || 'testGroups');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [isStartTestLoading, setIsStartTestLoading] = useState(false);
    const [isDiscountIdMissing, setIsDiscountIdMissing] = useState(false);
    const [isDiscountIdThere, setIsDiscountIdThere] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [inventoryIssues, setInventoryIssues] = useState([]);
    const [isScriptDetected, setIsScriptDetected] = useState(null); // null = loading, true = detected, false = not detected
    const [isRefreshingScriptStatus, setIsRefreshingScriptStatus] = useState(false);

    // Set document title for App Bridge title bar
    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        setIsSmallScreen(mediaQuery.matches);

        const handleResize = (e) => {
            setIsSmallScreen(e.matches);
        };

        mediaQuery.addEventListener('change', handleResize);
        return () => mediaQuery.removeEventListener('change', handleResize);
    }, []);

    // Add useEffect to show welcome dialog for new tests and check if instructions were seen
    useEffect(() => {
        if (action === 'new' && !testData?.basicInfo?.instructionsSeen) {
            setShowWelcomeDialog(true);
        }
    }, [action, testData]);

    const handleNavigationChange = (id) => {
        setCurrentTabId(id);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('tab', id);
        window.history.replaceState(null, '', `?${newSearchParams.toString()}`);
    };

    // Create handlers using the extracted functions
    const handleSave = createSaveTestHandler(
        basicInfo,
        testGroups,
        targetingState,
        analyticsState,
        selectedProducts,
        discountConfig,
        testData,
        shop,
        testId,
        name,
        description,
        setIsSaveLoading,
        setToastMessage,
        setShowToast,
        setInventoryIssues,
        setShowInventoryValidationModal,
        setShowStartTestConfirmation
    );

    const handleGetStarted = async () => {
        try {
            const welcomeHandler = createWelcomeHandler(testData, shop, testId);
            await welcomeHandler();
            setShowWelcomeDialog(false);
        } catch (error) {
            console.error('Error updating test data:', error);
            setShowWelcomeDialog(false);
        }
    };

    // Calculate modifications status based on test type
    const hasModifiedPrices = basicInfo?.type === 'pricing' ?
        checkIfPricesModified(testGroups, selectedProducts) : false;
    const hasModifiedProductDetails = basicInfo?.type === 'productDetails' ?
        checkIfProductDetailsModified(testGroups, selectedProducts) : false;
    const hasModifiedDiscount = basicInfo?.type === 'discount' ?
        checkIfDiscountModified(testGroups, discountConfig) : false;

    // Add useEffect to update hasModifications when testGroups or selectedProducts change
    useEffect(() => {
        if (basicInfo?.type === 'pricing') {
            const hasModifiedPrices = checkIfPricesModified(testGroups, selectedProducts);
            setHasModifications(hasModifiedPrices);
        } else if (basicInfo?.type === 'productDetails') {
            const hasModifiedProductDetails = checkIfProductDetailsModified(testGroups, selectedProducts);
            setHasModifications(hasModifiedProductDetails);
        } else if (basicInfo?.type === 'discount') {
            const hasModifiedDiscount = checkIfDiscountModified(testGroups, discountConfig);
            setHasModifications(hasModifiedDiscount);
        }
    }, [testGroups, selectedProducts, basicInfo?.type, discountConfig]);

    // Handle start test confirmation - Use the extracted handler
    const handleStartTestConfirmed = async () => {
        setShowStartTestConfirmation(false);

        // Use the extracted start test handler
        const startTestHandler = createStartTestHandler(
            basicInfo,
            testGroups,
            targetingState,
            analyticsState,
            selectedProducts,
            discountConfig,
            testData,
            shop,
            testId,
            name,
            description,
            fetcher,
            functionId,
            setIsStartTestLoading,
            setIsDuplicatingProducts,
            setToastMessage,
            setShowToast,
            setTestStatus,
            setBasicInfo
        );

        await startTestHandler();
    };

    // Add useEffect to monitor fetcher state and ensure loading state is cleared
    useEffect(() => {
        if (fetcher.state === "submitting") {
            if (basicInfo?.type !== 'discount') {
                setIsStartTestLoading(true);
            }
        } else if (fetcher.state === "idle") {
            if (basicInfo?.type !== 'discount') {
                setIsStartTestLoading(false);
                setIsDuplicatingProducts(false);
            }
        }
    }, [fetcher.state, basicInfo?.type]);

    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            if (fetcher.data.success) {
                if (fetcher.data.discountId) {
                    setToastMessage(fetcher.data.message || 'Test started successfully!');
                    setTestStatus('active');
                    setBasicInfo(prev => ({
                        ...prev,
                        discountId: fetcher.data.discountId,
                        status: 'active'
                    }));
                } else {
                    setToastMessage(fetcher.data.message || 'Test started successfully!');
                    // For product details tests, the API returns basicInfo with status: 'active'
                    if (fetcher.data.basicInfo?.status) {
                        setTestStatus(fetcher.data.basicInfo.status);
                        setBasicInfo(prev => ({
                            ...prev,
                            status: fetcher.data.basicInfo.status
                        }));
                    } else if (fetcher.data.newStatus) {
                        setTestStatus(fetcher.data.newStatus);
                    }
                }
                setShowToast(true);
            } else {
                setToastMessage(fetcher.data.error || 'Error starting test. Please try again.');
                setShowToast(true);
                setTestStatus('pending');
            }
            setIsSaveLoading(false);
        }
    }, [fetcher.state, fetcher.data]);

    // Add useEffect to update status when testData changes
    useEffect(() => {
        if (testData?.basicInfo?.status) {
            if (testData.basicInfo.status === 'active' &&
                testData.basicInfo.type === 'pricing' &&
                !testData.basicInfo.discountId) {
                setTestStatus('pending');
                setToastMessage('Test configuration is incomplete. Please restart the test.');
                setShowToast(true);
            } else {
                setTestStatus(testData.basicInfo.status);
            }
        }
    }, [testData?.basicInfo?.status, testData?.basicInfo?.discountId, testData?.basicInfo?.type]);

    // Sync basicInfo state when testData changes
    useEffect(() => {
        if (testData?.basicInfo) {
            setBasicInfo(testData.basicInfo);
        }
    }, [testData?.basicInfo]);

    // Sync discountConfig state when testData changes
    useEffect(() => {
        if (testData?.discountConfig) {
            setDiscountConfig(testData.discountConfig);
        }
    }, [testData?.discountConfig]);

    // Check script detection status
    const checkScriptDetection = async (showLoading = false) => {
        try {
            if (showLoading) {
                setIsRefreshingScriptStatus(true);
            }
            
            const sanitizedDomain = sanitizeShopDomain(shop.domain);
            const response = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/isScriptDetected.json`);

            if (!response.ok) {
                setIsScriptDetected(false);
                return;
            }

            const isDetected = await response.json();
            setIsScriptDetected(isDetected === true);
        } catch (error) {
            console.error('Error checking script detection:', error);
            setIsScriptDetected(false);
        } finally {
            if (showLoading) {
                setIsRefreshingScriptStatus(false);
            }
        }
    };

    useEffect(() => {
        checkScriptDetection();
    }, [shop.domain]);

    // Add window focus event listener to refresh script detection when user returns to tab
    useEffect(() => {
        const handleWindowFocus = () => {
            // Only refresh if script is currently not detected
            if (isScriptDetected === false) {
                console.log('🔄 Tab focused - refreshing script detection status...');
                checkScriptDetection(true); // Show loading state
            }
        };

        // Add event listener for window focus
        window.addEventListener('focus', handleWindowFocus);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, [isScriptDetected, shop.domain]);

    // Content panels mapping
    const contentPanels = {
        testGroups: <TestGroupsContent
            testGroups={testGroups}
            setTestGroups={setTestGroups}
            isTestStarted={!isModificationsAllowed(testStatus)}
        />,
        modifications: basicInfo?.type === 'productDetails' ? (
            <ModificationsContentProductDetails
                products={products}
                testGroups={testGroups}
                setTestGroups={setTestGroups}
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
                onModificationsMade={setHasModifications}
                isTestStarted={!isModificationsAllowed(testStatus)}
                AllProductIdsInTests={AllProductIdsInTests}
                multiVariantProductIds={multiVariantProductIds}
            />
        ) : basicInfo?.type === 'discount' ? (
            <ModificationsContentDiscount
                testGroups={testGroups}
                onTestGroupsChange={setTestGroups}
                currency={basicInfo?.currency}
                discountConfig={discountConfig}
                setDiscountConfig={setDiscountConfig}
            />
        ) : (
            <ModificationsContentPrice
                products={products}
                testGroups={testGroups}
                setTestGroups={setTestGroups}
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
                onPricesModified={setHasModifications}
                isTestStarted={!isModificationsAllowed(testStatus)}
                multiVariantProductIds={multiVariantProductIds}
                compareAtPriceProductIds={compareAtPriceProductIds}
                currency={basicInfo?.currency}
                basicInfo={basicInfo}
                setBasicInfo={setBasicInfo}
            />
        ),
        targeting: <TargetingContent
            targetingState={targetingState}
            setTargetingState={setTargetingState}
        />,
        preview: basicInfo?.type === 'productDetails' ? (
            <PreviewContentProductDetails
                shop={shop}
                testId={testId}
                currentTestData={{
                    basicInfo: basicInfo,
                    testGroups,
                    selectedProducts
                }}
            />
        ) : basicInfo?.type === 'discount' ? (
            <PreviewContentDiscount
                shop={shop}
                testId={testId}
                currentTestData={{
                    basicInfo: basicInfo,
                    testGroups,
                    discountConfig,
                    targeting: targetingState,
                    analytics: analyticsState
                }}
            />
        ) : (
            <PreviewContent
                shop={shop}
                testId={testId}
                currentTestData={{
                    basicInfo: basicInfo,
                    testGroups,
                    selectedProducts
                }}
            />
        ),
        configuration: <ConfigurationContent shop={shop} testId={testId} />,
        results: basicInfo?.type === 'productDetails' ? (
            <ResultsContentProductDetails testGroups={testGroups} />
        ) : basicInfo?.type === 'discount' ? (
            <ResultsContentDiscount testGroups={testGroups} />
        ) : (
            <ResultsContent testGroups={testGroups} selectedProducts={selectedProducts} testType={basicInfo?.type} />
        )
    };

    const errorBannerMarkup = showToast ? (
        <div style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            maxWidth: '600px',
            width: 'calc(100% - 40px)',
            margin: '0 20px'
        }}>
            <Banner
                status="critical"
                onDismiss={() => setShowToast(false)}
            >
                <p>{toastMessage}</p>
            </Banner>
        </div>
    ) : null;



    return (
        <>
            {isStartTestLoading && <Loading />}
            <Page fullWidth>
                {/* Back to Tests button */}
                <div style={{ 
                    display: 'flex',
                    alignItems: 'center', 
                    padding: '0.2rem 0',
                    justifyContent: 'flex-start'
                }}>
                    <Button
                        icon={ArrowLeftIcon}
                        onClick={() => navigate('/app')}
                        variant="tertiary"
                        size="medium"
                    >
                        Back to Tests
                    </Button>
                </div>
                {/* Horizontal Navigation */}
                <HorizontalNavigation 
                    currentTabId={currentTabId}
                    onNavigationChange={handleNavigationChange}
                    testStatus={testStatus}
                    testData={testData}
                />

                {/* Modals */}
                <WelcomeModal
                    isOpen={showWelcomeDialog}
                    onClose={() => setShowWelcomeDialog(false)}
                    onGetStarted={handleGetStarted}
                />

                <StartTestConfirmationModal
                    isOpen={showStartTestConfirmation}
                    onClose={() => setShowStartTestConfirmation(false)}
                    onConfirm={handleStartTestConfirmed}
                    testType={basicInfo?.type}
                />

                <InventoryValidationModal
                    isOpen={showInventoryValidationModal}
                    onClose={() => setShowInventoryValidationModal(false)}
                    inventoryIssues={inventoryIssues}
                />

                <ui-title-bar title={basicInfo?.testName || name || 'New Test'}>
                    <button variant="breadcrumb" onClick={() => navigate('/app')}>
                        A/B Tests
                    </button>

                    {/* Show Test Script Installation button if script not detected */}
                    {isScriptDetected === false ? (
                        <>
                            <button
                                onClick={() => navigate('/app/setup-guide')}
                                disabled={isRefreshingScriptStatus}
                            >
                                Go to Setup Guide for more clarity
                            </button>
                            <button
                                variant="primary"
                                onClick={() => window.open(`https://${shop.primaryDomain?.url?.replace('https://', '') || shop.domain}?config=verification`, '_blank')}
                                disabled={isRefreshingScriptStatus}
                            >
                                {isRefreshingScriptStatus ? '🔄 Checking Status...' : '⚠️ Test Script Installation Required'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => handleSave(false)}
                                disabled={isSaveLoading || isStartTestLoading || !isModificationsAllowed(testStatus)}
                            >
                                {isSaveLoading ? 'Saving...' : 'Save Changes'}
                            </button>

                            <button
                                variant="primary"
                                onClick={() => handleSave(true)}
                                disabled={
                                    isStartTestLoading ||
                                    isSaveLoading ||
                                    !(basicInfo?.type === 'discount' ?
                                        isDiscountTestDataComplete(testGroups, targetingState, analyticsState, discountConfig) :
                                        isTestDataComplete(selectedProducts, testGroups, targetingState, analyticsState, basicInfo?.type)
                                    ) ||
                                    !isModificationsAllowed(testStatus) ||
                                    !hasModifications
                                }
                            >
                                {isStartTestLoading ? (
                                    isDuplicatingProducts ? 'Creating Product Duplicates...' : 'Starting...'
                                ) : 'Start Test'}
                            </button>
                        </>
                    )}
                </ui-title-bar>

                {/* Error banner - Show at the top for immediate visibility */}
                {errorBannerMarkup}

                <BlockStack gap="500">
                    <Layout>
                        <Layout.Section>
                            <BlockStack gap="500">
                                {contentPanels[currentTabId]}
                                <PrevNextNavigationButtons
                                    currentTabId={currentTabId}
                                    tabOrder={tabOrder}
                                    onNavigationChange={handleNavigationChange}
                                    hasModifications={hasModifications}
                                />
                            </BlockStack>
                        </Layout.Section>
                    </Layout>
                </BlockStack>
            </Page>
        </>
    );
} 