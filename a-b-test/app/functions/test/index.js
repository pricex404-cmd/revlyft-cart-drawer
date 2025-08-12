// Export all test functions from a single location

// Utility functions
export {
    sanitizeShopDomain,
    isModificationsAllowed,
    validateTestConfiguration,
    checkIfPricesModified,
    checkIfProductDetailsModified,
    checkIfDiscountModified,
    renderInventoryIssueDetails
} from './test-utils';

// Handler functions
export {
    createSaveTestHandler,
    createWelcomeHandler,
    createStartTestHandler
} from './test-handlers';

// State management functions
export {
    getInitialTestGroups,
    getInitialTargetingState,
    getInitialAnalyticsState,
    isTestDataComplete,
    isDiscountTestDataComplete
} from './state-management';

// Action functions
export {
    handleSaveTest,
    handleStartTest
} from './test-actions';

// Firebase operations
export {
    fetchTestData,
    updateTestStatus
} from './firebase-operations'; 