/**
 * Revlyft Cart Drawer Script
 * Loads cart configuration from Firebase and renders customized cart drawer
 */

(function() {
  'use strict';

  // Get shop domain from global variable set by Liquid template
  const SHOP_DOMAIN = window.REVLYFT_SHOP_DOMAIN || window.location.hostname;
  const FIREBASE_DB_URL = 'https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app';

  // Cart state
  let cartConfig = null;
  let cartData = null;
  let isCartOpen = false;

  /**
   * Sanitize shop domain for Firebase path
   */
  function sanitizeDomain(domain) {
    return domain.replace(/\./g, '_');
  }

  /**
   * Fetch cart configuration from Firebase
   */
  async function fetchCartConfig() {
    try {
      const sanitizedDomain = sanitizeDomain(SHOP_DOMAIN);
      const configUrl = `${FIREBASE_DB_URL}/cartUpsell/${sanitizedDomain}/config.json`;
      
      console.log('🛒 Fetching cart config from:', configUrl);
      
      const response = await fetch(configUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch cart config: ${response.status}`);
      }
      
      const config = await response.json();
      console.log('✅ Cart config loaded:', config);
      
      return config;
    } catch (error) {
      console.error('❌ Error fetching cart config:', error);
      return null;
    }
  }

  /**
   * Fetch current cart data from Shopify
   */
  async function fetchCartData() {
    try {
      const response = await fetch('/cart.js');
      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status}`);
      }
      
      const cart = await response.json();
      console.log('🛒 Cart data:', cart);
      
      return cart;
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      return null;
    }
  }

  /**
   * Format price based on Shopify's money format
   */
  function formatPrice(cents) {
    const dollars = (cents / 100).toFixed(2);
    return `$${dollars}`;
  }

  /**
   * Create HTML for cart items only
   */
  function createCartItemsHTML(items) {
    if (items.length === 0) {
      return `
        <div style="text-align: center; padding: 40px 20px; color: #999;">
          <p style="font-size: 18px; margin-bottom: 8px;">Your cart is empty</p>
          <p style="font-size: 14px;">Add some products to get started!</p>
        </div>
      `;
    }

    return items.map(item => `
      <div class="revlyft-cart-item" data-key="${item.key}" style="
        display: flex;
        gap: 16px;
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(0,0,0,0.1);
      ">
        <img src="${item.image}" alt="${item.title}" style="
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
        ">
        <div style="flex: 1;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 500;">
            ${item.product_title}
          </h3>
          ${item.variant_title ? `<p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">${item.variant_title}</p>` : ''}
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="revlyft-qty-btn" data-action="decrease" data-key="${item.key}" style="
                width: 28px;
                height: 28px;
                border: 1px solid rgba(0,0,0,0.2);
                background: white;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
              ">−</button>
              <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
              <button class="revlyft-qty-btn" data-action="increase" data-key="${item.key}" style="
                width: 28px;
                height: 28px;
                border: 1px solid rgba(0,0,0,0.2);
                background: white;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
              ">+</button>
            </div>
            <span style="font-weight: 600;">${formatPrice(item.final_line_price)}</span>
          </div>
        </div>
        <button class="revlyft-remove-btn" data-key="${item.key}" style="
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #999;
          font-size: 20px;
        ">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M6 18c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V6H6v12zM13 2h-2.5l-1-1h-3l-1 1H3v2h12V2z"/>
          </svg>
        </button>
      </div>
    `).join('');
  }

  /**
   * Create cart drawer HTML
   */
  function createCartDrawerHTML(config, cart) {
    const { appearance, announcementBar, progressBar, upsell } = config;
    
    // Calculate totals
    const subtotal = cart.total_price;
    const itemCount = cart.item_count;
    
    // Progress bar calculations
    let progressPercentage = 0;
    let remainingAmount = 0;
    if (progressBar.enabled && progressBar.goal) {
      progressPercentage = Math.min((subtotal / (progressBar.goal * 100)) * 100, 100);
      remainingAmount = Math.max((progressBar.goal * 100) - subtotal, 0);
    }

    return `
      <div id="revlyft-cart-drawer" style="
        position: fixed;
        top: 0;
        right: -100%;
        width: 400px;
        max-width: 90vw;
        height: 100vh;
        background-color: ${appearance.cartBackgroundColor};
        box-shadow: -4px 0 20px rgba(0,0,0,0.15);
        z-index: 9999;
        transition: right 0.3s ease-in-out;
        display: flex;
        flex-direction: column;
        font-family: ${appearance.fontFamily || 'system-ui, -apple-system, sans-serif'};
        font-size: ${appearance.fontSize || '14px'};
        color: ${appearance.cartTextColor};
      ">
        <!-- Cart Header -->
        <div style="
          padding: 20px;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          background-color: ${appearance.cartAccentColor};
        ">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="margin: 0; font-size: 24px; font-weight: 600;">Your Cart (${itemCount})</h2>
            <button id="revlyft-close-cart" style="
              background: none;
              border: none;
              font-size: 28px;
              cursor: pointer;
              padding: 0;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: ${appearance.cartTextColor};
            ">×</button>
          </div>
        </div>

        ${announcementBar.enabled ? `
          <div style="
            padding: 12px 20px;
            background-color: ${announcementBar.backgroundColor};
            color: ${announcementBar.textColor};
            text-align: center;
            font-size: 14px;
          ">
            ${announcementBar.text}
          </div>
        ` : ''}

        ${progressBar.enabled ? `
          <div style="padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,0.1);">
            <div id="revlyft-progress-text" style="margin-bottom: 8px; font-size: 13px;">
              ${progressPercentage >= 100 
                ? progressBar.goalText 
                : `Add ${formatPrice(remainingAmount)} to unlock ${progressBar.goalText}`
              }
            </div>
            <div style="
              width: 100%;
              height: 8px;
              background-color: ${progressBar.backgroundColor};
              border-radius: 4px;
              overflow: hidden;
            ">
              <div id="revlyft-progress-bar-fill" style="
                width: ${progressPercentage}%;
                height: 100%;
                background-color: ${progressBar.barColor};
                transition: width 0.3s ease;
              "></div>
            </div>
          </div>
        ` : ''}

        <!-- Cart Items -->
        <div id="revlyft-cart-items" style="
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        ">
          ${createCartItemsHTML(cart.items)}
        </div>

        ${upsell.enabled && cart.items.length > 0 ? `
          <div style="
            padding: 16px 20px;
            background-color: ${upsell.backgroundColor};
            color: ${upsell.textColor};
            border-top: 1px solid rgba(0,0,0,0.1);
          ">
            <h3 style="margin: 0 0 12px 0; font-size: 16px;">${upsell.title}</h3>
            <!-- Upsell products would go here -->
          </div>
        ` : ''}

        <!-- Cart Footer -->
        ${cart.items.length > 0 ? `
          <div id="revlyft-cart-footer" style="
            padding: 20px;
            border-top: 1px solid rgba(0,0,0,0.1);
            background-color: ${appearance.cartAccentColor};
          ">
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
              <span style="font-size: 16px; font-weight: 600;">Subtotal:</span>
              <span id="revlyft-subtotal" style="font-size: 16px; font-weight: 600;">${formatPrice(subtotal)}</span>
            </div>
            <div style="margin-bottom: 12px; font-size: 12px; color: #666; text-align: center;">
              Taxes and shipping calculated at checkout
            </div>
            <button id="revlyft-checkout-btn" style="
              width: 100%;
              padding: 16px;
              background-color: ${appearance.cartAccentColor};
              color: ${appearance.cartTextColor};
              border: 2px solid ${appearance.cartTextColor};
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
              Proceed to Checkout
            </button>
          </div>
        ` : ''}
      </div>

      <!-- Backdrop -->
      <div id="revlyft-cart-backdrop" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9998;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
      "></div>
    `;
  }

  /**
   * Open cart drawer
   */
  function openCart() {
    if (isCartOpen) return;
    
    isCartOpen = true;
    const drawer = document.getElementById('revlyft-cart-drawer');
    const backdrop = document.getElementById('revlyft-cart-backdrop');
    
    if (drawer && backdrop) {
      drawer.style.right = '0';
      backdrop.style.opacity = '1';
      backdrop.style.visibility = 'visible';
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Close cart drawer
   */
  function closeCart() {
    if (!isCartOpen) return;
    
    isCartOpen = false;
    const drawer = document.getElementById('revlyft-cart-drawer');
    const backdrop = document.getElementById('revlyft-cart-backdrop');
    
    if (drawer && backdrop) {
      drawer.style.right = '-100%';
      backdrop.style.opacity = '0';
      backdrop.style.visibility = 'hidden';
      document.body.style.overflow = '';
    }
  }

  /**
   * Update cart quantity
   */
  async function updateCartQuantity(key, quantity) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: key,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart');
      }

      // Refresh cart
      await refreshCart();
    } catch (error) {
      console.error('❌ Error updating cart:', error);
    }
  }

  /**
   * Remove item from cart
   */
  async function removeFromCart(key) {
    await updateCartQuantity(key, 0);
  }

  /**
   * Refresh cart display (smart update - only updates changed sections)
   */
  async function refreshCart() {
    cartData = await fetchCartData();
    if (cartData && cartConfig) {
      const { appearance, progressBar } = cartConfig;
      const subtotal = cartData.total_price;
      const itemCount = cartData.item_count;

      // Update item count in header
      const headerTitle = document.querySelector('#revlyft-cart-drawer h2');
      if (headerTitle) {
        headerTitle.textContent = `Your Cart (${itemCount})`;
      }

      // Update progress bar if enabled
      if (progressBar.enabled && progressBar.goal) {
        const progressPercentage = Math.min((subtotal / (progressBar.goal * 100)) * 100, 100);
        const remainingAmount = Math.max((progressBar.goal * 100) - subtotal, 0);
        
        const progressText = document.querySelector('#revlyft-progress-text');
        const progressBarFill = document.querySelector('#revlyft-progress-bar-fill');
        
        if (progressText) {
          progressText.textContent = progressPercentage >= 100 
            ? progressBar.goalText 
            : `Add ${formatPrice(remainingAmount)} to unlock ${progressBar.goalText}`;
        }
        if (progressBarFill) {
          progressBarFill.style.width = `${progressPercentage}%`;
        }
      }

      // Update cart items section
      const itemsContainer = document.getElementById('revlyft-cart-items');
      if (itemsContainer) {
        itemsContainer.innerHTML = createCartItemsHTML(cartData.items);
        attachItemEventListeners(); // Only re-attach item-specific listeners
      }

      // Update subtotal in footer
      const subtotalElement = document.querySelector('#revlyft-subtotal');
      if (subtotalElement) {
        subtotalElement.textContent = formatPrice(subtotal);
      }

      // Show/hide footer based on item count
      const footer = document.querySelector('#revlyft-cart-footer');
      if (footer) {
        footer.style.display = itemCount > 0 ? 'block' : 'none';
      }
    }
  }

  /**
   * Attach event listeners to cart elements (one-time setup)
   */
  function attachCartEventListeners() {
    // Close button
    const closeBtn = document.getElementById('revlyft-close-cart');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeCart);
    }

    // Backdrop
    const backdrop = document.getElementById('revlyft-cart-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', closeCart);
    }

    // Checkout button
    const checkoutBtn = document.getElementById('revlyft-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        window.location.href = '/checkout';
      });
    }

    // Attach item listeners
    attachItemEventListeners();
  }

  /**
   * Attach event listeners to cart items (called after item updates)
   */
  function attachItemEventListeners() {
    // Quantity buttons
    document.querySelectorAll('.revlyft-qty-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const action = e.target.getAttribute('data-action');
        const key = e.target.getAttribute('data-key');
        const item = cartData.items.find(i => i.key === key);
        
        if (item) {
          const newQuantity = action === 'increase' ? item.quantity + 1 : Math.max(0, item.quantity - 1);
          await updateCartQuantity(key, newQuantity);
        }
      });
    });

    // Remove buttons
    document.querySelectorAll('.revlyft-remove-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const key = e.target.closest('button').getAttribute('data-key');
        await removeFromCart(key);
      });
    });
  }

  /**
   * Override default cart links to open our drawer
   * Uses capture phase to intercept clicks before theme handlers
   */
  function overrideCartLinks() {
    document.addEventListener('click', function(e) {
      const cartTrigger = e.target.closest(
        'a[href="/cart"], a[href^="/cart?"], .cart-icon, .header__icon--cart, .cart-notification-button, [data-cart-drawer], #cart-icon'
      );
      
      if (!cartTrigger) return;
      
      // Check if it's an anchor tag
      if (cartTrigger.tagName === 'A') {
        const href = cartTrigger.getAttribute('href');
        
        // Only intercept exact /cart or /cart? links
        if (href === '/cart' || (href && href.startsWith('/cart?'))) {
          e.preventDefault();
          e.stopImmediatePropagation();
          window.revlyftOpenCart?.();
        }
      } else {
        // Non-anchor cart triggers (icons, buttons) - always intercept
        e.preventDefault();
        e.stopImmediatePropagation();
        window.revlyftOpenCart?.();
      }
    }, true);
    
    console.log('🔗 Global cart interceptor active (capture phase)');
  }

  /**
   * Initialize cart drawer
   */
  async function initCartDrawer() {
    console.log('🚀 Initializing Revlyft Cart Drawer...');
    console.log('Shop Domain:', SHOP_DOMAIN);
    
    // Fetch configuration
    cartConfig = await fetchCartConfig();
    console.log('Cart Config:', cartConfig);
    
    if (!cartConfig) {
      console.log('⚠️ No cart config found, skipping initialization');
      return;
    }
    
    if (!cartConfig.metadata?.isActive) {
      console.log('⚠️ Cart drawer not active (isActive: false), skipping initialization');
      return;
    }

    // Fetch cart data
    cartData = await fetchCartData();
    if (!cartData) {
      console.error('❌ Failed to fetch cart data');
      return;
    }

    // Create cart container
    const container = document.createElement('div');
    container.id = 'revlyft-cart-container';
    container.innerHTML = createCartDrawerHTML(cartConfig, cartData);
    document.body.appendChild(container);

    // Attach event listeners
    attachCartEventListeners();

    // Override cart links (global capture-phase interceptor)
    overrideCartLinks();

    // Intercept Add-to-Cart actions
    interceptAddToCart();

    // Hide theme's native cart drawer
    hideThemeCartDrawer();

    // Listen for cart updates from other scripts
    document.addEventListener('cart:updated', refreshCart);

    console.log('✅ Revlyft Cart Drawer initialized');
  }

  /**
   * Intercept Add-to-Cart AJAX calls
   */
  function interceptAddToCart() {
    if (window.__REVLYFT_FETCH_PATCHED__) return;
    
    window.__REVLYFT_FETCH_PATCHED__ = true;
    const originalFetch = window.fetch;
    
    window.fetch = function(...args) {
      const [url] = args;
      const urlString = typeof url === 'string' ? url : url?.toString() || '';
      
      if (urlString.includes('/cart/add')) {
        return originalFetch.apply(this, args)
          .then(async (response) => {
            if (response.ok) {
              try {
                response.clone();
                await window.revlyftRefreshCart?.();
                setTimeout(() => window.revlyftOpenCart?.(), 100);
              } catch (err) {
                // Silent fail
              }
            }
            return response;
          })
          .catch((err) => {
            throw err;
          });
      }
      
      return originalFetch.apply(this, args);
    };
  }

  /**
   * Hide theme's native cart drawer to prevent dual carts
   */
  function hideThemeCartDrawer() {
    // Inject CSS to hide common theme cart drawer selectors
    const style = document.createElement('style');
    style.id = 'revlyft-hide-theme-cart';
    style.textContent = `
      /* Hide common theme cart drawers */
      cart-drawer,
      #cart-drawer,
      .cart-drawer,
      [id*="CartDrawer"],
      [class*="cart-drawer"],
      drawer-element[id*="cart"],
      .drawer[id*="cart"],
      #shopify-section-cart-drawer,
      .cart-notification,
      .cart-notification-wrapper {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
    console.log('🚫 Theme cart drawer hidden');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartDrawer);
  } else {
    initCartDrawer();
  }

  // Expose global function to open cart
  window.revlyftOpenCart = openCart;
  window.revlyftCloseCart = closeCart;
  window.revlyftRefreshCart = refreshCart;

})();
