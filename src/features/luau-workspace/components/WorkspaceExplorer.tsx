import React from 'react';
import type { WorkspaceFile } from '../types';

type Props = {
  files: WorkspaceFile[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
};

export const WorkspaceExplorer: React.FC<Props> = ({ files, activeId, onSelect, onCreate }) => {
  const grouped = {
    workspace: files.filter(f => f.path.startsWith('workspace/')),
    scripts: files.filter(f => f.path.startsWith('scripts/')),
    autoexec: files.filter(f => f.path.startsWith('autoexec/')),
    config: files.filter(f => !f.path.includes('/')),
    themes: files.filter(f => f.path.startsWith('themes/')),
  };

  const Section: React.FC<{ title: string; items: WorkspaceFile[] }> = ({ title, items }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase', margin: '8px 8px 6px' }}>{title}</div>
      {items.map(f => (
        <button
          key={f.id}
          onClick={() => onSelect(f.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
            padding: '6px 8px', borderRadius: 6, border: 'none',
            background: activeId === f.id ? 'var(--primary-light)' : 'transparent',
            color: activeId === f.id ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font-mono)',
          }}
          title={f.path}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: f.modified ? 'var(--warning, #f59e0b)' : 'transparent', flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.path}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ padding: '8px 6px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px' }}>
        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Explorer</span>
        <button onClick={onCreate} className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>+ New</button>
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '0 8px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
        Mirrors <code>Real/workspace</code>, <code>scripts</code>, <code>autoexec</code> + <code>Madium/Bin</code>
      </div>
      <Section title="Workspace" items={grouped.workspace} />
      <Section title="Scripts" items={grouped.scripts} />
      <Section title="Autoexec" items={grouped.autoexec} />
      <Section title="Config" items={grouped.config} />
      <Section title="Themes" items={grouped.themes} />
    </div>
  );
};
