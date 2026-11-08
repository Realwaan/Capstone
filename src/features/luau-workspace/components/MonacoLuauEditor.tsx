import React, { useEffect, useRef } from 'react';

type Props = {
  value: string;
  language: string;
  theme: string;
  onChange: (v: string) => void;
  path: string;
};

export const MonacoLuauEditor: React.FC<Props> = ({ value, language, theme: _theme, onChange, path }) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Lightweight fallback: textarea with Luau-like styling.
  // Swap with @monaco-editor/react when you add `monaco-editor` dep:
  //   <MonacoEditor height="100%" language={language === 'luau' ? 'lua' : language} theme={...} value={value} onChange={v => onChange(v ?? '')} path={path} />
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
    }
  }, [path]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-surface, #0e1116)' }}>
      <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>{path} · {language}</span>
        <span style={{ opacity: 0.7 }}>Monaco stub — add <code>monaco-editor</code> for full LSP highlighting</span>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        spellCheck={false}
        style={{
          flex: 1, width: '100%', resize: 'none', border: 'none', outline: 'none',
          background: '#0e1116', color: '#e6edf3', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '13px', lineHeight: 1.6, padding: '14px 16px', tabSize: 4,
        }}
        placeholder="-- Luau code"
      />
    </div>
  );
};
