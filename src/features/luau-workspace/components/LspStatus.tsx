import React from 'react';
import type { LspStatus } from '../types';

export const LspStatusBadge: React.FC<{ status: LspStatus; version: string; onConnect: () => void }> = ({ status, version, onConnect }) => {
  const color: Record<LspStatus, string> = { idle: 'var(--text-muted)', connecting: '#f59e0b', ready: '#22c55e', error: '#ef4444' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color[status], display: 'inline-block' }} />
      <span style={{ color: 'var(--text-secondary)' }}>{status}</span>
      <span style={{ color: 'var(--text-muted)' }} title="Mirrors Real/bin/luau-lsp.exe + Madium/Bin/lsp/luau-lsp.exe">{version}</span>
      {status !== 'ready' && status !== 'connecting' && (
        <button onClick={onConnect} className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>Connect</button>
      )}
    </div>
  );
};
