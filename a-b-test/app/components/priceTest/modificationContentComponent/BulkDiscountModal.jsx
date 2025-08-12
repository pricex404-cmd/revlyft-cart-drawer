import { useState } from "react";
import { BlockStack, Text, Box, InlineStack, Button, TextField } from "@shopify/polaris";
import { formatMoney } from "../../../utils/formatMoney";
import WarningBanners from './WarningBanners';
import extractShopifyProductId from "../../../utils/extractProductId";

// Color theme
const colors = {
    primary: '#6B7280',
    primaryLight: '#F3F4F6',
    border: '#D1D5DB',
    surface: '#F9FAFB'
};

export const BulkDiscountModal = ({
    showBulkDiscountModal,
    selectedProducts,
    testGroups,
    currency,
    onApplyBulkDiscounts,
    onCancel,
    showPriceWarning,
    setShowPriceWarning,
    warningMessage,
    setWarningMessage
}) => {
    // State for bulk discount values for each group
    const [bulkDiscounts, setBulkDiscounts] = useState(() => {
        const initialDiscounts = {};
        testGroups.forEach(group => {
            if (!group.name.toLowerCase().includes('control')) {
                initialDiscounts[group.id] = '';
            }
        });
        return initialDiscounts;
    });

    const handleDiscountChange = (groupId, value) => {
        // Allow empty string for clearing the field
        if (value === '') {
            setBulkDiscounts(prev => ({
                ...prev,
                [groupId]: ''
            }));
            return;
        }

        // Only allow numbers and decimal point
        if (!/^\d*\.?\d*$/.test(value)) {
            setWarningMessage('Please enter only numbers and decimal points for discount percentage.');
            setShowPriceWarning(true);
            setTimeout(() => setShowPriceWarning(false), 3000);
            return; // Don't update if invalid characters
        }

        // Convert to number for validation
        const numericValue = parseFloat(value);

        // Don't allow values greater than 100
        if (numericValue > 100) {
            setWarningMessage('Discount percentage cannot be greater than 100%.');
            setShowPriceWarning(true);
            setTimeout(() => setShowPriceWarning(false), 3000);
            return; // Don't update if over 100%
        }

        // Don't allow negative values (this is handled by the regex above, but being explicit)
        if (numericValue < 1) {
            setWarningMessage('Discount percentage cannot be less than 1%.');
            setShowPriceWarning(true);
            setTimeout(() => setShowPriceWarning(false), 3000);
            return;
        }

        // Clear any existing warnings when valid input is entered
        if (showPriceWarning) {
            setShowPriceWarning(false);
        }

        // Update the state with valid value
        setBulkDiscounts(prev => ({
            ...prev,
            [groupId]: value
        }));
    };

    const handleApply = () => {
        // Check if all groups have discount values entered
        const validDiscounts = {};
        let hasEmptyFields = false;

        Object.entries(bulkDiscounts).forEach(([groupId, discount]) => {
            if (discount === '' || discount === undefined) {
                hasEmptyFields = true;
                return;
            }
            // Since we validate input, we know these are valid numbers
            validDiscounts[groupId] = parseFloat(discount);
        });

        if (hasEmptyFields) {
            setWarningMessage('Please enter discount percentages for all test groups.');
            setShowPriceWarning(true);
            setTimeout(() => setShowPriceWarning(false), 4000);
            return;
        }

        onApplyBulkDiscounts(validDiscounts);
    };

    const calculatePreviewPrice = (originalPrice, discountPercentage) => {
        return originalPrice * (1 - discountPercentage / 100);
    };

    if (!showBulkDiscountModal) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 20000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                padding: '0'
            }}>
                <Box padding="600">
                    <BlockStack gap="500">
                        {/* Warning Banners - only show when there's a warning */}
                        {showPriceWarning && (
                            <WarningBanners
                                productSelectionError=""
                                setProductSelectionError={() => { }}
                                showModificationWarning={false}
                                setShowModificationWarning={() => { }}
                                showPriceWarning={showPriceWarning}
                                setShowPriceWarning={setShowPriceWarning}
                                warningMessage={warningMessage}
                            />
                        )}

                        <BlockStack gap="200">
                            <Text variant="headingLg" as="h2">
                                Set Bulk Discount Percentages
                            </Text>
                            <Text variant="bodyMd" as="p" color="subdued">
                                Set discount percentages that will be applied to all selected products for each test group.
                            </Text>
                        </BlockStack>

                        {/* Bulk discount inputs for each non-control group */}
                        <BlockStack gap="400">
                            {testGroups.map(group => {
                                const isControlGroup = group.name.toLowerCase().includes('control');
                                if (isControlGroup) return null;

                                return (
                                    <Box key={group.id} padding="400" background="bg-surface-secondary" borderRadius="200">
                                        <InlineStack gap="400" align="center">
                                            <div style={{ minWidth: '150px' }}>
                                                <Text variant="headingMd" as="h3">
                                                    {group.name}
                                                </Text>
                                            </div>
                                            <div style={{ width: '200px' }}>
                                                <TextField
                                                    type="number"
                                                    value={bulkDiscounts[group.id] || ''}
                                                    onChange={(value) => handleDiscountChange(group.id, value)}
                                                    placeholder="Enter discount"
                                                    min={0}
                                                    max={100}
                                                    step={0.1}
                                                    suffix="%"
                                                    autoComplete="off"
                                                />
                                            </div>
                                            <Text variant="bodyMd" as="p" color="subdued">
                                                Applied to all selected products
                                            </Text>
                                        </InlineStack>
                                    </Box>
                                );
                            })}
                        </BlockStack>



                        {/* Action buttons */}
                        <InlineStack align="end" gap="300">
                            <Button onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleApply}
                                disabled={Object.values(bulkDiscounts).every(d => d === '')}
                            >
                                Apply Bulk Discounts
                            </Button>
                        </InlineStack>
                    </BlockStack>
                </Box>
            </div>
        </div>
    );
};

export default BulkDiscountModal; 