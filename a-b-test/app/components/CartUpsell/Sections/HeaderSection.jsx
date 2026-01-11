import GeneralSettings from "./Header/GeneralSettings";
import TitleSettings from "./Header/TitleSettings";

export default function HeaderSection({ config, onUpdate }) {
  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Header</h2>
      
      <GeneralSettings 
        config={config}
        onUpdate={(updatedConfig) => onUpdate(updatedConfig)}
      />

      <TitleSettings 
        config={config.title}
        onUpdate={(updatedTitle) => onUpdate({ ...config, title: updatedTitle })}
      />
    </div>
  );
}
