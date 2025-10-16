import { useState, useEffect } from "react";
import { Text, BlockStack, InlineStack, Box, LegacyCard } from "@shopify/polaris";
import extractShopifyProductId from "../../utils/extractProductId";
import { getCurrencySymbol } from "../../utils/currencyFormatter";

// Import new components
import PricingMethodSelector from './modificationContentComponent/PricingMethodSelector';
import WarningBanners from './modificationContentComponent/WarningBanners';
import VariantSelectionModal from './modificationContentComponent/VariantSelectionModal';
import ProductsList from './modificationContentComponent/ProductsList';
import ProductPricingInterface from './modificationContentComponent/ProductPricingInterface';
import EmptyProductsState from './modificationContentComponent/EmptyProductsState';
import BulkDiscountModal from './modificationContentComponent/BulkDiscountModal';
import useProductModifications from './useProductModifications';


 const ModificationsContentPrice = ({
    products,
    testGroups,
    setTestGroups,
    selectedProducts,
    setSelectedProducts,
    onPricesModified,
    isTestStarted,
    multiVariantProductIds,
    compareAtPriceProductIds,
    currency,
    basicInfo,
    setBasicInfo
}) => {
    // Use the custom hook for product modifications
    const {
        showProductList,
        setShowProductList,
        showModificationWarning,
        setShowModificationWarning,
        showPriceWarning,
        setShowPriceWarning,
        warningMessage,
        setWarningMessage,
        productSelectionError,
        setProductSelectionError,
        showVariantSelection,
        setShowVariantSelection,
        currentMultiVariantProduct,
        setCurrentMultiVariantProduct,
        selectedVariants,
        setSelectedVariants,
        hasDiscountId,
        handleModificationAttempt,
        calculateDiscountPercentage,
        handleVariantToggle,
        handleConfirmVariantSelection,
        handleCancelVariantSelection
    } = useProductModifications({
        testGroups,
        setTestGroups,
        selectedProducts,
        setSelectedProducts,
        isTestStarted,

        multiVariantProductIds,
        compareAtPriceProductIds,
        pricingMethod: basicInfo?.pricingMethod || 'percentage'
    });

    // Get the current pricing method from basicInfo, default to 'percentage'
    const pricingMethod = basicInfo?.pricingMethod || 'percentage';

    // State for bulk discount modal
    const [showBulkDiscountModal, setShowBulkDiscountModal] = useState(false);

    // Function to handle pricing method change
    const handlePricingMethodChange = (method) => {
        if (isTestStarted) return;

        // If switching to percentage and there are selected products, show bulk discount modal
        if (method === 'percentage' && selectedProducts.length > 0) {
            setShowBulkDiscountModal(true);
        }
        setBasicInfo(prev => ({
            ...prev,
            pricingMethod: method
        }));

    };

    // Function to handle per-product pricing method change
    const handleProductPricingMethodChange = (productId, method) => {
        if (isTestStarted) return;

        // Update the selectedProducts array to include the pricing method for this specific product
        setSelectedProducts(prev => prev.map(product => {
            if (product.productId === productId) {
                return {
                    ...product,
                    pricingMethod: method
                };
            }
            return product;
        }));
    };

    

    // Debug: Log testGroups to see their structure
    // );

    // Sanitize any existing testGroups on component mount
    useEffect(() => {
        if (testGroups && testGroups.length > 0) {
            // Check if any group has product IDs that need sanitizing
            let needsSanitizing = false;

            testGroups.forEach(group => {
                if (group.products) {
                    Object.keys(group.products).forEach(productId => {
                        if (productId.includes('gid://')) {
                            needsSanitizing = true;
                        }
                    });
                }
            });

            // If we found unsanitized IDs, clean them up
            if (needsSanitizing) {
                

                const sanitizedGroups = testGroups.map(group => {
                    // Skip if no products
                    if (!group.products) return group;

                    const sanitizedProducts = {};

                    // Convert each product ID to numeric format
                    Object.entries(group.products).forEach(([productId, productData]) => {
                        if (productId === 'initialised') {
                            sanitizedProducts[productId] = productData;
                            return;
                        }

                        const numericId = extractShopifyProductId(productId);
                        if (numericId) {
                            sanitizedProducts[numericId] = productData;
                        }
                    });

                    return {
                        ...group,
                        products: sanitizedProducts
                    };
                })
                setTestGroups(sanitizedGroups);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleProductSelect = (product) => {
        
        
        

        if (isTestStarted) {
            
            return;
        }

        // Check if product has multiple variants
        const productId = product.id.split('/').pop();
        
        

        


        // Check if product has compare at price using the pre-filtered array
        const hasCompareAtPrice = compareAtPriceProductIds && compareAtPriceProductIds.includes(productId);

        
        
        
        

        // Check if product is already in another test
        
        


      

        // Check if this product is already selected
        const isAlreadySelected = selectedProducts.find(p => p.productId === product.id);

        // If product is already selected, allow deselection regardless of warnings
        if (isAlreadySelected) {
            
            // Remove product
            setSelectedProducts(selectedProducts.filter(p => p.productId !== product.id));

            // Remove product prices from all test groups
            const updatedGroups = testGroups.map(group => {
                const productKey = extractShopifyProductId(product.id);
                const { [productKey]: removed, ...remainingProducts } = group.products || {};
                return {
                    ...group,
                    products: remainingProducts
                };
            });
            setTestGroups(updatedGroups);
            return;
        }

        // Show warnings and prevent selection for problematic products
        if (hasCompareAtPrice) {
            
            setProductSelectionError(`This product has a compare at price set. Price tests cannot be run on products with compare at price as it would create pricing conflicts.`);
            setTimeout(() => setProductSelectionError(''), 6000);
            return; // Prevent selection
        }

       

        

        // Proceed with normal selection logic for products without issues
        const isMultiVariant = multiVariantProductIds && multiVariantProductIds.includes(productId);

        if (isMultiVariant) {
            // Handle multi-variant product - check if all variants have same price
            const allVariants = product.variants.edges.map(edge => ({
                variantId: edge.node.id,
                title: edge.node.title,
                price: parseFloat(edge.node.price || '0')
            }));

            // Check if all variants have the same price
            const firstPrice = allVariants[0]?.price || 0;
            const hasSamePrice = allVariants.every(variant => variant.price === firstPrice);

            if (hasSamePrice) {
                // Treat as normal product - all variants have same price
                const formattedProduct = {
                    productId: product.id,
                    title: product.title,
                    handle: product.handle,
                    imageUrl: product.images.edges[0]?.node.url || '',
                    isMultiVariant: true,
                    samePrice: true, // Flag to indicate same price across variants
                    originalPrice: firstPrice, // Store all variants for backend
                    variants: allVariants, // Auto-select all variants
                    pricingMethod: pricingMethod // Initialize with current pricing method
                };

                // Add formatted product
                setSelectedProducts([...selectedProducts, formattedProduct]);

                // Initialize product in test groups like a normal product but with multi-variant flag
                const numericProductId = extractShopifyProductId(product.id);

                const updatedGroups = testGroups.map(group => ({
                    ...group,
                    products: {
                        ...group.products,
                        [numericProductId]: {
                            isMultiVariant: true,
                            samePrice: true,
                            originalPrice: firstPrice,
                            modifiedPrice: firstPrice,
                            discountPercentage: 0, // Initialize with 0% discount
                            fixedAmountOff: 0, // Initialize with 0 fixed amount off
                            // Store all variants with same price
                            variants: allVariants.reduce((acc, variant) => {
                                const variantKey = extractShopifyProductId(variant.variantId);
                                acc[variantKey] = {
                                    variantId: variant.variantId,
                                    title: variant.title,
                                    originalPrice: variant.price,
                                    modifiedPrice: variant.price,
                                    discountPercentage: 0, // Initialize with 0% discount
                                    fixedAmountOff: 0 // Initialize with 0 fixed amount off
                                };
                                return acc;
                            }, {})
                        }
                    }
                }));
                setTestGroups(updatedGroups);
            } else {
                // Different prices - show complex variant selection UI
                const formattedProduct = {
                    productId: product.id,
                    title: product.title,
                    handle: product.handle,
                    imageUrl: product.images.edges[0]?.node.url || '',
                    isMultiVariant: true,
                    samePrice: false,
                    allVariants: allVariants, // Store all available variants
                    variants: [], // Initially no variants selected for testing
                    pricingMethod: pricingMethod // Initialize with current pricing method
                };

                // Add formatted product
                setSelectedProducts([...selectedProducts, formattedProduct]);

                // Initialize empty multi-variant product in test groups (variants will be selected later)
                const numericProductId = extractShopifyProductId(product.id);

                const updatedGroups = testGroups.map(group => ({
                    ...group,
                    products: {
                        ...group.products,
                        [numericProductId]: {
                            isMultiVariant: true,
                            samePrice: false,
                            variants: {} // Empty initially, will be populated when variants are selected
                        }
                    }
                }));
                setTestGroups(updatedGroups);
            }
        } else {
            // Handle single variant product (normalize to use variants structure)
            const firstVariant = product.variants.edges[0]?.node;

            // Format product according to schema
            const formattedProduct = {
                productId: product.id,
                variantId: firstVariant?.id || '',
                title: product.title,
                handle: product.handle,
                originalPrice: parseFloat(firstVariant?.price || '0'),
                imageUrl: product.images.edges[0]?.node.url || '',
                isMultiVariant: false,
                pricingMethod: pricingMethod // Initialize with current pricing method
            };

            // Add formatted product
            setSelectedProducts([...selectedProducts, formattedProduct]);

            // Initialize product price in all test groups with normalized variants structure
            const defaultPrice = parseFloat(firstVariant?.price || '0');
            const numericProductId = extractShopifyProductId(product.id);
            const numericVariantId = extractShopifyProductId(firstVariant?.id || '');

            const updatedGroups = testGroups.map(group => ({
                ...group,
                products: {
                    ...group.products,
                    [numericProductId]: {
                        isMultiVariant: false,
                        originalPrice: defaultPrice,
                        modifiedPrice: defaultPrice,
                        discountPercentage: 0, // Initialize with 0% discount
                        fixedAmountOff: 0, // Initialize with 0 fixed amount off
                        variants: {
                            [numericVariantId]: {
                                variantId: firstVariant?.id || '',
                                title: firstVariant?.title || 'Default Title',
                                originalPrice: defaultPrice,
                                modifiedPrice: defaultPrice,
                                discountPercentage: 0, // Initialize with 0% discount
                                fixedAmountOff: 0 // Initialize with 0 fixed amount off
                            }
                        }
                    }
                }
            }));
            setTestGroups(updatedGroups);
        }
    };

    // New function to handle product removal from the product list view
    const handleRemoveProduct = (product) => {
        if (isTestStarted) return;

        // Remove product from selected products
        setSelectedProducts(selectedProducts.filter(p => p.productId !== product.productId));

        // Remove product prices from all test groups
        const updatedGroups = testGroups.map(group => {
            const productKey = extractShopifyProductId(product.productId);
            const { [productKey]: removed, ...remainingProducts } = group.products || {};
            return {
                ...group,
                products: remainingProducts
            };
        });
        setTestGroups(updatedGroups);
    };

    const handlePriceChange = (productId, groupId, newValue, variantId = null, inputType = 'price') => {
        if (isTestStarted) return;
        if (hasDiscountId) {
            handleModificationAttempt();
            return;
        }
        

        const numericProductId = extractShopifyProductId(productId);
        const product = selectedProducts.find(p => extractShopifyProductId(p.productId) === numericProductId);

        // Calculate newPrice, discountPercentage, and fixedAmountOff based on input type
        let newPrice, discountPercentage, fixedAmountOff;
        let originalPrice;

        // Get original price based on product type and variant
        if (product?.isMultiVariant && product?.samePrice) {
            originalPrice = product.originalPrice || 0;
        } else if (product?.isMultiVariant && variantId) {
            const variant = product.variants.find(v => v.variantId === variantId);
            originalPrice = variant?.price || 0;
        } else {
            originalPrice = product?.originalPrice || 0;
        }

        if (inputType === 'percentage') {
            // User entered discount percentage, calculate modified price and fixed amount off
            discountPercentage = parseFloat(newValue) || 0;

            // Validate percentage is between 0 and 99 (less than 100%)
            if (discountPercentage < 0 || discountPercentage >= 100) {
                setWarningMessage('Discount percentage must be between 0% and 100%');
                setShowPriceWarning(true);
                setTimeout(() => setShowPriceWarning(false), 3000);
                return;
            }

            newPrice = originalPrice * (1 - discountPercentage / 100);
            
            // Round to 2 decimal places to prevent floating point precision issues
            newPrice = Math.round(newPrice * 100) / 100;
            
            // Calculate fixed amount off from percentage input
            fixedAmountOff = originalPrice - newPrice;
        } else {
            // User entered fixed price, calculate discount percentage and fixed amount off
            newPrice = parseFloat(newValue) || 0;
            
            // Round to 2 decimal places to prevent floating point precision issues
            newPrice = Math.round(newPrice * 100) / 100;
            
            // Calculate fixed amount off directly from fixed price input
            fixedAmountOff = originalPrice - newPrice;
            
            discountPercentage = calculateDiscountPercentage(originalPrice, newPrice);
            
            // Round discount percentage to prevent precision issues
            discountPercentage = Math.round(discountPercentage * 100) / 100;
        }

        // Validate price (only for fixed price mode)
        if (inputType === 'price') {
            // Validate that new price is not negative
            if (newPrice < 0) {
                setWarningMessage('Modified price cannot be negative');
                setShowPriceWarning(true);
                setTimeout(() => setShowPriceWarning(false), 3000);
                return;
            }

            // Validate that new price is not greater than original price
            if (newPrice > originalPrice) {
                setWarningMessage(`Modified price cannot be greater than original price (${getCurrencySymbol(currency)}${originalPrice?.toFixed(2) || '0.00'})`);
                setShowPriceWarning(true);
                setTimeout(() => setShowPriceWarning(false), 3000);
                return;
            }
            
            // Validate that the resulting discount is not 100% or more
            if (discountPercentage > 100) {
                setWarningMessage('Price too low - would result in 100% discount. Please enter a higher price.');
                setShowPriceWarning(true);
                setTimeout(() => setShowPriceWarning(false), 3000);
                return;
            }
        }

        // Handle multi-variant products
        if (product?.isMultiVariant && product?.samePrice) {
            // Same price multi-variant: update all variants with the same price

            const updatedGroups = testGroups.map(group => {
                if (group.id === groupId) {
                    const products = group.products || {};
                    const productData = products[numericProductId] || {};
                    const variants = productData.variants || {};

                    // Update all variants with the same price and discount
                    const updatedVariants = {};
                    Object.keys(variants).forEach(variantKey => {
                        updatedVariants[variantKey] = {
                            ...variants[variantKey],
                            modifiedPrice: newPrice,
                            discountPercentage: discountPercentage,
                            fixedAmountOff: fixedAmountOff
                        };
                    });

                    return {
                        ...group,
                        products: {
                            ...products,
                            [numericProductId]: {
                                ...productData,
                                isMultiVariant: true,
                                samePrice: true,
                                modifiedPrice: newPrice, // Also store at product level for easy access
                                discountPercentage: discountPercentage, // Store discount at product level
                                fixedAmountOff: fixedAmountOff, // Store fixed amount off for Shopify discounts
                                variants: updatedVariants
                            }
                        }
                    };
                }
                return group;
            });
            setTestGroups(updatedGroups);
        } else if (product?.isMultiVariant && variantId) {
            // Different prices multi-variant: update specific variant

            const updatedGroups = testGroups.map(group => {
                if (group.id === groupId) {
                    const products = group.products || {};
                    const productData = products[numericProductId] || {};
                    const variants = productData.variants || {};
                    const numericVariantId = extractShopifyProductId(variantId);

                    return {
                        ...group,
                        products: {
                            ...products,
                            [numericProductId]: {
                                ...productData,
                                isMultiVariant: true,
                                samePrice: false,
                                variants: {
                                    ...variants,
                                    [numericVariantId]: {
                                        ...variants[numericVariantId],
                                        modifiedPrice: newPrice,
                                        discountPercentage: discountPercentage,
                                        fixedAmountOff: fixedAmountOff
                                    }
                                }
                            }
                        }
                    };
                }
                return group;
            });
            setTestGroups(updatedGroups);
        } else {
            // Handle single variant products (now using normalized variants structure)

            const updatedGroups = testGroups.map(group => {
                if (group.id === groupId) {
                    const products = group.products || {};
                    const productData = products[numericProductId] || {};
                    const productOriginalPrice = products[numericProductId]?.originalPrice ||
                        selectedProducts.find(p => extractShopifyProductId(p.productId) === numericProductId)?.originalPrice || 0;

                    // Get variant ID from either existing data or selected products
                    const variantId = selectedProducts.find(p => extractShopifyProductId(p.productId) === numericProductId)?.variantId || '';
                    const numericVariantId = extractShopifyProductId(variantId);

                    // Get existing variants or create new structure
                    const existingVariants = productData.variants || {};
                    const variantData = Object.values(existingVariants)[0] || {};

                    return {
                        ...group,
                        products: {
                            ...products,
                            [numericProductId]: {
                                ...productData,
                                isMultiVariant: false,
                                originalPrice: productOriginalPrice,
                                modifiedPrice: newPrice,
                                discountPercentage: discountPercentage, // Add discount percentage
                                fixedAmountOff: fixedAmountOff, // Add fixed amount off for Shopify discounts
                                variants: {
                                    [numericVariantId]: {
                                        variantId: variantId,
                                        title: variantData.title || 'Default Title',
                                        originalPrice: productOriginalPrice,
                                        modifiedPrice: newPrice,
                                        discountPercentage: discountPercentage, // Add discount percentage for variant
                                        fixedAmountOff: fixedAmountOff // Add fixed amount off for variant
                                    }
                                }
                            }
                        }
                    };
                }
                return group;
            });
            setTestGroups(updatedGroups);
        }

        // Price modification check is now handled at the main test file level
    };

    const handleDone = () => {
        setShowProductList(false);
    };

    // Handle bulk discount modal actions
    const handleApplyBulkDiscounts = (bulkDiscounts) => {
        // Apply bulk discounts to all selected products in all groups
        const updatedGroups = testGroups.map(group => {
            const groupDiscount = bulkDiscounts[group.id];
            if (groupDiscount === undefined) return group; // Skip control groups

            const products = group.products || {};
            const updatedProducts = {};

            selectedProducts.forEach(product => {
                const numericProductId = extractShopifyProductId(product.productId);
                const existingProductData = products[numericProductId];

                if (product.isMultiVariant && product.samePrice) {
                    // Same price multi-variant: apply discount to all variants
                    const originalPrice = product.originalPrice || 0;
                    const modifiedPrice = originalPrice * (1 - groupDiscount / 100);

                    const existingVariants = existingProductData?.variants || {};
                    const updatedVariants = {};

                    Object.keys(existingVariants).forEach(variantKey => {
                        updatedVariants[variantKey] = {
                            ...existingVariants[variantKey],
                            modifiedPrice: modifiedPrice,
                            discountPercentage: groupDiscount
                        };
                    });

                    updatedProducts[numericProductId] = {
                        ...existingProductData,
                        isMultiVariant: true,
                        samePrice: true,
                        modifiedPrice: modifiedPrice,
                        discountPercentage: groupDiscount,
                        variants: updatedVariants
                    };
                } else if (product.isMultiVariant && !product.samePrice) {
                    // Different prices multi-variant: apply discount to each selected variant
                    const existingVariants = existingProductData?.variants || {};
                    const updatedVariants = {};

                    Object.entries(existingVariants).forEach(([variantKey, variantData]) => {
                        const originalPrice = variantData.originalPrice || 0;
                        const modifiedPrice = originalPrice * (1 - groupDiscount / 100);

                        updatedVariants[variantKey] = {
                            ...variantData,
                            modifiedPrice: modifiedPrice,
                            discountPercentage: groupDiscount
                        };
                    });

                    updatedProducts[numericProductId] = {
                        ...existingProductData,
                        isMultiVariant: true,
                        samePrice: false,
                        variants: updatedVariants
                    };
                } else {
                    // Single variant product
                    const originalPrice = product.originalPrice || 0;
                    const modifiedPrice = originalPrice * (1 - groupDiscount / 100);

                    const existingVariants = existingProductData?.variants || {};
                    const updatedVariants = {};

                    Object.entries(existingVariants).forEach(([variantKey, variantData]) => {
                        updatedVariants[variantKey] = {
                            ...variantData,
                            modifiedPrice: modifiedPrice,
                            discountPercentage: groupDiscount
                        };
                    });

                    updatedProducts[numericProductId] = {
                        ...existingProductData,
                        isMultiVariant: false,
                        originalPrice: originalPrice,
                        modifiedPrice: modifiedPrice,
                        discountPercentage: groupDiscount,
                        variants: updatedVariants
                    };
                }
            });

            return {
                ...group,
                products: {
                    ...products,
                    ...updatedProducts
                }
            };
        });

        setTestGroups(updatedGroups);

        // Set pricing method to percentage and close modal
        setBasicInfo(prev => ({
            ...prev,
            pricingMethod: 'percentage'
        }));
        setShowBulkDiscountModal(false);
    };

    const handleCancelBulkDiscount = () => {
        setShowBulkDiscountModal(false);
        // Don't change the pricing method if cancelled
    };



    // Handle variant selection in the pricing interface
    const handleVariantSelectionInPricing = (product, variant) => {
        if (isTestStarted) return;

        const productId = product.productId;
        const isVariantSelected = product.variants?.some(v => v.variantId === variant.variantId) || false;

        if (isVariantSelected) {
            // Remove variant from selection
            const updatedVariants = product.variants.filter(v => v.variantId !== variant.variantId);
            const updatedProducts = selectedProducts.map(p =>
                p.productId === productId ? { ...p, variants: updatedVariants } : p
            );
            setSelectedProducts(updatedProducts);

            // Remove variant from test groups
            const numericProductId = extractShopifyProductId(productId);
            const numericVariantId = extractShopifyProductId(variant.variantId);

            const updatedGroups = testGroups.map(group => {
                const productData = group.products?.[numericProductId];
                if (productData?.variants) {
                    const updatedVariants = { ...productData.variants };
                    delete updatedVariants[numericVariantId];

                    return {
                        ...group,
                        products: {
                            ...group.products,
                            [numericProductId]: {
                                ...productData,
                                variants: updatedVariants
                            }
                        }
                    };
                }
                return group;
            });
            setTestGroups(updatedGroups);
        } else {
            // Add variant to selection
            const newVariant = {
                variantId: variant.variantId,
                title: variant.title,
                price: variant.price
            };

            const updatedVariants = [...(product.variants || []), newVariant];
            const updatedProducts = selectedProducts.map(p =>
                p.productId === productId ? { ...p, variants: updatedVariants } : p
            );
            setSelectedProducts(updatedProducts);

            // Add variant to test groups
            const numericProductId = extractShopifyProductId(productId);
            const numericVariantId = extractShopifyProductId(variant.variantId);

            const updatedGroups = testGroups.map(group => {
                const productData = group.products?.[numericProductId] || { isMultiVariant: true, variants: {} };

                return {
                    ...group,
                    products: {
                        ...group.products,
                        [numericProductId]: {
                            ...productData,
                            variants: {
                                ...productData.variants,
                                [numericVariantId]: {
                                    variantId: variant.variantId,
                                    title: variant.title,
                                    originalPrice: variant.price,
                                    modifiedPrice: variant.price,
                                    discountPercentage: 0, // Initialize with 0% discount
                                    fixedAmountOff: 0 // Initialize with 0 fixed amount off
                                }
                            }
                        }
                    }
                };
            });
            setTestGroups(updatedGroups);
        }
    };


    
    
    

    return (
        <BlockStack gap="400">
            {/* Warning Banners */}
            <WarningBanners
                productSelectionError={productSelectionError}
                setProductSelectionError={setProductSelectionError}
                showModificationWarning={showModificationWarning}
                setShowModificationWarning={setShowModificationWarning}
                showPriceWarning={showPriceWarning}
                setShowPriceWarning={setShowPriceWarning}
                warningMessage={warningMessage}
            />

            {/* Debug: Show current state */}
            {}

            {/* Variant Selection Modal */}
            <VariantSelectionModal
                showVariantSelection={showVariantSelection}
                currentMultiVariantProduct={currentMultiVariantProduct}
                selectedVariants={selectedVariants}
                currency={currency}
                onVariantToggle={handleVariantToggle}
                onConfirm={handleConfirmVariantSelection}
                onCancel={handleCancelVariantSelection}
                productSelectionError={productSelectionError}
                setProductSelectionError={setProductSelectionError}
            />

            {/* Bulk Discount Modal */}
            <BulkDiscountModal
                showBulkDiscountModal={showBulkDiscountModal}
                selectedProducts={selectedProducts}
                testGroups={testGroups}
                currency={currency}
                onApplyBulkDiscounts={handleApplyBulkDiscounts}
                onCancel={handleCancelBulkDiscount}
                showPriceWarning={showPriceWarning}
                setShowPriceWarning={setShowPriceWarning}
                warningMessage={warningMessage}
                setWarningMessage={setWarningMessage}
            />

            <LegacyCard>
                <LegacyCard.Section>
                    <BlockStack gap="400">
                        <BlockStack gap="200">
                            <Text variant="headingLg" as="h1">PRICE</Text>
                            <Text variant="bodyMd" as="p" color="subdued">
                                Make specific price changes for one or more products based on target audience.
                            </Text>
                        </BlockStack>
                        <BlockStack gap="400" align="center">
                        {showProductList ? (
                            <ProductsList
                                products={products}
                                selectedProducts={selectedProducts}
                                onProductSelect={handleProductSelect}
                                onDone={() => setShowProductList(false)}
                                isTestStarted={isTestStarted}
                                multiVariantProductIds={multiVariantProductIds}
                                compareAtPriceProductIds={compareAtPriceProductIds}
                                currency={currency}
                            />
                        ) : selectedProducts.length === 0 ? (
                            <EmptyProductsState
                                onAddProducts={() => setShowProductList(true)}
                                isTestStarted={isTestStarted}
                            />
                        ) : null}

                        {/* Selected Products Price Interface */}
                        {selectedProducts.length > 0 && !showProductList && (
                            <ProductPricingInterface
                                selectedProducts={selectedProducts}
                                testGroups={testGroups}
                                pricingMethod={pricingMethod}
                                currency={currency}
                                onPriceChange={handlePriceChange}
                                onVariantSelectionInPricing={handleVariantSelectionInPricing}
                                onRemoveProduct={handleRemoveProduct}
                                onShowProductList={() => setShowProductList(true)}
                                isTestStarted={isTestStarted}
                                extractShopifyProductId={extractShopifyProductId}
                                onProductPricingMethodChange={handleProductPricingMethodChange}
                            />
                        )}
                    </BlockStack>
                </BlockStack>
                </LegacyCard.Section>
            </LegacyCard>
        </BlockStack>
    );
};

export default ModificationsContentPrice; 