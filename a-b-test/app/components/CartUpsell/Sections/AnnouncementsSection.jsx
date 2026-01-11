import React from 'react';
import GeneralSettings from './Announcements/GeneralSettings';
import StaticBannerSettings from './Announcements/StaticBannerSettings';
import DynamicBannerSettings from './Announcements/DynamicBannerSettings';

export default function AnnouncementsSection({ config, onUpdate }) {
  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Announcements</h2>
      
      <GeneralSettings 
        config={config}
        onUpdate={onUpdate}
      />

      {config.enabled && !config.dynamicBanner && (
        <StaticBannerSettings
          config={config}
          onUpdate={onUpdate}
        />
      )}

      {config.enabled && (
        <DynamicBannerSettings
          config={config}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
