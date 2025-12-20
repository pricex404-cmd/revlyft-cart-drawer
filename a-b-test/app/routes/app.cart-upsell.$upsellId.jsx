import { useState, useEffect } from "react";
import { useLoaderData, useParams, useSearchParams, useNavigate } from "@remix-run/react";
import {
  Page,
  Banner,
  Button
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
                }
              }
            }
          }
        }
      }
    }
  `);

  const data = await shopResponse.json();
  const products = data.data.products.edges.map(edge => ({
    id: edge.node.id,
    title: edge.node.title,
    image: edge.node.featuredImage?.url,
    price: edge.node.variants.edges[0]?.node.price
  }));

  return {
    shop: data.data.shop.myshopifyDomain,
    products,
    currencyCode: data.data.shop.currencyCode || 'USD'
  };
};

export default function CartUpsellConfiguration() {
  const { shop, products, currencyCode } = useLoaderData();
  const { upsellId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [activeSection, setActiveSection] = useState('design');

  const [cartConfig, setCartConfig] = useState({
    appearance: {
      cartBackgroundColor: '#ffffff',
      cartTextColor: '#000000',
      cartAccentColor: '#4CAF50',
      savingsTextColor: '#FF5722',
      subtotalTextColor: '#000000',
      fontFamily: 'Arial, sans-serif',
      fontSize: 'medium'
    },
    announcementBar: {
      enabled: false,
      text: 'Free shipping on orders over $50!',
      backgroundColor: '#4CAF50',
      textColor: '#ffffff'
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
            setCartConfig(data);
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
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
                    Announcement Text
                  </label>
                  <input
                    type="text"
                    value={cartConfig.announcementBar.text}
                    onChange={(e) => setCartConfig({
                      ...cartConfig,
                      announcementBar: { ...cartConfig.announcementBar, text: e.target.value }
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

                <div>
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
    <Page>
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
                <span style={{ filter: 'grayscale(1)' }}>📋</span>
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
          flex: 1,
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
            fontFamily: cartConfig.appearance.fontFamily,
            fontSize: cartConfig.appearance.fontSize === 'small' ? '10px' : 
                     cartConfig.appearance.fontSize === 'large' ? '12px' : '11px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Cart Header */}
            <div style={{ padding: '16px 16px 12px 16px', borderBottom: '1px solid #e1e3e5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>Your Cart (2 items)</div>
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
                padding: '10px 14px',
                textAlign: 'center',
                fontSize: '10px',
                fontWeight: '500'
              }}>
                {cartConfig.announcementBar.text}
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
                        color: cartConfig.appearance.cartTextColor
                      }}>
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

            {/* Footer */}
            <div style={{
              padding: '14px',
              borderTop: '1px solid #e1e3e5',
              backgroundColor: cartConfig.appearance.cartAccentColor
            }}>
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
              <button style={{
                width: '100%',
                padding: '11px',
                backgroundColor: '#000000',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
