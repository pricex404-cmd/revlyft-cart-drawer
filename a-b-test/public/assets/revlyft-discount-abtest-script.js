// Function to get time remaining in minutes and seconds
// Get hashValue from sessionStorage or cookies
let hashValue = null;
if (window.sessionStorage && window.sessionStorage.getItem('rv_hashValue')) {
    hashValue = window.sessionStorage.getItem('rv_hashValue');
} else {
    hashValue = getCookie('rv_hashValue');
}

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

// Function to create or update timer UI
function updateTimerUI(timeString, timerExpired = false, retryCount = 0) {
    if (window.rv_DiscountMessageRetryLimitReached) {
        return;
    }
    // console.log('🔄 Updating timer UI');
    let timerDiv = document.getElementById('rv-discount-timer');

    if (!timerDiv) {
        const cartHeaderContainer = document.querySelector('cart-drawer .drawer__header, .drawer__header');
        const discountMessage = findDiscountElement();
        if (!cartHeaderContainer && !discountMessage) {
            if (timerExpired) {
                console.log('⏳ No discount message found and timer expired, will NOT retry.');
                return;
            }
            // Limit retries to 4
            if (retryCount >= 4) {
                console.log('⏳ No discount message found after 4 retries, will NOT retry again.');
                window.rv_DiscountMessageRetryLimitReached = true;
                return;
            }
            console.log('⏳ No discount message found, will retry...');
            setTimeout(() => updateTimerUI(timeString, timerExpired, retryCount + 1), 500);
            return;
        }

        console.log('✅ Creating new timer UI');
        // Ensure a block just BELOW the header so header stays on its own line
        let offerBlock = null;
        if (cartHeaderContainer) {
            offerBlock = document.getElementById('rv-offer-block');
            if (!offerBlock) {
                offerBlock = document.createElement('div');
                offerBlock.id = 'rv-offer-block';
                offerBlock.style.cssText = `
                    width: 100%;
                    display: block;
                    margin: 12px 0;
                    padding: 8px 10px;
                    background: rgba(0,0,0,0.02);
                    border: 1px solid rgba(0,0,0,0.06);
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                `;
                cartHeaderContainer.insertAdjacentElement('afterend', offerBlock);
            }
        }
        timerDiv = document.createElement('div');
        timerDiv.id = 'rv-discount-timer';
        timerDiv.style.cssText = `
            margin: 10px 0;
            padding: 8px 12px;
            background-color: #fff8e6;
            border: 1px solid #ffd700;
            border-radius: 14px;
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
            font-size: 1.4em;
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
        textSpan.id = 'rv-discount-timer-text';
        textSpan.style.flex = '1';
        textSpan.style.fontSize = '1.2rem';
        textSpan.style.fontWeight = '600';
        timerDiv.appendChild(textSpan);

        if (offerBlock) {
            offerBlock.insertAdjacentElement('beforeend', timerDiv);
        } else if (discountMessage) {
            discountMessage.insertAdjacentElement('afterend', timerDiv);
        }
        console.log('✅ Timer UI inserted into DOM');
    }

    const textSpan = document.getElementById('rv-discount-timer-text');
    if (textSpan) {
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

        const boxStyle = `display:inline-block;padding:4px 12px;border:1px solid #ffd089;background:#fff;border-radius:10px;min-width:54px;text-align:center;color:#b91c1c;font-weight:700;box-shadow:0 1px 2px rgba(0,0,0,0.07);font-variant-numeric: tabular-nums;`;
        const sepStyle = `display:inline-block;margin:0 8px;color:#b91c1c;font-weight:700;`;
        const wrapStyle = `display:inline-flex;align-items:center;gap:8px;margin-top:10px;`;
        textSpan.innerHTML = `⚡ Hurry! This special offer expires in <span style="display:block"></span><span class="rv-time-wrap" style="${wrapStyle}"><span style="${boxStyle}">${minutes}m</span><span style="${sepStyle}">:</span><span style="${boxStyle}">${seconds}s</span></span>`;
    }
}

// Function to remove timer UI only (not the cookie)
function removeTimerUI() {
    const timerDiv = document.getElementById('rv-discount-timer');
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
function trackCartChangeWithProgressBar() {
    try {
        console.log('🔄 Tracking cart change with progress bar logic');

        // Get current cart info from DOM
        const currentItemCount = getCartInfo();
        const currentCartValue = getCartValue();

        // Find discount message in DOM
        const discountMessage = document.querySelector('.discounts__discount');
        if (!discountMessage) {
            console.log('❌ No discount message found - removing progress bar');
            removeProgressBarUI();
            return;
        }

        const messageText = discountMessage.textContent.trim();
        console.log('✅ Discount message found:', messageText);

        // Check if discount is already applied (shows "off orders over" with actual discount)
       
        const isDiscountApplied = messageText.includes('off orders with')||messageText.includes('off orders over');
        console.log("isDiscountApplied",isDiscountApplied,messageText)
        if (isDiscountApplied) {
            console.log('✅ Discount already applied - showing 100% progress bar');
            renderProgressBarUI(100);
            return;
        }
console.log("aaaa")
        // Check if it's an "Add more" message (value-based or quantity-based)
        const isValueBased = messageText.includes('Add Rs') && messageText.includes('more to get');
        const isQuantityBased = messageText.includes('Add') && (messageText.includes('more items') || messageText.includes('more item')) && messageText.includes('to get');
        
        if (isValueBased) {
            console.log('✅ Value-based "Add more" message - calculating progress from DOM');
            
            // Extract the amount needed to add from the message
            const amountToAddInCart = messageText.match(/Add Rs ([\d,.]+) more/);
            
            if (amountToAddInCart && currentCartValue > 0) {
                const amountToAdd = extractPriceFromText(amountToAddInCart[1]);
                const targetThreshold = currentCartValue + amountToAdd;
                
                // Calculate progress percentage - how much of the threshold we've reached
                const progressPercent = Math.min(Math.round((currentCartValue / targetThreshold) * 100), 100);

                console.log('💰 Value-based progress calculation from DOM:', {
                    currentCartValue,
                    amountToAdd,
                    targetThreshold,
                    progressPercent,
                    calculation: `(${currentCartValue} / ${targetThreshold}) * 100 = ${progressPercent}%`,
                    remaining: `${targetThreshold - currentCartValue} more needed`
                });

                renderProgressBarUI(progressPercent);
            } else {
                console.log('❌ Could not extract amount or cart value is 0');
                removeProgressBarUI();
            }
        } else if (isQuantityBased) {
            console.log('✅ Quantity-based "Add more" message - calculating progress from DOM');
            
            // Extract the number of items needed to add from the message (handles both singular and plural)
            const quantityToAddInCart = messageText.match(/Add (\d+) more items?/);
            
            if (quantityToAddInCart && currentItemCount > 0) {
                const itemsToAdd = parseInt(quantityToAddInCart[1]);
                const targetThreshold = currentItemCount + itemsToAdd;
                
                // Calculate progress percentage - how much of the threshold we've reached
                const progressPercent = Math.min(Math.round((currentItemCount / targetThreshold) * 100), 100);

                console.log('🔢 Quantity-based progress calculation from DOM:', {
                    currentItemCount,
                    itemsToAdd,
                    targetThreshold,
                    progressPercent,
                    calculation: `(${currentItemCount} / ${targetThreshold}) * 100 = ${progressPercent}%`,
                    remaining: `${targetThreshold - currentItemCount} more items needed`
                });

                renderProgressBarUI(progressPercent);
            } else {
                console.log('❌ Could not extract quantity or cart items is 0');
                removeProgressBarUI();
            }
        } else {
            console.log('❌ No relevant discount message - removing progress bar');
            removeProgressBarUI();
        }

    } catch (error) {
        console.error('❌ Error in cart change tracking with progress bar:', error);
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




// FIXED getCartValue function - updated selectors for your cart structure
function getCartValue() {
    try {
        console.log('🔍 Attempting to get cart value...');

        // Updated selectors based on your cart structure
        const selectors = [
            '.totals__subtotal-value',  // This is from your HTML: <p class="totals__subtotal-value">Rs. 11,679.20</p>
            '.cart-drawer__footer .totals__subtotal-value',
            '.drawer__footer .totals__subtotal-value',
            '.cart__footer .totals__total .money',
            '.cart__total .money',
            '[data-cart-total]'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            console.log(`🔍 Checking selector: "${selector}"`, element ? '✅ Found!' : '❌ Not found');
            if (element) {
                const text = element.textContent.trim();
                console.log('📝 Element text:', text);
                // Extract numeric value from text like "Rs. 11,679.20"
                const match = text.match(/[\d,]+\.?\d*/);
                if (match) {
                    const value = parseFloat(match[0].replace(/,/g, ''));
                    console.log('✅ Cart value found:', value);
                    return value;
                }
            }
        }

        // Fallback: try to get from cart data
        if (window.cart && window.cart.total_price) {
            const value = window.cart.total_price / 100; // Convert from cents
            console.log('✅ Cart value from window.cart:', value);
            return value;
        }

        console.log('❌ No cart value found, returning 0');
        return 0;
    } catch (error) {
        console.error('❌ Error getting cart value:', error);
        return 0;
    }
}

// SIMPLIFIED renderProgressBarUI function - ONLY renders progress bar with percentage
function renderProgressBarUI(progressPercent) {
    console.log('🎨 Rendering progress bar:', { progressPercent });

    let progressBarDiv = document.getElementById('rv-progress-bar');

    if (!progressBarDiv) {
        // Prefer placing elements inside the offer block just below header; otherwise after discount message
        const offerBlock = document.getElementById('rv-offer-block');
        const cartHeaderHeading = document.querySelector('cart-drawer .drawer__header .drawer__heading, .drawer__header .drawer__heading');
        const cartHeaderContainer = cartHeaderHeading ? cartHeaderHeading.closest('.drawer__header') : null;
        const discountMessage = document.querySelector('.discounts__discount');
        const timerEl = document.getElementById('rv-discount-timer');
        const insertionTarget = offerBlock || timerEl || cartHeaderContainer || discountMessage || cartHeaderHeading;
        if (!insertionTarget) {
            console.log('❌ No suitable insertion target (header/discount message) found for progress bar');
            return;
        }

        // Ensure a progress text element exists just above the bar
        let progressTextDiv = document.getElementById('rv-progress-text');
        if (!progressTextDiv) {
            progressTextDiv = document.createElement('div');
            progressTextDiv.id = 'rv-progress-text';
            progressTextDiv.style.cssText = `
                width: 100%;
                margin: 10px 0 8px 0;
                font-size: 1em;
                line-height: 1.2;
                color: #1f2937;
                font-weight: 400;
                text-align: center;
                letter-spacing: .2px;
                display: block !important;
            `;
            // Use custom marketing copy instead of the raw discount message
            progressTextDiv.textContent = 'Bigger Cart, Bigger Offer';
            if (offerBlock) {
                offerBlock.insertAdjacentElement('beforeend', progressTextDiv);
            } else if (timerEl) {
                timerEl.insertAdjacentElement('afterend', progressTextDiv);
            } else {
                insertionTarget.insertAdjacentElement('afterend', progressTextDiv);
            }
        } else if (timerEl && progressTextDiv.previousElementSibling !== timerEl) {
            // If timer exists, ensure text sits right after it
            timerEl.insertAdjacentElement('afterend', progressTextDiv);
        }

        // Create progress bar element
        progressBarDiv = document.createElement('div');
        progressBarDiv.id = 'rv-progress-bar';
        progressBarDiv.style.cssText = `
            width: 100%;
            height: 20px;
            background: #f0f0f0;
            border: 2px solid #ddd;
            border-radius: 12px;
            position: relative;
            overflow: hidden;
            margin: 6px 0 10px 0;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;

        const fillDiv = document.createElement('div');
        fillDiv.id = 'rv-progress-bar-fill';
        fillDiv.style.cssText = `
            height: 100%;
            width: 0%;
            background: #3b82f6;
            transition: width 0.6s ease;
            border-radius: 10px;
            position: absolute;
            top: 0;
            left: 0;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;

        progressBarDiv.appendChild(fillDiv);
        const anchorForBar = document.getElementById('rv-progress-text') || insertionTarget;
        if (offerBlock) {
            offerBlock.insertAdjacentElement('beforeend', progressBarDiv);
        } else {
            anchorForBar.insertAdjacentElement('afterend', progressBarDiv);
        }
        console.log('✅ Progress bar created and inserted');
    }

    // Update progress bar with the given percentage
    const fillElement = document.getElementById('rv-progress-bar-fill');
    if (fillElement) {
        // Set width
        fillElement.style.width = progressPercent + '%';
        console.log('📏 Progress bar width set to:', progressPercent + '%');

        // Set color based on progress
        let fillColor;
        if (progressPercent >= 100) {
            fillColor = '#10b981'; // Green for completion
        } else if (progressPercent >= 75) {
            fillColor = '#f59e0b'; // Orange for high progress  
        } else if (progressPercent > 0) {
            fillColor = '#3b82f6'; // Blue for normal progress
        } else {
            fillColor = '#ef4444'; // Red for 0% progress
        }

        // Apply color with !important to override any existing styles
        fillElement.style.setProperty('background', fillColor, 'important');
        fillElement.style.setProperty('background-color', fillColor, 'important');

        console.log('🎨 Progress bar updated:', {
            width: progressPercent + '%',
            color: fillColor
        });
    }
}

// Function to extract price from text (e.g., "500.10" from "Rs. 500.10")
function extractPriceFromText(priceText) {
    try {
        console.log('🔍 Extracting price from text:', priceText);
        // Remove currency symbols and spaces, but keep decimal points
        const cleanText = priceText.replace(/[Rs,\s]/g, '');
        console.log('🧹 Cleaned text:', cleanText);
        const price = parseFloat(cleanText);
        console.log('💰 Parsed price:', price);
        return isNaN(price) ? 0 : price;
    } catch (error) {
        console.error('❌ Error extracting price from text:', priceText, error);
        return 0;
    }
}

// Function to remove progress bar UI
function removeProgressBarUI() {
    const progressBarDiv = document.getElementById('rv-progress-bar');
    if (progressBarDiv) {
        progressBarDiv.remove();
        console.log('🗑️ Progress bar UI removed');
    }
    const progressTextDiv = document.getElementById('rv-progress-text');
    if (progressTextDiv) {
        progressTextDiv.remove();
        console.log('🗑️ Progress text removed');
    }
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
                    await trackCartChangeWithProgressBar();
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
