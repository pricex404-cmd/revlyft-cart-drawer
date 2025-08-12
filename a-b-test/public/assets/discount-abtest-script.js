// Function to get time remaining in minutes and seconds
function getTimeRemaining(startTime) {
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const timeElapsed = now - start;
    const timeRemaining = thirtyMinutes - timeElapsed;

    if (timeRemaining <= 0) {
        return null;
    }

    const minutes = Math.floor(timeRemaining / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    return {
        minutes,
        seconds,
        total: timeRemaining
    };
}

// Function to format time as MM:SS
function formatTime(minutes, seconds) {
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Function to find discount message element
function findDiscountElement() {
    console.log('🔍 Looking for discount element');

    // Get all text content in the cart
    const cartText = document.body.innerText;
    console.log('📝 Cart text found:', cartText.includes('Add $') && cartText.includes('% off'));

    // Try multiple selectors
    const selectors = [
        'li.discounts__discount--end',
        'li.discounts__discount',
        '.discounts li',
        '.cart-drawer__footer .discounts li',
        '.drawer__footer .discounts li',
        '.cart__footer .discounts li',
        '.cart-drawer__footer ul.discounts > li'
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector);
        console.log(`🔍 Checking selector: "${selector}"`, element ? '✅ Found!' : '❌ Not found');
        if (element) {
            const text = element.textContent;
            console.log('📝 Element text:', text);
            if (text.includes('% off')) {
                return element;
            }
        }
    }

    // If no element found with selectors, try finding by text content
    const elements = Array.from(document.getElementsByTagName('*'));
    for (const element of elements) {
        const text = element.textContent;
        if (text && text.includes('Add $') && text.includes('% off')) {
            console.log('🎯 Found element by text content:', element);
            return element;
        }
    }

    console.log('❌ No discount element found');
    return null;
}

// Function to create or update timer UI
function updateTimerUI(timeString) {
    console.log('🔄 Updating timer UI');
    let timerDiv = document.getElementById('cf-discount-timer');

    if (!timerDiv) {
        const discountMessage = findDiscountElement();
        if (!discountMessage) {
            console.log('⏳ No discount message found, will retry...');
            return;
        }

        console.log('✅ Creating new timer UI');
        timerDiv = document.createElement('div');
        timerDiv.id = 'cf-discount-timer';
        timerDiv.style.cssText = `
            margin: 10px 0;
            padding: 8px 12px;
            background-color: #fff8e6;
            border: 1px solid #ffd700;
            border-radius: 4px;
            color: #e31837;
            font-weight: bold;
            font-size: 0.95em;
            display: flex;
            align-items: center;
            gap: 8px;
            text-align: center;
            width: 100%;
            box-sizing: border-box;
        `;

        const clockIcon = document.createElement('span');
        clockIcon.innerHTML = '⏰';
        clockIcon.style.cssText = `
            font-size: 1.2em;
            animation: pulse 1s infinite;
        `;
        timerDiv.appendChild(clockIcon);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);

        const textSpan = document.createElement('span');
        textSpan.id = 'cf-discount-timer-text';
        textSpan.style.flex = '1';
        timerDiv.appendChild(textSpan);

        discountMessage.insertAdjacentElement('afterend', timerDiv);
        console.log('✅ Timer UI inserted into DOM');
    }

    const textSpan = document.getElementById('cf-discount-timer-text');
    if (textSpan) {
        textSpan.textContent = `⚡ Hurry! This special offer expires in ${timeString}`;
        console.log('✅ Timer text updated:', timeString);
    }
}

// Function to remove timer UI only (not the cookie)
function removeTimerUI() {
    const timerDiv = document.getElementById('cf-discount-timer');
    if (timerDiv) {
        timerDiv.remove();
        console.log('🗑️ Timer UI removed');
    }
}

// Function to manage discount countdown
function manageDiscountCountdown() {
    try {
        console.log('🔄 Starting discount countdown');

        // Look for discount test timer cookie
        const cookies = document.cookie.split(';');
        let discountStartTime = null;

        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name.startsWith('cf_test_timer_discount_')) {
                discountStartTime = decodeURIComponent(value);
                console.log('🍪 Found discount timer cookie:', name, discountStartTime);
                break;
            }
        }

        if (!discountStartTime) {
            console.log('❌ No discount timer cookie found');
            return;
        }

        // Start the countdown
        const countdownInterval = setInterval(() => {
            const remaining = getTimeRemaining(discountStartTime);
            if (!remaining) {
                clearInterval(countdownInterval);
                removeTimerUI(); // Only remove the UI, keep the cookie
                return;
            }

            const timeString = formatTime(remaining.minutes, remaining.seconds);
            updateTimerUI(timeString);
        }, 1000);
    } catch (error) {
        console.error('❌ Error in countdown:', error);
    }
}

// Function to get helper functions (assuming they exist in your main script)
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

async function getStoreId() {
    // This should return your store ID - implement based on your existing logic
    return 'store01test1_myshopify_com';
}

async function fetchABTestData() {
    try {
        const storeId = await getStoreId();
        const response = await fetch(`https://abtest-6b299-default-rtdb.firebaseio.com/abTests/${storeId}.json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch AB test data: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching AB test data:', error);
        return null;
    }
}

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

// Function to track cart drawer message analytics
async function trackCartDrawerMessageAnalytics(messageType, testId, variantIndex) {
    try {
        const ip = getCookie('cf_finalDevId');
        if (!ip) {
            console.log('❌ No IP found in cookies for analytics');
            return;
        }

        const storeId = await getStoreId();
        const firebasePath = `abTests/${storeId}/${testId}/testGroups/${variantIndex}/analytics/${messageType}`;
        const analyticsUrl = `https://abtest-6b299-default-rtdb.firebaseio.com/${firebasePath}.json`;

        // Fetch current analytics data
        const response = await fetch(analyticsUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${messageType} data: ${response.status}`);
        }

        let analyticsData = await response.json();
        analyticsData = Array.isArray(analyticsData) ? analyticsData.filter(id => id !== "") : [];
        analyticsData.push(ip);

        // Update Firebase with new analytics data
        const updateResponse = await fetch(analyticsUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(analyticsData)
        });

        if (!updateResponse.ok) {
            throw new Error(`Failed to update ${messageType} data: ${updateResponse.status}`);
        }

        console.log(`📊 Successfully tracked ${messageType} for cart drawer message`);
    } catch (error) {
        console.error(`❌ Error tracking ${messageType}:`, error);
    }
}

// Function to determine event data based on state changes
function determineEventData(currentState, messageText, threshold, isControlGroup = false) {
    const timestamp = new Date().toISOString();

    if (isControlGroup) {
        // For control group, we just track item count and basic info
        return {
            currentItemCount: currentState,
            itemsToThreshold: Math.max(0, threshold - currentState),
            messageShown: "Control Group - No discount message",
            timestamp: timestamp,
        };
    }

    // Check if the message indicates we've met the threshold
    const hasMetThreshold = messageText.includes(`${threshold}+ items`) ||
        messageText.includes('off orders with') ||
        !messageText.includes('more item');

    return {
        currentItemCount: currentState,
        itemsToThreshold: hasMetThreshold ? 0 : Math.max(0, threshold - currentState),
        messageShown: messageText,
        timestamp: timestamp,
    };
}

// Global state tracking to prevent duplicates
let globalTrackingState = {
    lastTrackedData: null,
    lastTrackingTime: 0,
    trackingInProgress: false
};

// Function to track detailed user behavior analytics
async function trackUserBehaviorAnalytics(testId, variantIndex, eventData) {
    try {
        // Prevent concurrent tracking calls
        if (globalTrackingState.trackingInProgress) {
            console.log('⚠️ Tracking already in progress, skipping duplicate call');
            return;
        }

        const ip = getCookie('cf_finalDevId');
        if (!ip) {
            console.log('❌ No IP found in cookies for analytics');
            return;
        }

        // Create a unique key for this event
        const eventKey = `${eventData.currentItemCount}-${eventData.messageShown.trim()}-${eventData.itemsToThreshold}`;
        const currentTime = Date.now();

        // Enhanced duplicate detection
        if (globalTrackingState.lastTrackedData &&
            globalTrackingState.lastTrackedData.eventKey === eventKey &&
            (currentTime - globalTrackingState.lastTrackingTime) < 5000) { // 5 second window
            console.log('⚠️ Skipping duplicate event - same state within 5 seconds');
            return;
        }

        globalTrackingState.trackingInProgress = true;

        const storeId = await getStoreId();
        const firebasePath = `abTests/${storeId}/${testId}/testGroups/${variantIndex}/analytics/userBehavior/${ip}`;
        const analyticsUrl = `https://abtest-6b299-default-rtdb.firebaseio.com/${firebasePath}.json`;

        // Fetch current user behavior data
        const response = await fetch(analyticsUrl);
        if (!response.ok) {
            console.error(`❌ Failed to fetch data: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to fetch user behavior data: ${response.status}`);
        }

        let userData = await response.json() || {};

        // Find the highest experience index
        let experienceIndexes = Object.keys(userData)
            .map(k => parseInt(k))
            .filter(k => !isNaN(k))
            .sort((a, b) => a - b);
        let lastIndex = experienceIndexes.length > 0 ? experienceIndexes[experienceIndexes.length - 1] : 0;
        let lastExperience = userData[lastIndex];

        // If no experience exists, create the first one
        if (!lastExperience) {
            userData[0] = {
                events: [],
                firstSeen: new Date().toISOString()
            };
            lastIndex = 0;
            lastExperience = userData[0];
        }

        // Check if last experience has saleDone property
        let targetIndex = lastIndex;
        if ('saleDone' in lastExperience) {
            // Create a new experience node
            targetIndex = lastIndex + 1;
            userData[targetIndex] = {
                events: [],
                firstSeen: new Date().toISOString()
            };
        }

        // Enhanced duplicate detection in existing events (per experience node)
        const isDuplicate = userData[targetIndex].events.some(existingEvent => {
            const timeDiff = Math.abs(new Date(eventData.timestamp) - new Date(existingEvent.timestamp));
            return (
                existingEvent.currentItemCount === eventData.currentItemCount &&
                existingEvent.messageShown && eventData.messageShown &&
                existingEvent.messageShown.trim() === eventData.messageShown.trim() &&
                existingEvent.itemsToThreshold === eventData.itemsToThreshold &&
                timeDiff < 5000 // Within 5 seconds
            );
        });

        if (isDuplicate) {
            console.log('⚠️ Skipping duplicate event - already exists in database');
            globalTrackingState.trackingInProgress = false;
            return;
        }

        // Add new event to the correct experience node
        userData[targetIndex].events.push(eventData);

        // Update Firebase with new user behavior data
        const updateResponse = await fetch(analyticsUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!updateResponse.ok) {
            throw new Error(`Failed to update user behavior data: ${updateResponse.status}`);
        }

        // Update global tracking state
        globalTrackingState.lastTrackedData = {
            eventKey: eventKey,
            eventData: eventData
        };
        globalTrackingState.lastTrackingTime = currentTime;

        console.log(`📊 Successfully tracked user behavior for ${eventData.isControlGroup ? 'control group' : 'test group'}`);
    } catch (error) {
        console.error('❌ Error tracking user behavior:', error);
    } finally {
        globalTrackingState.trackingInProgress = false;
    }
}

// Function to extract cart information
function getCartInfo() {
    const cartItems = document.querySelectorAll('.cart-item');
    let totalItems = 0;

    cartItems.forEach(item => {
        const quantityInput = item.querySelector('.quantity__input');
        if (quantityInput) {
            totalItems += parseInt(quantityInput.value) || 0;
        }
    });

    console.log('🛒 Current cart items:', totalItems);
    return totalItems;
}

// Improved cart change observation with better duplicate prevention
function observeCartChanges() {
    console.log('👀 Setting up cart change observer for all groups');

    let lastTrackedState = {
        itemCount: -1, // Initialize with -1 to ensure first tracking
        messageText: '',
        timestamp: 0
    };

    let trackingTimeout = null;

    // Function to track cart changes for all groups
    async function trackCartChange(isManual = false) {
        try {
            // Clear any pending timeout
            if (trackingTimeout) {
                clearTimeout(trackingTimeout);
                trackingTimeout = null;
            }

            const currentItemCount = getCartInfo();
            const currentTime = Date.now();

            // Get current message text
            const discountMessage = document.querySelector('.discounts__discount');
            const messageText = discountMessage ? discountMessage.textContent.trim() : "";

            // Enhanced duplicate detection
            const timeSinceLastTrack = currentTime - lastTrackedState.timestamp;
            const hasStateChanged = (
                currentItemCount !== lastTrackedState.itemCount ||
                messageText !== lastTrackedState.messageText
            );

            // Skip if no meaningful change and not manual trigger
            if (!isManual && !hasStateChanged && timeSinceLastTrack < 3000) {
                console.log('⚠️ No significant cart changes detected, skipping tracking');
                return;
            }

            // Get active test data
            const abTestsData = await fetchABTestData();
            if (!abTestsData) return;

            // Find the active discount test
            for (const [testId, test] of Object.entries(abTestsData)) {
                if (test.basicInfo?.type === 'discount' && test.basicInfo?.status === 'active') {
                    const hashValue = getCookie('cf_hashValue');
                    const userVariant = getVariantForUser(test.testGroups, hashValue);
                    if (!userVariant) continue;

                    const variantIndex = test.testGroups.findIndex(group =>
                        group.id.toString() === userVariant.id.toString()
                    );

                    if (variantIndex === -1) continue;

                    // Get threshold from test configuration
                    const threshold = parseInt(test.discountConfig?.threshold) || 3;

                    // Check if this is control group (discountPercentageValue is "0")
                    const isControlGroup = userVariant.discountPercentageValue === "0";

                    let eventData;
                    if (isControlGroup) {
                        // For control group, track without discount message
                        eventData = determineEventData(
                            currentItemCount,
                            "",
                            threshold,
                            true
                        );
                    } else {
                        // For test group, use the message text
                        eventData = determineEventData(
                            currentItemCount,
                            messageText,
                            threshold,
                            false
                        );
                    }

                    await trackUserBehaviorAnalytics(testId, variantIndex, eventData);

                    // Update last tracked state
                    lastTrackedState = {
                        itemCount: currentItemCount,
                        messageText: messageText,
                        timestamp: currentTime
                    };
                }
            }
        } catch (error) {
            console.error('❌ Error in cart change tracking:', error);
        }
    }

    // Debounced tracking function
    function debouncedTrackCartChange() {
        if (trackingTimeout) {
            clearTimeout(trackingTimeout);
        }
        trackingTimeout = setTimeout(() => trackCartChange(false), 1000); // 1 second debounce
    }

    // Create a MutationObserver to watch for changes in the cart
    const observer = new MutationObserver(async (mutations) => {
        let shouldTrack = false;

        for (const mutation of mutations) {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                // Skip timer-related changes
                if (mutation.target.id === 'cf-discount-timer' ||
                    mutation.target.id === 'cf-discount-timer-text' ||
                    (mutation.target.parentElement && mutation.target.parentElement.id === 'cf-discount-timer')) {
                    continue;
                }

                // Check if cart items changed
                const cartItemsChanged = Array.from(mutation.addedNodes).some(node =>
                    node.nodeType === Node.ELEMENT_NODE &&
                    (node.classList.contains('cart-item') || node.querySelector && node.querySelector('.cart-item'))
                ) || Array.from(mutation.removedNodes).some(node =>
                    node.nodeType === Node.ELEMENT_NODE &&
                    (node.classList.contains('cart-item') || node.querySelector && node.querySelector('.cart-item'))
                );

                // Check if quantity inputs changed
                const quantityChanged = mutation.target.classList &&
                    mutation.target.classList.contains('quantity__input');

                // Check if discount message changed (but not timer)
                const discountMessageChanged = mutation.target.classList &&
                    mutation.target.classList.contains('discounts__discount');

                if (cartItemsChanged || quantityChanged || discountMessageChanged) {
                    shouldTrack = true;
                    break;
                }
            }
        }

        if (shouldTrack) {
            console.log('🔄 Cart change detected, scheduling tracking');
            debouncedTrackCartChange();
        }
    });

    // Function to start observing cart
    function startObserving() {
        const cartDrawer = document.querySelector('cart-drawer');
        if (cartDrawer) {
            console.log('✅ Cart drawer found, starting observation for all groups');
            observer.observe(cartDrawer, {
                childList: true,
                characterData: true,
                subtree: true
            });
        } else {
            console.log('⏳ Cart drawer not found, will retry...');
            setTimeout(startObserving, 500);
        }
    }

    // Start observing and handle dynamic cart drawer creation
    startObserving();

    // Also observe body for cart drawer creation
    const bodyObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'CART-DRAWER') {
                        console.log('🛒 Cart drawer dynamically added, initializing observer');
                        startObserving();
                    }
                });
            }
        }
    });

    bodyObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Track initial cart state after a delay
    setTimeout(() => trackCartChange(true), 2000);
}

// Wait for DOM to be ready
function initializeTimer() {
    console.log('🚀 Initializing discount timer script');
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', manageDiscountCountdown);
    } else {
        manageDiscountCountdown();
    }
}

// Initialize everything
function initializeScript() {
    console.log('🚀 Initializing enhanced A/B test script');

    // Initialize timer for test groups
    initializeTimer();

    // Initialize cart change tracking for all groups
    observeCartChanges();
}

// Start initialization
document.addEventListener('DOMContentLoaded', initializeScript);

// Also try to initialize immediately in case DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('🏃‍♂️ DOM already loaded, initializing immediately');
    initializeScript();
}

// Watch for cart updates
document.addEventListener('cart:updated', () => {
    console.log('🛒 Cart updated, reinitializing');
    setTimeout(() => {
        manageDiscountCountdown();
    }, 500);
});

// Watch for cart drawer
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE &&
                node.classList &&
                (node.classList.contains('cart-drawer') ||
                    node.classList.contains('drawer--right'))) {
                console.log('🛒 Cart drawer detected, reinitializing');
                setTimeout(() => {
                    manageDiscountCountdown();
                }, 500);
                break;
            }
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });

// Export functions
window.causalFunnelDiscount = {
    getTimeRemaining,
    formatTime,
    manageDiscountCountdown,
    observeCartChanges,
    trackUserBehaviorAnalytics
};