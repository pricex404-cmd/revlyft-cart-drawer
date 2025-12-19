import { useState, useEffect } from "react";
import { useLoaderData, useParams, useSearchParams, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  InlineStack,
  Banner
} from "@shopify/polaris";
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { authenticate } from "../shopify.server";
import { sanitizeShopDomain } from "../utils/sanitizeShopDomain";

const FIREBASE_DB_URL = "https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app";

export const loader = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const { upsellId } = params;

  // Get shop details and products
  const shopResponse = await admin.graphql(`
    query {
      shop {
        primaryDomain {
          url
        }
        myshopifyDomain
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
                }
              }
            }
          }
        }
      }
    }
  `);
  
  const shopData = await shopResponse.json();
  const primaryDomain = shopData.data.shop.primaryDomain.url;
  const products = shopData.data.products.edges.map(edge => ({
    id: edge.node.id,
    title: edge.node.title,
    image: edge.node.featuredImage?.url || null,
    price: edge.node.variants.edges[0]?.node.price || "0.00"
  }));

  return {
    shop: session.shop,
    upsellId,
    storeDomain: primaryDomain,
    products
  };
};

export default function CartUpsell() {
  const { shop, upsellId, storeDomain, products } = useLoaderData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');
  const name = searchParams.get('name');
  const description = searchParams.get('description');

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [currentTab, setCurrentTab] = useState('appearance');
  
  // Comprehensive configuration state for all cart features
  const [cartConfig, setCartConfig] = useState({
    // Cart Appearance
    appearance: {
      cartBackgroundColor: '#f0f0f0',
      cartAccentColor: '#ffffff',
      cartTextColor: '#000000',
      savingsTextColor: '#2ea818',
      fontFamily: 'inherit',
      fontSize: 'medium'
    },
    // Announcement Bar
    announcementBar: {
      enabled: false,
      text: 'Free shipping on orders over $50!',
      backgroundColor: '#000000',
      textColor: '#ffffff'
    },
    // Progress Bar (for free shipping, etc.)
    progressBar: {
      enabled: false,
      goal: 50,
      goalText: 'Add [amount] more to unlock free shipping!',
      backgroundColor: '#e0e0e0',
      barColor: '#4CAF50'
    },
    // Cart Upsell
    upsell: {
      enabled: false,
      title: 'You might also like',
      products: [],
      backgroundColor: '#ffffff',
      textColor: '#000000',
      buttonColor: '#000000',
      buttonTextColor: '#ffffff',
      borderRadius: 8,
      showProductImages: true
    }
  });

  // Save configuration to Firebase
  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      const sanitizedDomain = sanitizeShopDomain(shop);
      
      const configData = {
        ...cartConfig,
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

  // Load existing configuration from Firebase
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
            // Remove metadata before setting state
            const { metadata, ...configOnly } = data;
            setCartConfig(configOnly);
          }
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
      }
    };

    loadConfiguration();
  }, [shop]);

  return (
    <Page fullWidth>
      {/* Back to Tests button */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center', 
        padding: '0.2rem 0',
        justifyContent: 'flex-start'
      }}>
        <Button
          icon={ArrowLeftIcon}
          onClick={() => navigate('/app')}
          variant="tertiary"
          size="medium"
        >
          Back to Tests
        </Button>
      </div>

      <ui-title-bar title={name || 'Cart Upsell Configuration'}>
        <button variant="breadcrumb" onClick={() => navigate('/app')}>
          A/B Tests
        </button>
        <button
          onClick={saveConfiguration}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
        <button
          variant="primary"
          disabled={isSaving}
        >
          Activate Upsell
        </button>
      </ui-title-bar>

      {showSuccessToast && (
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10000,
          maxWidth: '600px',
          width: 'calc(100% - 40px)',
          margin: '0 20px'
        }}>
          <Banner
            status="success"
            onDismiss={() => setShowSuccessToast(false)}
          >
            <p>Configuration saved successfully!</p>
          </Banner>
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 120px)', padding: '20px' }}>
        {/* Configuration Panel - Left Side */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Card>
            <BlockStack gap="500">
              {/* Colors Section */}
              <div>
                <Text variant="headingLg" as="h2" fontWeight="bold">Colors</Text>
                <div style={{ marginTop: '20px' }}>
                  <BlockStack gap="400">
                    {/* Background Color */}
                    <div>
                      <Text variant="bodyMd" as="p" fontWeight="regular" tone="subdued">Background color</Text>
                      <div style={{ position: 'relative', marginTop: '8px' }}>
                        <input
                          type="text"
                          value={cartConfig.appearance.cartBackgroundColor}
                          onChange={(e) => setCartConfig({
                            ...cartConfig,
                            appearance: { ...cartConfig.appearance, cartBackgroundColor: e.target.value }
                          })}
                          style={{ 
                            width: '100%',
                            padding: '12px 60px 12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontFamily: 'inherit'
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
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '40px',
                            height: '40px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                    </div>

                    {/* Cart Accent Color */}
                    <div>
                      <Text variant="bodyMd" as="p" fontWeight="regular" tone="subdued">Cart accent color</Text>
                      <div style={{ position: 'relative', marginTop: '8px' }}>
                        <input
                          type="text"
                          value={cartConfig.appearance.cartAccentColor}
                          onChange={(e) => setCartConfig({
                            ...cartConfig,
                            appearance: { ...cartConfig.appearance, cartAccentColor: e.target.value }
                          })}
                          style={{ 
                            width: '100%',
                            padding: '12px 60px 12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontFamily: 'inherit'
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
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '40px',
                            height: '40px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                    </div>

                    {/* Cart Text Color */}
                    <div>
                      <Text variant="bodyMd" as="p" fontWeight="regular" tone="subdued">Cart text color</Text>
                      <div style={{ position: 'relative', marginTop: '8px' }}>
                        <input
                          type="text"
                          value={cartConfig.appearance.cartTextColor}
                          onChange={(e) => setCartConfig({
                            ...cartConfig,
                            appearance: { ...cartConfig.appearance, cartTextColor: e.target.value }
                          })}
                          style={{ 
                            width: '100%',
                            padding: '12px 60px 12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontFamily: 'inherit'
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
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '40px',
                            height: '40px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                    </div>

                    {/* Savings Text Color */}
                    <div>
                      <Text variant="bodyMd" as="p" fontWeight="regular" tone="subdued">Savings text color</Text>
                      <div style={{ position: 'relative', marginTop: '8px' }}>
                        <input
                          type="text"
                          value={cartConfig.appearance.savingsTextColor}
                          onChange={(e) => setCartConfig({
                            ...cartConfig,
                            appearance: { ...cartConfig.appearance, savingsTextColor: e.target.value }
                          })}
                          style={{ 
                            width: '100%',
                            padding: '12px 60px 12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontFamily: 'inherit'
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
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '40px',
                            height: '40px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                    </div>
                  </BlockStack>
                </div>
              </div>

              {/* Font Size */}
              <div>
                <Text variant="bodyMd" as="p" fontWeight="regular" tone="subdued">Font Size</Text>
                <select
                  value={cartConfig.appearance.fontSize}
                  onChange={(e) => setCartConfig({
                    ...cartConfig,
                    appearance: { ...cartConfig.appearance, fontSize: e.target.value }
                  })}
                  style={{ 
                    marginTop: '8px',
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              {/* Announcement Bar Section */}
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e1e3e5' }}>
                <BlockStack gap="300">
                  <Text variant="headingLg" as="h2">Announcement Bar</Text>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={cartConfig.announcementBar.enabled}
                      onChange={(e) => setCartConfig({
                        ...cartConfig,
                        announcementBar: { ...cartConfig.announcementBar, enabled: e.target.checked }
                      })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <Text variant="bodyMd" as="span">Enable Announcement Bar</Text>
                  </label>

                  {cartConfig.announcementBar.enabled && (
                    <>
                      <BlockStack gap="200">
                        <Text variant="headingMd" as="h3">Announcement Text</Text>
                        <input
                          type="text"
                          value={cartConfig.announcementBar.text}
                          onChange={(e) => setCartConfig({
                            ...cartConfig,
                            announcementBar: { ...cartConfig.announcementBar, text: e.target.value }
                          })}
                          placeholder="Enter announcement text..."
                          style={{ 
                            padding: '8px 12px', 
                            border: '1px solid #e1e3e5', 
                            borderRadius: '4px',
                            width: '100%'
                          }}
                        />
                      </BlockStack>

                      <BlockStack gap="200">
                        <Text variant="headingMd" as="h3">Background Color</Text>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input
                            type="color"
                            value={cartConfig.announcementBar.backgroundColor}
                            onChange={(e) => setCartConfig({
                              ...cartConfig,
                              announcementBar: { ...cartConfig.announcementBar, backgroundColor: e.target.value }
                            })}
                            style={{ width: '60px', height: '40px', border: '1px solid #e1e3e5', borderRadius: '4px', cursor: 'pointer' }}
                          />
                          <input
                            type="text"
                            value={cartConfig.announcementBar.backgroundColor}
                            onChange={(e) => setCartConfig({
                              ...cartConfig,
                              announcementBar: { ...cartConfig.announcementBar, backgroundColor: e.target.value }
                            })}
                            style={{ 
                              padding: '8px 12px', 
                              border: '1px solid #e1e3e5', 
                              borderRadius: '4px',
                              fontFamily: 'monospace',
                              width: '120px'
                            }}
                          />
                        </div>
                      </BlockStack>

                      <BlockStack gap="200">
                        <Text variant="headingMd" as="h3">Text Color</Text>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input
                            type="color"
                            value={cartConfig.announcementBar.textColor}
                            onChange={(e) => setCartConfig({
                              ...cartConfig,
                              announcementBar: { ...cartConfig.announcementBar, textColor: e.target.value }
                            })}
                            style={{ width: '60px', height: '40px', border: '1px solid #e1e3e5', borderRadius: '4px', cursor: 'pointer' }}
                          />
                          <input
                            type="text"
                            value={cartConfig.announcementBar.textColor}
                            onChange={(e) => setCartConfig({
                              ...cartConfig,
                              announcementBar: { ...cartConfig.announcementBar, textColor: e.target.value }
                            })}
                            style={{ 
                              padding: '8px 12px', 
                              border: '1px solid #e1e3e5', 
                              borderRadius: '4px',
                              fontFamily: 'monospace',
                              width: '120px'
                            }}
                          />
                        </div>
                      </BlockStack>
                    </>
                  )}
                </BlockStack>
              </div>

              {/* Progress Bar Section */}
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e1e3e5' }}>
                <BlockStack gap="300">
                  <Text variant="headingLg" as="h2">Progress Bar</Text>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={cartConfig.progressBar.enabled}
                      onChange={(e) => setCartConfig({
                        ...cartConfig,
                        progressBar: { ...cartConfig.progressBar, enabled: e.target.checked }
                      })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <Text variant="bodyMd" as="span">Enable Progress Bar</Text>
                  </label>

                  {cartConfig.progressBar.enabled && (
                    <>
                      <BlockStack gap="200">
                        <Text variant="headingMd" as="h3">Goal Amount</Text>
                        <input
                          type="number"
                          value={cartConfig.progressBar.goal}
                          onChange={(e) => setCartConfig({
                            ...cartConfig,
                            progressBar: { ...cartConfig.progressBar, goal: parseFloat(e.target.value) || 0 }
                          })}
                          placeholder="50"
                          style={{ 
                            padding: '8px 12px', 
                            border: '1px solid #e1e3e5', 
                            borderRadius: '4px',
                            width: '100%'
                          }}
                        />
                      </BlockStack>

                      <BlockStack gap="200">
                        <Text variant="headingMd" as="h3">Goal Text</Text>
                        <input
                          type="text"
                          value={cartConfig.progressBar.goalText}
                          onChange={(e) => setCartConfig({
                            ...cartConfig,
                            progressBar: { ...cartConfig.progressBar, goalText: e.target.value }
                          })}
                          placeholder="Add [amount] more..."
                          style={{ 
                            padding: '8px 12px', 
                            border: '1px solid #e1e3e5', 
                            borderRadius: '4px',
                            width: '100%'
                          }}
                        />
                        <Text variant="bodySm" as="p" color="subdued">
                          Use [amount] as placeholder for remaining amount
                        </Text>
                      </BlockStack>

                      <BlockStack gap="200">
                        <Text variant="headingMd" as="h3">Bar Color</Text>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input
                            type="color"
                            value={cartConfig.progressBar.barColor}
                            onChange={(e) => setCartConfig({
                              ...cartConfig,
                              progressBar: { ...cartConfig.progressBar, barColor: e.target.value }
                            })}
                            style={{ width: '60px', height: '40px', border: '1px solid #e1e3e5', borderRadius: '4px', cursor: 'pointer' }}
                          />
                          <input
                            type="text"
                            value={cartConfig.progressBar.barColor}
                            onChange={(e) => setCartConfig({
                              ...cartConfig,
                              progressBar: { ...cartConfig.progressBar, barColor: e.target.value }
                            })}
                            style={{ 
                              padding: '8px 12px', 
                              border: '1px solid #e1e3e5', 
                              borderRadius: '4px',
                              fontFamily: 'monospace',
                              width: '120px'
                            }}
                          />
                        </div>
                      </BlockStack>
                    </>
                  )}
                </BlockStack>
              </div>
            </BlockStack>
          </Card>
        </div>

        {/* Cart Preview - Right Side */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ 
            fontSize: '13px', 
            fontWeight: '500', 
            color: '#666',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Preview
          </div>
          <div style={{ 
                  width: '450px',
                  height: '700px',
                  backgroundColor: cartConfig.appearance.cartBackgroundColor,
                  color: cartConfig.appearance.cartTextColor,
                  borderRadius: '8px',
                  overflow: 'auto',
                  border: '1px solid #e1e3e5',
                  fontFamily: cartConfig.appearance.fontFamily,
                  fontSize: cartConfig.appearance.fontSize === 'small' ? '12px' : 
                           cartConfig.appearance.fontSize === 'large' ? '15px' : '13px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  
                  {/* Cart Header */}
                  <div style={{ padding: '20px 20px 16px 20px', borderBottom: '1px solid #e1e3e5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700' }}>Your Cart (2 items)</div>
                      <button style={{ 
                        background: 'none', 
                        border: 'none', 
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: cartConfig.appearance.cartTextColor,
                        lineHeight: '1'
                      }}>✕</button>
                    </div>
                  </div>

                  {/* Announcement Bar */}
                  {cartConfig.announcementBar.enabled && (
                    <div style={{
                      backgroundColor: cartConfig.announcementBar.backgroundColor,
                      color: cartConfig.announcementBar.textColor,
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      {cartConfig.announcementBar.text}
                    </div>
                  )}

                  {/* Progress Bar */}
                  {cartConfig.progressBar.enabled && (
                    <div style={{ padding: '16px', borderBottom: '1px solid #e1e3e5' }}>
                      <div style={{ marginBottom: '8px', fontSize: '13px' }}>
                        {cartConfig.progressBar.goalText.replace('[amount]', '$' + (cartConfig.progressBar.goal - 29.99).toFixed(2))}
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: cartConfig.progressBar.backgroundColor,
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(29.99 / cartConfig.progressBar.goal) * 100}%`,
                          height: '100%',
                          backgroundColor: cartConfig.progressBar.barColor,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  )}
                  {/* Cart Items */}
                  <div style={{ 
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    margin: '16px'
                  }}>
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
                          <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor">
                            <path d="M6 18c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V6H6v12zM13 2h-2.5l-1-1h-3l-1 1H3v2h12V2z"/>
                          </svg>
                        </button>
                        <img 
                          src={product.image || "data:image/svg+xml,%3Csvg width='90' height='90' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='90' height='90' fill='%23e8f4ff'/%3E%3Crect x='25' y='25' width='40' height='40' fill='%23b3d9ff' rx='4'/%3E%3Ccircle cx='35' cy='35' r='3' fill='%23ffffff'/%3E%3C/svg%3E"}
                          alt={product.title}
                          style={{
                            width: '90px',
                            height: '90px',
                            borderRadius: '8px',
                            flexShrink: 0,
                            objectFit: 'cover'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', paddingRight: '24px' }}>
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
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: '#f9f9f9'
                            }}>
                              <button style={{ 
                                padding: '8px 14px', 
                                background: 'none', 
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '600'
                              }}>-</button>
                              <span style={{ padding: '0 16px', fontWeight: '600', fontSize: '14px' }}>1</span>
                              <button style={{ 
                                padding: '8px 14px', 
                                background: 'none', 
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '600'
                              }}>+</button>
                            </div>
                          </div>
                          <div style={{ 
                            fontSize: '16px', 
                            fontWeight: '700', 
                            marginTop: '8px',
                            textAlign: 'right'
                          }}>₹{product.price}</div>
                        </div>
                      </div>
                    )) : (
                      <Text variant="bodyMd" as="p" tone="subdued">
                        No products found in your store.
                      </Text>
                    )}
                  </div>

                  {/* Cart Footer */}
                  <div style={{ 
                    padding: '20px',
                    backgroundColor: cartConfig.appearance.cartBackgroundColor,
                    borderTop: '1px solid #e1e3e5',
                    marginTop: 'auto'
                  }}>
                    {/* Estimated Total */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                      fontSize: '16px',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 3h18v18l-2-2-2 2-2-2-2 2-2-2-2 2-2-2-2 2V3z" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="7" y1="8" x2="17" y2="8" stroke="#666666" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="7" y1="12" x2="17" y2="12" stroke="#666666" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="7" y1="16" x2="13" y2="16" stroke="#666666" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span style={{ fontWeight: '600' }}>Estimated Total</span>
                      </div>
                      <span style={{ fontWeight: '700', fontSize: '18px' }}>₹1379.90</span>
                    </div>
                    
                    {/* Checkout Button */}
                    <button style={{
                      width: '100%',
                      backgroundColor: cartConfig.appearance.cartAccentColor,
                      color: '#000',
                      border: '1px solid #e1e3e5',
                      borderRadius: '8px',
                      padding: '14px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginBottom: '12px'
                    }}>
                      Checkout
                    </button>

                    {/* Powered by branding */}
                    <div style={{ 
                      textAlign: 'center', 
                      fontSize: '13px',
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}>
                      <span>Powered by</span>
                      <span style={{ 
                        fontWeight: '600',
                        color: '#2c6ecb'
                      }}>RevLyft</span>
                    </div>
                  </div>
                </div>
        </div>
      </div>
    </Page>
  );
}
