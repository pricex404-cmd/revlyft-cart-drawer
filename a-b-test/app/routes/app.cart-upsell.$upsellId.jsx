import { useState, useEffect } from "react";
import { useLoaderData, useParams, useSearchParams, useNavigate } from "@remix-run/react";
import {
  Page,
  Banner,
  Button,
  Checkbox
} from "@shopify/polaris";
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { authenticate } from "../shopify.server";
import { sanitizeShopDomain } from "../utils/sanitizeShopDomain";

const FIREBASE_DB_URL = "https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app";

export const loader = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const { upsellId } = params;

  const shopResponse = await admin.graphql(`
    query {
      shop {
        primaryDomain {
          url
        }
        myshopifyDomain
        currencyCode
      }
      products(first: 2) {
        edges {
          node {
            id
            title
            featuredImage {
              url
              altText
            }
            variants(first: 1) {
              edges {
                node {
                  price
                  compareAtPrice
                }
              }
            }
          }
        }
      }
    }
  `);

  const data = await shopResponse.json();
  
  // Extract theme body font with error handling with error handling
  let themeBodyFont = 'system-ui, -apple-system, sans-serif';
  try {
    const themeResponse = await admin.graphql(`
      query {
        themes(first: 1, query: "role:main") {
          edges {
            node {
              id
              name
              files(first: 1, filenames: ["config/settings_data.json"]) {
                edges {
                  node {
                    ... on OnlineStoreThemeFileBodyText {
                      content
                    }
                  }
                }
              }
            }
          }
        }
      }
    `);
    
    const themeData = await themeResponse.json();
    
    if (themeData.data?.themes?.edges[0]?.node?.files?.edges[0]?.node?.content) {
      const settingsContent = JSON.parse(themeData.data.themes.edges[0].node.files.edges[0].node.content);
      const bodyFont = settingsContent.current?.type_body_font;
      if (bodyFont) {
        themeBodyFont = bodyFont.replace(/_/g, ' ');
      }
    }
  } catch (error) {
    console.error('Error fetching theme font:', error);
    // Use default font if theme fetch fails
  }
  
  const products = data.data.products.edges.map(edge => ({
    id: edge.node.id,
    title: edge.node.title,
    image: edge.node.featuredImage?.url,
    price: edge.node.variants.edges[0]?.node.price,
    compareAtPrice: edge.node.variants.edges[0]?.node.compareAtPrice
  }));

  return {
    shop: data.data.shop.myshopifyDomain,
    products,
    currencyCode: data.data.shop.currencyCode || 'USD',
    themeBodyFont
  };
};

export default function CartUpsellConfiguration() {
  const { shop, products, currencyCode, themeBodyFont } = useLoaderData();
  const { upsellId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [activeSection, setActiveSection] = useState('design');

  const [cartConfig, setCartConfig] = useState({
    general: {
      inheritThemeFont: true,
      customFontFamily: 'Arial, sans-serif',
      showStrikethroughPrices: true,
      enableSubtotalLine: true,
      checkoutButtonRadius: '8px',
      checkoutButtonColor: '#000000',
      checkoutButtonTextColor: '#ffffff',
      checkoutButtonHoverColor: '#333333',
      checkoutButtonTextHoverColor: '#ffffff'
    },
    appearance: {
      cartBackgroundColor: '#ffffff',
      cartTextColor: '#000000',
      cartAccentColor: '#4CAF50',
      savingsTextColor: '#FF5722',
      subtotalTextColor: '#000000',
      fontFamily: 'Arial, sans-serif',
      fontSize: 'medium'
    },
    header: {
      height: '60px',
      bottomBorder: 'thin',
      backgroundColor: '#ffffff',
      title: {
        text: 'Your Cart ({{cart_quantity}} items)',
        alignment: 'left',
        fontWeight: 600,
        fontSize: '24px'
      }
    },
    announcementBar: {
      enabled: false,
      text: 'Free shipping on orders over $50!',
      backgroundColor: '#4CAF50',
      textColor: '#ffffff',
      borderColor: '#3d8b40',
      height: '50px',
      fontSize: '14px',
      position: 'before',
      dynamicBanner: false,
      autoChangeTime: 3,
      banners: [
        { id: 1, text: 'Free shipping on orders over $50!' },
        { id: 2, text: 'New arrivals - Shop now!' }
      ]
    },
    progressBar: {
      enabled: false,
      goal: 50,
      goalText: 'Free Shipping Unlocked!',
      backgroundColor: '#e0e0e0',
      barColor: '#4CAF50'
    },
    upsell: {
      enabled: false,
      title: 'You might also like',
      backgroundColor: '#f5f5f5',
      textColor: '#000000'
    },
    metadata: {
      lastUpdated: new Date().toISOString(),
      isActive: false,
      testId: upsellId
    }
  });

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Rotate banners for preview
  useEffect(() => {
    if (cartConfig.announcementBar.dynamicBanner && cartConfig.announcementBar.banners.length >= 2) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prevIndex) => 
          (prevIndex + 1) % cartConfig.announcementBar.banners.length
        );
      }, cartConfig.announcementBar.autoChangeTime * 1000);

      return () => clearInterval(interval);
    } else {
      setCurrentBannerIndex(0);
    }
  }, [cartConfig.announcementBar.dynamicBanner, cartConfig.announcementBar.autoChangeTime, cartConfig.announcementBar.banners.length]);

  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      const sanitizedDomain = sanitizeShopDomain(shop);
      const configData = {
        ...cartConfig,
        currency: currencyCode, // Save currency with config
        metadata: {
          lastUpdated: new Date().toISOString(),
          isActive: true,
          testId: upsellId
        }
      };

      const response = await fetch(
        `${FIREBASE_DB_URL}/cartUpsell/${sanitizedDomain}/config.json`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(configData)
        }
      );

      if (!response.ok) throw new Error('Failed to save configuration');

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        const sanitizedDomain = sanitizeShopDomain(shop);
        const response = await fetch(
          `${FIREBASE_DB_URL}/cartUpsell/${sanitizedDomain}/config.json`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setCartConfig({
              general: {
                inheritThemeFont: data.general?.inheritThemeFont ?? true,
                customFontFamily: data.general?.customFontFamily || 'Arial, sans-serif',
                showStrikethroughPrices: data.general?.showStrikethroughPrices ?? true,
                enableSubtotalLine: data.general?.enableSubtotalLine ?? true,
                checkoutButtonRadius: data.general?.checkoutButtonRadius || '8px',
                checkoutButtonColor: data.general?.checkoutButtonColor || '#000000',
                checkoutButtonTextColor: data.general?.checkoutButtonTextColor || '#ffffff',
                checkoutButtonHoverColor: data.general?.checkoutButtonHoverColor || '#333333',
                checkoutButtonTextHoverColor: data.general?.checkoutButtonTextHoverColor || '#ffffff'
              },
              appearance: {
                ...cartConfig.appearance,
                ...data.appearance
              },
              header: {
                height: data.header?.height || '60px',
                bottomBorder: data.header?.bottomBorder || 'thin',
                backgroundColor: data.header?.backgroundColor || '#ffffff',
                title: {
                  text: data.header?.title?.text || 'Your Cart ({{cart_quantity}} items)',
                  alignment: data.header?.title?.alignment || 'left',
                  fontWeight: data.header?.title?.fontWeight || 600,
                  fontSize: data.header?.title?.fontSize || '24px'
                }
              },
              announcementBar: {
                enabled: data.announcementBar?.enabled || false,
                text: data.announcementBar?.text || 'Free shipping on orders over $50!',
                backgroundColor: data.announcementBar?.backgroundColor || '#4CAF50',
                textColor: data.announcementBar?.textColor || '#ffffff',
                borderColor: data.announcementBar?.borderColor || '#3d8b40',
                height: data.announcementBar?.height || '50px',
                fontSize: data.announcementBar?.fontSize || '14px',
                position: data.announcementBar?.position || 'before',
                dynamicBanner: data.announcementBar?.dynamicBanner || false,
                autoChangeTime: data.announcementBar?.autoChangeTime || 3,
                banners: data.announcementBar?.banners || [
                  { id: 1, text: 'Free shipping on orders over $50!' },
                  { id: 2, text: 'New arrivals - Shop now!' }
                ]
              },
              progressBar: {
                ...cartConfig.progressBar,
                ...data.progressBar
              },
              upsell: {
                ...cartConfig.upsell,
                ...data.upsell
              },
              metadata: data.metadata || cartConfig.metadata
            });
          }
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
      }
    };

    loadConfiguration();
  }, [shop]);

  const menuItems = [
    { id: 'design', label: 'Design', parent: 'general' },
    { id: 'header', label: 'Header', parent: 'general' },
    { id: 'announcements', label: 'Announcements', parent: 'body' },
    { id: 'progress-bar', label: 'Progress Bar', parent: 'body' },
    { id: 'upsells', label: 'Upsells', parent: 'body' },
  ];

  const renderConfigPanel = () => {
    switch (activeSection) {
      case 'design':
        return (
          <div style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ filter: 'grayscale(1)' }}>🎨</span>
              Design
            </h2>
            
            {/* General Section */}
            <div style={{ 
              marginBottom: '32px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '24px',
              backgroundColor: '#f9fafb',
              width: '100%',
              maxWidth: '100%'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>General</h3>
              
              {/* Inherit Font from Theme */}
              <div style={{ marginBottom: '16px' }}>
                <Checkbox
                  label="Inherit font from theme"
                  checked={cartConfig.general.inheritThemeFont}
                  onChange={(checked) => setCartConfig({
                    ...cartConfig,
                    general: { ...cartConfig.general, inheritThemeFont: checked }
                  })}
                />
              </div>

              {/* Custom Font Family - Only show when inheritThemeFont is false */}
              {!cartConfig.general.inheritThemeFont && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                    Custom font family
                  </label>
                  <select
                    value={cartConfig.general.customFontFamily}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      general: { ...cartConfig.general, customFontFamily: e.target.value }
                    })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Helvetica, sans-serif">Helvetica</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="'Courier New', monospace">Courier New</option>
                    <option value="Verdana, sans-serif">Verdana</option>
                    <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                    <option value="system-ui, -apple-system, sans-serif">System Font</option>
                  </select>
                </div>
              )}

              {/* Show Strikethrough Prices */}
              <div style={{ marginBottom: '16px' }}>
                <Checkbox
                  label={
                    <span>
                      Show strikethrough prices
                      <span title="Only displays for products with compare at price configured" style={{ cursor: 'help', fontSize: '14px', color: '#6b7280', marginLeft: '8px' }}>ⓘ</span>
                    </span>
                  }
                  checked={cartConfig.general.showStrikethroughPrices}
                  onChange={(checked) => setCartConfig({
                    ...cartConfig,
                    general: { ...cartConfig.general, showStrikethroughPrices: checked }
                  })}
                />
              </div>

              {/* Enable Subtotal Line */}
              <div>
                <Checkbox
                  label="Enable subtotal line"
                  checked={cartConfig.general.enableSubtotalLine}
                  onChange={(checked) => setCartConfig({
                    ...cartConfig,
                    general: { ...cartConfig.general, enableSubtotalLine: checked }
                  })}
                />
              </div>
            </div>

            {/* Button Settings Section */}
            <div style={{ 
              marginBottom: '32px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '24px',
              backgroundColor: '#f9fafb',
              width: '100%',
              maxWidth: '100%'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>Button Settings</h3>
              
              {/* Corner Radius Slider */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                  Corner radius: {cartConfig.general?.checkoutButtonRadius || '8px'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={parseInt(cartConfig.general?.checkoutButtonRadius) || 8}
                  onChange={(e) => setCartConfig({
                    ...cartConfig,
                    general: { ...cartConfig.general, checkoutButtonRadius: `${e.target.value}px` }
                  })}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: 'linear-gradient(to right, #4CAF50 0%, #4CAF50 ' + ((parseInt(cartConfig.general?.checkoutButtonRadius) || 8) * 2) + '%, #d1d5db ' + ((parseInt(cartConfig.general?.checkoutButtonRadius) || 8) * 2) + '%, #d1d5db 100%)',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none'
                  }}
                />
              </div>

              {/* Button Color */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                  Button color
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={cartConfig.general.checkoutButtonColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      general: { ...cartConfig.general, checkoutButtonColor: e.target.value }
                    })}
                    style={{ 
                      width: '100%',
                      padding: '10px 50px 10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff'
                    }}
                  />
                  <input
                    type="color"
                    value={cartConfig.general.checkoutButtonColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      general: { ...cartConfig.general, checkoutButtonColor: e.target.value }
                    })}
                    style={{ 
                      position: 'absolute',
                      right: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '36px',
                      height: '36px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              {/* Button Text Color */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                  Button text color
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={cartConfig.general.checkoutButtonTextColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      general: { ...cartConfig.general, checkoutButtonTextColor: e.target.value }
                    })}
                    style={{ 
                      width: '100%',
                      padding: '10px 50px 10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff'
                    }}
                  />
                  <input
                    type="color"
                    value={cartConfig.general.checkoutButtonTextColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      general: { ...cartConfig.general, checkoutButtonTextColor: e.target.value }
                    })}
                    style={{ 
                      position: 'absolute',
                      right: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '36px',
                      height: '36px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              {/* Button Hover Color */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                  Button hover color
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={cartConfig.general.checkoutButtonHoverColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      general: { ...cartConfig.general, checkoutButtonHoverColor: e.target.value }
                    })}
                    style={{ 
                      width: '100%',
                      padding: '10px 50px 10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff'
                    }}
                  />
                  <input
                    type="color"
                    value={cartConfig.general.checkoutButtonHoverColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      general: { ...cartConfig.general, checkoutButtonHoverColor: e.target.value }
                    })}
                    style={{ 
                      position: 'absolute',
                      right: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '36px',
                      height: '36px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              {/* Button Text Hover Color */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                  Button text hover color
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={cartConfig.general.checkoutButtonTextHoverColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      general: { ...cartConfig.general, checkoutButtonTextHoverColor: e.target.value }
                    })}
                    style={{ 
                      width: '100%',
                      padding: '10px 50px 10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff'
                    }}
                  />
                  <input
                    type="color"
                    value={cartConfig.general.checkoutButtonTextHoverColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      general: { ...cartConfig.general, checkoutButtonTextHoverColor: e.target.value }
                    })}
                    style={{ 
                      position: 'absolute',
                      right: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '36px',
                      height: '36px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Colors Section */}
            <div style={{ 
              marginBottom: '32px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '24px',
              backgroundColor: '#f9fafb',
              width: '100%',
              maxWidth: '100%'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>Colors</h3>
              
              {/* Background Color */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                  Background color
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={cartConfig.appearance.cartBackgroundColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      appearance: { ...cartConfig.appearance, cartBackgroundColor: e.target.value }
                    })}
                    style={{ 
                      width: '100%',
                      padding: '10px 50px 10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff'
                    }}
                  />
                  <input
                    type="color"
                    value={cartConfig.appearance.cartBackgroundColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      appearance: { ...cartConfig.appearance, cartBackgroundColor: e.target.value }
                    })}
                    style={{ 
                      position: 'absolute',
                      right: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '36px',
                      height: '36px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              {/* Cart Accent Color */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                  Cart accent color
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={cartConfig.appearance.cartAccentColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      appearance: { ...cartConfig.appearance, cartAccentColor: e.target.value }
                    })}
                    style={{ 
                      width: '100%',
                      padding: '10px 50px 10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff'
                    }}
                  />
                  <input
                    type="color"
                    value={cartConfig.appearance.cartAccentColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      appearance: { ...cartConfig.appearance, cartAccentColor: e.target.value }
                    })}
                    style={{ 
                      position: 'absolute',
                      right: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '36px',
                      height: '36px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              {/* Cart Text Color */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                  Cart text color
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={cartConfig.appearance.cartTextColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      appearance: { ...cartConfig.appearance, cartTextColor: e.target.value }
                    })}
                    style={{ 
                      width: '100%',
                      padding: '10px 50px 10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff'
                    }}
                  />
                  <input
                    type="color"
                    value={cartConfig.appearance.cartTextColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      appearance: { ...cartConfig.appearance, cartTextColor: e.target.value }
                    })}
                    style={{ 
                      position: 'absolute',
                      right: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '36px',
                      height: '36px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              {/* Savings Text Color */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                  Savings text color
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={cartConfig.appearance.savingsTextColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      appearance: { ...cartConfig.appearance, savingsTextColor: e.target.value }
                    })}
                    style={{ 
                      width: '100%',
                      padding: '10px 50px 10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff'
                    }}
                  />
                  <input
                    type="color"
                    value={cartConfig.appearance.savingsTextColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      appearance: { ...cartConfig.appearance, savingsTextColor: e.target.value }
                    })}
                    style={{ 
                      position: 'absolute',
                      right: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '36px',
                      height: '36px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              {/* Subtotal Text Color */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                  Subtotal text color
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={cartConfig.appearance.subtotalTextColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      appearance: { ...cartConfig.appearance, subtotalTextColor: e.target.value }
                    })}
                    style={{ 
                      width: '100%',
                      padding: '10px 50px 10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff'
                    }}
                  />
                  <input
                    type="color"
                    value={cartConfig.appearance.subtotalTextColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      appearance: { ...cartConfig.appearance, subtotalTextColor: e.target.value }
                    })}
                    style={{ 
                      position: 'absolute',
                      right: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '36px',
                      height: '36px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'header':
        return (
          <div style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Header</h2>
            
            {/* General Settings Subdivision */}
            <div style={{ 
              marginBottom: '32px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#fafafa'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#374151' }}>General</h3>
              
              {/* Height Slider */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                  Header Height: {cartConfig.header.height}
                </label>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={parseInt(cartConfig.header.height)}
                  onChange={(e) => setCartConfig({
                    ...cartConfig,
                    header: { ...cartConfig.header, height: `${e.target.value}px` }
                  })}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Bottom Border Radio */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                  Bottom Border
                </label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="bottomBorder"
                      value="none"
                      checked={cartConfig.header.bottomBorder === 'none'}
                      onChange={(e) => setCartConfig({
                        ...cartConfig,
                        header: { ...cartConfig.header, bottomBorder: e.target.value }
                      })}
                      style={{ marginRight: '6px' }}
                    />
                    <span style={{ fontSize: '14px' }}>None</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="bottomBorder"
                      value="thin"
                      checked={cartConfig.header.bottomBorder === 'thin'}
                      onChange={(e) => setCartConfig({
                        ...cartConfig,
                        header: { ...cartConfig.header, bottomBorder: e.target.value }
                      })}
                      style={{ marginRight: '6px' }}
                    />
                    <span style={{ fontSize: '14px' }}>Thin</span>
                  </label>
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                  Background Color
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={cartConfig.header.backgroundColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      header: { ...cartConfig.header, backgroundColor: e.target.value }
                    })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="color"
                    value={cartConfig.header.backgroundColor}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      header: { ...cartConfig.header, backgroundColor: e.target.value }
                    })}
                    style={{
                      position: 'absolute',
                      right: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '36px',
                      height: '36px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Title Settings Subdivision */}
            <div style={{ 
              marginBottom: '32px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#fafafa'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#374151' }}>Title</h3>
              
              {/* Text Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                  Text
                </label>
                <input
                  type="text"
                  value={cartConfig.header.title.text}
                  onChange={(e) => setCartConfig({
                    ...cartConfig,
                    header: { 
                      ...cartConfig.header, 
                      title: { ...cartConfig.header.title, text: e.target.value }
                    }
                  })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                  Use <code style={{ backgroundColor: '#e5e7eb', padding: '2px 4px', borderRadius: '3px' }}>{'{{cart_quantity}}'}</code> for the # of items in cart
                </div>
              </div>

              {/* Alignment Radio */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                  Alignment
                </label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="titleAlignment"
                      value="left"
                      checked={cartConfig.header.title.alignment === 'left'}
                      onChange={(e) => setCartConfig({
                        ...cartConfig,
                        header: { 
                          ...cartConfig.header, 
                          title: { ...cartConfig.header.title, alignment: e.target.value }
                        }
                      })}
                      style={{ marginRight: '6px' }}
                    />
                    <span style={{ fontSize: '14px' }}>Side</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="titleAlignment"
                      value="center"
                      checked={cartConfig.header.title.alignment === 'center'}
                      onChange={(e) => setCartConfig({
                        ...cartConfig,
                        header: { 
                          ...cartConfig.header, 
                          title: { ...cartConfig.header.title, alignment: e.target.value }
                        }
                      })}
                      style={{ marginRight: '6px' }}
                    />
                    <span style={{ fontSize: '14px' }}>Center</span>
                  </label>
                </div>
              </div>

              {/* Font Weight Slider */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                  Font Weight: {cartConfig.header.title.fontWeight}
                </label>
                <input
                  type="range"
                  min="300"
                  max="700"
                  step="100"
                  value={cartConfig.header.title.fontWeight}
                  onChange={(e) => setCartConfig({
                    ...cartConfig,
                    header: { 
                      ...cartConfig.header, 
                      title: { ...cartConfig.header.title, fontWeight: parseInt(e.target.value) }
                    }
                  })}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Font Size Slider */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                  Font Size: {cartConfig.header.title.fontSize}
                </label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={parseInt(cartConfig.header.title.fontSize)}
                  onChange={(e) => setCartConfig({
                    ...cartConfig,
                    header: { 
                      ...cartConfig.header, 
                      title: { ...cartConfig.header.title, fontSize: `${e.target.value}px` }
                    }
                  })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        );

      case 'announcements':
        return (
          <div style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Announcements</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={cartConfig.announcementBar.enabled}
                  onChange={(e) => setCartConfig({
                    ...cartConfig,
                    announcementBar: { ...cartConfig.announcementBar, enabled: e.target.checked }
                  })}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontSize: '14px' }}>Enable Announcement Bar</span>
              </label>
            </div>

            {cartConfig.announcementBar.enabled && (
              <>
                {/* Static Banner Text - Only show when dynamic banner is disabled */}
                {!cartConfig.announcementBar.dynamicBanner && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                      Announcement Text
                    </label>
                    {/* Unified text editor box */}
                    <div style={{ 
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      backgroundColor: '#fff'
                    }}>
                      {/* Text Formatting Buttons */}
                      <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      padding: '8px',
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: '#f9fafb'
                    }}>
                      <button
                        onClick={() => {
                          const textArea = document.getElementById('announcement-text-input');
                          const start = textArea.selectionStart;
                          const end = textArea.selectionEnd;
                          if (start === end) return;
                          const selectedText = cartConfig.announcementBar.text.substring(start, end);
                          const newText = cartConfig.announcementBar.text.substring(0, start) + '<b>' + selectedText + '</b>' + cartConfig.announcementBar.text.substring(end);
                          setCartConfig({
                            ...cartConfig,
                            announcementBar: { ...cartConfig.announcementBar, text: newText }
                          });
                        }}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}
                      >
                        B
                      </button>
                      <button
                        onClick={() => {
                          const textArea = document.getElementById('announcement-text-input');
                          const start = textArea.selectionStart;
                          const end = textArea.selectionEnd;
                          if (start === end) return;
                          const selectedText = cartConfig.announcementBar.text.substring(start, end);
                          const newText = cartConfig.announcementBar.text.substring(0, start) + '<i>' + selectedText + '</i>' + cartConfig.announcementBar.text.substring(end);
                          setCartConfig({
                            ...cartConfig,
                            announcementBar: { ...cartConfig.announcementBar, text: newText }
                          });
                        }}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                          fontStyle: 'italic',
                          fontSize: '14px'
                        }}
                      >
                        I
                      </button>
                      <button
                        onClick={() => {
                          const textArea = document.getElementById('announcement-text-input');
                          const start = textArea.selectionStart;
                          const end = textArea.selectionEnd;
                          if (start === end) return;
                          const selectedText = cartConfig.announcementBar.text.substring(start, end);
                          const newText = cartConfig.announcementBar.text.substring(0, start) + '<u>' + selectedText + '</u>' + cartConfig.announcementBar.text.substring(end);
                          setCartConfig({
                            ...cartConfig,
                            announcementBar: { ...cartConfig.announcementBar, text: newText }
                          });
                        }}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: '14px'
                        }}
                      >
                        U
                      </button>
                    </div>
                    <input
                      id="announcement-text-input"
                      type="text"
                      value={cartConfig.announcementBar.text}
                      onChange={(e) => setCartConfig({
                        ...cartConfig,
                        announcementBar: { ...cartConfig.announcementBar, text: e.target.value }
                      })}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px',
                        border: 'none',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                    Border Color
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={cartConfig.announcementBar.borderColor}
                      onChange={(e) => setCartConfig({
                        ...cartConfig,
                        announcementBar: { ...cartConfig.announcementBar, borderColor: e.target.value }
                      })}
                      style={{ 
                        width: '100%',
                        padding: '10px 50px 10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <input
                      type="color"
                      value={cartConfig.announcementBar.borderColor}
                      onChange={(e) => setCartConfig({
                        ...cartConfig,
                        announcementBar: { ...cartConfig.announcementBar, borderColor: e.target.value }
                      })}
                      style={{ 
                        position: 'absolute',
                        right: '6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '36px',
                        height: '36px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                    Height: {cartConfig.announcementBar.height}
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={parseInt(cartConfig.announcementBar.height) || 50}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      announcementBar: { ...cartConfig.announcementBar, height: `${e.target.value}px` }
                    })}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      background: 'linear-gradient(to right, #4CAF50 0%, #4CAF50 ' + (((parseInt(cartConfig.announcementBar.height) || 50) - 30) * 100 / 70) + '%, #d1d5db ' + (((parseInt(cartConfig.announcementBar.height) || 50) - 30) * 100 / 70) + '%, #d1d5db 100%)',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                      WebkitAppearance: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                    Font Size: {cartConfig.announcementBar.fontSize}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={parseInt(cartConfig.announcementBar.fontSize) || 14}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      announcementBar: { ...cartConfig.announcementBar, fontSize: `${e.target.value}px` }
                    })}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      background: 'linear-gradient(to right, #4CAF50 0%, #4CAF50 ' + (((parseInt(cartConfig.announcementBar.fontSize) || 14) - 10) * 100 / 14) + '%, #d1d5db ' + (((parseInt(cartConfig.announcementBar.fontSize) || 14) - 10) * 100 / 14) + '%, #d1d5db 100%)',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                      WebkitAppearance: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                    Position
                  </label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="announcement-position"
                        value="before"
                        checked={cartConfig.announcementBar.position === 'before'}
                        onChange={(e) => setCartConfig({
                          ...cartConfig,
                          announcementBar: { ...cartConfig.announcementBar, position: e.target.value }
                        })}
                        style={{ marginRight: '6px' }}
                      />
                      <span style={{ fontSize: '14px' }}>Before Products</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="announcement-position"
                        value="after"
                        checked={cartConfig.announcementBar.position === 'after'}
                        onChange={(e) => setCartConfig({
                          ...cartConfig,
                          announcementBar: { ...cartConfig.announcementBar, position: e.target.value }
                        })}
                        style={{ marginRight: '6px' }}
                      />
                      <span style={{ fontSize: '14px' }}>After Products</span>
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                    Background Color
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={cartConfig.announcementBar.backgroundColor}
                      onChange={(e) => setCartConfig({
                        ...cartConfig,
                        announcementBar: { ...cartConfig.announcementBar, backgroundColor: e.target.value }
                      })}
                      style={{ 
                        width: '100%',
                        padding: '10px 50px 10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <input
                      type="color"
                      value={cartConfig.announcementBar.backgroundColor}
                      onChange={(e) => setCartConfig({
                        ...cartConfig,
                        announcementBar: { ...cartConfig.announcementBar, backgroundColor: e.target.value }
                      })}
                      style={{ 
                        position: 'absolute',
                        right: '6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '36px',
                        height: '36px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                    Text Color
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={cartConfig.announcementBar.textColor}
                      onChange={(e) => setCartConfig({
                        ...cartConfig,
                        announcementBar: { ...cartConfig.announcementBar, textColor: e.target.value }
                      })}
                      style={{ 
                        width: '100%',
                        padding: '10px 50px 10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <input
                      type="color"
                      value={cartConfig.announcementBar.textColor}
                      onChange={(e) => setCartConfig({
                        ...cartConfig,
                        announcementBar: { ...cartConfig.announcementBar, textColor: e.target.value }
                      })}
                      style={{ 
                        position: 'absolute',
                        right: '6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '36px',
                        height: '36px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <Checkbox
                    label={
                      <span>
                        Dynamic Banner
                        <span title="Display multiple banners that rotate automatically" style={{ cursor: 'help', fontSize: '14px', color: '#6b7280', marginLeft: '8px' }}>ⓘ</span>
                      </span>
                    }
                    checked={cartConfig.announcementBar.dynamicBanner}
                    onChange={(checked) => setCartConfig({
                      ...cartConfig,
                      announcementBar: { ...cartConfig.announcementBar, dynamicBanner: checked }
                    })}
                  />
                </div>

                {/* Dynamic Banner Settings */}
                {cartConfig.announcementBar.dynamicBanner && (
                  <>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                        Auto change time (seconds)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={cartConfig.announcementBar.autoChangeTime}
                        onChange={(e) => setCartConfig({
                          ...cartConfig,
                          announcementBar: { ...cartConfig.announcementBar, autoChangeTime: parseInt(e.target.value) || 3 }
                        })}
                        style={{ 
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                          Banners ({cartConfig.announcementBar.banners.length}/5)
                        </label>
                        <button
                          onClick={() => {
                            if (cartConfig.announcementBar.banners.length < 5) {
                              const newId = Math.max(...cartConfig.announcementBar.banners.map(b => b.id)) + 1;
                              setCartConfig({
                                ...cartConfig,
                                announcementBar: {
                                  ...cartConfig.announcementBar,
                                  banners: [...cartConfig.announcementBar.banners, { id: newId, text: 'New banner text' }]
                                }
                              });
                            }
                          }}
                          disabled={cartConfig.announcementBar.banners.length >= 5}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: cartConfig.announcementBar.banners.length >= 5 ? '#e5e7eb' : '#4CAF50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: cartConfig.announcementBar.banners.length >= 5 ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}
                        >
                          + Add Banner
                        </button>
                      </div>

                      {cartConfig.announcementBar.banners.map((banner, index) => (
                        <div key={banner.id} style={{ marginBottom: '12px' }}>
                          <div style={{ 
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            backgroundColor: '#fff'
                          }}>
                            {/* Banner Header */}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px 12px',
                              backgroundColor: '#f9fafb',
                              borderBottom: '1px solid #e5e7eb'
                            }}>
                              <span style={{ fontSize: '13px', fontWeight: '500', color: '#6b7280' }}>Banner {index + 1}</span>
                              {cartConfig.announcementBar.banners.length > 2 && (
                                <button
                                  onClick={() => {
                                    setCartConfig({
                                      ...cartConfig,
                                      announcementBar: {
                                        ...cartConfig.announcementBar,
                                        banners: cartConfig.announcementBar.banners.filter(b => b.id !== banner.id)
                                      }
                                    });
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#ef4444',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                  }}
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            {/* Formatting buttons */}
                            <div style={{ 
                              display: 'flex', 
                              gap: '8px', 
                              padding: '8px',
                              borderBottom: '1px solid #e5e7eb',
                              backgroundColor: '#f9fafb'
                            }}>
                              <button
                                onClick={() => {
                                  const textArea = document.getElementById(`banner-text-${banner.id}`);
                                  const start = textArea.selectionStart;
                                  const end = textArea.selectionEnd;
                                  if (start === end) return;
                                  const selectedText = banner.text.substring(start, end);
                                  const newText = banner.text.substring(0, start) + '<b>' + selectedText + '</b>' + banner.text.substring(end);
                                  setCartConfig({
                                    ...cartConfig,
                                    announcementBar: {
                                      ...cartConfig.announcementBar,
                                      banners: cartConfig.announcementBar.banners.map(b => 
                                        b.id === banner.id ? { ...b, text: newText } : b
                                      )
                                    }
                                  });
                                }}
                                style={{
                                  padding: '4px 8px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  backgroundColor: '#fff',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  fontSize: '12px'
                                }}
                              >
                                B
                              </button>
                              <button
                                onClick={() => {
                                  const textArea = document.getElementById(`banner-text-${banner.id}`);
                                  const start = textArea.selectionStart;
                                  const end = textArea.selectionEnd;
                                  if (start === end) return;
                                  const selectedText = banner.text.substring(start, end);
                                  const newText = banner.text.substring(0, start) + '<i>' + selectedText + '</i>' + banner.text.substring(end);
                                  setCartConfig({
                                    ...cartConfig,
                                    announcementBar: {
                                      ...cartConfig.announcementBar,
                                      banners: cartConfig.announcementBar.banners.map(b => 
                                        b.id === banner.id ? { ...b, text: newText } : b
                                      )
                                    }
                                  });
                                }}
                                style={{
                                  padding: '4px 8px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  backgroundColor: '#fff',
                                  cursor: 'pointer',
                                  fontStyle: 'italic',
                                  fontSize: '12px'
                                }}
                              >
                                I
                              </button>
                              <button
                                onClick={() => {
                                  const textArea = document.getElementById(`banner-text-${banner.id}`);
                                  const start = textArea.selectionStart;
                                  const end = textArea.selectionEnd;
                                  if (start === end) return;
                                  const selectedText = banner.text.substring(start, end);
                                  const newText = banner.text.substring(0, start) + '<u>' + selectedText + '</u>' + banner.text.substring(end);
                                  setCartConfig({
                                    ...cartConfig,
                                    announcementBar: {
                                      ...cartConfig.announcementBar,
                                      banners: cartConfig.announcementBar.banners.map(b => 
                                        b.id === banner.id ? { ...b, text: newText } : b
                                      )
                                    }
                                  });
                                }}
                                style={{
                                  padding: '4px 8px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  backgroundColor: '#fff',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  fontSize: '12px'
                                }}
                              >
                                U
                              </button>
                            </div>
                            {/* Text input */}
                            <input
                              id={`banner-text-${banner.id}`}
                              type="text"
                              value={banner.text}
                              onChange={(e) => setCartConfig({
                                ...cartConfig,
                                announcementBar: {
                                  ...cartConfig.announcementBar,
                                  banners: cartConfig.announcementBar.banners.map(b => 
                                    b.id === banner.id ? { ...b, text: e.target.value } : b
                                  )
                                }
                              })}
                              style={{ 
                                width: '100%',
                                padding: '10px 12px',
                                border: 'none',
                                fontSize: '14px',
                                outline: 'none'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      
                      {cartConfig.announcementBar.banners.length < 2 && (
                        <div style={{ 
                          padding: '8px 12px', 
                          backgroundColor: '#fef2f2', 
                          border: '1px solid #fecaca', 
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#991b1b'
                        }}>
                          ⚠️ Minimum 2 banners required for dynamic banner
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        );

      case 'progress-bar':
        return (
          <div style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Progress Bar</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={cartConfig.progressBar.enabled}
                  onChange={(e) => setCartConfig({
                    ...cartConfig,
                    progressBar: { ...cartConfig.progressBar, enabled: e.target.checked }
                  })}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontSize: '14px' }}>Enable Progress Bar</span>
              </label>
            </div>

            {cartConfig.progressBar.enabled && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                    Goal Amount ($)
                  </label>
                  <input
                    type="number"
                    value={cartConfig.progressBar.goal}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      progressBar: { ...cartConfig.progressBar, goal: parseFloat(e.target.value) }
                    })}
                    style={{ 
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                    Goal Text
                  </label>
                  <input
                    type="text"
                    value={cartConfig.progressBar.goalText}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      progressBar: { ...cartConfig.progressBar, goalText: e.target.value }
                    })}
                    style={{ 
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                    Background Color
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={cartConfig.progressBar.backgroundColor}
                      onChange={(e) => setCartConfig({
                        ...cartConfig,
                        progressBar: { ...cartConfig.progressBar, backgroundColor: e.target.value }
                      })}
                      style={{ 
                        width: '100%',
                        padding: '10px 50px 10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <input
                      type="color"
                      value={cartConfig.progressBar.backgroundColor}
                      onChange={(e) => setCartConfig({
                        ...cartConfig,
                        progressBar: { ...cartConfig.progressBar, backgroundColor: e.target.value }
                      })}
                      style={{ 
                        position: 'absolute',
                        right: '6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '36px',
                        height: '36px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                    Bar Color
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={cartConfig.progressBar.barColor}
                      onChange={(e) => setCartConfig({
                        ...cartConfig,
                        progressBar: { ...cartConfig.progressBar, barColor: e.target.value }
                      })}
                      style={{ 
                        width: '100%',
                        padding: '10px 50px 10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <input
                      type="color"
                      value={cartConfig.progressBar.barColor}
                      onChange={(e) => setCartConfig({
                        ...cartConfig,
                        progressBar: { ...cartConfig.progressBar, barColor: e.target.value }
                      })}
                      style={{ 
                        position: 'absolute',
                        right: '6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '36px',
                        height: '36px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        );

      default:
        return (
          <div style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Select a section</h2>
          </div>
        );
    }
  };

  return (
    <Page fullWidth>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .sidebar-button {
          transition: transform 0.2s ease;
        }
        .sidebar-button:hover {
          transform: scale(1.05);
        }
      `}</style>
      <div style={{ display: 'flex', height: '100vh' }}>
        {/* Left Section: Sidebar + Middle Panel with Header */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header Bar - Only spans left sections */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(8px)',
            zIndex: 20,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => window.history.back()}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4L6 10L12 16" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#111827' }}>Cart Appearance</h1>
              <span style={{
                padding: '3px 10px',
                backgroundColor: '#d1fae5',
                color: '#065f46',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                Active
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#fff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Discard
              </button>
              <button
                onClick={saveConfiguration}
                disabled={isSaving}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.6 : 1
                }}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Sidebar + Middle Panel Container */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar Navigation */}
        <div style={{ 
          width: '240px',
          backgroundColor: '#fff',
          borderRight: '1px solid #e5e7eb',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '12px' }}>
            <div style={{ marginBottom: '4px' }}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: '600', 
                color: '#6b7280', 
                textTransform: 'uppercase',
                padding: '6px 8px'
              }}>
                General
              </div>
              <button
                onClick={() => setActiveSection('design')}
                className="sidebar-button"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 8px',
                  border: 'none',
                  backgroundColor: activeSection === 'design' ? '#f3f4f6' : 'transparent',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ filter: 'grayscale(1)' }}>🎨</span>
                <span>Design</span>
              </button>
              <button
                onClick={() => setActiveSection('header')}
                className="sidebar-button"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 8px',
                  border: 'none',
                  backgroundColor: activeSection === 'header' ? '#f3f4f6' : 'transparent',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ filter: 'grayscale(1)' }}>🔝</span>
                <span>Header</span>
              </button>
            </div>

            <div style={{ marginBottom: '4px', marginTop: '12px' }}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: '600', 
                color: '#6b7280', 
                textTransform: 'uppercase',
                padding: '6px 8px'
              }}>
                Body
              </div>
              <button
                onClick={() => setActiveSection('announcements')}
                className="sidebar-button"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 8px',
                  border: 'none',
                  backgroundColor: activeSection === 'announcements' ? '#f3f4f6' : 'transparent',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ filter: 'grayscale(1)' }}>📢</span>
                <span>Announcements</span>
              </button>
              <button
                onClick={() => setActiveSection('progress-bar')}
                className="sidebar-button"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 8px',
                  border: 'none',
                  backgroundColor: activeSection === 'progress-bar' ? '#f3f4f6' : 'transparent',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ filter: 'grayscale(1)' }}>📊</span>
                <span>Progress Bar</span>
              </button>
              <button
                onClick={() => setActiveSection('upsells')}
                className="sidebar-button"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 8px',
                  border: 'none',
                  backgroundColor: activeSection === 'upsells' ? '#f3f4f6' : 'transparent',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ filter: 'grayscale(1)' }}>🎁</span>
                <span>Upsells</span>
              </button>
            </div>

            <div style={{ marginBottom: '4px', marginTop: '12px' }}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: '600', 
                color: '#6b7280', 
                textTransform: 'uppercase',
                padding: '6px 8px'
              }}>
                Footer
              </div>
              <button
                onClick={() => setActiveSection('footer-content')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 8px',
                  border: 'none',
                  backgroundColor: activeSection === 'footer-content' ? '#f3f4f6' : 'transparent',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ filter: 'grayscale(1)' }}>📝</span>
                <span>Footer Content</span>
              </button>
            </div>

            <div style={{ marginBottom: '4px', marginTop: '12px' }}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: '600', 
                color: '#6b7280', 
                textTransform: 'uppercase',
                padding: '6px 8px'
              }}>
                Settings
              </div>
              <button
                onClick={() => setActiveSection('advanced-settings')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 8px',
                  border: 'none',
                  backgroundColor: activeSection === 'advanced-settings' ? '#f3f4f6' : 'transparent',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ filter: 'grayscale(1)' }}>⚙️</span>
                <span>Advanced Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Middle Configuration Panel */}
        <div style={{ 
          flex: 1.5,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          overflowY: 'auto'
        }}>
          {/* Content Area */}
          <div style={{ padding: '24px' }}>
          {showSuccessToast && (
            <div style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              padding: '16px',
              backgroundColor: '#10b981',
              color: 'white',
              textAlign: 'center'
            }}>
              Configuration saved successfully!
            </div>
          )}
          {renderConfigPanel()}
          </div>
        </div>
        </div>
        </div>

        {/* Right Preview Panel - Separate Section */}
        <div style={{ 
          width: '380px',
          backgroundColor: '#f9fafb',
          borderLeft: '1px solid #e5e7eb',
          padding: '24px',
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: '#6b7280',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Preview
          </div>
          <div style={{ 
            width: '100%',
            flex: 1,
            backgroundColor: cartConfig.appearance.cartBackgroundColor,
            color: cartConfig.appearance.cartTextColor,
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #e1e3e5',
            fontFamily: cartConfig.general?.inheritThemeFont ? themeBodyFont : (cartConfig.general?.customFontFamily || 'Arial, sans-serif'),
            fontSize: cartConfig.appearance.fontSize === 'small' ? '10px' : 
                     cartConfig.appearance.fontSize === 'large' ? '12px' : '11px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Cart Header */}
            <div style={{ 
              padding: '16px 16px 12px 16px', 
              borderBottom: cartConfig.header.bottomBorder === 'thin' ? '1px solid #e1e3e5' : 'none',
              backgroundColor: cartConfig.header.backgroundColor,
              height: `calc(${cartConfig.header.height} * 0.7)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: cartConfig.header.title.alignment === 'center' ? 'center' : 'space-between'
            }}>
              {cartConfig.header.title.alignment === 'left' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ 
                    fontSize: `calc(${cartConfig.header.title.fontSize} * 0.7)`,
                    fontWeight: cartConfig.header.title.fontWeight
                  }}>
                    {cartConfig.header.title.text.replace('{{cart_quantity}}', '2')}
                  </div>
                  <button style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: cartConfig.appearance.cartTextColor,
                    lineHeight: '1'
                  }}>✕</button>
                </div>
              )}
              {cartConfig.header.title.alignment === 'center' && (
                <>
                  <div style={{ 
                    fontSize: `calc(${cartConfig.header.title.fontSize} * 0.7)`,
                    fontWeight: cartConfig.header.title.fontWeight
                  }}>
                    {cartConfig.header.title.text.replace('{{cart_quantity}}', '2')}
                  </div>
                  <button style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: cartConfig.appearance.cartTextColor,
                    lineHeight: '1',
                    position: 'absolute',
                    right: '16px'
                  }}>✕</button>
                </>
              )}
            </div>

            {/* Announcement Bar - Before Products */}
            {cartConfig.announcementBar.enabled && cartConfig.announcementBar.position === 'before' && (
              <div 
                style={{
                  backgroundColor: cartConfig.announcementBar.backgroundColor,
                  color: cartConfig.announcementBar.textColor,
                  border: `1px solid ${cartConfig.announcementBar.borderColor}`,
                  padding: '10px 14px',
                  textAlign: 'center',
                  fontSize: `calc(${cartConfig.announcementBar.fontSize} * 0.7)`,
                  fontWeight: '500',
                  height: `calc(${cartConfig.announcementBar.height} * 0.7)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'pre-wrap',
                  overflow: 'hidden',
                  position: 'relative'
                }} 
              >
                <div
                  key={currentBannerIndex}
                  style={{
                    width: '100%',
                    animation: 'slideIn 0.5s ease-in-out'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: cartConfig.announcementBar.dynamicBanner 
                      ? cartConfig.announcementBar.banners[currentBannerIndex]?.text || '' 
                      : cartConfig.announcementBar.text 
                  }}
                />
              </div>
            )}

            {/* Progress Bar */}
            {cartConfig.progressBar.enabled && (
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #e1e3e5' }}>
                <div style={{ marginBottom: '6px', fontSize: '10px', color: cartConfig.appearance.cartTextColor }}>
                  Add ${(cartConfig.progressBar.goal - 29.99).toFixed(2)} to unlock {cartConfig.progressBar.goalText}
                </div>
                <div style={{
                  width: '100%',
                  height: '5px',
                  backgroundColor: cartConfig.progressBar.backgroundColor,
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '60%',
                    height: '100%',
                    backgroundColor: cartConfig.progressBar.barColor,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div style={{ padding: '14px', flex: 1, overflowY: 'auto' }}>
              {products && products.length > 0 ? products.map((product, index) => (
                <div key={product.id} style={{ 
                  position: 'relative',
                  display: 'flex', 
                  gap: '16px',
                  marginBottom: index < products.length - 1 ? '20px' : '0',
                  paddingBottom: index < products.length - 1 ? '20px' : '0',
                  borderBottom: index < products.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <button style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: '#ccc',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#999'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#ccc'}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                  <img 
                    src={product.image || "data:image/svg+xml,%3Csvg width='90' height='90' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='90' height='90' fill='%23e8f4ff'/%3E%3Crect x='25' y='25' width='40' height='40' fill='%23b3d9ff' rx='4'/%3E%3Ccircle cx='35' cy='35' r='3' fill='%23ffffff'/%3E%3C/svg%3E"}
                    alt={product.title}
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '8px',
                      flexShrink: 0,
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '6px', paddingRight: '24px', color: cartConfig.appearance.cartTextColor }}>
                      {product.title}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginTop: '12px'
                    }}>
                      <div style={{ 
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#f9f9f9'
                      }}>
                        <button style={{ 
                          padding: '4px 8px', 
                          background: 'none', 
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>-</button>
                        <span style={{ padding: '0 10px', fontWeight: '600', fontSize: '11px', color: '#000000' }}>1</span>
                        <button style={{ 
                          padding: '4px 8px', 
                          background: 'none', 
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>+</button>
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        fontWeight: '700',
                        color: cartConfig.appearance.cartTextColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {cartConfig.general?.showStrikethroughPrices && product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price) && (
                          <span style={{ 
                            fontSize: '11px', 
                            textDecoration: 'line-through', 
                            color: '#999',
                            fontWeight: '500'
                          }}>
                            {new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode }).format(parseFloat(product.compareAtPrice))}
                          </span>
                        )}
                        {new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode }).format(parseFloat(product.price))}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                  No products available
                </div>
              )}
            </div>

            {/* Announcement Bar - After Products (before footer) */}
            {cartConfig.announcementBar.enabled && cartConfig.announcementBar.position === 'after' && (
              <div 
                style={{
                  backgroundColor: cartConfig.announcementBar.backgroundColor,
                  color: cartConfig.announcementBar.textColor,
                  border: `1px solid ${cartConfig.announcementBar.borderColor}`,
                  padding: '10px 14px',
                  textAlign: 'center',
                  fontSize: `calc(${cartConfig.announcementBar.fontSize} * 0.7)`,
                  fontWeight: '500',
                  height: `calc(${cartConfig.announcementBar.height} * 0.7)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'pre-wrap',
                  overflow: 'hidden',
                  position: 'relative'
                }} 
              >
                <div
                  key={currentBannerIndex}
                  style={{
                    width: '100%',
                    animation: 'slideIn 0.5s ease-in-out'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: cartConfig.announcementBar.dynamicBanner 
                      ? cartConfig.announcementBar.banners[currentBannerIndex]?.text || '' 
                      : cartConfig.announcementBar.text 
                  }}
                />
              </div>
            )}

            {/* Footer */}
            <div style={{
              padding: '14px',
              borderTop: '1px solid #e1e3e5',
              backgroundColor: cartConfig.appearance.cartAccentColor
            }}>
              {cartConfig.general?.enableSubtotalLine !== false && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: cartConfig.appearance.subtotalTextColor }}>Subtotal:</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: cartConfig.appearance.subtotalTextColor }}>
                    {products && products.length > 0 
                      ? new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode }).format(
                          products.reduce((sum, product) => sum + (parseFloat(product.price) || 0), 0)
                        )
                      : new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode }).format(0)
                    }
                  </span>
                </div>
              )}
              <button 
                style={{
                  width: '100%',
                  padding: '11px',
                  backgroundColor: cartConfig.general?.checkoutButtonColor || '#000000',
                  color: cartConfig.general?.checkoutButtonTextColor || '#ffffff',
                  border: 'none',
                  borderRadius: cartConfig.general?.checkoutButtonRadius || '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = cartConfig.general?.checkoutButtonHoverColor || '#333333';
                  e.target.style.color = cartConfig.general?.checkoutButtonTextHoverColor || '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = cartConfig.general?.checkoutButtonColor || '#000000';
                  e.target.style.color = cartConfig.general?.checkoutButtonTextColor || '#ffffff';
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
