import { Checkbox } from "@shopify/polaris";

export default function GeneralSettings({ config, onUpdate }) {
  return (
    <div style={{ 
      marginBottom: '32px',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      backgroundColor: '#f9fafb',
      width: '100%',
      maxWidth: '100%'
    }}>
      <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>General</h3>
      
      {/* Inherit Font from Theme */}
      <div style={{ marginBottom: '16px' }}>
        <Checkbox
          label="Inherit font from theme"
          checked={config.inheritThemeFont}
          onChange={(checked) => onUpdate({ ...config, inheritThemeFont: checked })}
        />
      </div>

      {/* Custom Font Family - Only show when inheritThemeFont is false */}
      {!config.inheritThemeFont && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>
            Custom font family
          </label>
          <select
            value={config.customFontFamily}
            onChange={(e) => onUpdate({ ...config, customFontFamily: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          >
            <option value="Arial, sans-serif">Arial</option>
            <option value="Helvetica, sans-serif">Helvetica</option>
            <option value="'Times New Roman', serif">Times New Roman</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Courier New', monospace">Courier New</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
            <option value="system-ui, -apple-system, sans-serif">System Font</option>
          </select>
        </div>
      )}

      {/* Show Strikethrough Prices */}
      <div style={{ marginBottom: '16px' }}>
        <Checkbox
          label={
            <span>
              Show strikethrough prices
              <span title="Only displays for products with compare at price configured" style={{ cursor: 'help', fontSize: '14px', color: '#6b7280', marginLeft: '8px' }}>ⓘ</span>
            </span>
          }
          checked={config.showStrikethroughPrices}
          onChange={(checked) => onUpdate({ ...config, showStrikethroughPrices: checked })}
        />
      </div>

      {/* Enable Subtotal Line */}
      <div>
        <Checkbox
          label="Enable subtotal line"
          checked={config.enableSubtotalLine}
          onChange={(checked) => onUpdate({ ...config, enableSubtotalLine: checked })}
        />
      </div>
    </div>
  );
}
