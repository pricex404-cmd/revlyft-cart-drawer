import React from 'react';
import HeaderPreview from './HeaderPreview';
import AnnouncementBarPreview from './AnnouncementBarPreview';
import ProgressBarPreview from './ProgressBarPreview';
import CartItemsPreview from './CartItemsPreview';

export default function CartPreview({ 
  config, 
  products, 
  currencyCode, 
  themeFont,
  currentBannerIndex 
}) {
  return (
    <div style={{ 
      width: '100%',
      flex: 1,
      backgroundColor: config.appearance.cartBackgroundColor,
      color: config.appearance.cartTextColor,
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid #e1e3e5',
      fontFamily: config.general?.inheritThemeFont ? themeFont : (config.general?.customFontFamily || 'Arial, sans-serif'),
      fontSize: config.appearance.fontSize === 'small' ? '10px' : 
               config.appearance.fontSize === 'large' ? '12px' : '11px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Cart Header */}
      <HeaderPreview 
        config={config.header}
        cartTextColor={config.appearance.cartTextColor}
      />

      {/* Announcement Bar - Before Products */}
      <AnnouncementBarPreview 
        config={config.announcementBar}
        position="before"
        currentBannerIndex={currentBannerIndex}
      />

      {/* Progress Bar */}
      <ProgressBarPreview 
        config={config.progressBar}
        products={products}
        currencyCode={currencyCode}
        textColor={config.appearance.cartTextColor}
      />

      {/* Cart Items and Footer */}
      <CartItemsPreview 
        products={products}
        cartTextColor={config.appearance.cartTextColor}
        showStrikethroughPrices={config.general?.showStrikethroughPrices}
        currencyCode={currencyCode}
        cartAccentColor={config.appearance.cartAccentColor}
        subtotalTextColor={config.appearance.subtotalTextColor}
        enableSubtotalLine={config.general?.enableSubtotalLine}
        checkoutButtonConfig={{
          color: config.general?.checkoutButtonColor,
          textColor: config.general?.checkoutButtonTextColor,
          hoverColor: config.general?.checkoutButtonHoverColor,
          textHoverColor: config.general?.checkoutButtonTextHoverColor,
          radius: config.general?.checkoutButtonRadius
        }}
      />

      {/* Announcement Bar - After Products */}
      <AnnouncementBarPreview 
        config={config.announcementBar}
        position="after"
        currentBannerIndex={currentBannerIndex}
      />
    </div>
  );
}
