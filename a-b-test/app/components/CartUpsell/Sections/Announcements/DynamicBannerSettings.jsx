import React from 'react';
import { Checkbox } from '@shopify/polaris';

export default function DynamicBannerSettings({ config, onUpdate }) {
  const handleAddBanner = () => {
    if (config.banners.length < 5) {
      const newId = Math.max(...config.banners.map(b => b.id)) + 1;
      onUpdate({
        ...config,
        banners: [...config.banners, { id: newId, text: 'New banner text' }]
      });
    }
  };

  const handleRemoveBanner = (bannerId) => {
    onUpdate({
      ...config,
      banners: config.banners.filter(b => b.id !== bannerId)
    });
  };

  const handleBannerTextChange = (bannerId, newText) => {
    onUpdate({
      ...config,
      banners: config.banners.map(b => 
        b.id === bannerId ? { ...b, text: newText } : b
      )
    });
  };

  const handleFormat = (bannerId, tag) => {
    const textArea = document.getElementById(`banner-text-${bannerId}`);
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    if (start === end) return;
    
    const banner = config.banners.find(b => b.id === bannerId);
    const selectedText = banner.text.substring(start, end);
    const newText = banner.text.substring(0, start) + `<${tag}>` + selectedText + `</${tag}>` + banner.text.substring(end);
    handleBannerTextChange(bannerId, newText);
  };

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Checkbox
          label={
            <span>
              Dynamic Banner
              <span title="Display multiple banners that rotate automatically" style={{ cursor: 'help', fontSize: '14px', color: '#6b7280', marginLeft: '8px' }}>ⓘ</span>
            </span>
          }
          checked={config.dynamicBanner}
          onChange={(checked) => onUpdate({ ...config, dynamicBanner: checked })}
        />
      </div>

      {config.dynamicBanner && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
              Auto change time (seconds)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={config.autoChangeTime}
              onChange={(e) => onUpdate({ ...config, autoChangeTime: parseInt(e.target.value) || 3 })}
              style={{ 
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                Banners ({config.banners.length}/5)
              </label>
              <button
                onClick={handleAddBanner}
                disabled={config.banners.length >= 5}
                style={{
                  padding: '6px 12px',
                  backgroundColor: config.banners.length >= 5 ? '#e5e7eb' : '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: config.banners.length >= 5 ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                + Add Banner
              </button>
            </div>

            {config.banners.map((banner, index) => (
              <div key={banner.id} style={{ marginBottom: '12px' }}>
                <div style={{ 
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  backgroundColor: '#fff'
                }}>
                  {/* Banner Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#6b7280' }}>Banner {index + 1}</span>
                    {config.banners.length > 2 && (
                      <button
                        onClick={() => handleRemoveBanner(banner.id)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {/* Formatting buttons */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    padding: '8px',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb'
                  }}>
                    <button
                      onClick={() => handleFormat(banner.id, 'b')}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}
                    >
                      B
                    </button>
                    <button
                      onClick={() => handleFormat(banner.id, 'i')}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        fontStyle: 'italic',
                        fontSize: '12px'
                      }}
                    >
                      I
                    </button>
                    <button
                      onClick={() => handleFormat(banner.id, 'u')}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: '12px'
                      }}
                    >
                      U
                    </button>
                  </div>
                  {/* Text input */}
                  <input
                    id={`banner-text-${banner.id}`}
                    type="text"
                    value={banner.text}
                    onChange={(e) => handleBannerTextChange(banner.id, e.target.value)}
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
            ))}
            
            {config.banners.length < 2 && (
              <div style={{ 
                padding: '8px 12px', 
                backgroundColor: '#fef2f2', 
                border: '1px solid #fecaca', 
                borderRadius: '6px',
                fontSize: '13px',
                color: '#991b1b'
              }}>
                ⚠️ Minimum 2 banners required for dynamic banner
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
