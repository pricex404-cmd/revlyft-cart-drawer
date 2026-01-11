import SliderInput from "../../Shared/SliderInput";

export default function TitleSettings({ config, onUpdate }) {
  const alignmentOptions = [
    { value: 'left', label: 'Side' },
    { value: 'center', label: 'Center' }
  ];

  return (
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
          value={config.text}
          onChange={(e) => onUpdate({ ...config, text: e.target.value })}
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
          {alignmentOptions.map((option) => (
            <label key={option.value} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="titleAlignment"
                value={option.value}
                checked={config.alignment === option.value}
                onChange={(e) => onUpdate({ ...config, alignment: e.target.value })}
                style={{ marginRight: '6px' }}
              />
              <span style={{ fontSize: '14px' }}>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Font Weight Slider */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
          Font Weight: {config.fontWeight}
        </label>
        <input
          type="range"
          min="300"
          max="700"
          step="100"
          value={config.fontWeight}
          onChange={(e) => onUpdate({ ...config, fontWeight: parseInt(e.target.value) })}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${((config.fontWeight - 300) / 400) * 100}%, #d1d5db ${((config.fontWeight - 300) / 400) * 100}%, #d1d5db 100%)`,
            outline: 'none',
            WebkitAppearance: 'none',
            appearance: 'none',
            cursor: 'pointer'
          }}
        />
      </div>

      {/* Font Size Slider */}
      <SliderInput
        label="Font Size"
        value={config.fontSize}
        onChange={(value) => onUpdate({ ...config, fontSize: value })}
        min={12}
        max={32}
        unit="px"
      />
    </div>
  );
}
