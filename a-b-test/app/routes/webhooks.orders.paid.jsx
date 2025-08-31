import { authenticate } from "../shopify.server";
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { log } from "console";
function getVariantForUser(testVariants, hashValue) {
    if (!Array.isArray(testVariants)) {
        console.error("❌ Invalid test variants data");
        return null;
    }

    let selectedVariant = null;
    let cumulativePercentage = 0;

    // Filter out special groups and sort by ID to maintain original order
    const validVariants = testVariants
        .filter(variant => variant.percentage && variant.id)
        .sort((a, b) => a.id - b.id);

    for (const variant of validVariants) {
        cumulativePercentage += variant.percentage;

        if (hashValue <= cumulativePercentage) {
            selectedVariant = variant;
            console.log(`🎯 User assigned to variant: "${variant.name}" (${variant.percentage}% of users)`);
            break;
        }
    }

    if (!selectedVariant) {
        console.log("🎯 No variant selected for this user");
        return null;
    }

    return selectedVariant;
}
// Helper function to write logs to a file
const logToFile = (message) => {
    const logDir = path.resolve(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, 'order-paid.txt');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    // Check if log file exists and its size
    if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        const fileSizeInBytes = stats.size;
        const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

        // If file size is greater than 5MB, rotate the log
        if (fileSizeInMegabytes > 5) {
            const backupFile = path.join(logDir, `order-paid-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`);
            fs.renameSync(logFile, backupFile);
        }

        // Read existing content
        const existingContent = fs.readFileSync(logFile, 'utf8');
        // Prepend new message to existing content
        fs.writeFileSync(logFile, logMessage + existingContent);
    } else {
        // If file doesn't exist, just write the new message
        fs.writeFileSync(logFile, logMessage);
    }
    console.log(message);
};

// File to store processed webhook IDs
const processedWebhooksFile = path.join(process.cwd(), 'logs', 'processed-webhooks.json');

// Function to load processed webhook IDs
const loadProcessedWebhooks = () => {
    try {
        if (fs.existsSync(processedWebhooksFile)) {
            const data = fs.readFileSync(processedWebhooksFile, 'utf8');
            const webhooks = JSON.parse(data);
            // Filter out any null or undefined values
            const validWebhooks = webhooks.filter(id => id != null);
            return new Set(validWebhooks);
        }
    } catch (error) {
        logToFile(`Error loading processed webhooks: ${error.message}`);
    }
    return new Set();
};

// Function to save processed webhook IDs
const saveProcessedWebhooks = (webhookIds) => {
    try {
        // Filter out any null or undefined values
        const webhooksArray = [...webhookIds].filter(id => id != null);
        fs.writeFileSync(processedWebhooksFile, JSON.stringify(webhooksArray));
    } catch (error) {
        logToFile(`Error saving processed webhooks: ${error.message}`);
    }
};

// Function to extract safe cart data
const getSafeCartData = (lineItems) => {
    if (!lineItems || !Array.isArray(lineItems)) return [];
    return lineItems.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price,
        title: item.title,
        sku: item.sku,
    }));
};


// Function to get store ID from shop domain
const getStoreId = (shopDomain) => {
    return shopDomain.replace(/\./g, '_');
};

// Function to clean product ID (remove the Shopify prefix if present)
const getCleanProductId = (productId) => {
    // Convert to string first to handle both string and number inputs
    const productIdStr = String(productId);
    if (productIdStr.includes('gid://shopify/Product/')) {
        return productIdStr.split('/').pop();
    }
    return productIdStr;
};

// Function to check if user meets targeting criteria for a specific test
const checkUserMeetsTargeting = (testId, testType, testStatus, targetingData) => {
    if (!targetingData || typeof targetingData !== 'object') {
        return true; // No targeting data, allow tracking
    }

    // Create the test key in the same format as stored in cart attributes
    const testKey = `${testId}_${testType}_${testStatus}`;

    if (targetingData.hasOwnProperty(testKey)) {
        const meetsTargeting = targetingData[testKey] === 'true';
        return meetsTargeting;
    }

    logToFile(`No targeting info found for test ${testId} (${testKey}), allowing tracking`);
    return true; // No specific targeting info, allow tracking
};

// Function to fetch A/B test data from Firebase
const fetchABTestData = async (shopDomain) => {
    try {
        const storeId = shopDomain;
        const firebaseUrl = `https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app/abTests/${storeId}.json`;

        const response = await fetch(firebaseUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch A/B test data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        logToFile(`Error fetching A/B test data: ${error.message}`);
        return {};
    }
};

// Helper function to generate consistent hash
const generateConsistentHash = (input) => {
    let hash = 0;
    if (input.length === 0) return hash;

    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // Convert to a value between 0 and 100
    return Math.abs(hash % 100);
};

// Function to get test information for a product
const getProductTestInfo = async (productId, shopDomain, browserIp, fetchHashValue) => {
    try {
        const cleanProductId = getCleanProductId(productId);

        // Calculate hash value from device ID
        const hashValue = fetchHashValue || generateConsistentHash(browserIp);

        // Get A/B test data
        const abTestsData = await fetchABTestData(shopDomain);

        // Find active tests that include this product
        for (const [testId, test] of Object.entries(abTestsData)) {
            // Skip non-test objects (like querySelectors)
            if (!test || typeof test !== 'object' || !test.basicInfo) {
                continue;
            }

            if (!test.basicInfo || test.basicInfo.status !== 'active') {
                continue;
            }

            // Check if this product is in the test's selectedProducts
            const isProductInTest = test.selectedProducts && test.selectedProducts.some(product => {
                const testProductId = getCleanProductId(product.productId);
                return String(testProductId) === String(cleanProductId);
            });

            if (!isProductInTest) {
                // For productDetails tests, also check for created products
                if (test.basicInfo.type === 'productDetails') {
                    const testGroups = test.testGroups || [];
                    let foundInCreatedProducts = false;

                    for (const group of testGroups) {
                        if (group.products) {
                            for (const productKey in group.products) {
                                const productData = group.products[productKey];
                                if (productData.createdProductId) {
                                    const createdProductId = getCleanProductId(productData.createdProductId);
                                    if (createdProductId === cleanProductId) {
                                        foundInCreatedProducts = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if (foundInCreatedProducts) break;
                    }

                    if (!foundInCreatedProducts) {
                        continue;
                    }
                } else {
                    continue;
                }
            }

            // Get test groups and sort by ID to maintain order
            const testVariants = (test.testGroups || [])
                .filter(group => group.percentage && group.id)
                .sort((a, b) => a.id - b.id)
                .map(group => ({
                    id: group.id,
                    name: group.name,
                    percentage: group.percentage,
                    products: group.products
                }));

            if (testVariants.length === 0) {
                logToFile('No test variants found for test');
                continue;
            }

            // Find the variant for this user based on hash value
            let cumulativePercentage = 0;
            let selectedVariant = null;

            for (const variant of testVariants) {
                cumulativePercentage += variant.percentage;

                if (hashValue <= cumulativePercentage) {
                    selectedVariant = variant;
                    logToFile(`Selected variant: ${variant.name} (hash ${hashValue} <= ${cumulativePercentage})`);
                    break;
                }
            }

            if (selectedVariant) {
                const variantIndex = testVariants.findIndex(v => v.id === selectedVariant.id);
                logToFile(`Variant index: ${variantIndex}`);
                return {
                    testId,
                    variantId: selectedVariant.id,
                    variantIndex,
                    testType: test.basicInfo.type
                };
            }
        }

        logToFile('No active test found for product');
        return null;
    } catch (error) {
        logToFile(`Error getting product test info: ${error.message}`);
        return null;
    }
};

// Function to track analytics event in Firebase
const trackAnalyticsEvent = async (eventType, browserIp, testId, variantIndex, shopDomain, testType = null, variantId = null) => {
    try {
        // Use the store ID as provided (already processed)
        const storeId = shopDomain;

        // For price tests with saleDone event, include variant ID in the path
        let firebasePath;
        if (testType === 'pricing' && eventType === 'saleDone' && variantId) {
            firebasePath = `abTests/${storeId}/${testId}/testGroups/${variantIndex}/analytics/${eventType}/variantId_${variantId}`;
        } else {
            // Default path for other test types or events
            firebasePath = `abTests/${storeId}/${testId}/testGroups/${variantIndex}/analytics/${eventType}`;
        }

        const analyticsUrl = `https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app/${firebasePath}.json`;

        // Fetch current analytics data
        const response = await fetch(analyticsUrl);
        if (!response.ok) {
            logToFile(`[trackAnalyticsEvent] Failed to fetch analytics: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to fetch analytics: ${response.status} ${response.statusText}`);
        }

        // Parse current data
        let analyticsData = await response.json();

        // Initialize array if null or not an array
        if (!analyticsData || !Array.isArray(analyticsData)) {
            logToFile(`[trackAnalyticsEvent] Initializing empty analytics array`);
            analyticsData = [];
        }

        // Filter out empty strings and null values
        analyticsData = analyticsData.filter(id => id && id !== "");

        // Always add browser IP to analytics (allow duplicates)
        analyticsData.push(browserIp);

        // Update Firebase with the new array
        logToFile(`[trackAnalyticsEvent] Sending update to Firebase with data: ${JSON.stringify(analyticsData)}`);
        const updateResponse = await fetch(analyticsUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(analyticsData)
        });

        if (!updateResponse.ok) {
            logToFile(`[trackAnalyticsEvent] Failed to update Firebase: ${updateResponse.status} ${updateResponse.statusText}`);
            throw new Error(`Failed to update analytics: ${updateResponse.status}`);
        }

        const responseData = await updateResponse.json();
    } catch (error) {
        logToFile(`[trackAnalyticsEvent] Error: ${error.message}`);
        logToFile(`[trackAnalyticsEvent] Error stack: ${error.stack}`);
        throw error;
    }
};

// Load processed webhook IDs
let processedWebhookIds = loadProcessedWebhooks();

export const action = async ({ request }) => {
    const startTime = Date.now();

    try {
        // Get shop domain from headers
        const headers = Object.fromEntries(request.headers.entries());
        const shopDomainn = headers['x-shopify-shop-domain'];
        const shopDomain = getStoreId(shopDomainn);
        const isTest = headers['x-shopify-test'] === 'true';

        if (!shopDomain) {
            logToFile('Error: Missing X-Shopify-Shop-Domain header');
            return new Response("Missing shop domain header", { status: 400 });
        }

        // Authenticate and get the full payload
        const { payload } = await authenticate.webhook(request);

        // Get the webhook ID from the correct location in the payload
        const webhookId = payload.id || payload.webhook_id;

        if (!webhookId) {
            logToFile('Warning: No webhook ID found in payload');
            // Still process the webhook even if ID is missing
            return processWebhook(payload, shopDomain);
        }

        // Ensure idempotency - check if we've already processed this webhook
        if (processedWebhookIds.has(webhookId)) {
            logToFile(`Webhook ${webhookId} already processed, skipping`);
            return new Response("Webhook already processed", { status: 200 });
        }

        // Process the webhook and mark it as processed
        const response = await processWebhook(payload, shopDomain);
        processedWebhookIds.add(webhookId);
        saveProcessedWebhooks(processedWebhookIds);

        return response;
    } catch (error) {
        logToFile(`Authentication error: ${error.message}`);
        return new Response(
            error.message?.includes('HMAC') ? "HMAC verification failed" : "Webhook error",
            { status: error.message?.includes('HMAC') ? 401 : 500 }
        );
    }
};

// Separate function to process the webhook payload
async function processWebhook(payload, shopDomain) {
    try {
        // Extract cart attributes from multiple possible locations
        const noteAttributes = payload.note_attributes || [];
        const cartAttributes = payload.attributes || {};
        // logToFile(`payloadd: ${JSON.stringify(payload)}`);
        // Helper function to find attribute value
        const findAttributeValue = (key) => {
            // Check note_attributes first
            const noteAttr = noteAttributes.find(attr => attr.name === key || attr.name === `_${key}`);
            if (noteAttr) return noteAttr.value;

            // Then check cart attributes
            return cartAttributes[key] || cartAttributes[`_${key}`];
        };

        // Get device ID and hash value
        const userIp = findAttributeValue('revlyft_user_ip');
        const deepId = findAttributeValue('revlyft_deep_id');
        const fetchhashValue = findAttributeValue('revlyft_hash_value');
        const testTargetingAttribute = findAttributeValue('revlyft_tests_targeting_data');
        const testTimerAttribute = findAttributeValue('revlyft_tests_start_time_data');
        const currentTimeStr = findAttributeValue('revlyft_current_time');

        // Use userIp from attributes if available, otherwise fallback to browser_ip
        const browserIp = userIp || payload.browser_ip;

        if (!browserIp) {
            logToFile('No device ID found in cart attributes or browser_ip, cannot track analytics');
            return new Response("Webhook processed", { status: 200 });
        }

        // Parse targeting data if available
        let targetingData = {};
        if (testTargetingAttribute) {
            try {
                targetingData = JSON.parse(testTargetingAttribute);
            } catch (error) {
                logToFile(`Error parsing targeting data: ${error.message}`);
            }
        }

        // Extract safe cart data with attributes
        const cartData = getSafeCartData(payload.line_items);

        // ONLY access non-protected fields
        const safeData = {
            // Order information
            total_price: payload.total_price || 0,
            currency: payload.currency || 'USD',
            order_number: payload.order_number,
            // Cart information
            cart: cartData,
            // Analytics information
            timestamp: new Date().toISOString()
        };

        // Process each item in the cart for analytics
        for (const item of safeData.cart) {

            // Get test information for this product
            const testInfo = await getProductTestInfo(item.product_id, shopDomain, browserIp, fetchhashValue);
            if (testInfo) {
                // Check if user meets targeting criteria for this test (skip for product detail tests)
                if (testInfo.testType !== 'productDetails') {
                    const meetsTargeting = checkUserMeetsTargeting(testInfo.testId, testInfo.testType, 'active', targetingData);
                    if (!meetsTargeting) {
                        logToFile(`User does not meet targeting criteria for test ${testInfo.testId}. Skipping analytics tracking.`);
                        continue; // Skip to next item
                    }
                } else {
                    logToFile(`Skipping targeting check for product detail test ${testInfo.testId}`);
                }
                // For price tests, we need to check if the specific variant is part of the test
                let variantId = null;
                let shouldTrackAnalytics = true;
                if (testInfo.testType === 'pricing') {
                    // Use the variant_id from the cart item
                    variantId = getCleanProductId(item.variant_id);
                    // Check if this specific variant is part of the test group
                    const abTestsData = await fetchABTestData(shopDomain);
                    const test = abTestsData[testInfo.testId];
                    if (test && test.testGroups && test.testGroups[testInfo.variantIndex]) {
                        const testGroup = test.testGroups[testInfo.variantIndex];
                        const cleanProductId = getCleanProductId(item.product_id);
                        // Check if the product exists in this test group
                        if (testGroup.products && testGroup.products[cleanProductId]) {
                            const productInTestGroup = testGroup.products[cleanProductId];
                            // Check if the specific variant exists in this test group's product variants
                            if (productInTestGroup.variants && productInTestGroup.variants[variantId]) {
                            } else {
                                shouldTrackAnalytics = false;
                            }
                        } else {
                            logToFile(`Product ${cleanProductId} is not configured in this test group. Skipping analytics.`);
                            shouldTrackAnalytics = false;
                        }
                    } else {
                        logToFile(`Test group ${testInfo.variantIndex} not found. Skipping analytics.`);
                        shouldTrackAnalytics = false;
                    }
                }
                if (shouldTrackAnalytics) {
                    // Track the sale in Firebase
                    await trackAnalyticsEvent('saleDone', browserIp, testInfo.testId, testInfo.variantIndex, shopDomain, testInfo.testType, variantId);

                } else {
                    logToFile(`Skipped analytics tracking for variant not in test`);
                }
            } else {
                logToFile(`No active test found for product ${item.product_id}`);
            }
        }

        // --- ORDER-LEVEL DISCOUNT TEST ANALYTICS ---
        const abTestsData = await fetchABTestData(shopDomain);
        for (const [testId, test] of Object.entries(abTestsData)) {

            if (!test || typeof test !== 'object' || !test.basicInfo) {
                continue;
            }

            if (!test.basicInfo || test.basicInfo.status !== 'active') {
                logToFile('Test not active, skipping');
                continue;
            }

            if (test.basicInfo.status === 'active' && test.basicInfo.type === 'discount') {
                // --- 30 MINUTES CHECK ---
                let skipAnalytics = false;
                if (!testTimerAttribute) {
                    logToFile(`Skipping analytics for discount test ${testId}: test timer attribute missing or empty.`);
                    skipAnalytics = true;
                } else {
                    try {
                        const timerObj = testTimerAttribute ? JSON.parse(testTimerAttribute) : {};
                        const timerKey = `${testId}_${test.basicInfo.type}_${test.basicInfo.status}`;
                        const startTimeStr = timerObj[timerKey];
                        if (!startTimeStr) {
                            logToFile(`Skipping analytics for discount test ${testId}: start time not found in timer attribute.`);
                            skipAnalytics = true;
                        } else {
                            const startTime = new Date(startTimeStr);
                            const now = currentTimeStr ? new Date(currentTimeStr) : new Date();
                            const diffMs = now - startTime;
                            if (diffMs > 30 * 60 * 1000) {
                                logToFile(`Skipping analytics for discount test ${testId}: more than 30 minutes since start (${(diffMs / 60000).toFixed(2)} min)`);
                                skipAnalytics = true;
                            }
                        }
                    } catch (e) {
                        logToFile(`Error parsing test timer for discount test ${testId}: ${e.message}`);
                        skipAnalytics = true;
                    }
                }
                if (skipAnalytics) continue;

                const hashValue = fetchhashValue || generateConsistentHash(browserIp);
                const userVariant = getVariantForUser(test.testGroups, hashValue);
                if (!userVariant) continue;

                const variantIndex = test.testGroups.findIndex(group =>
                    group.id.toString() === userVariant.id.toString()
                );
                logToFile(`User variant: ${userVariant.name}, Variant index: ${variantIndex}`);

                if (variantIndex === -1) continue;
                // Calculate order-level analytics
                const itemCount = safeData.cart.reduce((sum, item) => sum + item.quantity, 0);
                const subtotal = safeData.cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
                const discountAmount = safeData.cart.reduce((sum, item) => sum + parseFloat(item.total_discount || 0), 0);
                const total = subtotal - discountAmount;
                // Optionally, get itemsToThreshold/messageShown from attributes or testData if available
                // Save only the minimal order summary as analyticsDetails
                let analyticsDetails = {
                    order_number: payload.order_number,
                    order_id: payload.id,
                    created_at: payload.created_at,
                    currency: payload.currency,
                    total_price: payload.total_price,
                    subtotal_price: payload.total_line_items_price || payload.subtotal_price,
                    total_discounts: payload.total_discounts,
                    discount_applications: (payload.discount_applications || []).map(app => ({
                        title: app.title,
                        type: app.type,
                        value: app.value,
                        value_type: app.value_type
                    }))
                };

                // Read userBehavior node for this user
                const userBehaviorUrl = `https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app/abTests/${shopDomain}/${testId}/testGroups/${variantIndex}/analytics/userBehavior/${deepId}.json`;
                let userBehaviorData = {};
                try {
                    const userBehaviorResp = await fetch(userBehaviorUrl);
                    if (userBehaviorResp.ok) {
                        userBehaviorData = await userBehaviorResp.json() || {};
                    }
                } catch (err) {
                    logToFile('Error fetching userBehavior node: ' + err.message);
                }
                // Find the highest experience index
                let experienceIndexes = Object.keys(userBehaviorData)
                    .map(k => parseInt(k))
                    .filter(k => !isNaN(k))
                    .sort((a, b) => a - b);
                let lastIndex = experienceIndexes.length > 0 ? experienceIndexes[experienceIndexes.length - 1] : 0;
                let lastExperience = userBehaviorData[lastIndex];
                // If no experience exists, create the first one
                if (!lastExperience) {
                    userBehaviorData[0] = {
                        events: [],
                        firstSeen: new Date().toISOString()
                    };
                    lastIndex = 0;
                    lastExperience = userBehaviorData[0];
                }
                // If last experience already has saleDone, create a new node
                let targetIndex = lastIndex;
                if ('saleDone' in lastExperience) {
                    targetIndex = lastIndex + 1;
                    userBehaviorData[targetIndex] = {
                        events: [],
                        firstSeen: new Date().toISOString()
                    };
                }
                // Set saleDone in the correct experience node
                userBehaviorData[targetIndex].saleDone = analyticsDetails;
                // Save to Firebase under userBehavior node
                const updateUrl = `https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app/abTests/${shopDomain}/${testId}/testGroups/${variantIndex}/analytics/userBehavior/${deepId}.json`;
                const response = await fetch(updateUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userBehaviorData)
                });
            }
            else {
                logToFile(`No active discount test found for shop domain ${shopDomain}`);
            }
        }

        return new Response("Webhook processed", { status: 200 });
    } catch (error) {
        logToFile(`Processing error: ${error.message}`);
        return new Response("Webhook received", { status: 200 });
    }
}


