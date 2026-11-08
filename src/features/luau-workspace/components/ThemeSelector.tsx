import React from 'react';
import { themes } from '../themes';
import type { ThemeId } from '../types';

export const ThemeSelector: React.FC<{ value: ThemeId; onChange: (t: ThemeId) => void }> = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Theme</span>
    <select value={value} onChange={e => onChange(e.target.value as ThemeId)} style={{ fontSize: '0.78rem', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border-card)', background: 'var(--bg-elevated)' }}>
      {Object.entries(themes).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
    </select>
  </div>
);
