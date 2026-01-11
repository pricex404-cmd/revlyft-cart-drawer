export default function RadioGroup({ name, options, selectedValue, onChange }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      {options.map((option, index) => (
        <label 
          key={option.value}
          style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            cursor: 'pointer', 
            marginBottom: index < options.length - 1 ? '12px' : '0'
          }}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={(e) => onChange(e.target.value)}
            style={{ marginRight: '8px', marginTop: '2px' }}
          />
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              {option.label}
            </div>
            {option.description && (
              <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                {option.description}
              </div>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}
