// Firebase configuration
const FIREBASE_DB_URL = "https://abtest-6b299-default-rtdb.firebaseio.com/";

// Function to sanitize shop domain for Firebase path
export const sanitizeShopDomain = (domain) => {
    if (!domain) return '';
    return domain.replace(/\./g, '_');
};

export const saveTestData = async (shop, testId, testData) => {
    const sanitizedDomain = sanitizeShopDomain(shop.domain);
    const response = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
    });

    if (!response.ok) {
        throw new Error('Failed to save test data');
    }

    return response.json();
};

export const fetchTestData = async (shop, testId) => {
    const sanitizedDomain = sanitizeShopDomain(shop.domain);
    const response = await fetch(`${FIREBASE_DB_URL}/abTests/${sanitizedDomain}/${testId}.json`);

    if (!response.ok) {
        throw new Error('Failed to fetch test data');
    }

    return response.json();
};

export const updateTestStatus = async (shop, testId, status, discountId = null) => {
    const sanitizedDomain = sanitizeShopDomain(shop.domain);
    const testData = await fetchTestData(shop, testId);

    const updatedData = {
        ...testData,
        basicInfo: {
            ...testData.basicInfo,
            status,
            ...(discountId && { discountId })
        }
    };

    return saveTestData(shop, testId, updatedData);
}; 