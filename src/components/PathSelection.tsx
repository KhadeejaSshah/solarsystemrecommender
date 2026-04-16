import { EntryPath } from '../types';

const paths: { id: EntryPath; icon: string; title: string; subtitle: string; desc: string; badge: string }[] = [
  {
    id: 'bill',
    icon: '📄',
    title: 'Enter My Bill',
    subtitle: 'Upload or enter your electricity bill',
    desc: 'We extract monthly units and size your system from your real usage.',
    badge: 'Fastest',
  },
  {
    id: 'appliances',
    icon: '🏠',
    title: 'Add My Appliances',
    subtitle: 'Select what you use at home',
    desc: 'Choose appliances, set quantities and usage hours for accurate sizing.',
    badge: 'Most Accurate',
  },
  {
    id: 'modern-home',
    icon: '✨',
    title: 'Modern Home',
    subtitle: 'Switch to all-electric living',
    desc: 'Pick modern electric upgrades and add your existing home appliances.',
    badge: 'Premium',
  },
];

export default function PathSelectionStep({ onSelect }: { onSelect: (path: EntryPath) => void }) {
  return (
    <div className="screen">
      <div style={{ maxWidth: 760, width: '100%' }}>
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 className="display" style={{ fontSize: 48, marginBottom: 12 }}>
            How would you like to size your system?
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 16 }}>
            Choose the path that fits your household best.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          {paths.map((path, index) => (
            <button
              key={path.id}
              type="button"
              className="option-card"
              onClick={() => onSelect(path.id)}
              style={{ textAlign: 'left', borderColor: 'transparent' }}
            >
              <div className="option-card-number">{String(index + 1).padStart(2, '0')}</div>
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 44 }}>{path.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span className="display" style={{ fontSize: 22 }}>{path.title}</span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '3px 10px',
                        borderRadius: 100,
                        background: 'rgba(0,0,0,0.2)',
                        border: `1px solid var(--muted)`,
                        color: 'var(--muted)',
                      }}
                    >
                      {path.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{path.desc}</div>
                  <div style={{ marginTop: 10, color: 'var(--muted)', fontSize: 12 }}>{path.subtitle}</div>
                </div>
                <span style={{ fontSize: 22, opacity: 0.4 }}>→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
