import { useState, useEffect } from "react";
import { BlockStack } from "@shopify/polaris";
import { DiscountTypeSelector } from "./modificationContentComponent/DiscountTypeSelector";
import { ThresholdInput } from "./modificationContentComponent/ThresholdInput";
import { GroupDiscountConfig } from "./modificationContentComponent/GroupDiscountConfig";

export function ModificationsContentDiscount({
    testGroups,
    onTestGroupsChange,
    currency = "USD",
    discountConfig,
    setDiscountConfig
}) {
    // Use props instead of local state
    const discountType = discountConfig?.type || "value";
    const threshold = discountConfig?.threshold || "";

    // Initialize groups with 0% discount if they don't have a value set
    useEffect(() => {
        if (testGroups && testGroups.length > 0) {
            const initializedGroups = testGroups.map(group => {
                // Check if it's a control group (case-insensitive)
                const isControlGroup = group.name.toLowerCase().includes('control');

                return {
                    ...group,
                    // Set control group to 0% and make it non-editable
                    discountPercentageValue: isControlGroup ? "0" : (group.discountPercentageValue || "0")
                };
            });

            // Only update if there are changes
            const hasChanges = JSON.stringify(initializedGroups) !== JSON.stringify(testGroups);
            if (hasChanges) {
                onTestGroupsChange(initializedGroups);
            }
        }
    }, [testGroups, onTestGroupsChange]);

    // Debug: Log props on component mount and when they change
    useEffect(() => {
        console.log('💰 ModificationsContentDiscount props:', {
            discountConfig,
            hasSetDiscountConfig: !!setDiscountConfig,
            testGroupsCount: testGroups?.length || 0,
            groups: testGroups?.map(g => ({
                name: g.name,
                isControl: g.name.toLowerCase().includes('control'),
                discount: g.discountPercentageValue
            }))
        });
    }, [discountConfig, setDiscountConfig, testGroups]);

    // Update discount type
    const setDiscountType = (type) => {
        console.log('🔧 Setting discount type:', type);
        setDiscountConfig(prev => ({
            ...prev,
            type: type
        }));
    };

    // Validate and update threshold
    const handleThresholdChange = (value) => {
        console.log('🔧 Setting threshold value:', value);
        const numValue = parseFloat(value);
        if (value === "") {
            setDiscountConfig(prev => ({
                ...prev,
                threshold: "",
            }));
        } else if (isNaN(numValue) || numValue <= 0) {
            setDiscountConfig(prev => ({
                ...prev,
                threshold: value
            }));
        } else {
            setDiscountConfig(prev => ({
                ...prev,
                threshold: value
            }));
        }
    };

    // Update group discount
    const handleDiscountChange = (groupId, value) => {
        const numValue = parseFloat(value);
        const updatedGroups = testGroups.map(group => {
            if (group.id === groupId) {
                // Check if it's a control group
                if (group.name.toLowerCase().includes('control')) {
                    return group; // Return unchanged control group
                }

                return {
                    ...group,
                    discountPercentageValue: value,
                    discountError: (value === "" || isNaN(numValue) || numValue < 0 || numValue > 100)
                        ? "Please enter a valid discount percentage (0-100)"
                        : ""
                };
            }
            return group;
        });
        onTestGroupsChange(updatedGroups);
    };

    return (
        <BlockStack gap="500">
            <DiscountTypeSelector
                discountType={discountType}
                setDiscountType={setDiscountType}
            />

            <ThresholdInput
                discountType={discountType}
                threshold={threshold}
                onThresholdChange={handleThresholdChange}
                currency={currency}
            />

            <GroupDiscountConfig
                testGroups={testGroups}
                onDiscountChange={handleDiscountChange}
                discountType={discountType}
                threshold={threshold}
            />
        </BlockStack>
    );
}
