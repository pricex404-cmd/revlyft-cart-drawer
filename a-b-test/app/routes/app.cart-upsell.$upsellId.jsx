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
import ProgressBarSection from "../components/CartUpsell/Sections/ProgressBarSection";
import DesignSection from "../components/CartUpsell/Sections/DesignSection";
import HeaderSection from "../components/CartUpsell/Sections/HeaderSection";
import AnnouncementsSection from "../components/CartUpsell/Sections/AnnouncementsSection";
import CartPreview from "../components/CartUpsell/Preview/CartPreview";
import { useCartConfig } from "../hooks/useCartConfig";

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

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [activeSection, setActiveSection] = useState('design');

  // Use custom hook for configuration management
  const { cartConfig, setCartConfig, saveConfiguration, isSaving } = useCartConfig(shop, upsellId, currencyCode);

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

  const handleSaveConfiguration = async () => {
    const result = await saveConfiguration();
    if (result.success) {
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } else {
      alert('Failed to save configuration. Please try again.');
    }
  };

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
          <DesignSection
            generalConfig={cartConfig.general}
            appearanceConfig={cartConfig.appearance}
            onGeneralUpdate={(updatedConfig) => setCartConfig({
              ...cartConfig,
              general: updatedConfig
            })}
            onAppearanceUpdate={(updatedConfig) => setCartConfig({
              ...cartConfig,
              appearance: updatedConfig
            })}
          />
        );

      case 'header':
        return (
          <HeaderSection
            config={cartConfig.header}
            onUpdate={(updatedConfig) => setCartConfig({
              ...cartConfig,
              header: updatedConfig
            })}
          />
        );

      case 'announcements':
        return (
          <AnnouncementsSection
            config={cartConfig.announcementBar}
            onUpdate={(updatedConfig) => setCartConfig({
              ...cartConfig,
              announcementBar: updatedConfig
            })}
          />
        );

      case 'progress-bar':
        return (
          <ProgressBarSection 
            config={cartConfig.progressBar}
            currencyCode={currencyCode}
            onUpdate={(updatedConfig) => setCartConfig({
              ...cartConfig,
              progressBar: updatedConfig
            })}
          />
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
                onClick={handleSaveConfiguration}
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
          <CartPreview 
            config={cartConfig}
            products={products}
            currencyCode={currencyCode}
            themeFont={themeBodyFont}
            currentBannerIndex={currentBannerIndex}
          />
        </div>
      </div>
    </Page>
  );
}
