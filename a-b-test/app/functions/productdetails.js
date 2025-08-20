import { sanitizeShopDomain } from "../utils/sanitizeShopDomain";
import extractShopifyProductId from "../utils/extractProductId";
import { createNewSession, closeOpenSessions } from "./timer";

const FIREBASE_DB_URL = "https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app";

// Function to check if any modifications have been made
export const checkIfModificationsMade = (isTestStarted, selectedProducts, testGroups) => {
    if (isTestStarted || !selectedProducts.length || !testGroups.length) return false;

    const nonControlGroups = testGroups.filter(group => !group.name.toLowerCase().includes('control'));
    if (nonControlGroups.length === 0) return false;

    return nonControlGroups.every(group => {
        return selectedProducts.every(product => {
            const productId = extractShopifyProductId(product.productId);
            const groupProductData = group.products?.[productId];

            if (!groupProductData) return false;

            return groupProductData.modifiedTitle !== product.title ||
                groupProductData.modifiedDescription !== product.description ||
                groupProductData.modifiedImage !== product.imageUrl;
        });
    });
};

// Function to handle product selection
export const handleProductSelect = (product, selectedProducts, setSelectedProducts, testGroups, setTestGroups) => {
    if (selectedProducts.find(p => p.productId === product.id)) {
        // Remove product
        setSelectedProducts(selectedProducts.filter(p => p.productId !== product.id));

        // Remove product data from all test groups
        const updatedGroups = testGroups.map(group => ({
            ...group,
            products: {
                ...group.products,
                [extractShopifyProductId(product.id)]: undefined
            }
        }));
        setTestGroups(updatedGroups);
    } else {
        // Get the first variant ID
        const variantId = product.variants.edges[0]?.node.id || '';

        // Format product according to schema
        const formattedProduct = {
            productId: product.id,
            variantId: variantId,
            title: product.title,
            handle: product.handle,
            imageUrls: product.images.edges.map(edge => edge.node.url) || [],
            description: product.description || '',
            inventory_quantity: product.variants.edges[0]?.node.inventoryQuantity || 0
        };

        // Add formatted product
        setSelectedProducts([...selectedProducts, formattedProduct]);

        // Initialize product data in all test groups
        const numericProductId = extractShopifyProductId(product.id);
        const originalTitle = product.title;
        const originalDescription = product.description || '';
        const originalImages = product.images.edges.map(edge => edge.node.url) || [];
        const originalInventory = product.variants.edges[0]?.node.inventoryQuantity || 0;

        const updatedGroups = testGroups.map(group => {
            const isControlGroup = group.name.toLowerCase().includes('control');
            const existingProductData = group.products?.[numericProductId] || {};

            return {
                ...group,
                products: {
                    ...group.products,
                    [numericProductId]: {
                        ...existingProductData,
                        variantId: variantId,
                        originalTitle,
                        originalDescription,
                        originalImages,
                        originalInventory,
                        modifiedTitle: isControlGroup ? originalTitle : (existingProductData.modifiedTitle || originalTitle),
                        modifiedDescription: isControlGroup ? originalDescription : (existingProductData.modifiedDescription || originalDescription),
                        modifiedImages: isControlGroup ? originalImages : (existingProductData.modifiedImages || originalImages),
                        modifiedInventory: isControlGroup ? originalInventory : (existingProductData.modifiedInventory !== undefined ? existingProductData.modifiedInventory : 0)
                    }
                }
            };
        });
        setTestGroups(updatedGroups);
    }
};

// Function to handle product removal
export const handleRemoveProduct = (product, selectedProducts, setSelectedProducts, testGroups, setTestGroups) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== product.productId));

    const updatedGroups = testGroups.map(group => ({
        ...group,
        products: {
            ...group.products,
            [extractShopifyProductId(product.productId)]: undefined
        }
    }));
    setTestGroups(updatedGroups);
};

// Function to handle modification changes
export const handleModificationChange = (productId, groupId, field, value, testGroups, setTestGroups) => {
    const numericProductId = extractShopifyProductId(productId);

    const updatedGroups = testGroups.map(group => {
        if (group.id === groupId) {
            const products = group.products || {};
            const productData = products[numericProductId] || {};

            // Find the original product data from control group
            const controlGroup = testGroups.find(g => g.name.toLowerCase().includes('control'));
            const originalData = controlGroup?.products?.[numericProductId] || {};

            // Special handling for image modifications
            if (field === 'modifiedImages') {
                // Ensure we're not modifying the control group
                if (group.name.toLowerCase().includes('control')) {
                    return group;
                }

                return {
                    ...group,
                    products: {
                        ...products,
                        [numericProductId]: {
                            ...productData,
                            variantId: originalData.variantId || productData.variantId,
                            originalTitle: originalData.originalTitle || productData.originalTitle,
                            originalDescription: originalData.originalDescription || productData.originalDescription || '',
                            originalImages: originalData.originalImages || [],
                            modifiedTitle: productData.modifiedTitle || originalData.originalTitle,
                            modifiedDescription: productData.modifiedDescription || originalData.originalDescription || '',
                            modifiedImages: value
                        }
                    }
                };
            }

            // Handle other modifications
            return {
                ...group,
                products: {
                    ...products,
                    [numericProductId]: {
                        ...productData,
                        variantId: originalData.variantId || productData.variantId,
                        originalTitle: originalData.originalTitle || productData.originalTitle,
                        originalDescription: originalData.originalDescription || productData.originalDescription || '',
                        originalImages: originalData.originalImages || [],
                        modifiedTitle: field === 'modifiedTitle' ? value : (productData.modifiedTitle || originalData.originalTitle),
                        modifiedDescription: field === 'modifiedDescription' ? value : (productData.modifiedDescription || originalData.originalDescription || ''),
                        modifiedImages: productData.modifiedImages || originalData.originalImages || [],
                        [field]: value
                    }
                }
            };
        }
        return group;
    });
    setTestGroups(updatedGroups);
};

// Function to handle multiple image uploads
export const handleMultipleImageUpload = async (
    productId,
    groupId,
    files,
    testGroups,
    setTestGroups,
    setUploadingImages,
    setErrorMessage,
    setShowModificationWarning
) => {
    if (!files || files.length === 0) return;

    // Clear any previous error
    setErrorMessage('');
    setShowModificationWarning(false);

    // Set loading state
    setUploadingImages(prev => ({
        ...prev,
        [`${productId}-${groupId}`]: true
    }));

    const uploadedUrls = [];
    const errors = [];

    try {
        // Process each file
        for (const file of files) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                errors.push(`Invalid file type for ${file.name}. Allowed types: ${allowedTypes.join(', ')}`);
                continue;
            }

            // Validate file size (max 20MB)
            const maxSize = 20 * 1024 * 1024;
            if (file.size > maxSize) {
                errors.push(`File size too large for ${file.name}. Maximum size is 20MB`);
                continue;
            }

            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload-image', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to upload image');
                }

                const data = await response.json();
                if (!data.url) {
                    throw new Error('No image URL received from server');
                }

                uploadedUrls.push(data.url);
            } catch (error) {
                errors.push(`Error uploading ${file.name}: ${error.message}`);
            }
        }

        if (uploadedUrls.length > 0) {
            // Update the test group with the new image URLs
            const numericProductId = extractShopifyProductId(productId);
            const updatedGroups = testGroups.map(group => {
                if (group.id === groupId) {
                    const existingProductData = group.products?.[numericProductId] || {};
                    const existingModifiedImages = existingProductData.modifiedImages || [];

                    return {
                        ...group,
                        products: {
                            ...group.products,
                            [numericProductId]: {
                                ...existingProductData,
                                modifiedImages: [...existingModifiedImages, ...uploadedUrls],
                                modifiedImage: uploadedUrls[0] || existingProductData.modifiedImage // Keep first image as primary for backward compatibility
                            }
                        }
                    };
                }
                return group;
            });
            setTestGroups(updatedGroups);
        }

        if (errors.length > 0) {
            setErrorMessage(errors.join('\n'));
            setShowModificationWarning(true);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error uploading images:', error);
        setErrorMessage(error.message || 'Failed to upload images');
        setShowModificationWarning(true);
        return false;
    } finally {
        setUploadingImages(prev => ({
            ...prev,
            [`${productId}-${groupId}`]: false
        }));
    }
};

// Function to deactivate all active product details tests except the current one
const deactivateAllActiveProductDetailsTests = async (sanitizedDomain, shop, currentTestId = null) => {
    try {
        // Fetch all tests
        const response = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}.json`);
        const allTests = await response.json();

        if (!response.ok || !allTests) {
            throw new Error('Failed to fetch tests');
        }

        // Find all active product details tests except the current one
        const activeProductDetailsTests = Object.entries(allTests).filter(([testId, test]) =>
            test.basicInfo?.status === 'active' &&
            test.basicInfo?.type === 'productDetails' &&
            testId !== currentTestId
        );

        // Deactivate each active product details test
        for (const [testId, test] of activeProductDetailsTests) {
            // Call the deactivate API
            const deactivateResponse = await fetch(`/api/product-details-activate-deactivate?testId=${testId}&shop=${shop}&action=deactivate`, {
                method: 'POST'
            });

            if (!deactivateResponse.ok) {
                throw new Error(`Failed to deactivate product details test ${testId}`);
            }

            // Handle session tracking - close any open sessions
            const currentTime = new Date().toISOString();
            let updatedSessions = test.sessions || [];

            // Close any open sessions
            updatedSessions = closeOpenSessions(updatedSessions, currentTime);

            // Update test status and sessions in Firebase
            const updatedTestData = {
                ...test,
                basicInfo: {
                    ...test.basicInfo,
                    status: 'deactive',
                    lastStatusChange: currentTime
                },
                sessions: updatedSessions
            };

            await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTestData)
            });
        }

        return true;
    } catch (error) {
        console.error('Error deactivating product details tests:', error);
        throw error;
    }
};

export const handleProductDetailActivateDeactivate = async (testIds, activeRowIndex, shop, rows, setRows, setIsActionModalOpen, setIsDeleting) => {
    if (activeRowIndex !== null && testIds[activeRowIndex]) {
        try {
            setIsDeleting(true);
            const testId = testIds[activeRowIndex];
            const sanitizedDomain = sanitizeShopDomain(shop);
            const currentTime = new Date().toISOString();

            // Get test data
            const testResponse = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`);
            const testData = await testResponse.json();

            if (!testResponse.ok) {
                throw new Error('Failed to fetch test data');
            }

            const currentStatus = testData?.basicInfo?.status;
            const action = currentStatus === 'active' ? 'deactivate' : 'activate';

            // Handle session tracking
            let updatedSessions = testData?.sessions || [];

            if (action === 'activate') {
                // Deactivate all other active product details tests first
                await deactivateAllActiveProductDetailsTests(sanitizedDomain, shop, testId);

                // Start new session
                const newSession = createNewSession('reactivation');
                updatedSessions.push(newSession);
            } else {
                // End current active session
                updatedSessions = closeOpenSessions(updatedSessions, currentTime);
            }

            // Call the product details activate/deactivate API
            const response = await fetch(`/api/product-details-activate-deactivate?testId=${testId}&shop=${shop}&action=${action}`, {
                method: 'POST'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Failed to ${action} product details test`);
            }

            // Update the test status and sessions in Firebase
            const newStatus = action === 'activate' ? 'active' : 'deactive';
            const updatedTestData = {
                ...testData,
                basicInfo: {
                    ...testData.basicInfo,
                    status: newStatus,
                    lastStatusChange: currentTime
                },
                sessions: updatedSessions
            };

            const updateResponse = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTestData)
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update test data');
            }

            // Update the local state
            const newRows = rows.map((row, index) => {
                if (index === activeRowIndex) {
                    const updatedRow = [...row.slice(0, 3), newStatus, ...row.slice(4)];
                    updatedRow.sessions = updatedSessions;
                    return updatedRow;
                }
                return row;
            });
            setRows(newRows);

            // Show success message (you might want to use a toast system here)
            console.log(`Product details test ${action}d successfully`);
            setIsActionModalOpen(false);
        } catch (error) {
            console.error('Error in handleProductDetailActivateDeactivate:', error);
            const errorMessage = error.message || 'An unexpected error occurred';
            // Show error message (you might want to use a toast system here)
            console.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    }
};

// Function to validate inventory distribution
export const validateInventoryDistribution = (testGroups, selectedProducts) => {
    const inventoryIssues = [];

    selectedProducts.forEach(product => {
        const numericProductId = extractShopifyProductId(product.productId);
        const controlGroup = testGroups.find(g => g.name.toLowerCase().includes('control'));
        const originalInventory = controlGroup?.products?.[numericProductId]?.originalInventory || 0;

        let totalInventory = 0;
        const groupInventories = [];

        testGroups.forEach(group => {
            const groupInventory = group.products?.[numericProductId]?.modifiedInventory;
            if (groupInventory !== undefined) {
                totalInventory += parseInt(groupInventory);
                groupInventories.push({
                    groupName: group.name,
                    inventory: parseInt(groupInventory)
                });
            }
        });

        if (totalInventory !== originalInventory) {
            inventoryIssues.push({
                productTitle: product.title,
                originalInventory,
                currentTotal: totalInventory,
                difference: originalInventory - totalInventory,
                groupDistribution: groupInventories
            });
        }
    });

    return {
        hasIssues: inventoryIssues.length > 0,
        issues: inventoryIssues
    };
};