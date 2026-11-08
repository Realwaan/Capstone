import React, { useState } from 'react';
import { mcpTools } from '../mcp/server';

export const McpPanel: React.FC<{ logs: string[]; onCall: (name: string, args: Record<string, unknown>) => void }> = ({ logs, onCall }) => {
  const [selected, setSelected] = useState(mcpTools[0].name);
  return (
    <div style={{ borderTop: '1px solid var(--border-subtle)', padding: 10 }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
        MCP — mirrors Real/bin/real-mcp.exe
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {mcpTools.map(t => (
          <button
            key={t.name}
            onClick={() => setSelected(t.name)}
            style={{
              padding: '4px 8px', borderRadius: 6, fontSize: '0.72rem', fontFamily: 'var(--font-mono)',
              border: '1px solid var(--border-card)', background: selected === t.name ? 'var(--primary-light)' : 'var(--bg-elevated)',
              cursor: 'pointer',
            }}
            title={t.description}
          >
            {t.name}
          </button>
        ))}
      </div>
      <button onClick={() => onCall(selected, {})} className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '6px 10px' }}>
        Call {selected}
      </button>
      {logs.length > 0 && (
        <pre style={{ marginTop: 10, maxHeight: 120, overflow: 'auto', background: 'var(--bg-elevated)', padding: 8, borderRadius: 6, fontSize: '0.72rem' }}>
          {logs.slice(-20).join('\n')}
        </pre>
      )}
    </div>
  );
};
