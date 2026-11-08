import type { ThemeId } from '../types';

export const themes: Record<ThemeId, { label: string; monacoTheme: string; cssVars: Record<string, string> }> = {
  'real-dark': { label: 'Real Dark (ported from Real/icons/real-taskbar-dark.ico)', monacoTheme: 'vs-dark', cssVars: { '--bg': '#0e1116', '--fg': '#e6edf3' } },
  dark: { label: 'Dark', monacoTheme: 'vs-dark', cssVars: {} },
  light: { label: 'Light', monacoTheme: 'vs', cssVars: {} },
  midnight: { label: 'Midnight', monacoTheme: 'hc-black', cssVars: {} },
};
