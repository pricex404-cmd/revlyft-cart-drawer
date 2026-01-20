import { useState, useEffect } from 'react';
import { sanitizeShopDomain } from '../utils/sanitizeShopDomain';

const FIREBASE_DB_URL = "https://a-b-test-5f9a8-default-rtdb.asia-southeast1.firebasedatabase.app";

export function useCartConfig(shop, upsellId, currencyCode) {
  const [isSaving, setIsSaving] = useState(false);

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
      showRewardsOnEmptyCart: true,
      backgroundColor: '#e0e0e0',
      barColor: '#4CAF50',
      completeIconColor: '#4CAF50',
      incompleteIconColor: '#9e9e9e',
      completionText: '🎉 You\'ve unlocked all rewards!',
      calculationType: 'cartTotal',
      usePreDiscountedPrices: true,
      rewards: []
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

  // Load configuration from Firebase
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
                cartBackgroundColor: data.appearance?.cartBackgroundColor || '#ffffff',
                cartTextColor: data.appearance?.cartTextColor || '#000000',
                cartAccentColor: data.appearance?.cartAccentColor || '#4CAF50',
                savingsTextColor: data.appearance?.savingsTextColor || '#FF5722',
                subtotalTextColor: data.appearance?.subtotalTextColor || '#000000',
                fontFamily: data.appearance?.fontFamily || 'Arial, sans-serif',
                fontSize: data.appearance?.fontSize || 'medium'
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
                enabled: data.progressBar?.enabled || false,
                showRewardsOnEmptyCart: data.progressBar?.showRewardsOnEmptyCart ?? true,
                backgroundColor: data.progressBar?.backgroundColor || '#e0e0e0',
                barColor: data.progressBar?.barColor || '#4CAF50',
                completeIconColor: data.progressBar?.completeIconColor || '#4CAF50',
                incompleteIconColor: data.progressBar?.incompleteIconColor || '#9e9e9e',
                completionText: data.progressBar?.completionText || '🎉 You\'ve unlocked all rewards!',
                calculationType: data.progressBar?.calculationType || 'cartTotal',
                usePreDiscountedPrices: data.progressBar?.usePreDiscountedPrices ?? true,
                rewards: data.progressBar?.rewards || []
              },
              upsell: {
                enabled: data.upsell?.enabled || false,
                title: data.upsell?.title || 'You might also like',
                backgroundColor: data.upsell?.backgroundColor || '#f5f5f5',
                textColor: data.upsell?.textColor || '#000000'
              },
              metadata: data.metadata || {
                lastUpdated: new Date().toISOString(),
                isActive: false,
                testId: upsellId
              }
            });
          }
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
      }
    };

    loadConfiguration();
  }, [shop, upsellId]);

  // Save configuration to Firebase
  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      const sanitizedDomain = sanitizeShopDomain(shop);
      const configData = {
        ...cartConfig,
        currency: currencyCode,
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

      return { success: true };
    } catch (error) {
      console.error('Error saving configuration:', error);
      return { success: false, error };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    cartConfig,
    setCartConfig,
    saveConfiguration,
    isSaving
  };
}
