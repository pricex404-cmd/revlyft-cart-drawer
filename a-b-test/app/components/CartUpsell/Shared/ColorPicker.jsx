export default function ColorPicker({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
  );
}
