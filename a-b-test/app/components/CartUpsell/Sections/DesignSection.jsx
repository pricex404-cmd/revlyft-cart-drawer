import GeneralSettings from "./Design/GeneralSettings";
import ButtonSettings from "./Design/ButtonSettings";
import ColorSettings from "./Design/ColorSettings";

export default function DesignSection({ generalConfig, appearanceConfig, onGeneralUpdate, onAppearanceUpdate }) {
  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ filter: 'grayscale(1)' }}>🎨</span>
        Design
      </h2>
      
      <GeneralSettings 
        config={generalConfig}
        onUpdate={onGeneralUpdate}
      />

      <ButtonSettings 
        config={generalConfig}
        onUpdate={onGeneralUpdate}
      />

      <ColorSettings 
        config={appearanceConfig}
        onUpdate={onAppearanceUpdate}
      />
    </div>
  );
}
