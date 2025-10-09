// Function to get time remaining in minutes and seconds
// Get hashValue from sessionStorage or cookies
let hashValue = null;
if (window.sessionStorage && window.sessionStorage.getItem('rv_hashValue')) {
    hashValue = window.sessionStorage.getItem('rv_hashValue');
} else {
    hashValue = getCookie('rv_hashValue');
}

// Centralized styles for this script
const RV_STYLES = {
    offerBlock: `
        width: 100%;
        display: block;
        margin: 12px 0;
        padding: 2px 10px;
        background: rgba(0,0,0,0.02);
        border: 1px solid rgba(0,0,0,0.06);
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    `,
    timerDiv: `
        margin: 10px 0;
        padding: 8px 12px;
        background-color: #fff8e6;
        border: 1px solid #ffd700;
        border-radius: 14px;
        color: #1f2937;
        font-weight: bold;
        font-size: 0.95em;
        display: flex;
        align-items: center;
        gap: 8px;
        text-align: center;
        width: 100%;
        box-sizing: border-box;
    `,
    clockIcon: `
        font-size: 1.4em;
        animation: rv-pulse 1s infinite;
    `,
    keyframes: `
        @keyframes rv-pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `,
    textSpan: `
        flex: 1;
        font-size: 1.2rem;
        font-weight: 600;
    `,
    timeBox: `
        display:inline-block;
        padding:4px 12px;
        border:1px solid #ffd089;
        background:#fff;
        border-radius:10px;
        min-width:54px;
        text-align:center;
        color: #1f2937;
        font-weight:700;
        box-shadow:0 1px 2px rgba(0,0,0,0.07);
        font-variant-numeric: tabular-nums;
    `,
    timeSep: `
        display:inline-block;
        margin:0 8px;
        color:#b91c1c;
        font-weight:700;
    `,
    timeWrap: `
        display:inline-flex;
        align-items:center;
        gap:8px;
        margin-top:10px;
    `,
   
    
   
};

// Inject keyframes once
(function ensureKeyframesInjected() {
    const STYLE_ID = 'rv-discount-styles';
    if (!document.getElementById(STYLE_ID)) {
        const styleEl = document.createElement('style');
        styleEl.id = STYLE_ID;
        styleEl.textContent = RV_STYLES.keyframes;
        document.head.appendChild(styleEl);
    }
})();

function getTimeRemaining(startTime, timerMinutes = 30) {
    const timerDurationMs = (parseInt(timerMinutes, 10) || 30) * 60 * 1000; // timer minutes in milliseconds
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const timeElapsed = now - start;
    const timeRemaining = timerDurationMs - timeElapsed;

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

// Global flag to prevent infinite discount message retries
window.rv_DiscountMessageRetryLimitReached = false;

// Function to create or update timer UI - now integrates with progress bar
function updateTimerUI(timeString, timerExpired = false, retryCount = 0) {
    if (window.rv_DiscountMessageRetryLimitReached) {
        return;
    }
    
    // Look for progress bar message element first
    let progressMessage = document.querySelector('.progress-message');
    
    if (!progressMessage) {
        // Fallback to discount message element
        const discountMessage = findDiscountElement();
        if (!discountMessage) {
            if (timerExpired) {
                console.log('⏳ No progress bar or discount message found and timer expired, will NOT retry.');
                return;
            }
            // Limit retries to 4
            if (retryCount >= 4) {
                console.log('⏳ No progress bar or discount message found after 4 retries, will NOT retry again.');
                window.rv_DiscountMessageRetryLimitReached = true;
                return;
            }
            console.log('⏳ No progress bar or discount message found, will retry...');
            setTimeout(() => updateTimerUI(timeString, timerExpired, retryCount + 1), 500);
            return;
        }
    }

    console.log('✅ Updating timer UI within progress bar');
    
    // Support both "MM:SS" string and {minutes, seconds}
    let minutes = 0;
    let seconds = 0;
    if (typeof timeString === 'string' && timeString.includes(':')) {
        const parts = timeString.split(':');
        minutes = parseInt(parts[0], 10) || 0;
        seconds = parseInt(parts[1], 10) || 0;
    } else if (timeString && typeof timeString === 'object') {
        minutes = parseInt(timeString.minutes, 10) || 0;
        seconds = parseInt(timeString.seconds, 10) || 0;
    }

    const boxStyle = RV_STYLES.timeBox;
    const sepStyle = RV_STYLES.timeSep;
    const wrapStyle = RV_STYLES.timeWrap;
    
    // Create timer HTML
    const timerHTML = `<div style="${RV_STYLES.timerDiv.replace('margin: 10px 0;', 'margin: 8px 0 12px 0;')}">
        <span style="${RV_STYLES.clockIcon}">⏰</span>
        <span style="${RV_STYLES.textSpan}">⚡ Hurry! This special offer expires in 
            <span style="display:block"></span>
            <span class="rv-time-wrap" style="${wrapStyle}">
                <span style="${boxStyle}">${minutes}m</span>
                <span style="${sepStyle}">:</span>
                <span style="${boxStyle}">${seconds}s</span>
            </span>
        </span>
    </div>`;
    
    if (progressMessage) {
        // Check if timer already exists in progress message
        let existingTimer = progressMessage.querySelector('.rv-timer-in-progress');
        if (!existingTimer) {
            // Create timer container within progress message
            existingTimer = document.createElement('div');
            existingTimer.className = 'rv-timer-in-progress';
            existingTimer.style.cssText = 'margin-bottom: 8px;';
            progressMessage.insertBefore(existingTimer, progressMessage.firstChild);
        }
        existingTimer.innerHTML = timerHTML;
    } else {
        // Fallback: create separate timer div if no progress bar
        let timerDiv = document.getElementById('rv-discount-timer');
        if (!timerDiv) {
            const cartHeaderContainer = document.querySelector('cart-drawer .drawer__header, .drawer__header');
            let offerBlock = document.getElementById('rv-offer-block');
            if (!offerBlock && cartHeaderContainer) {
                offerBlock = document.createElement('div');
                offerBlock.id = 'rv-offer-block';
                offerBlock.style.cssText = RV_STYLES.offerBlock;
                cartHeaderContainer.insertAdjacentElement('afterend', offerBlock);
            }
            
            timerDiv = document.createElement('div');
            timerDiv.id = 'rv-discount-timer';
            timerDiv.innerHTML = timerHTML;
            
            if (offerBlock) {
                offerBlock.appendChild(timerDiv);
            } else if (discountMessage) {
                discountMessage.insertAdjacentElement('afterend', timerDiv);
            }
        } else {
            timerDiv.innerHTML = timerHTML;
        }
    }
}

// Function to remove timer UI only (not the cookie)
function removeTimerUI() {
    // Remove timer from progress bar if it exists
    const progressTimer = document.querySelector('.rv-timer-in-progress');
    if (progressTimer) {
        progressTimer.remove();
        console.log('🗑️ Timer UI removed from progress bar');
    }
    
    // Also remove standalone timer div if it exists
    const timerDiv = document.getElementById('rv-discount-timer');
    if (timerDiv) {
        timerDiv.remove();
        console.log('🗑️ Standalone timer UI removed');
    }
}

// Function to manage discount countdown
function manageDiscountCountdown() {
    try {
        console.log('🔄 Starting discount countdown');

        // Look for discount test timer cookie
        const cookies = document.cookie.split(';');
        let discountStartTime = null;
        let testId = null;
        let abTestsData = null;
        // Find the discount timer cookie and testId
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name.startsWith('rv_tests_start_time_') && name.endsWith('_discount_active')) {
                discountStartTime = decodeURIComponent(value);
                // Extract testId from the cookie name
                // Remove prefix and suffix to get just the testId
                testId = name.replace('rv_tests_start_time_', '').replace('_discount_active', '');
                console.log('🍪 Found discount timer cookie:', name, discountStartTime);
                break;
            }
        }
        // Get hashValue from cookie if available
        if (hashValue) hashValue = parseInt(hashValue, 10);

        // Fetch AB test data to get testGroups and timer config
        fetchABTestData().then(async function (abTestsData) {
            // If we didn't find a cookie/testId, try to infer active discount test
            if ((!discountStartTime || !testId) && abTestsData) {
                for (const [tid, test] of Object.entries(abTestsData)) {
                    if (test.basicInfo?.type === 'discount' && test.basicInfo?.status === 'active') {
                        testId = tid;
                        break;
                    }
                }
            }

            if (!abTestsData || !testId || !abTestsData[testId]) {
                console.log('❌ No AB test data or active test found for timer initialization');
                return;
            }

            const testData = abTestsData[testId];
            const testGroups = testData.testGroups;
            // Read timer config from DB
            const showTimer = !!(testData.discountConfig && testData.discountConfig.showTimer);
            const timerMinutes = parseInt(testData.discountConfig && testData.discountConfig.timerMinutes) || 30;
            const userVariant = getVariantForUser(testGroups, hashValue);
            const variantIndex = testGroups.findIndex(group => group.id.toString() === userVariant.id.toString());
            if (variantIndex === 0) {
                console.log('🛑 User is in control group (variant index 0), skipping timer UI and DOM lookups.');
                return;
            }
            // Respect showTimer flag from DB
            if (!showTimer) {
                console.log('⏹️ showTimer disabled in config, skipping timer UI.');
                return;
            }

            // If no cookie, create one now to start the timer
            if (!discountStartTime) {
                const nowIso = new Date().toISOString();
                const cookieName = `rv_tests_start_time_${testId}_discount_active`;
                document.cookie = `${cookieName}=${encodeURIComponent(nowIso)}; path=/`;
                discountStartTime = nowIso;
                console.log('🍪 Created discount timer cookie:', cookieName, discountStartTime);
            }
            // Start the countdown only for non-control group
            let timerExpired = false;
            const countdownInterval = setInterval(() => {
                const remaining = getTimeRemaining(discountStartTime, timerMinutes);
                if (!remaining) {
                    clearInterval(countdownInterval);
                    removeTimerUI(); // Only remove the UI, keep the cookie
                    timerExpired = true;
                    return;
                }
                if (!timerExpired) {
                    const timeString = formatTime(remaining.minutes, remaining.seconds);
                    updateTimerUI(timeString, timerExpired);
                }
            }, 1000);
        });
    } catch (error) {
        console.error('❌ Error in countdown:', error);
    }
}

// Global variable to cache Shopify domain
if (typeof rv_cachedShopifyDomain === 'undefined') {
    var rv_cachedShopifyDomain = null;
}

/**
 * Get Shopify domain from script parameters or current page
 * @returns {string|null} The Shopify domain or null
 */
function getShopifyDomainFromScript() {
    try {
        // Method 0: Try document.currentScript first (most reliable)
        if (document.currentScript && document.currentScript.src) {
            if (document.currentScript.src.includes('revlyft-discount-abtest-script.js')) {
                try {
                    const url = new URL(document.currentScript.src);
                    const shopParam = url.searchParams.get('shop');
                    if (shopParam) {
                        console.log('🔍 Found shop parameter in current script:', shopParam);
                        return shopParam;
                    }
                } catch (urlError) {
                    console.error('❌ Error parsing current script URL:', urlError);
                }
            }
        }

        // Method 1: Check if the script URL has a shop parameter
        const scripts = document.getElementsByTagName('script');

        for (const script of scripts) {
            if (script.src && script.src.includes('revlyft-discount-abtest-script.js')) {
                try {
                    const url = new URL(script.src);
                    const shopParam = url.searchParams.get('shop');
                    if (shopParam) {
                        console.log('🔍 Found shop parameter in script URL:', shopParam);
                        return shopParam;
                    }
                } catch (urlError) {
                    console.error('❌ Error parsing script URL:', script.src, urlError);
                }
            }
        }

        // Method 2: Check URL parameters of current page
        const urlParams = new URLSearchParams(window.location.search);
        const shopParam = urlParams.get('shop');
        if (shopParam) {
            console.log('🔍 Found shop parameter in page URL:', shopParam);
            return shopParam;
        }

        // Method 3: Check if current domain is already a myshopify domain
        const currentDomain = window.location.hostname;
        if (currentDomain.includes('.myshopify.com')) {
            console.log('🔍 Current domain is already a Shopify domain:', currentDomain);
            return currentDomain;
        }

        return null;
    } catch (error) {
        console.error('❌ Error getting Shopify domain from script:', error);
        return null;
    }
}

/**
 * Get the app domain for API calls
 * @returns {string} The app domain
 */
function getAppDomain() {
    // Try to get from script parameters first
    const scripts = document.getElementsByTagName('script');
    for (const script of scripts) {
        if (script.src && script.src.includes('revlyft-discount-abtest-script.js')) {
            try {
                const url = new URL(script.src);
                const appDomain = url.searchParams.get('app_domain');
                if (appDomain) {
                    return appDomain;
                }
            } catch (urlError) {
                console.error('❌ Error parsing script URL for app domain:', urlError);
            }
        }
    }
    
    // Fallback to current domain
    return window.location.origin;
}

/**
 * Fetch the actual Shopify domain from the API
 * @returns {Promise<string>} The actual myshopify domain
 */
async function fetchShopifyDomain() {
    // First try to get domain from script parameters (faster and doesn't require API call)
    const scriptDomain = getShopifyDomainFromScript();
    if (scriptDomain) {
        console.log('🔍 Using Shopify domain from script:', scriptDomain);
        return scriptDomain;
    }

    // If script method fails, try API call
    try {
        const appDomain = getAppDomain();
        const apiUrl = `${appDomain}/api/store-info`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch store info: ${response.status}`);
        }

        const data = await response.json();
        return data.myshopifyDomain;
    } catch (error) {
        console.error('❌ Error fetching Shopify domain from API:', error);
        // Final fallback to current domain
        const fallbackDomain = window.location.hostname;
        console.warn('⚠️ Using fallback domain:', fallbackDomain);
        return fallbackDomain;
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
    // Return cached domain if available
    if (rv_cachedShopifyDomain) {
        return rv_cachedShopifyDomain.replace(/\./g, '_');
    }

    try {
        // Fetch actual Shopify domain from API
        const shopifyDomain = await fetchShopifyDomain();

        // Cache the domain for future use
        rv_cachedShopifyDomain = shopifyDomain;

        // Convert to Firebase format (replace dots with underscores)
        const sanitizedDomain = shopifyDomain.replace(/\./g, '_');

        return sanitizedDomain;
    } catch (error) {
        console.error('❌ Error getting store ID:', error);
        // Fallback to current domain
        const domain = window.location.hostname;
        const sanitizedDomain = domain.replace(/\./g, '_');
        console.warn('⚠️ Falling back to current domain:', domain);
        return sanitizedDomain;
    }
}

async function fetchABTestData() {
    try {
        const storeId = await getStoreId();
        const response = await fetch(`https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app/abTests/${storeId}.json`);
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
        const ip = getCookie('rv_finalDevId');
        if (!ip) {
            console.log('❌ No IP found in cookies for analytics');
            return;
        }

        const storeId = await getStoreId();
        const firebasePath = `abTests/${storeId}/${testId}/testGroups/${variantIndex}/analytics/${messageType}`;
        const analyticsUrl = `https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app/${firebasePath}.json`;

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

// Generic function to extract threshold value and unit from discount message
function extractThresholdInfo(message) {
    // Extract everything between 'Add' and 'more'
    const match = message.match(/Add\s+(.+?)\s*more/i);
    if (match) {
        const thresholdToAdd = match[1].trim();
        return { thresholdToAdd };
    }
    return { thresholdToAdd: '' };
}

// Function to determine event data based on state changes
function determineEventData(currentState, messageText, threshold, isControlGroup = false) {
    const timestamp = new Date().toISOString();

    if (isControlGroup) {
        // For control group, we just track item count and basic info
        return {
            currentItemCount: currentState,
            itemsToThreshold: "N/A",
            messageShown: "Control Group - No discount message",
            timestamp: timestamp,
        };
    }

    // Use the generic extraction for threshold info
    const { thresholdToAdd } = extractThresholdInfo(messageText);
    const hasMetThreshold = messageText.includes(`${threshold}+ items`) ||
        messageText.includes('off orders with') ||
        !messageText.includes('more');

    let itemsToThreshold = hasMetThreshold ? 0 : thresholdToAdd;

    return {
        currentItemCount: currentState,
        itemsToThreshold,
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

        // Guard: Do not add analytics if not on cart page and eventData is empty/zero
        if (
            eventData.currentItemCount === 0 &&
            eventData.itemsToThreshold === 0
        ) {
            console.log('🚫 Not on cart page or empty cart, skipping analytics.');
            return;
        }

        const ip = getCookie('rv_finalDevId');
        if (!ip) {
            console.log('❌ No IP found in cookies for analytics');
            return;
        }

        // Check if discount timer expired (skip analytics if expired)
        const discountStartTime = getCookie(`rv_tests_start_time_${testId}_discount_active`);
        if (discountStartTime) {
            try {
                const abTestsData = await fetchABTestData();
                const timerMinutes = parseInt(abTestsData?.[testId]?.discountConfig?.timerMinutes) || 30;
                const now = Date.now();
                const start = new Date(discountStartTime).getTime();
                if (now - start > (timerMinutes * 60 * 1000)) {
                    console.log('⏰ Discount timer expired, skipping analytics');
                    return;
                }
            } catch (e) {
                // Fallback to 30 minutes if any error
                const now = Date.now();
                const start = new Date(discountStartTime).getTime();
                if (now - start > 30 * 60 * 1000) {
                    console.log('⏰ Discount timer expired, skipping analytics');
                    return;
                }
            }
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
        const analyticsUrl = `https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app/${firebasePath}.json`;

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

// ===================================================================
// MISSING FUNCTION: You need to ADD this function to your file
// ===================================================================

// Function to track cart changes with progress bar - OPTIMIZED (no DB calls)


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
                    // Check if discount timer expired (skip analytics if expired)
                    const discountStartTime = getCookie(`rv_tests_start_time_${testId}_discount_active`);
                    if (discountStartTime) {
                        const timerMinutes = parseInt(test.discountConfig?.timerMinutes) || 30;
                        const now = Date.now();
                        const start = new Date(discountStartTime).getTime();
                        if (now - start > (timerMinutes * 60 * 1000)) {
                            console.log('⏰ Discount timer expired, skipping cart change analytics');
                            continue;
                        }
                    }
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
                if (mutation.target.id === 'rv-discount-timer' ||
                    mutation.target.id === 'rv-discount-timer-text' ||
                    (mutation.target.parentElement && mutation.target.parentElement.id === 'rv-discount-timer')) {
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
    function startObserving(retryCount = 0) {
        const cartDrawer = document.querySelector('cart-drawer');
        if (cartDrawer) {
            console.log('✅ Cart drawer found, starting observation for all groups');
            observer.observe(cartDrawer, {
                childList: true,
                characterData: true,
                subtree: true
            });
        } else {
            // NEW: Support for cart page
            const cartPage = document.querySelector('.cart__items');
            if (cartPage) {
                console.log('✅ Cart page found, starting observation for all groups');
                observer.observe(cartPage, {
                    childList: true,
                    characterData: true,
                    subtree: true
                });
            } else {
                if (retryCount >= 4) {
                    console.log('⏳ Cart drawer/page not found after 4 retries, will NOT retry again.');
                    return;
                }
                console.log('⏳ Cart drawer/page not found, will retry...');
                setTimeout(() => startObserving(retryCount + 1), 500);
            }
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

window.revlyfDiscount = {
    getTimeRemaining,
    formatTime,
    manageDiscountCountdown,
    observeCartChanges,
    trackUserBehaviorAnalytics
};
