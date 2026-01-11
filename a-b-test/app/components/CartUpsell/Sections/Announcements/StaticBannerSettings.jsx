import React from 'react';

export default function StaticBannerSettings({ config, onUpdate }) {
  const handleFormat = (tag) => {
    const textArea = document.getElementById('announcement-text-input');
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    if (start === end) return;
    
    const selectedText = config.text.substring(start, end);
    const newText = config.text.substring(0, start) + `<${tag}>` + selectedText + `</${tag}>` + config.text.substring(end);
    onUpdate({ ...config, text: newText });
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
        Announcement Text
      </label>
      <div style={{ 
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        overflow: 'hidden',
        backgroundColor: '#fff'
      }}>
        {/* Text Formatting Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          padding: '8px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <button
            onClick={() => handleFormat('b')}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            B
          </button>
          <button
            onClick={() => handleFormat('i')}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontStyle: 'italic',
              fontSize: '14px'
            }}
          >
            I
          </button>
          <button
            onClick={() => handleFormat('u')}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px'
            }}
          >
            U
          </button>
        </div>
        <input
          id="announcement-text-input"
          type="text"
          value={config.text}
          onChange={(e) => onUpdate({ ...config, text: e.target.value })}
          style={{ 
            width: '100%',
            padding: '10px 12px',
            border: 'none',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>
    </div>
  );
}
