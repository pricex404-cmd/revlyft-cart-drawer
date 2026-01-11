import React from 'react';

export default function CartItemsPreview({ 
  products, 
  cartTextColor, 
  showStrikethroughPrices,
  currencyCode,
  cartAccentColor,
  subtotalTextColor,
  enableSubtotalLine,
  checkoutButtonConfig
}) {
  return (
    <>
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
              <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '6px', paddingRight: '24px', color: cartTextColor }}>
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
                  color: cartTextColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {showStrikethroughPrices && product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price) && (
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

      {/* Footer */}
      <div style={{
        padding: '14px',
        borderTop: '1px solid #e1e3e5',
        backgroundColor: cartAccentColor
      }}>
        {enableSubtotalLine !== false && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: subtotalTextColor }}>Subtotal:</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: subtotalTextColor }}>
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
            backgroundColor: checkoutButtonConfig.color || '#000000',
            color: checkoutButtonConfig.textColor || '#ffffff',
            border: 'none',
            borderRadius: checkoutButtonConfig.radius || '8px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = checkoutButtonConfig.hoverColor || '#333333';
            e.target.style.color = checkoutButtonConfig.textHoverColor || '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = checkoutButtonConfig.color || '#000000';
            e.target.style.color = checkoutButtonConfig.textColor || '#ffffff';
          }}
        >
          Proceed to Checkout
        </button>
      </div>
    </>
  );
}
