import ColorPicker from "../../Shared/ColorPicker";
import SliderInput from "../../Shared/SliderInput";

export default function GeneralSettings({ config, onUpdate }) {
  const borderOptions = [
    { value: 'none', label: 'None' },
    { value: 'thin', label: 'Thin' }
  ];

  return (
    <div style={{ 
      marginBottom: '32px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: '#fafafa'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#374151' }}>General</h3>
      
      {/* Height Slider */}
      <SliderInput
        label="Header Height"
        value={config.height}
        onChange={(value) => onUpdate({ ...config, height: value })}
        min={40}
        max={100}
        unit="px"
      />

      {/* Bottom Border Radio */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
          Bottom Border
        </label>
        <div style={{ display: 'flex', gap: '16px' }}>
          {borderOptions.map((option) => (
            <label key={option.value} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="bottomBorder"
                value={option.value}
                checked={config.bottomBorder === option.value}
                onChange={(e) => onUpdate({ ...config, bottomBorder: e.target.value })}
                style={{ marginRight: '6px' }}
              />
              <span style={{ fontSize: '14px' }}>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Background Color */}
      <ColorPicker
        label="Background Color"
        value={config.backgroundColor}
        onChange={(value) => onUpdate({ ...config, backgroundColor: value })}
      />
    </div>
  );
}
