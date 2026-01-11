import React from 'react';
import ColorPicker from '../../Shared/ColorPicker';
import SliderInput from '../../Shared/SliderInput';
import RadioGroup from '../../Shared/RadioGroup';

export default function GeneralSettings({ config, onUpdate }) {
  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => onUpdate({ ...config, enabled: e.target.checked })}
            style={{ marginRight: '8px' }}
          />
          <span style={{ fontSize: '14px' }}>Enable Announcement Bar</span>
        </label>
      </div>

      {config.enabled && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <ColorPicker
              label="Border Color"
              value={config.borderColor}
              onChange={(value) => onUpdate({ ...config, borderColor: value })}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <SliderInput
              label="Height"
              value={parseInt(config.height) || 50}
              min={30}
              max={100}
              unit="px"
              onChange={(value) => onUpdate({ ...config, height: `${value}px` })}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <SliderInput
              label="Font Size"
              value={parseInt(config.fontSize) || 14}
              min={10}
              max={24}
              unit="px"
              onChange={(value) => onUpdate({ ...config, fontSize: `${value}px` })}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <RadioGroup
              label="Position"
              name="announcement-position"
              value={config.position}
              onChange={(value) => onUpdate({ ...config, position: value })}
              options={[
                { value: 'before', label: 'Before Products' },
                { value: 'after', label: 'After Products' }
              ]}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <ColorPicker
              label="Background Color"
              value={config.backgroundColor}
              onChange={(value) => onUpdate({ ...config, backgroundColor: value })}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <ColorPicker
              label="Text Color"
              value={config.textColor}
              onChange={(value) => onUpdate({ ...config, textColor: value })}
            />
          </div>
        </>
      )}
    </>
  );
}
