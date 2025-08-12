import { Text, BlockStack, Button, Box } from "@shopify/polaris";
import { useState, useEffect } from "react";

// Color theme
const colors = {
    primary: '#00A47C',
    primaryLight: '#E5F4F0', // Light background
    secondary: '#FFA500',
    accent: '#9C27B0',
    warning: '#FF5722',
    surface: '#F6F6F7',
    border: '#DDD'
};

// Custom styles for buttons
const buttonStyles = {
    selected: {
        backgroundColor: `${colors.primary} !important`,
        color: 'white !important',
        border: `2px solid ${colors.primary} !important`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    unselected: {
        backgroundColor: `${colors.surface} !important`,
        color: `${colors.primary} !important`,
        border: `2px solid ${colors.border} !important`,
        '&:hover': {
            backgroundColor: `${colors.surface} !important`,
            borderColor: `${colors.primary} !important`
        }
    }
};

// Add custom styles
const customStyles = {
    select: {
        '& [data-polaris-overlay]': {
            maxHeight: '300px !important',
            overflowY: 'auto !important'
        }
    }
};

// Add custom box styles
const boxStyles = {
    backgroundColor: `${colors.surface} !important`,
    border: `2px solid ${colors.border}`,
    borderRadius: '8px'
};

// Add heading styles
const StyledHeading = ({ children }) => (
    <div style={{
        backgroundColor: colors.primaryLight,
        padding: '12px 16px',
        borderRadius: '4px',
        marginBottom: '16px',
        width: '100%',
        borderLeft: `4px solid ${colors.primary}`
    }}>
        <Text variant="headingMd" as="h2" style={{ color: colors.primary }}>
            {children}
        </Text>
    </div>
);

export const TargetingContent = ({ targetingState, setTargetingState }) => {

    const deviceOptions = [
        { label: "All Devices", value: "all" },
        { label: "Desktop", value: "desktop" },
        { label: "Mobile", value: "mobile" }
    ];

    const visitorOptions = [
        { label: "All Visitors", value: "all" },
        { label: "New", value: "new" },
        { label: "Returning", value: "returning" }
    ];

    const trafficSourceOptions = [
        { label: "All Sources", value: "all" },
        { label: "Organic traffic", value: "organic_traffic" },
        { label: "Paid traffic", value: "paid_traffic" },
    ];

    return (
        <BlockStack gap="800">
            {/* Header */}
            <BlockStack gap="200">
                <Text variant="headingLg" as="h1">Audience</Text>
                <Text variant="bodyMd" as="p" color="subdued">
                    Show test only to certain visitors.
                </Text>
            </BlockStack>

            {/* Device Type */}
            <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                <BlockStack gap="400">
                    <StyledHeading>DEVICE TYPE</StyledHeading>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {deviceOptions.map(option => (
                            <Button
                                key={option.value}
                                onClick={() => setTargetingState(prev => ({ ...prev, deviceType: option.value }))}
                                variant={targetingState.deviceType === option.value ? "primary" : "secondary"}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </BlockStack>
            </Box>

            {/* Visitor Type */}
            <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                <BlockStack gap="400">
                    <StyledHeading>VISITOR TYPE</StyledHeading>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {visitorOptions.map(option => (
                            <Button
                                key={option.value}
                                onClick={() => setTargetingState(prev => ({ ...prev, visitorType: option.value }))}
                                variant={targetingState.visitorType === option.value ? "primary" : "secondary"}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </BlockStack>
            </Box>

            {/* Traffic Source */}
            <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                <BlockStack gap="400">
                    <StyledHeading>TRAFFIC SOURCE</StyledHeading>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                        {trafficSourceOptions.map(option => (
                            <Button
                                key={option.value}
                                onClick={() => setTargetingState(prev => ({ ...prev, trafficSource: option.value }))}
                                variant={targetingState.trafficSource === option.value ? "primary" : "secondary"}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </BlockStack>
            </Box>

            {/* Countries */}
            {/* <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                <BlockStack gap="400">
                    <StyledHeading>COUNTRIES</StyledHeading>
                    <div style={{ position: 'relative' }}>
                        <Combobox
                            activator={
                                <Combobox.TextField
                                    label=""
                                    value={inputValue}
                                    onChange={(value) => {
                                        setInputValue(value);
                                        setIsOpen(true);
                                    }}
                                    placeholder="Select a country"
                                    autoComplete="off"
                                />
                            }
                            open={isOpen}
                            onClose={() => setIsOpen(false)}
                        >
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <Listbox onSelect={handleCountrySelect}>
                                    {filteredCountryOptions.map((option) => (
                                        <Listbox.Option
                                            key={option.value}
                                            value={option.value}
                                            selected={targetingState.selectedCountry === option.value}
                                        >
                                            {option.label}
                                        </Listbox.Option>
                                    ))}
                                </Listbox>
                            </div>
                        </Combobox>
                    </div>
                </BlockStack>
            </Box> */}

            {/* Footer Note */}
            {/* <Text variant="bodyMd" as="p" color="subdued">
                Visitors that do not match these conditions will receive the treatment of Control Group.
            </Text> */}
        </BlockStack>
    );
};

export default TargetingContent; 