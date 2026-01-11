import React from 'react';

export default function HeaderPreview({ config, cartTextColor }) {
  return (
    <div style={{ 
      padding: '16px 16px 12px 16px', 
      borderBottom: config.bottomBorder === 'thin' ? '1px solid #e1e3e5' : 'none',
      backgroundColor: config.backgroundColor,
      height: `calc(${config.height} * 0.7)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative'
    }}>
      <div style={{ 
        flex: 1,
        display: 'flex',
        justifyContent: config.title.alignment === 'center' ? 'center' : 'flex-start',
        fontSize: `calc(${config.title.fontSize} * 0.7)`,
        fontWeight: config.title.fontWeight
      }}>
        {config.title.text.replace('{{cart_quantity}}', '2')}
      </div>
      <button style={{ 
        background: 'none', 
        border: 'none', 
        fontSize: '20px',
        cursor: 'pointer',
        color: cartTextColor,
        lineHeight: '1',
        flexShrink: 0
      }}>✕</button>
    </div>
  );
}
