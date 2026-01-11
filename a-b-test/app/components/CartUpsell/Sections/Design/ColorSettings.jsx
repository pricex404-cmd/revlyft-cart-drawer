export default function ColorSettings({ config, onUpdate }) {
  return (
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
            value={config.cartBackgroundColor}
            onChange={(e) => onUpdate({ ...config, cartBackgroundColor: e.target.value })}
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
            value={config.cartBackgroundColor}
            onChange={(e) => onUpdate({ ...config, cartBackgroundColor: e.target.value })}
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
            value={config.cartAccentColor}
            onChange={(e) => onUpdate({ ...config, cartAccentColor: e.target.value })}
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
            value={config.cartAccentColor}
            onChange={(e) => onUpdate({ ...config, cartAccentColor: e.target.value })}
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
            value={config.cartTextColor}
            onChange={(e) => onUpdate({ ...config, cartTextColor: e.target.value })}
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
            value={config.cartTextColor}
            onChange={(e) => onUpdate({ ...config, cartTextColor: e.target.value })}
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
            value={config.savingsTextColor}
            onChange={(e) => onUpdate({ ...config, savingsTextColor: e.target.value })}
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
            value={config.savingsTextColor}
            onChange={(e) => onUpdate({ ...config, savingsTextColor: e.target.value })}
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
            value={config.subtotalTextColor}
            onChange={(e) => onUpdate({ ...config, subtotalTextColor: e.target.value })}
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
            value={config.subtotalTextColor}
            onChange={(e) => onUpdate({ ...config, subtotalTextColor: e.target.value })}
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
  );
}
