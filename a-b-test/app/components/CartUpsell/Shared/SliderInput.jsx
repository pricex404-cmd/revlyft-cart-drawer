export default function SliderInput({ label, value, onChange, min = 0, max = 100, unit = '' }) {
  const numericValue = parseInt(value) || min;
  const percentage = ((numericValue - min) / (max - min)) * 100;

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
        {label}: {value}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={numericValue}
        onChange={(e) => onChange(`${e.target.value}${unit}`)}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '3px',
          background: `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${percentage}%, #d1d5db ${percentage}%, #d1d5db 100%)`,
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none'
        }}
      />
    </div>
  );
}
