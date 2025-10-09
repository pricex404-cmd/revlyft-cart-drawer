export const getInitialTestGroups = (testData, isNewTest) => {
    if (testData?.testGroups) {
        return testData.testGroups;
    }

    // Only use default groups for new tests
    return isNewTest ? [
        {
            id: 1,
            name: 'Control Group',
            percentage: 50,
            color: '#0040FF',
            products: {},
            analytics: {
                views: {},
                addToCart: {},
                saleDone: {}
            }
        },
        {
            id: 2,
            name: 'New Group 1',
            percentage: 50,
            color: '#00A47C',
            products: {},
            analytics: {
                views: {},
                addToCart: {},
                saleDone: {}
            }
        }
    ] : [];
};

export const getInitialTargetingState = (testData) => {
    return testData?.targeting || {
        deviceType: "all",
        visitorType: "all",
        trafficSource: "all"
    };
};

export const getInitialAnalyticsState = (testData) => {
    return testData?.analytics || {
        conversionType: 'all',
        primaryMetric: 'conversion'
    };
};

export const isTestDataComplete = (selectedProducts, testGroups, targetingState, analyticsState, testType) => {
    console.log('🔍 isTestDataComplete called with:', {
        selectedProductsLength: selectedProducts.length,
        testGroupsLength: testGroups.length,
        testType
    });

    if (selectedProducts.length === 0) {
        console.log('❌ No selected products');
        return false;
    }

    // Check if any test group has product modifications
    const hasProductModifications = testGroups.some(group => {
        console.log(`🏷️ Checking group: ${group.name}`);

        if (!group.products) {
            console.log(`❌ Group ${group.name} has no products`);
            return false;
        }

        const productKeys = Object.keys(group.products);
        console.log(`📦 Group ${group.name} has ${productKeys.length} products`);

        if (testType === 'pricing') {
            // For pricing tests, check if prices have been modified
            const hasModifiedPrices = productKeys.length > 0 && productKeys.some(key => {
                const productData = group.products[key];
                console.log(`💰 Checking product ${key}:`, productData);

                if (!productData) return false;

                // Handle multi-variant products
                if (productData.isMultiVariant && productData.variants) {
                    const variantKeys = Object.keys(productData.variants);
                    console.log(`🔀 Multi-variant product ${key} has ${variantKeys.length} variants`);

                    const hasVariantModifications = variantKeys.some(variantKey => {
                        const variantData = productData.variants[variantKey];
                        const hasModification = variantData && variantData.modifiedPrice !== undefined;
                        console.log(`🎯 Variant ${variantKey} has modification:`, hasModification);
                        return hasModification;
                    });

                    return hasVariantModifications;
                } else {
                    // Handle single variant products
                    const hasModification = productData.modifiedPrice !== undefined;
                    console.log(`🔍 Single variant product ${key} has modification:`, hasModification);
                    return hasModification;
                }
            });

            console.log(`✅ Group ${group.name} has modified prices:`, hasModifiedPrices);
            return hasModifiedPrices;
        } else if (testType === 'productDetails') {
            // For product details tests, check if any details have been modified
            return productKeys.length > 0 && productKeys.some(key => {
                const productData = group.products[key];
                return productData && (
                    productData.modifiedTitle !== undefined ||
                    productData.modifiedDescription !== undefined ||
                    productData.modifiedImage !== undefined
                );
            });
        }
        return false;
    });

    // Check if we have targeting and analytics data
    const hasTargeting = Object.keys(targetingState).length > 0;
    const hasAnalytics = Object.keys(analyticsState).length > 0;

    console.log('📊 Final validation results:', {
        hasProductModifications,
        hasTargeting,
        hasAnalytics,
        final: hasProductModifications && hasTargeting && hasAnalytics
    });

    return hasProductModifications && hasTargeting && hasAnalytics;
};

// Separate function for discount test validation
export const isDiscountTestDataComplete = (testGroups, targetingState, analyticsState, discountConfig) => {
    console.log('💰 isDiscountTestDataComplete called with:',discountConfig, {
        testGroupsLength: testGroups.length,
        hasDiscountConfig: !!discountConfig,
        discountConfig
    });

    // Check if we have test groups
    if (testGroups.length === 0) {
        console.log('❌ No test groups');
        return false;
    }

    // Check if any non-control groups have discount values
    const nonControlGroups = testGroups.filter(group => !group.name.toLowerCase().includes('control'));
    const hasDiscountValues = nonControlGroups.length > 0 && nonControlGroups.every(group => {
        const hasValue = group.discountPercentageValue && group.discountPercentageValue !== '';
        const numValue = parseFloat(group.discountPercentageValue);
        const isValidValue = !isNaN(numValue) && numValue > 0 && numValue <= 100;
        console.log(`🏷️ Group ${group.name} has valid discount value:`, hasValue && isValidValue, group.discountPercentageValue);
        return hasValue && isValidValue;
    });

    // Check if discount configuration is set
    const hasDiscountConfig = discountConfig && discountConfig.type && discountConfig.threshold !== ''&& !(discountConfig.showTimer==true && discountConfig.timerMinutes=="") 
  

    // Check if we have targeting and analytics data
    const hasTargeting = Object.keys(targetingState).length > 0;
    const hasAnalytics = Object.keys(analyticsState).length > 0;

    console.log('📊 Discount test validation results:', {
        nonControlGroupsCount: nonControlGroups.length,
        hasDiscountValues,
        hasDiscountConfig,
        hasTargeting,
        hasAnalytics,
        final: hasDiscountValues && hasDiscountConfig && hasTargeting && hasAnalytics
    });

    return hasDiscountValues && hasDiscountConfig && hasTargeting && hasAnalytics;
}; 