// Function to check if required parameters are present
function checkRequiredParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const priceTagging = urlParams.get('price_tagging') || sessionStorage.getItem('price_tagging');
    const source = urlParams.get('source') || sessionStorage.getItem('source');

    return priceTagging === 'true' && source === 'ab_test';
}

// Only execute if required parameters are present
if (checkRequiredParameters()) {
    // Add hover highlight style
    const hoverStyle = document.createElement('style');
    hoverStyle.innerHTML = `
/* Base styles for the hover highlight effect */
.hover-highlight {
    outline: 2px solid #4CAF50 !important;
    outline-offset: -2px !important;
    cursor: pointer !important;
    pointer-events: auto !important;
    position: relative !important;
    z-index: 999 !important;
}

/* Style for elements that already have selectors in DB */
.already-stored {
    outline: 2px solid #FFA500 !important;
    outline-offset: -2px !important;
    position: relative !important;
    z-index: 999 !important;
}

.already-stored::after {
    content: '✓';
    position: absolute;
    top: -10px;
    right: -10px;
    background: #FFA500;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
}

/* Modal overlay styles - covers the entire screen when active */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: none; /* Start hidden */
    justify-content: center;
    align-items: center;
    z-index: 999999;
    opacity: 1;
    visibility: visible;
}

/* Modal content container styles */
.modal-content {
    background: #ffffff;
    padding: 25px;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    border: 1px solid #e0e0e0;
    position: relative;
    transform: translateY(0);
    opacity: 1;
}

/* Modal heading styles */
.modal-content h3 {
    color: #333;
    margin: 0 0 15px 0;
    font-size: 20px;
    font-weight: 600;
}

/* Modal paragraph text styles */
.modal-content p {
    color: #666;
    margin: 0 0 20px 0;
    font-size: 16px;
    line-height: 1.5;
}

/* Container for modal action buttons */
.modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
}

/* Base styles for modal buttons */
.modal-button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    font-size: 14px;
    transition: all 0.2s ease;
}

/* Hover effect for modal buttons */
.modal-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

/* Styles for the 'Yes' button */
.modal-button.yes {
    background: #4CAF50;
    color: white;
}

/* Hover effect for 'Yes' button */
.modal-button.yes:hover {
    background: #45a049;
}

/* Styles for the 'No' button */
.modal-button.no {
    background: #f44336;
    color: white;
}

/* Hover effect for 'No' button */
.modal-button.no:hover {
    background: #da190b;
}

/* Selector Widget Styles */
/* Main widget container - fixed to bottom right of screen */
.selector-widget {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    width: 300px;
    z-index: 999998;
    pointer-events: auto;
}

/* Ensure all widget elements handle their own events */
.selector-widget * {
    pointer-events: auto;
}

/* Prevent widget elements from being highlighted */
.selector-widget * {
    outline: none !important;
    cursor: default !important;
}

/* Widget header styles */
.selector-widget-header {
    background: #4CAF50;
    color: white;
    padding: 10px 15px;
    border-radius: 8px 8px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
}

/* Widget title styles */
.selector-widget-header h3 {
    margin: 0;
    font-size: 16px;
}

/* Widget content area - scrollable when expanded */
.selector-widget-content {
    max-height: 300px;
    overflow-y: auto;
    padding: 15px;
    display: none;
}

/* Show content when widget is expanded */
.selector-widget.expanded .selector-widget-content {
    display: block;
}

/* List of selectors container */
.selector-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

/* Individual selector item styles */
.selector-item {
    padding: 8px 35px 8px 8px;
    border-bottom: 1px solid #eee;
    font-size: 12px;
    word-break: break-all;
    cursor: default;
    font-family: monospace;
    position: relative;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

/* Type indicator badge styles */
.selector-item-type {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    margin-right: 8px;
    flex-shrink: 0;
}

/* Price type indicator styles */
.selector-item-type.price {
    background: #e3f2fd;
    color: #1976d2;
}

/* Other type indicator styles */
.selector-item-type.other {
    background: #f3e5f5;
    color: #7b1fa2;
}

/* Timestamp display styles */
.selector-item-timestamp {
    display: block;
    font-size: 10px;
    color: #666;
    margin-top: 4px;
}

/* Toggle button styles */
.toggle-button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 20px;
    padding: 0;
    line-height: 1;
}

/* Delete button styles */
.selector-delete {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #f44336;
    cursor: pointer;
    font-size: 20px;
    padding: 0;
    opacity: 0.7;
    width: 24px;
    height: 24px;
    line-height: 20px;
    text-align: center;
    flex-shrink: 0;
    z-index: 1;
}

.selector-delete:hover {
    opacity: 1;
}

/* Remove border from last item */
.selector-item:last-child {
    border-bottom: none;
}

/* New styles for selector mode */
.cf-selector-mode * {
    pointer-events: auto !important;
}
`;

    // Add blue border highlight style
    const blueHighlightStyle = document.createElement('style');
    blueHighlightStyle.innerHTML = `
.cf-product-highlight {
    outline: 2px solid #2196F3 !important;
    outline-offset: -2px !important;
    position: relative !important;
    z-index: 999 !important;
    box-shadow: 0 0 0 2px #2196F3 !important;
}

.cf-stored-highlight {
    outline: 2px solid #FFA500 !important;
    outline-offset: -2px !important;
    position: relative !important;
    z-index: 999 !important;
    box-shadow: 0 0 0 2px #FFA500 !important;
}
`;
    document.head.appendChild(blueHighlightStyle);

    // Check URL parameters and store in session storage
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('price_tagging') && urlParams.has('source')) {
        const priceTagging = urlParams.get('price_tagging');
        const source = urlParams.get('source');

        if (priceTagging === 'true' && source === 'ab_test') {
            sessionStorage.setItem('price_tagging', priceTagging);
            sessionStorage.setItem('source', source);
        }
    }

    document.head.appendChild(hoverStyle);

    // Create selector widget HTML
    const widgetHTML = `
<div class="selector-widget">
    <div class="selector-widget-header">
        <h3>Selectors</h3>
        <button class="toggle-button">▼</button>
    </div>
    <div class="selector-widget-content">
        <button class="selector-mode-button">Enable Selection Mode</button>
        <ul class="selector-list"></ul>
    </div>
</div>
`;
    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // Get widget elements
    const selectorWidget = document.querySelector('.selector-widget');
    const selectorList = document.querySelector('.selector-list');
    const toggleButton = document.querySelector('.toggle-button');

    // Check session storage and initialize widget
    const priceTagging = sessionStorage.getItem('price_tagging');
    const source = sessionStorage.getItem('source');

    if (priceTagging === 'true' && source === 'ab_test') {
        // Show widget and initialize functionality
        selectorWidget.style.display = 'block';

        // Toggle widget visibility
        toggleButton.addEventListener('click', () => {
            selectorWidget.classList.toggle('expanded');
            toggleButton.textContent = selectorWidget.classList.contains('expanded') ? '▲' : '▼';
        });

        // Initialize the widget
        fetchAndDisplaySelectors();
    } else {
        // Hide widget if conditions not met
        selectorWidget.style.display = 'none';
    }

    // Add styles for the selector mode button
    const buttonStyle = document.createElement('style');
    buttonStyle.innerHTML = `
.selector-mode-button {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
}

.selector-mode-button:hover {
    background: #45a049;
    transform: translateY(-1px);
}

.selector-mode-button.active {
    background: #f44336;
}

.selector-mode-button.active:hover {
    background: #da190b;
}
`;
    document.head.appendChild(buttonStyle);

    // Get the selector mode button
    const selectorModeButton = document.querySelector('.selector-mode-button');

    // Track selection mode state
    let isSelectionModeActive = false;

    // Function to toggle selection mode
    function toggleSelectionMode() {
        isSelectionModeActive = !isSelectionModeActive;

        if (isSelectionModeActive) {
            selectorModeButton.textContent = 'Disable Selection Mode';
            selectorModeButton.classList.add('active');
            document.body.classList.add('cf-selector-mode');
            initializeEventListeners();
        } else {
            selectorModeButton.textContent = 'Enable Selection Mode';
            selectorModeButton.classList.remove('active');
            document.body.classList.remove('cf-selector-mode');
            cleanup();
        }
    }

    // Add click handler for the selector mode button
    selectorModeButton.addEventListener('click', toggleSelectionMode);

    // Function to fetch and display selectors from Firebase
    async function fetchAndDisplaySelectors() {
        try {
            const shopDomain = window.Shopify?.shop;
            if (!shopDomain) {
                console.error('❌ Shop domain not found');
                return;
            }

            const sanitizedDomain = shopDomain.replace(/\./g, '_');
            const response = await fetch(`https://abtest-6b299-default-rtdb.firebaseio.com/abTests/${sanitizedDomain}/querySelectors.json`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched selectors:', data);

            // Clear existing list
            selectorList.innerHTML = '';

            // Add each selector to the list
            if (data) {
                Object.entries(data).forEach(([key, selector]) => {
                    const li = document.createElement('li');
                    li.className = 'selector-item';

                    // Create type indicator badge
                    const typeBadge = document.createElement('span');
                    typeBadge.className = `selector-item-type ${selector.elementType || 'other'}`;
                    typeBadge.textContent = selector.elementType || 'other';
                    li.appendChild(typeBadge);

                    // Add selector text
                    const selectorText = document.createTextNode(selector.selector);
                    li.appendChild(selectorText);

                    // Add delete button
                    const deleteButton = document.createElement('button');
                    deleteButton.className = 'selector-delete';
                    deleteButton.textContent = '×';
                    deleteButton.setAttribute('data-key', key);
                    deleteButton.title = "Delete selector";
                    deleteButton.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                            await deleteSelector(key);
                            // Highlight after delete
                            await highlightStoredSelectors();
                        } catch (error) {
                            console.error('Error when deleting selector:', error);
                        }
                    });
                    li.appendChild(deleteButton);

                    selectorList.appendChild(li);
                });
            }
            // Highlight after fetching
            await highlightStoredSelectors();
        } catch (error) {
            console.error('Error fetching selectors:', error);
        }
    }

    // Function to store query selector in Firebase
    async function storeQuerySelector(selector) {
        try {
            const shopDomain = window.Shopify?.shop;
            if (!shopDomain) {
                console.error('❌ Shop domain not found');
                return;
            }

            const sanitizedDomain = shopDomain.replace(/\./g, '_');
            console.log('Storing selector for shop:', sanitizedDomain);

            // First check if this selector already exists
            const checkResponse = await fetch(`https://abtest-6b299-default-rtdb.firebaseio.com/abTests/${sanitizedDomain}/querySelectors.json`);

            if (!checkResponse.ok) {
                throw new Error(`HTTP error! status: ${checkResponse.status}`);
            }

            const existingData = await checkResponse.json();
            let selectorExists = false;

            if (existingData) {
                selectorExists = Object.values(existingData).some(item =>
                    item.selector === selector
                );
            }

            if (selectorExists) {
                console.log('⚠️ This selector already exists, not storing duplicate');
                alert('This selector is already saved in the database.');
                return true;
            }

            // Create the data structure
            const data = {
                selector: selector,
                timestamp: new Date().toISOString(),
                elementType: selector.includes('price-item') ? 'price' : 'other',
                url: window.location.href
            };

            console.log('Sending data to Firebase:', data);

            // Make the API call to store under the store's node
            const response = await fetch(`https://abtest-6b299-default-rtdb.firebaseio.com/abTests/${sanitizedDomain}/querySelectors.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Query selector stored successfully:', result);

            // Show success message
            alert('Query selector stored successfully! You can continue selecting more elements.');

            // Refresh the selector list and highlights
            await fetchAndDisplaySelectors();
            await highlightStoredSelectors();

            return true;
        } catch (error) {
            console.error('❌ Error storing query selector:', error);
            alert('Error storing query selector. Please try again.');
            return false;
        }
    }

    // Function to delete a selector from Firebase
    async function deleteSelector(key) {
        try {
            const shopDomain = window.Shopify?.shop;
            if (!shopDomain) {
                console.error('❌ Shop domain not found');
                return false;
            }

            const sanitizedDomain = shopDomain.replace(/\./g, '_');
            console.log('Attempting to delete selector with key:', key);
            console.log('DELETE URL:', `https://abtest-6b299-default-rtdb.firebaseio.com/abTests/${sanitizedDomain}/querySelectors/${key}.json`);

            const response = await fetch(`https://abtest-6b299-default-rtdb.firebaseio.com/abTests/${sanitizedDomain}/querySelectors/${key}.json`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('✅ Selector deleted successfully');

            // Refresh the selector list and highlights
            await fetchAndDisplaySelectors();
            await highlightStoredSelectors();

            return true;
        } catch (error) {
            console.error('❌ Error deleting selector:', error);
            alert('Error deleting selector. Please try again.');
            return false;
        }
    }

    // Create modal HTML
    const modalHTML = `
<div class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 999999;">
    <div class="modal-content" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 8px; min-width: 300px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Store Query Selector</h3>
        <p style="margin: 0 0 20px 0; color: #666;">Do you want to store this query selector in the database?</p>
        <div class="modal-buttons" style="display: flex; justify-content: flex-end; gap: 10px;">
            <button class="modal-button no" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">No</button>
            <button class="modal-button yes" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Yes</button>
        </div>
    </div>
</div>
`;

    // Remove any existing modal
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }

    // Insert new modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Get modal elements
    let modalOverlay = document.querySelector('.modal-overlay');
    let modalYesButton = document.querySelector('.modal-button.yes');
    let modalNoButton = document.querySelector('.modal-button.no');

    // Debug logging
    console.log('Modal elements after initialization:', {
        modalOverlay,
        modalYesButton,
        modalNoButton,
        modalHTML: modalOverlay ? modalOverlay.outerHTML : 'not found'
    });

    // Function to show modal
    function showModal() {
        console.log('Attempting to show modal...');
        modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            // Ensure the modal content exists
            if (!modalOverlay.querySelector('.modal-content')) {
                console.error('Modal content missing, recreating modal...');
                modalOverlay.remove();
                document.body.insertAdjacentHTML('beforeend', modalHTML);
                modalOverlay = document.querySelector('.modal-overlay');
            }

            modalOverlay.style.display = 'flex';
            modalOverlay.style.visibility = 'visible';
            modalOverlay.style.opacity = '1';
            modalOverlay.style.zIndex = '999999';

            // Ensure the modal content is visible
            const modalContent = modalOverlay.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.display = 'block';
                modalContent.style.visibility = 'visible';
                modalContent.style.opacity = '1';
            }

            console.log('Modal should be visible now', {
                display: modalOverlay.style.display,
                visibility: modalOverlay.style.visibility,
                opacity: modalOverlay.style.opacity,
                zIndex: modalOverlay.style.zIndex,
                contentExists: !!modalOverlay.querySelector('.modal-content')
            });
        } else {
            console.error('Modal overlay element not found! Recreating modal...');
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            modalOverlay = document.querySelector('.modal-overlay');
            if (modalOverlay) {
                modalOverlay.style.display = 'flex';
                console.log('Modal recreated and should be visible now');
            } else {
                console.error('Failed to recreate modal!');
            }
        }
    }

    // Function to hide modal
    function hideModal() {
        console.log('Attempting to hide modal...');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
            console.log('Modal hidden');
        } else {
            console.error('Modal overlay element not found when trying to hide!');
        }
    }

    // Click capture function
    function onClickCaptureSelector(event) {
        // Don't capture clicks on modal buttons or widget elements
        if (event.target.closest('.modal-overlay') || event.target.closest('.selector-widget')) {
            return;
        }

        // Only proceed if selection mode is active
        if (!isSelectionModeActive) {
            console.log('Selection mode not active, ignoring click');
            return;
        }

        console.log('Click event triggered');
        event.preventDefault();
        event.stopPropagation();

        const smartSelector = getSmartSelector(event.target);
        console.log('💡 Smart Selector:', smartSelector);

        // Re-query modal elements to ensure we have the latest references
        modalOverlay = document.querySelector('.modal-overlay');
        modalYesButton = document.querySelector('.modal-button.yes');
        modalNoButton = document.querySelector('.modal-button.no');

        console.log('Modal elements in click handler:', {
            modalOverlay,
            modalYesButton,
            modalNoButton,
            modalHTML: modalOverlay ? modalOverlay.outerHTML : 'not found',
            contentExists: modalOverlay ? !!modalOverlay.querySelector('.modal-content') : false
        });

        // Show modal
        showModal();

        // Create new button handlers
        const handleYesClick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Yes button clicked');
            try {
                const success = await storeQuerySelector(smartSelector);
                if (success) {
                    hideModal();
                }
            } catch (error) {
                console.error('Error in Yes button handler:', error);
            }
        };

        const handleNoClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('No button clicked');
            hideModal();
        };

        // Remove old handlers and add new ones
        if (modalYesButton) {
            modalYesButton.removeEventListener('click', handleYesClick);
            modalYesButton.addEventListener('click', handleYesClick);
            console.log('Yes button handler attached');
        } else {
            console.error('Yes button not found in modal!');
        }

        if (modalNoButton) {
            modalNoButton.removeEventListener('click', handleNoClick);
            modalNoButton.addEventListener('click', handleNoClick);
            console.log('No button handler attached');
        } else {
            console.error('No button not found in modal!');
        }

        // Add click handler to close modal when clicking outside
        const handleOverlayClick = (e) => {
            if (e.target === modalOverlay) {
                console.log('Overlay clicked, closing modal');
                hideModal();
                modalOverlay.removeEventListener('click', handleOverlayClick);
            }
        };
        modalOverlay.addEventListener('click', handleOverlayClick);
    }

    // Cleanup function to reset state and prepare for next selection
    function cleanup() {
        console.log('Cleaning up...');

        // Remove all event listeners
        document.removeEventListener('mouseover', onMouseOver, true);
        document.removeEventListener('mouseout', onMouseOut, true);
        document.removeEventListener('click', onClickCaptureSelector, true);

        // Remove any active highlights
        document.querySelectorAll('.hover-highlight').forEach(el => {
            el.classList.remove('hover-highlight');
        });

        // Hide modal if it exists
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }

        console.log('Cleanup complete');
    }

    // Initialize event listeners
    function initializeEventListeners() {
        console.log('Initializing event listeners...');

        // Remove any existing listeners first
        document.removeEventListener('mouseover', onMouseOver, true);
        document.removeEventListener('mouseout', onMouseOut, true);
        document.removeEventListener('click', onClickCaptureSelector, true);

        // Only add listeners if selection mode is active
        if (isSelectionModeActive) {
            // Use capture phase for events
            document.addEventListener('mouseover', onMouseOver, true);
            document.addEventListener('mouseout', onMouseOut, true);
            document.addEventListener('click', onClickCaptureSelector, true);

            // Add a class to the body to indicate selection mode is active
            document.body.classList.add('cf-selector-mode');

            console.log('Selection mode activated');
        }

        console.log('Event listeners initialized');
    }

    // Initialize everything when the script loads
    console.log('Script loading...');
    // Don't initialize event listeners by default
    // initializeEventListeners();
    console.log('Script loaded and initialized');

    // Function to generate query selector from element
    function generateQuerySelector(element) {
        if (!element) return null;

        const parts = [];
        let currentElement = element;

        while (currentElement && currentElement !== document.body) {
            let selector = '';

            // Add ID if present
            if (currentElement.id) {
                selector = `#${currentElement.id}`;
            }

            // Add classes
            const classes = Array.from(currentElement.classList);
            if (classes.length > 0) {
                if (selector) selector += '.';
                selector += classes.join('.');
            }

            // If no ID or classes, use tag name
            if (!selector) {
                selector = currentElement.tagName.toLowerCase();
            }

            parts.unshift(selector);
            currentElement = currentElement.parentElement;
        }

        return parts.join(' ');
    }

    // Function to extract selectors from highlighted elements
    function extractSelectors() {
        const highlightedElements = document.querySelectorAll('[data-ig-selected="true"]');
        const selectors = [];

        highlightedElements.forEach(element => {
            const selector = generateQuerySelector(element);
            if (selector) {
                selectors.push(selector);
            }
        });

        return selectors;
    }

    // Add event listener for selector extraction
    document.addEventListener('DOMContentLoaded', () => {
        const extractButton = document.createElement('button');
        extractButton.textContent = 'Extract Selectors';
        extractButton.style.position = 'fixed';
        extractButton.style.bottom = '20px';
        extractButton.style.right = '20px';
        extractButton.style.zIndex = '9999';
        extractButton.style.padding = '10px';
        extractButton.style.backgroundColor = '#4CAF50';
        extractButton.style.color = 'white';
        extractButton.style.border = 'none';
        extractButton.style.borderRadius = '4px';
        extractButton.style.cursor = 'pointer';

        extractButton.addEventListener('click', () => {
            const selectors = extractSelectors();
            console.log('Extracted Selectors:', selectors);

            // Create a modal to display selectors
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '50%';
            modal.style.left = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.backgroundColor = 'white';
            modal.style.padding = '20px';
            modal.style.borderRadius = '8px';
            modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            modal.style.zIndex = '10000';
            modal.style.maxWidth = '80%';
            modal.style.maxHeight = '80vh';
            modal.style.overflow = 'auto';

            const closeButton = document.createElement('button');
            closeButton.textContent = '×';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '10px';
            closeButton.style.right = '10px';
            closeButton.style.border = 'none';
            closeButton.style.background = 'none';
            closeButton.style.fontSize = '20px';
            closeButton.style.cursor = 'pointer';

            const content = document.createElement('pre');
            content.textContent = selectors.join('\n');
            content.style.whiteSpace = 'pre-wrap';
            content.style.wordBreak = 'break-word';

            modal.appendChild(closeButton);
            modal.appendChild(content);
            document.body.appendChild(modal);

            closeButton.addEventListener('click', () => {
                modal.remove();
            });
        });

        document.body.appendChild(extractButton);
    });

    // Function to check if selector exists in database
    async function checkSelectorExists(selector) {
        try {
            const shopDomain = window.Shopify?.shop;
            if (!shopDomain) {
                console.error('❌ Shop domain not found');
                return false;
            }

            const sanitizedDomain = shopDomain.replace(/\./g, '_');
            const response = await fetch(`https://abtest-6b299-default-rtdb.firebaseio.com/abTests/${sanitizedDomain}/querySelectors.json`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data) return false;

            return Object.values(data).some(item => item.selector === selector);
        } catch (error) {
            console.error('Error checking selector:', error);
            return false;
        }
    }

    // Store fetched selectors globally for matching
    let storedSelectorsFromDB = [];

    // Function to highlight elements from stored selectors
    async function highlightStoredSelectors() {
        try {
            const shopDomain = window.Shopify?.shop;
            if (!shopDomain) {
                console.error('❌ Shop domain not found');
                return;
            }

            const sanitizedDomain = shopDomain.replace(/\./g, '_');
            const response = await fetch(`https://abtest-6b299-default-rtdb.firebaseio.com/abTests/${sanitizedDomain}/querySelectors.json`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Always highlight product elements in blue
            // const productElements = findProductElements();
            // console.log(`[Highlight] Found ${productElements.length} product elements`);

            if (!data) return;

            // Get all stored selectors
            storedSelectorsFromDB = Object.values(data).map(item => item.selector);
            console.log('[Highlight] Selectors from DB:', storedSelectorsFromDB);

            // Remove existing highlights
            document.querySelectorAll('.cf-stored-highlight').forEach(el => {
                el.classList.remove('cf-stored-highlight');
            });

            // Try to find and highlight elements for each stored selector
            storedSelectorsFromDB.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    console.log(`[Highlight] Found ${elements.length} elements for selector: ${selector}`);
                    elements.forEach(element => {
                        element.classList.add('cf-stored-highlight');
                        console.log('[Highlight] Added highlight to element:', element);
                    });
                } catch (error) {
                    console.error(`[Highlight] Error applying selector ${selector}:`, error);
                }
            });
        } catch (error) {
            console.error('[Highlight] Error highlighting stored selectors:', error);
        }
    }

    // Function to find product elements
    // function findProductElements() {
    //     const elements = new Set();
    //     console.log('Looking for product elements on page');

    //     // Helper function to add element if it's valid
    //     const addElement = (element) => {
    //         if (element && !elements.has(element)) {
    //             console.log('Adding element:', element.tagName, element.className);
    //             elements.add(element);
    //             // Add blue highlight to the element
    //             element.classList.add('cf-product-highlight');
    //             console.log('[Highlight] Added blue highlight to element:', element);
    //         }
    //     };

    //     try {
    //         // 1. Look for product cards and containers
    //         const productSelectors = [
    //             'product-card',
    //             '.product-card',
    //             '.product-card-wrapper',
    //             '.product-grid__item',
    //             '.product-item',
    //             '.product',
    //             '[data-product-card]',
    //             '[data-product]'
    //         ];

    //         productSelectors.forEach(selector => {
    //             const found = document.querySelectorAll(selector);
    //             console.log(`[Highlight] Found ${found.length} elements for selector: ${selector}`);
    //             found.forEach(addElement);
    //         });

    //         // 2. Look for price elements
    //         const priceSelectors = [
    //             'product-price',
    //             '.price',
    //             '.price__container',
    //             '.product-price',
    //             '[data-product-price]',
    //             '.product__price',
    //             '.price-item',
    //             '.price-item--regular'
    //         ];

    //         priceSelectors.forEach(selector => {
    //             const found = document.querySelectorAll(selector);
    //             console.log(`[Highlight] Found ${found.length} elements for selector: ${selector}`);
    //             found.forEach(addElement);
    //         });

    //         // 3. Look for product info containers
    //         const infoSelectors = [
    //             'product-info',
    //             '.product__info',
    //             '.product__info-container',
    //             '.product-information',
    //             '.product-details',
    //             '[data-product-info]'
    //         ];

    //         infoSelectors.forEach(selector => {
    //             document.querySelectorAll(selector).forEach(addElement);
    //         });

    //         // 4. Look for add to cart forms
    //         const formSelectors = [
    //             'form[action="/cart/add"]',
    //             'form[action*="cart"]',
    //             '[data-product-form]',
    //             '.product-form',
    //             '.add-to-cart-form'
    //         ];

    //         formSelectors.forEach(selector => {
    //             document.querySelectorAll(selector).forEach(addElement);
    //         });

    //         // 5. Look for product images
    //         const imageSelectors = [
    //             '.product__image',
    //             '.product-image',
    //             '.product-card__image',
    //             '[data-product-image]',
    //             '.product__media'
    //         ];

    //         imageSelectors.forEach(selector => {
    //             document.querySelectorAll(selector).forEach(addElement);
    //         });

    //         // 6. Look for product titles
    //         const titleSelectors = [
    //             '.product__title',
    //             '.product-title',
    //             '.product-card__title',
    //             '[data-product-title]',
    //             '.product__heading'
    //         ];

    //         titleSelectors.forEach(selector => {
    //             document.querySelectorAll(selector).forEach(addElement);
    //         });

    //         // 7. Look for variant selectors
    //         const variantSelectors = [
    //             '.product-form__input',
    //             '.product-options',
    //             '.variant-selector',
    //             '[data-variant-selector]',
    //             '.product-variants'
    //         ];

    //         variantSelectors.forEach(selector => {
    //             document.querySelectorAll(selector).forEach(addElement);
    //         });

    //         // 8. Look for buy buttons
    //         const buttonSelectors = [
    //             '.buy-buttons',
    //             '.buy-buttons-block',
    //             '.product-form__buttons',
    //             '[data-add-to-cart]',
    //             '.add-to-cart-button'
    //         ];

    //         buttonSelectors.forEach(selector => {
    //             document.querySelectorAll(selector).forEach(addElement);
    //         });

    //         // 9. Look for product descriptions
    //         const descriptionSelectors = [
    //             '.product__description',
    //             '.product-description',
    //             '[data-product-description]',
    //             '.product__content'
    //         ];

    //         descriptionSelectors.forEach(selector => {
    //             document.querySelectorAll(selector).forEach(addElement);
    //         });

    //         // 10. Look for product meta information
    //         const metaSelectors = [
    //             '.product__meta',
    //             '.product-meta',
    //             '[data-product-meta]',
    //             '.product__vendor',
    //             '.product__type'
    //         ];

    //         metaSelectors.forEach(selector => {
    //             document.querySelectorAll(selector).forEach(addElement);
    //         });

    //         console.log(`[Highlight] Found ${elements.size} product-related elements on the page`);
    //         return Array.from(elements);
    //     } catch (error) {
    //         console.error('[Highlight] Error in findProductElements:', error);
    //         return [];
    //     }
    // }

    // Call highlightStoredSelectors when the page loads
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[Highlight] DOM Content Loaded, highlighting elements...');
        highlightStoredSelectors();
    });

    // Also call highlightStoredSelectors when the page is fully loaded
    window.addEventListener('load', () => {
        console.log('[Highlight] Window Loaded, highlighting elements...');
        highlightStoredSelectors();
    });

    // Mouse highlight functions
    async function onMouseOver(event) {
        // Skip if clicking on modal/widget
        if (event.target.closest('.modal-overlay') || event.target.closest('.selector-widget')) return;

        // Remove highlight from all elements
        document.querySelectorAll('.hover-highlight').forEach(el => {
            el.classList.remove('hover-highlight');
        });

        // Get the actual target element
        const targetElement = event.target;

        // Generate selector for this element
        const selector = getSmartSelector(targetElement);
        console.log('[Hover] SmartSelector:', selector);
        console.log('[Hover] Stored selectors from DB:', storedSelectorsFromDB);

        // Check if this element matches any selector from DB
        let isStored = false;
        for (const storedSelector of storedSelectorsFromDB) {
            try {
                if (targetElement.matches(storedSelector)) {
                    isStored = true;
                    break;
                }
            } catch (e) {
                // Ignore invalid selectors
            }
        }

        if (isStored) {
            targetElement.classList.add('already-stored');
        } else {
            targetElement.classList.add('hover-highlight');
        }

        // Prevent event from bubbling up
        event.stopPropagation();
    }

    function onMouseOut(event) {
        // Skip if on modal/widget
        if (event.target.closest('.modal-overlay') || event.target.closest('.selector-widget')) return;

        // Remove highlight only from the target element
        event.target.classList.remove('hover-highlight');
        // Don't remove already-stored class as these should stay highlighted

        // Prevent event from bubbling up
        event.stopPropagation();
    }

    // Utility: Generate simplified reusable selector
    function getSmartSelector(el) {
        if (!(el instanceof Element)) return null;

        // Function to get full selector path for an element
        function getElementSelector(element) {
            let selector = '';

            // Add ID if present
            if (element.id) {
                selector = `#${element.id}`;
            }

            // Add classes, excluding hover-highlight
            const classes = Array.from(element.classList).filter(cls => cls !== 'hover-highlight');
            if (classes.length > 0) {
                if (selector) selector += ' ';
                selector += classes.map(cls => `.${cls}`).join('');
            }

            return selector;
        }

        // Get the selector path up to 4 levels deep
        const selectors = [];
        let currentElement = el;
        let depth = 0;
        const maxDepth = 4;

        while (currentElement && currentElement !== document.body && depth < maxDepth) {
            const elementSelector = getElementSelector(currentElement);
            if (elementSelector) {
                selectors.unshift(elementSelector);
                depth++;
            }
            currentElement = currentElement.parentElement;
        }

        // Join selectors with spaces (for different elements in the path)
        return selectors.join(' ');
    }

    // Backup: full unique selector generator
    function getUniqueSelector(el) {
        if (!(el instanceof Element)) return null;
        const path = [];

        while (el.nodeType === Node.ELEMENT_NODE && el !== document.body) {
            let selector = el.nodeName.toLowerCase();

            if (el.id) {
                selector += '#' + el.id;
                path.unshift(selector);
                break;
            } else {
                if (el.className) {
                    selector += '.' + el.className.trim().replace(/\s+/g, '.');
                }

                let sibling = el;
                let siblingIndex = 1;
                while (sibling.previousElementSibling) {
                    sibling = sibling.previousElementSibling;
                    if (sibling.nodeName === el.nodeName) siblingIndex++;
                }

                selector += `:nth-of-type(${siblingIndex})`;
            }

            path.unshift(selector);
            el = el.parentElement;
        }
        return path.join(' > ');
    }

    // Helper function to clean product ID
    function getCleanProductId(id) {
        return String(id).trim().toLowerCase();
    }

    // Function to remove blue highlights
    function removeProductHighlights() {
        document.querySelectorAll('.cf-product-highlight').forEach(element => {
            element.classList.remove('cf-product-highlight');
        });
    }
} else {
    console.log('Required parameters not found. Script will not execute.');
}