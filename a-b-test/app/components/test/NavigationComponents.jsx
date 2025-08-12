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

export const NavigationButtons = ({
    currentTabId,
    tabOrder,
    onNavigationChange,
    hasModifications
}) => {
    if (currentTabId === 'preview') return null;

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
            label: 'Test Groups',
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
            label: 'Results',
            icon: TextInColumnsIcon,
            selected: currentTabId === 'results',
        },
    ];
}; 