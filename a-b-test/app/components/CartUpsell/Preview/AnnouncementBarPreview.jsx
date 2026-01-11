import React from 'react';

export default function AnnouncementBarPreview({ config, position, currentBannerIndex }) {
  if (!config.enabled || config.position !== position) return null;

  return (
    <div 
      style={{
        backgroundColor: config.backgroundColor,
        color: config.textColor,
        border: `1px solid ${config.borderColor}`,
        padding: '10px 14px',
        textAlign: 'center',
        fontSize: `calc(${config.fontSize} * 0.7)`,
        fontWeight: '500',
        height: `calc(${config.height} * 0.7)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
        position: 'relative'
      }} 
    >
      <div
        key={currentBannerIndex}
        style={{
          width: '100%',
          animation: 'slideIn 0.5s ease-in-out'
        }}
        dangerouslySetInnerHTML={{ 
          __html: config.dynamicBanner 
            ? config.banners[currentBannerIndex]?.text || '' 
            : config.text 
        }}
      />
    </div>
  );
}
