import { saveTestData } from './firebase-operations';

export const handleSaveTest = async (shop, testId, testData, isStartingTest = false) => {
    try {
        const timestamp = new Date().toISOString();
        const testType = testData?.basicInfo?.type;

        // Create the base update data structure
        const updatedTestData = {
            basicInfo: {
                ...(testData?.basicInfo || {}),
                updatedAt: timestamp,
                createdAt: testData?.basicInfo?.createdAt || timestamp,
                currency: testData?.basicInfo?.currency || '', // Changed default from INR to USD
                // Only include discountId for pricing tests
                ...(testType === 'pricing' && { discountId: testData?.basicInfo?.discountId || "" })
            },
            testGroups: testData.testGroups,
            targeting: testData.targeting,
            analytics: testData.analytics,
            sessions: testData.sessions || [] // Include sessions array at top level
        };

        // Add test-type specific fields
        if (testType === 'pricing' || testType === 'productDetails') {
            // Pricing and productDetails tests need selectedProducts
            updatedTestData.selectedProducts = testData.selectedProducts;
            
        } else if (testType === 'discount') {
            // Discount tests need discountConfig
            if (testData.discountConfig) {
                updatedTestData.discountConfig = testData.discountConfig;
                
            }
        }

        console.log('🔍 handleSaveTest: Final data structure:', {
            testType: testType,
            hasDiscountConfig: !!updatedTestData.discountConfig,
            hasSelectedProducts: !!updatedTestData.selectedProducts,
            allKeys: Object.keys(updatedTestData)
        });

        // Save test data
        await saveTestData(shop, testId, updatedTestData);

        return {
            success: true,
            message: 'Test saved successfully!'
        };
    } catch (error) {
        console.error('Error saving test:', error);
        return {
            success: false,
            message: 'Error saving test. Please try again.',
            error
        };
    }
};

export const handleStartTest = async (fetcher, shop, testId, testData, functionId) => {
    try {
        const testType = testData?.basicInfo?.type;

        if (testType === 'productDetails') {
            // For product details tests, call the create-product-duplicates API
            const formData = new FormData();
            formData.append('testId', testId);
            formData.append('shop', shop.domain);
            formData.append('testData', JSON.stringify(testData));

            // Submit to the create-product-duplicates API
            fetcher.submit(formData, { 
                method: 'post',
                action: '/api/create-product-duplicates'
            });

            // For product details tests, we need to wait for the fetcher response
            // The response will be handled by the fetcher state
            return {
                success: true,
                message: 'Product details test start process initiated',
                isAsync: true // Indicate that this is an async operation
            };
        }

        // For pricing and discount tests, use the existing logic
        // Prepare test variants based on test type
        let testVariants;
        if (testType === 'pricing') {
            testVariants = testData.testGroups.map(group => ({
                name: group.name,
                percentage: group.percentage,
                products: group.products
            }));
        } else if (testType === 'discount') {
            testVariants = testData.testGroups.map(group => ({
                name: group.name,
                percentage: group.percentage,
                discountPercentageValue: group.discountPercentageValue
            }));
        } else {
            throw new Error(`Unsupported test type: ${testType}`);
        }

        // Create form data for the request
        const formData = new FormData();
        formData.append('title', `${testData.basicInfo.testName} - ${testId}`);
        formData.append('functionId', functionId);
        formData.append('testVariants', JSON.stringify(testVariants));
        formData.append('testId', testId);
        formData.append('shop', shop.domain);

        // Add testType parameter for all tests
        formData.append('testType', testType);

        // Add test-type specific data
        if (testType === 'pricing') {
            formData.append('productId', testData.selectedProducts[0].productId);
        } else if (testType === 'discount') {
            formData.append('discountConfig', JSON.stringify(testData.discountConfig));
        }

        // Submit the form
        fetcher.submit(formData, { method: 'post' });

        return {
            success: true,
            message: 'Test start process initiated'
        };
    } catch (error) {
        console.error('Error in handleStartTest:', error);
        return {
            success: false,
            message: error.message
        };
    }
}; 