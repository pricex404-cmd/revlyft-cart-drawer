export default function ButtonSettings({ config, onUpdate }) {
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
      <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>Button Settings</h3>
      
      {/* Corner Radius Slider */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
          Corner radius: {config.checkoutButtonRadius || '8px'}
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={parseInt(config.checkoutButtonRadius) || 8}
          onChange={(e) => onUpdate({ ...config, checkoutButtonRadius: `${e.target.value}px` })}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: 'linear-gradient(to right, #4CAF50 0%, #4CAF50 ' + ((parseInt(config.checkoutButtonRadius) || 8) * 2) + '%, #d1d5db ' + ((parseInt(config.checkoutButtonRadius) || 8) * 2) + '%, #d1d5db 100%)',
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
            value={config.checkoutButtonColor}
            onChange={(e) => onUpdate({ ...config, checkoutButtonColor: e.target.value })}
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
            value={config.checkoutButtonColor}
            onChange={(e) => onUpdate({ ...config, checkoutButtonColor: e.target.value })}
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
            value={config.checkoutButtonTextColor}
            onChange={(e) => onUpdate({ ...config, checkoutButtonTextColor: e.target.value })}
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
            value={config.checkoutButtonTextColor}
            onChange={(e) => onUpdate({ ...config, checkoutButtonTextColor: e.target.value })}
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
            value={config.checkoutButtonHoverColor}
            onChange={(e) => onUpdate({ ...config, checkoutButtonHoverColor: e.target.value })}
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
            value={config.checkoutButtonHoverColor}
            onChange={(e) => onUpdate({ ...config, checkoutButtonHoverColor: e.target.value })}
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
            value={config.checkoutButtonTextHoverColor}
            onChange={(e) => onUpdate({ ...config, checkoutButtonTextHoverColor: e.target.value })}
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
            value={config.checkoutButtonTextHoverColor}
            onChange={(e) => onUpdate({ ...config, checkoutButtonTextHoverColor: e.target.value })}
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
