import { sanitizeShopDomain, validateTestConfiguration } from "./test-utils";
import { handleSaveTest, handleStartTest } from "./test-actions";
import { validateInventoryDistribution } from "../productdetails";
import { isDiscountTestDataComplete } from "./state-management";
import { deactivateAllActiveDiscountTests, deactivateAllActivePriceTests } from "../discount";
import { createNewSession } from "../timer";

const FIREBASE_DB_URL = "https://abtest-6b299-default-rtdb.firebaseio.com";

export const createSaveTestHandler = (
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
) => {
    return async (shouldStartTest) => {
        // For product details tests, validate inventory distribution before saving
        if (basicInfo?.type === 'productDetails') {
            const validation = validateInventoryDistribution(testGroups, selectedProducts);
            if (validation.hasIssues) {
                setInventoryIssues(validation.issues);
                setShowInventoryValidationModal(true);
                return;
            }
        }

        if (shouldStartTest) {
            setShowStartTestConfirmation(true);
            return;
        }

        setIsSaveLoading(true);

        try {
            const currentTime = new Date().toISOString();
            const newSession = createNewSession('manual');
            const existingSessions = testData?.sessions || [];
            const updatedSessions = [...existingSessions, newSession];

            const currentTestData = {
                basicInfo: {
                    ...basicInfo,
                    testName: basicInfo?.testName || name,
                    testDescription: basicInfo?.testDescription || description,
                    type: basicInfo?.type || type,
                    status: 'pending',
                    instructionsSeen: basicInfo?.instructionsSeen || true,
                    lastStartTime: currentTime
                },
                testGroups: testGroups.map(group => {
                    const { discountError, ...cleanGroup } = group;
                    return {
                        ...cleanGroup,
                        ...(basicInfo?.type === 'discount' && {
                            discountPercentageValue: group.discountPercentageValue || ''
                        })
                    };
                }),
                targeting: targetingState,
                analytics: analyticsState,
                sessions: updatedSessions
            };

            // Add selectedProducts for pricing and productDetails tests
            if (basicInfo?.type === 'pricing' || basicInfo?.type === 'productDetails') {
                currentTestData.selectedProducts = selectedProducts;
            }

            // Add discountConfig only for discount tests
            if (basicInfo?.type === 'discount') {
                const configToSave = {
                    type: discountConfig?.type || 'value',
                    threshold: discountConfig?.threshold || ''
                };
                currentTestData.discountConfig = configToSave;
            }

            const saveResult = await handleSaveTest(shop, testId, currentTestData);
            setToastMessage(saveResult.message);
            setShowToast(true);
            setIsSaveLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setToastMessage('An error occurred. Please try again.');
            setShowToast(true);
            setIsSaveLoading(false);
        }
    };
};

export const createStartTestHandler = (
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
) => {
    return async () => {
        setIsStartTestLoading(true);

        try {
            const currentTime = new Date().toISOString();
            const newSession = createNewSession('manual');
            const existingSessions = testData?.sessions || [];
            const updatedSessions = [...existingSessions, newSession];

            const currentTestData = {
                basicInfo: {
                    ...basicInfo,
                    testName: basicInfo?.testName || name,
                    testDescription: basicInfo?.testDescription || description,
                    type: basicInfo?.type || type,
                    status: 'pending',
                    instructionsSeen: basicInfo?.instructionsSeen || true,
                    lastStartTime: currentTime
                },
                testGroups: testGroups.map(group => {
                    const { discountError, ...cleanGroup } = group;
                    return {
                        ...cleanGroup,
                        ...(basicInfo?.type === 'discount' && {
                            discountPercentageValue: group.discountPercentageValue || ''
                        })
                    };
                }),
                targeting: targetingState,
                analytics: analyticsState,
                sessions: updatedSessions
            };

            // Add selectedProducts for pricing and productDetails tests
            if (basicInfo?.type === 'pricing' || basicInfo?.type === 'productDetails') {
                currentTestData.selectedProducts = selectedProducts;
            }

            // Add discountConfig only for discount tests
            if (basicInfo?.type === 'discount') {
                const configToSave = {
                    type: discountConfig?.type || 'value',
                    threshold: discountConfig?.threshold || ''
                };
                currentTestData.discountConfig = configToSave;
            }

            // Validate test configuration before proceeding
            let validation;
            if (basicInfo?.type === 'discount') {
                const isComplete = isDiscountTestDataComplete(testGroups, targetingState, analyticsState, currentTestData.discountConfig);
                validation = {
                    isValid: isComplete,
                    issues: isComplete ? [] : ['Discount test configuration is incomplete']
                };
            } else {
                validation = validateTestConfiguration(currentTestData, basicInfo?.type);
            }

            if (!validation.isValid) {
                throw new Error(`Test configuration is invalid: ${validation.issues.join(', ')}`);
            }

            console.log('✅ Test configuration validation passed for type:', basicInfo?.type);

            // Always save changes first (with pending status)
            const saveResult = await handleSaveTest(shop, testId, currentTestData);

            if (!saveResult.success) {
                throw new Error(saveResult.message);
            }

            console.log('📝 Test data saved, now starting test process for type:', basicInfo?.type);

            // Start the test based on type
            let startResult;
            if (basicInfo?.type === 'discount') {
                // Handle discount tests with cart discounts
                const sanitizedDomain = shop.domain.replace(/\./g, '_');
                await deactivateAllActiveDiscountTests(sanitizedDomain, shop.domain, testId);

                const response = await fetch(`/api/start-discount-test?testId=${testId}&shop=${shop.domain}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(currentTestData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to start discount test');
                }

                startResult = await response.json();

                if (startResult.success && startResult.discountId) {
                    const sanitizedDomain = shop.domain.replace(/\./g, '_');
                    const updateResponse = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            basicInfo: {
                                ...currentTestData.basicInfo,
                                discountId: startResult.discountId,
                                status: 'active',
                                lastStatusChange: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            }
                        })
                    });

                    if (!updateResponse.ok) {
                        throw new Error('Failed to update test data with discount ID');
                    }

                    setBasicInfo(prev => ({
                        ...prev,
                        discountId: startResult.discountId,
                        status: 'active'
                    }));
                    setTestStatus('active');
                }

                setIsStartTestLoading(false);
                setIsDuplicatingProducts(false);
            } else if (basicInfo?.type === 'pricing') {
                // Handle pricing tests with product discounts
                console.log('🏷️ Starting pricing test...');

                // Deactivate all active price tests before starting the new one
                const sanitizedDomain = shop.domain.replace(/\./g, '_');
                await deactivateAllActivePriceTests(sanitizedDomain, shop.domain, testId);

                startResult = await handleStartTest(fetcher, shop, testId, currentTestData, functionId);
            } else if (basicInfo?.type === 'productDetails') {
                // Handle product details tests (no discounts needed)
                console.log('📄 Starting product details test...');
                setIsDuplicatingProducts(true);
                startResult = await handleStartTest(fetcher, shop, testId, currentTestData, functionId);
            } else {
                throw new Error(`Unknown test type: ${basicInfo?.type}`);
            }

            if (!startResult.success) {
                throw new Error(startResult.message || 'Failed to start test');
            }

            setToastMessage(startResult.message || 'Test started successfully!');
            setShowToast(true);
            console.log('🚀 Test start process completed successfully for type:', basicInfo?.type);

        } catch (error) {
            console.error('💥 Error in start test handler:', error);
            setToastMessage(error.message || 'An error occurred. Please try again.');
            setShowToast(true);
            setIsStartTestLoading(false);
            setIsDuplicatingProducts(false);
        }
    };
};

export const createWelcomeHandler = (testData, shop, testId) => {
    return async () => {
        try {
            const updatedTestData = {
                ...testData,
                basicInfo: {
                    ...testData.basicInfo,
                    instructionsSeen: true
                }
            };

            const sanitizedDomain = sanitizeShopDomain(shop.domain);
            const response = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTestData)
            });

            if (!response.ok) {
                throw new Error('Failed to update test data');
            }

            return { success: true };
        } catch (error) {
            console.error('Error updating test data:', error);
            return { success: true, error: error.message };
        }
    };
}; 