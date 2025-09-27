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
        const discountMessage = findDiscountElement();
        if (!discountMessage) {
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
        timerDiv = document.createElement('div');
        timerDiv.id = 'rv-discount-timer';
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
        textSpan.id = 'rv-discount-timer-text';
        textSpan.style.flex = '1';
        timerDiv.appendChild(textSpan);

        discountMessage.insertAdjacentElement('afterend', timerDiv);
        console.log('✅ Timer UI inserted into DOM');
    }

    const textSpan = document.getElementById('rv-discount-timer-text');
    if (textSpan) {
        textSpan.textContent = `⚡ Hurry! This special offer expires in ${timeString}`;
        // console.log('✅ Timer text updated:', timeString);
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

// Function to remove progress bar UI
function removeProgressBarUI() {
    const progressBarDiv = document.getElementById('rv-top-progress-bar');
    if (progressBarDiv) {
        progressBarDiv.remove();
        console.log('🗑️ Progress bar UI removed');
    }
}

// Function to create or update visual progress bar UI (minimal, no text, flush at top)
function updateProgressBarUI(currentItems, threshold = 10) {
    console.log('🎯 updateProgressBarUI called:', { currentItems, threshold });

    let progressBarDiv = document.getElementById('rv-top-progress-bar');
    if (!progressBarDiv) {
        console.log('🔍 Progress bar not found, creating new one...');

        // Target cart drawer inner specifically to place bar above "Your cart" header
        const cartDrawerInner = document.querySelector('.drawer__inner[role="dialog"]');
        const cartHeader = cartDrawerInner ? cartDrawerInner.querySelector('.drawer__header') : null;
        console.log('🎯 Cart header found:', cartHeader);

        if (!cartHeader) {
            console.log('⚠️ Cart header not found, trying fallback selectors...');
            // Fallback: try other cart selectors
            const cartDrawer = document.querySelector('cart-drawer');
            const cartPage = document.querySelector('.cart__items');
            const productPage = document.querySelector('.product');

            console.log('🔍 Fallback elements:', { cartDrawer, cartPage, productPage });

            let targetElement = null;
            if (cartDrawer) {
                targetElement = cartDrawer;
                console.log('✅ Using cart drawer as target');
            } else if (cartPage) {
                targetElement = cartPage;
                console.log('✅ Using cart page as target');
            } else if (productPage) {
                targetElement = productPage;
                console.log('✅ Using product page as target');
            } else {
                console.log('❌ No suitable target found for progress bar');
                return; // No suitable target found
            }

            // Insert at the very top of fallback element
            progressBarDiv = document.createElement('div');
            progressBarDiv.id = 'rv-top-progress-bar';
            progressBarDiv.style.cssText = `
                width: 100%;
                height: 20px;
                background: #f0f0f0;
                border: 2px solid #ddd;
                border-radius: 12px;
                position: relative;
                overflow: hidden;
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
                margin: 8px 0;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            `;
            progressBarDiv.innerHTML = `
                <div id="rv-progress-bar-fill" style="
                    height: 100%; 
                    width: 0%; 
                    background: #3b82f6 !important; 
                    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); 
                    border-radius: 10px; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 10;
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                "></div>
            `;
            targetElement.insertAdjacentElement('afterbegin', progressBarDiv);
            console.log('✅ Progress bar inserted into fallback target');
        } else {
            console.log('✅ Cart drawer inner found, inserting progress bar just below header');
            // Insert progress bar just below the drawer__header (after the "Your cart" text)
            progressBarDiv = document.createElement('div');
            progressBarDiv.id = 'rv-top-progress-bar';
            progressBarDiv.style.cssText = `
                width: 100%;
                height: 20px;
                background: #f0f0f0;
                border: 2px solid #ddd;
                border-radius: 12px;
                position: relative;
                overflow: hidden;
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
                margin: 8px 0;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            `;
            progressBarDiv.innerHTML = `
                <div id="rv-progress-bar-fill" style="
                    height: 100%; 
                    width: 0%; 
                    background: #3b82f6 !important; 
                    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); 
                    border-radius: 10px; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 10;
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                "></div>
            `;
            // Insert right after the drawer__header
            cartHeader.insertAdjacentElement('afterend', progressBarDiv);
            console.log('✅ Progress bar inserted just below the cart header');
        }
    } else {
        console.log('✅ Progress bar already exists, updating...');
    }

    // Calculate progress
    const percent = Math.min(Math.round((currentItems / threshold) * 100), 100);
    const fill = document.getElementById('rv-progress-bar-fill');

    console.log('📊 Progress calculation:', { 
        currentItems, 
        threshold, 
        calculation: `${currentItems}/${threshold} * 100`,
        percent 
    });

    if (!fill) {
        console.log('❌ Progress bar fill element not found, trying to recreate...');
        // Try to recreate the fill element
        const progressBarDiv = document.getElementById('rv-top-progress-bar');
        if (progressBarDiv) {
            progressBarDiv.innerHTML = `
                <div id="rv-progress-bar-fill" style="
                    height: 100%; 
                    width: 0%; 
                    background: #3b82f6 !important; 
                    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); 
                    border-radius: 10px; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 10;
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                "></div>
            `;
            console.log('✅ Progress bar fill element recreated');
        } else {
            console.log('❌ Progress bar container not found either');
            return;
        }
    }

    // Get the fill element again after potential recreation
    const fillElement = document.getElementById('rv-progress-bar-fill');
    if (!fillElement) {
        console.log('❌ Still cannot find progress bar fill element');
        return;
    }

    // Update progress bar width
    fillElement.style.width = percent + '%';
    
    // Force visibility properties to override any CSS conflicts
    fillElement.style.display = 'block !important';
    fillElement.style.visibility = 'visible !important';
    fillElement.style.opacity = '1 !important';
    
    console.log('🎨 Progress bar updated:', { width: percent + '%', percent });

    // Blue fill based on progress percentage
    const fillColor = '#3b82f6'; // Always blue for any progress
    
    fillElement.style.background = fillColor;

    console.log('🌈 Color updated:', { background: fillElement.style.background, percent });
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

// Function to get cart value (total price)
function getCartValue() {
    // Try multiple selectors to find subtotal
    const selectors = [
        '.cart__subtotal .money',
        '.cart-subtotal',
        '[data-cart-subtotal]',
        '.subtotal',
        '.cart__subtotal',
        '.cart-subtotal-price',
        '.cart-total',
        '.total-price',
        '.money',
        // More specific selectors for cart drawer
        '.drawer__inner .subtotal',
        '.drawer__inner .cart__subtotal',
        '.drawer__inner .money',
        // Look for elements with price patterns
        '*[class*="subtotal"]',
        '*[class*="total"]',
        '*[class*="price"]'
    ];
    
    let subtotalElement = null;
    let usedSelector = '';
    
    for (const selector of selectors) {
        subtotalElement = document.querySelector(selector);
        if (subtotalElement) {
            usedSelector = selector;
            break;
        }
    }
    
    if (subtotalElement) {
        const text = subtotalElement.textContent || subtotalElement.innerText;
        console.log('💰 Found subtotal element using selector:', usedSelector, 'Text:', text);
        
        // Extract number from text like "$729.95 AUD" or "$729.95"
        const match = text.match(/[\d,]+\.?\d*/);
        if (match) {
            const value = parseFloat(match[0].replace(',', ''));
            console.log('💰 Cart value:', value, 'from text:', text);
            return value;
        }
    }
    
    // Fallback 1: Look for elements containing "Subtotal" text
    const allElements = document.querySelectorAll('*');
    for (const element of allElements) {
        // Skip style, script, and other non-content elements
        if (element.tagName === 'STYLE' || element.tagName === 'SCRIPT' || 
            element.tagName === 'META' || element.tagName === 'LINK') {
            continue;
        }
        
        const text = element.textContent || element.innerText;
        if (text && text.includes('Subtotal') && text.includes('$') && text.includes('AUD')) {
            console.log('💰 Found subtotal element:', element, 'Text:', text);
            // Look for the price pattern in the text
            const priceMatch = text.match(/\$([\d,]+\.?\d*)\s*AUD/);
            if (priceMatch) {
                const value = parseFloat(priceMatch[1].replace(',', ''));
                console.log('💰 Cart value (subtotal fallback):', value);
                return value;
            }
        }
    }
    
    // Fallback 2: Look for any element containing price patterns
    for (const element of allElements) {
        // Skip style, script, and other non-content elements
        if (element.tagName === 'STYLE' || element.tagName === 'SCRIPT' || 
            element.tagName === 'META' || element.tagName === 'LINK') {
            continue;
        }
        
        const text = element.textContent || element.innerText;
        // Look for various price patterns
        const pricePatterns = [
            /\$([\d,]+\.?\d*)\s*AUD/,  // $4,394.30 AUD
            /\$([\d,]+\.?\d*)/,        // $4,394.30
            /([\d,]+\.?\d*)\s*AUD/     // 4,394.30 AUD
        ];
        
        for (const pattern of pricePatterns) {
            if (text && pattern.test(text) && 
                !text.includes('@property') && !text.includes('syntax:') &&
                text.length < 1000) { // Avoid very long text (likely CSS/JS)
                console.log('💰 Found price in fallback element:', element, 'Text:', text);
                const match = text.match(pattern);
                if (match) {
                    const value = parseFloat(match[1].replace(',', ''));
                    console.log('💰 Cart value (price fallback):', value);
                    return value;
                }
            }
        }
    }
    
    console.log('💰 No cart value found');
    return 0;
}

// Function to extract cart information
function getCartInfo() {
    // Try multiple selectors to find cart items
    const selectors = [
        '.cart-item',
        '[data-cart-item]',
        '.cart__item',
        '.line-item',
        '.cart-line-item'
    ];
    
    let cartItems = [];
    let usedSelector = '';
    
    for (const selector of selectors) {
        cartItems = document.querySelectorAll(selector);
        if (cartItems.length > 0) {
            usedSelector = selector;
            break;
        }
    }
    
    let totalItems = 0;

    console.log('🔍 Found cart items using selector:', usedSelector, 'Count:', cartItems.length);
    
    cartItems.forEach((item, index) => {
        // Try multiple quantity input selectors
        const quantitySelectors = [
            '.quantity__input',
            'input[type="number"]',
            '.quantity-input',
            'input[name*="quantity"]',
            'input[data-quantity]'
        ];
        
        let quantityInput = null;
        for (const qSelector of quantitySelectors) {
            quantityInput = item.querySelector(qSelector);
            if (quantityInput) break;
        }
        
        console.log(`Item ${index}:`, item, 'Quantity input:', quantityInput);
        if (quantityInput) {
            const quantity = parseInt(quantityInput.value) || 0;
            totalItems += quantity;
            console.log(`Item ${index} quantity:`, quantity);
        } else {
            console.log(`Item ${index}: No quantity input found`);
        }
    });

    console.log('🛒 Total cart items:', totalItems);
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
            const currentCartValue = getCartValue();
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

                    // Update progress bar UI for test groups (not control group)
                    if (!isControlGroup) {
                        // Calculate actual threshold from discount message
                        const discountMessage = document.querySelector('.discounts__discount');
                        const messageText = discountMessage ? discountMessage.textContent.trim() : "";
                        console.log('📝 Discount message text:', messageText);
                        
                        const { thresholdToAdd } = extractThresholdInfo(messageText);
                        console.log('🔢 Extracted threshold to add:', thresholdToAdd);
                        
                        // Check if threshold is based on value or quantity
                        // If threshold is a large number (> 10), it's likely a value threshold
                        const isValueThreshold = threshold > 10;
                        
                        let actualThreshold;
                        let currentValue;
                        
                        if (isValueThreshold) {
                            // Use cart value for threshold calculation
                            currentValue = currentCartValue;
                            actualThreshold = threshold; // Use the configured threshold directly
                            console.log('💰 Using VALUE-based threshold');
                        } else {
                            // Use cart quantity for threshold calculation
                            currentValue = currentItemCount;
                            actualThreshold = currentItemCount + (parseInt(thresholdToAdd) || 0);
                            console.log('🔢 Using QUANTITY-based threshold');
                        }
                        
                        console.log('🎯 Progress bar threshold calculation:', {
                            currentItemCount,
                            currentCartValue,
                            currentValue,
                            thresholdToAdd,
                            parsedThresholdToAdd: parseInt(thresholdToAdd) || 0,
                            actualThreshold,
                            originalThreshold: threshold,
                            isValueThreshold,
                            messageText
                        });
                        
                        updateProgressBarUI(currentValue, actualThreshold);
                    }

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

// Manual test function for debugging progress bar
window.testProgressBar = function (testItems = 5, testThreshold = 10) {
    console.log('🧪 Testing progress bar with:', { testItems, testThreshold });
    
    // Force remove existing progress bar first
    removeProgressBarUI();
    
    // Wait a bit then create new one
    setTimeout(() => {
        updateProgressBarUI(testItems, testThreshold);
        
        // Test different progress levels
        setTimeout(() => {
            console.log('🧪 Testing 25% progress...');
            updateProgressBarUI(2, 8);
        }, 1000);

        setTimeout(() => {
            console.log('🧪 Testing 50% progress...');
            updateProgressBarUI(4, 8);
        }, 2000);

        setTimeout(() => {
            console.log('🧪 Testing 75% progress...');
            updateProgressBarUI(6, 8);
        }, 3000);

        setTimeout(() => {
            console.log('🧪 Testing 100% progress...');
            updateProgressBarUI(8, 8);
        }, 4000);
    }, 100);
};

// Test function specifically for cart drawer structure
window.testCartDrawerProgressBar = function () {
    console.log('🧪 Testing cart drawer progress bar...');
    const cartDrawerInner = document.querySelector('.drawer__inner[role="dialog"]');
    console.log('🎯 Cart drawer inner found:', cartDrawerInner);

    if (cartDrawerInner) {
        console.log('✅ Cart drawer structure detected, testing progress bar...');
        updateProgressBarUI(3, 10);
    } else {
        console.log('❌ Cart drawer not found. Make sure cart is open.');
    }
};

// Debug function to check progress bar state
window.debugProgressBar = function() {
    const progressBar = document.getElementById('rv-top-progress-bar');
    const fill = document.getElementById('rv-progress-bar-fill');
    
    console.log('🔍 Progress Bar Debug Info:');
    console.log('Progress Bar Container:', progressBar);
    console.log('Progress Bar Fill:', fill);
    
    if (progressBar) {
        const computedStyle = window.getComputedStyle(progressBar);
        console.log('Container Styles:', progressBar.style.cssText);
        console.log('Container Computed Styles:', computedStyle);
        console.log('Container Display:', computedStyle.display);
        console.log('Container Visibility:', computedStyle.visibility);
        console.log('Container Opacity:', computedStyle.opacity);
        console.log('Container Position:', computedStyle.position);
        console.log('Container Z-Index:', computedStyle.zIndex);
        
        // Check if element is actually visible
        const rect = progressBar.getBoundingClientRect();
        console.log('Container Bounding Rect:', rect);
        console.log('Container Visible:', rect.width > 0 && rect.height > 0);
    }
    
    if (fill) {
        const computedStyle = window.getComputedStyle(fill);
        console.log('Fill Styles:', fill.style.cssText);
        console.log('Fill Computed Styles:', computedStyle);
        console.log('Fill Width:', fill.style.width);
        console.log('Fill Background:', fill.style.background);
        console.log('Fill Display:', computedStyle.display);
        console.log('Fill Visibility:', computedStyle.visibility);
        console.log('Fill Opacity:', computedStyle.opacity);
        
        // Check if element is actually visible
        const rect = fill.getBoundingClientRect();
        console.log('Fill Bounding Rect:', rect);
        console.log('Fill Visible:', rect.width > 0 && rect.height > 0);
    }
    
    // Check cart items
    const cartItems = document.querySelectorAll('[data-cart-item]');
    console.log('Cart Items Found:', cartItems.length);
    
    return {
        progressBar,
        fill,
        cartItemsCount: cartItems.length
    };
};

// Force progress bar to show with color - emergency function
window.forceProgressBar = function(percent = 50) {
    console.log('🚨 Force Progress Bar with', percent + '%');
    
    // Remove existing progress bar
    removeProgressBarUI();
    
    // Wait a bit then create new one
    setTimeout(() => {
        // Create progress bar container
        const progressBarDiv = document.createElement('div');
        progressBarDiv.id = 'rv-top-progress-bar';
        progressBarDiv.style.cssText = `
            width: 100%;
            height: 20px;
            background: #f0f0f0;
            border: 2px solid #ddd;
            border-radius: 12px;
            position: relative;
            overflow: hidden;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
            margin: 8px 0;
            z-index: 1000;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;
        
        // Create fill element
        const fillDiv = document.createElement('div');
        fillDiv.id = 'rv-progress-bar-fill';
        // Always blue for any progress
        const fillColor = '#3b82f6';
        
        fillDiv.style.cssText = `
            height: 100%;
            width: ${percent}%;
            background: ${fillColor} !important;
            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            position: absolute;
            top: 0;
            left: 0;
            z-index: 10;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;
        
        progressBarDiv.appendChild(fillDiv);
        
        // Try to insert into cart
        const cartDrawerInner = document.querySelector('.drawer__inner[role="dialog"]');
        const cartHeader = cartDrawerInner ? cartDrawerInner.querySelector('.drawer__header') : null;
        
        if (cartHeader) {
            cartHeader.insertAdjacentElement('afterend', progressBarDiv);
            console.log('✅ Force progress bar inserted after cart header');
        } else {
            // Fallback - insert at top of body
            document.body.insertAdjacentElement('afterbegin', progressBarDiv);
            console.log('✅ Force progress bar inserted at top of body');
        }
        
        console.log('🎨 Force progress bar created with', percent + '% width and colorful gradient');
    }, 100);
};

// Quick visibility check function
window.checkProgressBarVisibility = function() {
    const progressBar = document.getElementById('rv-top-progress-bar');
    const fill = document.getElementById('rv-progress-bar-fill');
    
    if (progressBar) {
        const rect = progressBar.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(progressBar);
        
        console.log('🔍 Progress Bar Visibility Check:');
        console.log('Container Display:', computedStyle.display);
        console.log('Container Visibility:', computedStyle.visibility);
        console.log('Container Opacity:', computedStyle.opacity);
        console.log('Container Position:', computedStyle.position);
        console.log('Container Z-Index:', computedStyle.zIndex);
        console.log('Container Bounding Rect:', rect);
        console.log('Container Visible:', rect.width > 0 && rect.height > 0);
        console.log('Container Parent:', progressBar.parentElement);
        
        // Check if parent is visible
        if (progressBar.parentElement) {
            const parentRect = progressBar.parentElement.getBoundingClientRect();
            const parentStyle = window.getComputedStyle(progressBar.parentElement);
            console.log('Parent Display:', parentStyle.display);
            console.log('Parent Visibility:', parentStyle.visibility);
            console.log('Parent Opacity:', parentStyle.opacity);
            console.log('Parent Bounding Rect:', parentRect);
        }
    }
    
    if (fill) {
        const rect = fill.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(fill);
        
        console.log('Fill Display:', computedStyle.display);
        console.log('Fill Visibility:', computedStyle.visibility);
        console.log('Fill Opacity:', computedStyle.opacity);
        console.log('Fill Bounding Rect:', rect);
        console.log('Fill Visible:', rect.width > 0 && rect.height > 0);
    }
};

// Fix display issue function
window.fixProgressBarDisplay = function() {
    const fill = document.getElementById('rv-progress-bar-fill');
    if (fill) {
        // Force display properties
        fill.style.setProperty('display', 'block', 'important');
        fill.style.setProperty('visibility', 'visible', 'important');
        fill.style.setProperty('opacity', '1', 'important');
        
        console.log('🔧 Fixed progress bar fill display properties');
        console.log('Fill Display:', window.getComputedStyle(fill).display);
        console.log('Fill Visible:', window.getComputedStyle(fill).visibility);
        console.log('Fill Opacity:', window.getComputedStyle(fill).opacity);
    } else {
        console.log('❌ Progress bar fill element not found');
    }
};

// Test function to manually set progress bar with correct values
window.testProgressBarWithValues = function() {
    console.log('🧪 Testing progress bar with manual values...');
    
    // Remove existing progress bar
    removeProgressBarUI();
    
    // Wait a bit then create with correct values
    setTimeout(() => {
        // Based on your cart: $729.95 out of $1200 threshold
        const currentValue = 729.95;
        const threshold = 1200;
        const percent = Math.round((currentValue / threshold) * 100);
        
        console.log('🧪 Manual test values:', { currentValue, threshold, percent });
        
        // Create progress bar container
        const progressBarDiv = document.createElement('div');
        progressBarDiv.id = 'rv-top-progress-bar';
        progressBarDiv.style.cssText = `
            width: 100%;
            height: 20px;
            background: #f0f0f0;
            border: 2px solid #ddd;
            border-radius: 12px;
            position: relative;
            overflow: hidden;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
            margin: 8px 0;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            z-index: 1000;
        `;
        
        // Create fill element
        const fillDiv = document.createElement('div');
        fillDiv.id = 'rv-progress-bar-fill';
        fillDiv.style.cssText = `
            height: 100%;
            width: ${percent}%;
            background: #3b82f6 !important;
            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            position: absolute;
            top: 0;
            left: 0;
            z-index: 10;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;
        
        progressBarDiv.appendChild(fillDiv);
        
        // Try to insert into cart
        const cartDrawerInner = document.querySelector('.drawer__inner[role="dialog"]');
        const cartHeader = cartDrawerInner ? cartDrawerInner.querySelector('.drawer__header') : null;
        
        if (cartHeader) {
            cartHeader.insertAdjacentElement('afterend', progressBarDiv);
            console.log('✅ Test progress bar inserted after cart header');
        } else {
            // Fallback - insert at top of body
            document.body.insertAdjacentElement('afterbegin', progressBarDiv);
            console.log('✅ Test progress bar inserted at top of body');
        }
        
        console.log('🎨 Test progress bar created with', percent + '% width and blue fill');
    }, 100);
};

// Export functions
window.revlyfDiscount = {
    getTimeRemaining,
    formatTime,
    manageDiscountCountdown,
    observeCartChanges,
    trackUserBehaviorAnalytics,
    updateProgressBarUI,
    removeProgressBarUI,
    debugProgressBar,
    forceProgressBar,
    checkProgressBarVisibility,
    fixProgressBarDisplay,
    testProgressBarWithValues
};