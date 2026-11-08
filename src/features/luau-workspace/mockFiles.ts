import type { WorkspaceFile } from './types';

export const initialFiles: WorkspaceFile[] = [
  {
    id: 'workspace-main',
    name: 'main.luau',
    path: 'workspace/main.luau',
    language: 'luau',
    content: `-- Luau Workspace — main.luau
-- Mirrors Real/workspace + Madium workspace pattern
-- Uses luau-lsp@1.68.1 for diagnostics (see lsp/client.ts)

local Workspace = {}

function Workspace.hello(name: string): string
    return \`Hello, \${name}!\`
end

-- Strict Luau type — solver v2
type Player = {
    id: string,
    name: string,
    score: number,
}

local p: Player = { id = "1", name = "Keshie", score = 0 }
print(Workspace.hello(p.name))
return Workspace
`,
    modified: false,
  },
  {
    id: 'scripts-utils',
    name: 'utils.luau',
    path: 'scripts/utils.luau',
    language: 'luau',
    content: `-- scripts/utils.luau — shared helpers (Real/scripts + Madium scripts)
local Utils = {}

function Utils.clamp(n: number, lo: number, hi: number): number
    return math.max(lo, math.min(hi, n))
end

return Utils
`,
    modified: false,
  },
  {
    id: 'autoexec-init',
    name: 'init.luau',
    path: 'autoexec/init.luau',
    language: 'luau',
    content: `-- autoexec/init.luau — runs on workspace load (Real/autoexec)
print("[autoexec] workspace ready")
`,
    modified: false,
  },
  {
    id: 'lsp-config',
    name: '.luaurc',
    path: '.luaurc',
    language: 'json',
    content: `{
  "languageMode": "strict",
  "lint": { "*": true },
  "sourcemap": "sourcemap.json"
}`,
    modified: false,
  },
  {
    id: 'themes-config',
    name: 'theme.json',
    path: 'themes/theme.json',
    language: 'json',
    content: `{
  "id": "real-dark",
  "name": "Real Dark (ported)",
  "source": "Real/themes + Madium themes"
}`,
    modified: false,
  },
];
