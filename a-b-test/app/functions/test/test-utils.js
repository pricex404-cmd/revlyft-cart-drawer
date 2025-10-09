import extractShopifyProductId from "../../utils/extractProductId";

// Function to sanitize shop domain for Firebase path
export const sanitizeShopDomain = (domain) => {
    if (!domain) return '';
    return domain.replace(/\./g, '_');
};

// Function to check if modifications are allowed based on test status
export const isModificationsAllowed = (status) => {
    return status === 'pending';
};

// Function to validate test configuration before starting
export const validateTestConfiguration = (testData, testType) => {
    const issues = [];

    // Basic validation
    if (!testData.testGroups || testData.testGroups.length === 0) {
        issues.push('No test groups configured');
    }

    // Validate test groups have proper percentage distribution
    if (testData.testGroups && testData.testGroups.length > 0) {
        const totalPercentage = testData.testGroups.reduce((sum, group) => sum + (group.percentage || 0), 0);
        if (totalPercentage !== 100) {
            issues.push(`Test group percentages must total 100% (currently ${totalPercentage}%)`);
        }
    }

    // Type-specific validation
    if (testType === 'pricing') {
        if (!testData.selectedProducts || testData.selectedProducts.length === 0) {
            issues.push('No products selected for testing');
        }
        // For pricing tests, ensure we have proper modifications
        if (!testData.testGroups.some(group =>
            group.products && Object.keys(group.products).length > 0
        )) {
            issues.push('No price modifications configured for test groups');
        }
    } else if (testType === 'productDetails') {
        if (!testData.selectedProducts || testData.selectedProducts.length === 0) {
            issues.push('No products selected for testing');
        }
        // For product details tests, ensure we have proper modifications
        if (!testData.testGroups.some(group =>
            group.products && Object.keys(group.products).length > 0
        )) {
            issues.push('No product detail modifications configured for test groups');
        }
    } else if (testType === 'discount') {
        // Validate discount configuration
        if (!testData.discountConfig) {
            issues.push('Discount configuration is missing');
        } else {
            if (!testData.discountConfig.type) {
                issues.push('Discount type (value/quantity) not selected');
            }
            if (!testData.discountConfig.threshold) {
                issues.push('Discount threshold not set');
            }
        }

        // Validate that each non-control group has a discount value
        const nonControlGroups = testData.testGroups.filter(group =>
            !group.name.toLowerCase().includes('control')
        );

        nonControlGroups.forEach(group => {
            if (!group.discountPercentageValue || group.discountPercentageValue === '') {
                issues.push(`Discount value not set for group: ${group.name}`);
            } else {
                const discountValue = parseFloat(group.discountPercentageValue);
                if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
                    issues.push(`Invalid discount value for group ${group.name}. Must be between 0 and 100`);
                }
            }
        });
    }

    return {
        isValid: issues.length === 0,
        issues
    };
};

// Function to check if any prices have been modified
export const checkIfPricesModified = (testGroups, selectedProducts) => {
    console.log('🔍 checkIfPricesModified called with:', {
        testGroupsLength: testGroups.length,
        selectedProductsLength: selectedProducts.length
    });

    if (!selectedProducts.length || !testGroups.length) return false;

    // Get all non-control groups
    const nonControlGroups = testGroups.filter(group => !group.name.toLowerCase().includes('control'));
    console.log('📊 Non-control groups found:', nonControlGroups.length);
    console.log('🎯 Non-control group names:', nonControlGroups.map(g => g.name));

    if (nonControlGroups.length === 0) return false;

    // Check if all non-control groups have modified prices for all selected products
    return nonControlGroups.every(group => {
        console.log(`🏷️ Checking group: ${group.name}`);

        return selectedProducts.every(product => {
            const productId = product.productId.match(/(\d+)$/)?.[1] || product.productId;
            const groupProductData = group.products?.[productId];

            console.log(`📦 Checking product ${product.title} (ID: ${productId})`);
            console.log(`🔗 Group product data exists:`, !!groupProductData);

            if (!groupProductData) {
                console.log(`❌ No group product data found for product ${productId}`);
                return false;
            }

            // Handle multi-variant products
            if (product.isMultiVariant) {
                console.log(`🔀 Multi-variant product detected: ${product.title}`);

                // First check if there are any variants selected
                if (!product.variants || product.variants.length === 0) {
                    console.log(`❌ No variants selected for product ${product.title}`);
                    return false;
                }

                console.log(`📋 Product variants:`, product.variants.length);

                // Then check if selected variants have price modifications
                const allVariantsModified = product.variants.every(productVariant => {
                    const variantKey = extractShopifyProductId(productVariant.variantId);
                    const groupVariantData = groupProductData.variants?.[variantKey];

                    console.log(`🎯 Checking variant: ${productVariant.title} (Key: ${variantKey})`);

                    if (!groupVariantData) {
                        console.log(`❌ No variant data found for variant ${variantKey}`);
                        return false;
                    }

                    // Convert both to numbers for comparison to avoid floating point issues
                    const originalPrice = Number(productVariant.price);
                    const modifiedPrice = Number(groupVariantData.modifiedPrice);
                    const isModified = modifiedPrice !== originalPrice;

                    console.log(`🔍 Variant ${productVariant.title}: ${originalPrice} → ${modifiedPrice}, Modified: ${isModified}`);

                    return isModified;
                });

                console.log(`✅ All variants modified for ${product.title}: ${allVariantsModified}`);
                return allVariantsModified;
            } else {
                // Handle single variant products
                const originalPrice = Number(product.originalPrice);
                const modifiedPrice = Number(groupProductData.modifiedPrice);
                const isModified = modifiedPrice !== originalPrice;

                console.log(`🔍 Single variant ${product.title}: ${originalPrice} → ${modifiedPrice}, Modified: ${isModified}`);

                return isModified;
            }
        });
    });
};

// Function to check if any product details have been modified
export const checkIfProductDetailsModified = (testGroups, selectedProducts) => {
    if (!selectedProducts.length || !testGroups.length) return false;

    // Get all non-control groups
    const nonControlGroups = testGroups.filter(group => !group.name.toLowerCase().includes('control'));
    if (nonControlGroups.length === 0) return false;

    // Check if EVERY non-control group has modifications for EVERY selected product
    // This matches the original logic pattern
    return nonControlGroups.every(group => {
        return selectedProducts.every(product => {
            const productId = product.productId.match(/(\d+)$/)?.[1] || product.productId;
            const groupProductData = group.products?.[productId];

            if (!groupProductData) return false;

            // Use the stored original values in the group data
            const originalTitle = groupProductData.originalTitle || product.title;
            const originalDescription = groupProductData.originalDescription || product.description || '';
            const originalImages = groupProductData.originalImages || product.imageUrls || [];

            // Check if ANY field has been modified from the original
            const hasModifiedTitle = groupProductData.modifiedTitle !== originalTitle;
            const hasModifiedDescription = groupProductData.modifiedDescription !== originalDescription;
            const hasModifiedImages = JSON.stringify(groupProductData.modifiedImages || []) !== JSON.stringify(originalImages);

            return hasModifiedTitle || hasModifiedDescription || hasModifiedImages;
        });
    });
};

// Function to check if discount modifications have been made
export const checkIfDiscountModified = (testGroups, discountConfig) => {
    if (!testGroups.length) return false;
    if (discountConfig.showTimer === true && discountConfig.timerMinutes === "") {

        return false;
    }
 
    // Check if discount configuration is set
    if (!discountConfig.type || !discountConfig.threshold) return false;

    // Get all non-control groups
    const nonControlGroups = testGroups.filter(group => !group.name.toLowerCase().includes('control'));
    if (nonControlGroups.length === 0) return false;

    // Check if all non-control groups have discount values set
    return nonControlGroups.every(group => {
        const discountValue = parseFloat(group.discountPercentageValue);
        return !isNaN(discountValue) && discountValue > 0 && discountValue <= 100;
    });
};

// Function to render inventory issue details
export const renderInventoryIssueDetails = (issue) => {
    const action = issue.difference > 0 ? 'Distribute' : 'Reduce';
    const amount = Math.abs(issue.difference);

    return {
        action,
        amount,
        productTitle: issue.productTitle,
        originalInventory: issue.originalInventory,
        currentTotal: issue.currentTotal,
        difference: issue.difference,
        groupDistribution: issue.groupDistribution
    };
}; 