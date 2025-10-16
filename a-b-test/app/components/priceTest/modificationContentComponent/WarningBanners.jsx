import { Text, InlineStack, Icon } from "@shopify/polaris";
import { AlertTriangleIcon, XIcon } from '@shopify/polaris-icons';

// Simplified styles for warning banners
const bannerStyles = {
    container: {
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        maxWidth: '600px',
        width: 'calc(100% - 40px)',
        margin: '0 20px'
    },
    content: {
        padding: '12px 16px',
        borderRadius: '8px',
        borderLeft: '4px solid',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    dismissButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s ease',
        minWidth: '24px',
        minHeight: '24px'
    },
    spacer: {
        height: '60px',
        width: '100%'
    }
};

const WarningBanner = ({ title, message, onDismiss, type = 'warning' }) => {
    const getIconAndColors = (type) => {
        switch (type) {
            case 'error':
                return {
                    icon: AlertTriangleIcon,
                    borderColor: '#DC2626',
                    bgColor: '#FEF2F2',
                    textColor: '#7F1D1D',
                    titleColor: '#991B1B'
                };
            case 'warning':
            default:
                return {
                    icon: AlertTriangleIcon,
                    borderColor: '#F59E0B',
                    bgColor: '#FFF4E6',
                    textColor: '#8B5A00',
                    titleColor: '#D97706'
                };
        }
    };

    const { icon, borderColor, bgColor, textColor, titleColor } = getIconAndColors(type);

    return (
        <>
            <div style={bannerStyles.container}>
                <div style={{
                    ...bannerStyles.content,
                    background: bgColor,
                    borderLeftColor: borderColor
                }}>
                    <InlineStack gap="300" align="space-between">
                        <InlineStack gap="200" align="start">
                            <div style={{ marginTop: '1px', flexShrink: 0 }}>
                                <Icon source={icon} tone="base" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                {title && (
                                    <Text variant="bodySm" as="h3" fontWeight="semibold" color={titleColor}>
                                        {title}
                                    </Text>
                                )}
                                <Text variant="bodySm" as="p" color={textColor}>
                                    {message}
                                </Text>
                            </div>
                        </InlineStack>
                        <div style={{ flexShrink: 0 }}>
                            <button
                                onClick={onDismiss}
                                style={{
                                    ...bannerStyles.dismissButton,
                                    color: textColor
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = `${borderColor}15`;
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                }}
                            >
                                <Icon source={XIcon} tone="base" />
                            </button>
                        </div>
                    </InlineStack>
                </div>
            </div>
            {/* <div style={bannerStyles.spacer} /> */}
        </>
    );
};

export const WarningBanners = ({
    productSelectionError,
    setProductSelectionError,
    showModificationWarning,
    setShowModificationWarning,
    showPriceWarning,
    setShowPriceWarning,
    warningMessage
}) => {
    return (
        <>
            {/* Product Selection Error Banner */}
            {productSelectionError && (
                <WarningBanner
                    title="Product Selection Issue"
                    message={productSelectionError}
                    onDismiss={() => setProductSelectionError('')}
                    type="warning"
                />
            )}

            {/* Modification Warning Banner */}
            {showModificationWarning && (
                <WarningBanner
                    title="Modifications Disabled"
                    message="This test has already been created and cannot be modified. Please create a new test to make changes."
                    onDismiss={() => setShowModificationWarning(false)}
                    type="warning"
                />
            )}

            {/* Price Warning Banner */}
            {showPriceWarning && (
                <WarningBanner
                    title="Invalid Price"
                    message={warningMessage}
                    onDismiss={() => setShowPriceWarning(false)}
                    type="error"
                />
            )}
        </>
    );
};

export default WarningBanners; 