import { Button } from "@shopify/polaris";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    TextInColumnsIcon,
    ViewIcon,
    ChartLineIcon,
    TargetIcon,
    EditIcon,
    CategoriesIcon
} from '@shopify/polaris-icons';

// New horizontal navigation component
export const HorizontalNavigation = ({ currentTabId, onNavigationChange, testStatus }) => {
    const navigationItems = getNavigationItems(currentTabId);

    return (
        <div style={{
            borderBottom: '1px solid #e1e3e5',
            backgroundColor: '#f6f6f7',
            marginBottom: '2rem'
        }}>
            {/* Test Configuration Status */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #e1e3e5'
            }}>
                <div style={{ 
                    padding: '0.5rem 1rem', 

                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#6d7175',

                }}>
                    TEST CONFIGURATION ({testStatus.charAt(0).toUpperCase() + testStatus.slice(1)})
                </div>
            </div>

            {/* Navigation Buttons */}
            <div style={{
                display: 'flex',
                justifyContent: 'stretch',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                width: '100%'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    width: '100%'
                }}>
                    {navigationItems.map((item) => (
                        <Button
                            key={item.id}
                            icon={item.icon}
                            onClick={() => onNavigationChange(item.id)}
                            variant={item.selected ? 'primary' : 'tertiary'}
                            size="medium"
                            style={{
                                flex: '1',
                                minWidth: '0',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontWeight: item.selected ? '600' : '400',
                                border: item.selected ? '2px solid #5c6ac4' : '1px solid #c9cccf',
                                borderRadius: '8px',
                                padding: '0.75rem 1rem'
                            }}
                        >
                            {item.label}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const PrevNextNavigationButtons = ({
    currentTabId,
    tabOrder,
    onNavigationChange,
    hasModifications
}) => {

    const currentIndex = tabOrder.indexOf(currentTabId);
    const prevTab = currentIndex > 0 ? tabOrder[currentIndex - 1] : null;
    const nextTab = currentIndex < tabOrder.length - 1 ? tabOrder[currentIndex + 1] : null;

    const isNextDisabled = currentTabId === 'modifications' && !hasModifications;

    return (
        <div style={{
            display: 'flex',
            justifyContent: prevTab && nextTab ? 'space-between' : nextTab ? 'flex-end' : 'flex-start',
            marginTop: '1.5rem'
        }}>
            {prevTab && (
                <Button
                    icon={ArrowLeftIcon}
                    onClick={() => onNavigationChange(prevTab)}
                >
                    Previous
                </Button>
            )}
            {/* Spacer for both buttons */}
            {prevTab && nextTab && <div />}
            {nextTab && (
                <Button
                    icon={ArrowRightIcon}
                    onClick={() => onNavigationChange(nextTab)}
                    disabled={isNextDisabled}
                    primary={currentTabId === 'modifications'}
                >
                    Next
                </Button>
            )}
        </div>
    );
};

export const getNavigationItems = (currentTabId) => {
    return [
        {
            id: 'testGroups',
            label: 'Group Allocation',
            icon: CategoriesIcon,
            selected: currentTabId === 'testGroups',
        },
        {
            id: 'modifications',
            label: 'Modifications',
            icon: EditIcon,
            selected: currentTabId === 'modifications',
        },
        {
            id: 'targeting',
            label: 'Targeting',
            icon: TargetIcon,
            selected: currentTabId === 'targeting',
        },
        {
            id: 'preview',
            label: 'Preview',
            icon: ViewIcon,
            selected: currentTabId === 'preview',
        },
        {
            id: 'configuration',
            label: 'Configuration',
            icon: ChartLineIcon,
            selected: currentTabId === 'configuration',
        },
        {
            id: 'results',
            label: 'Analytics',
            icon: TextInColumnsIcon,
            selected: currentTabId === 'results',
        },
    ];
}; 