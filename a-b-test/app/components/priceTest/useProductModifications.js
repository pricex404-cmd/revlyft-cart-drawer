import { useState, useEffect } from "react";
import extractShopifyProductId from "../../utils/extractProductId";

export const useProductModifications = ({
    testGroups,
    setTestGroups,
    selectedProducts,
    setSelectedProducts,
    isTestStarted,
    AllProductIdsInTests,
    multiVariantProductIds,
    compareAtPriceProductIds
}) => {
    const [showProductList, setShowProductList] = useState(false);
    const [showModificationWarning, setShowModificationWarning] = useState(false);
    const [showPriceWarning, setShowPriceWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [productSelectionError, setProductSelectionError] = useState('');
    const [showVariantSelection, setShowVariantSelection] = useState(false);
    const [currentMultiVariantProduct, setCurrentMultiVariantProduct] = useState(null);
    const [selectedVariants, setSelectedVariants] = useState([]);

    // Check if test has a discountId
    const hasDiscountId = isTestStarted;

    // Function to handle modification attempts when discountId exists
    const handleModificationAttempt = () => {
        if (hasDiscountId) {
            setShowModificationWarning(true);
            setTimeout(() => setShowModificationWarning(false), 3000);
        }
    };

    // Helper function to calculate discount percentage
    const calculateDiscountPercentage = (originalPrice, modifiedPrice) => {
        if (!originalPrice || originalPrice === 0) return 0;
        const percentage = ((originalPrice - modifiedPrice) / originalPrice) * 100;
        return Math.round(percentage * 100) / 100; // Actually round to 2 decimal places
    };

    // Handle variant selection toggle
    const handleVariantToggle = (variantId) => {
        if (selectedVariants.includes(variantId)) {
            setSelectedVariants(selectedVariants.filter(id => id !== variantId));
        } else {
            setSelectedVariants([...selectedVariants, variantId]);
        }
    };

    // Handle confirming variant selection for multi-variant products
    const handleConfirmVariantSelection = () => {
        if (selectedVariants.length === 0) {
            setProductSelectionError('Please select at least one variant');
            setTimeout(() => setProductSelectionError(''), 3000);
            return;
        }

        const product = currentMultiVariantProduct;
        const variants = product.variants.edges.map(edge => edge.node);

        // Filter to only selected variants
        const filteredVariants = variants.filter(variant =>
            selectedVariants.includes(variant.id)
        );

        // Format product with only selected variants
        const formattedProduct = {
            productId: product.id,
            title: product.title,
            handle: product.handle,
            imageUrl: product.images.edges[0]?.node.url || '',
            isMultiVariant: true,
            variants: filteredVariants.map(variant => ({
                variantId: variant.id,
                title: variant.title,
                price: parseFloat(variant.price || '0')
            }))
        };

        // Add formatted product
        setSelectedProducts([...selectedProducts, formattedProduct]);

        // Initialize selected variant prices in all test groups
        const numericProductId = extractShopifyProductId(product.id);

        const updatedGroups = testGroups.map(group => ({
            ...group,
            products: {
                ...group.products,
                [numericProductId]: {
                    isMultiVariant: true,
                    variants: filteredVariants.reduce((acc, variant) => {
                        const variantKey = extractShopifyProductId(variant.id);
                        acc[variantKey] = {
                            variantId: variant.id,
                            title: variant.title,
                            originalPrice: parseFloat(variant.price || '0'),
                            modifiedPrice: parseFloat(variant.price || '0'),
                            discountPercentage: 0 // Initialize with 0% discount
                        };
                        return acc;
                    }, {})
                }
            }
        }));
        setTestGroups(updatedGroups);

        // Close modal
        setShowVariantSelection(false);
        setCurrentMultiVariantProduct(null);
        setSelectedVariants([]);
    };

    const handleCancelVariantSelection = () => {
        setShowVariantSelection(false);
        setCurrentMultiVariantProduct(null);
        setSelectedVariants([]);
    };

    return {
        // State
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

        // Functions
        hasDiscountId,
        handleModificationAttempt,
        calculateDiscountPercentage,
        handleVariantToggle,
        handleConfirmVariantSelection,
        handleCancelVariantSelection
    };
};

export default useProductModifications; 