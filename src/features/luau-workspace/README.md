# Luau Workspace — Real + Madium reference recreation

Clean recreation of the *legitimate* parts of Real 2.3.2 and Madium 1.6.8.

## Reference (do not copy binaries)
- `Real.lnk` → `C:\Users\Keshie\AppData\Local\Real\Update.exe --processStart Real.exe` (Squirrel), `real-2.3.2/Real.exe`, `bin/luau-lsp.exe@1.68.1`, `autoexec/`, `scripts/`, `workspace/`, `themes/`, `icons/`, `ipc/`, `real-mcp.exe`
- `Madium.lnk` → `C:\Users\Keshie\AppData\Local\Madium\Bin\Madium.exe 0.1.0`, `Madium-Module.dll`, `Loader.exe`, `Bin/lsp/luau-lsp.exe` (16.9 MB, same hash), `version.txt 1.6.8`

Both ship the **public** `luau-lsp@1.68.1` (JohnnyMorganz). This recreation reuses the public binary via sidecar, not the proprietary DLLs.

## What's implemented
**Option A — Web IDE** (this repo, Vite React):
- `src/features/luau-workspace/WorkspaceView.tsx` — main view routed at `#workspace`
- `components/WorkspaceExplorer` — workspace/scripts/autoexec/themes tree
- `components/MonacoLuauEditor` — textarea stub (swap with `@monaco-editor/react` + `monaco-editor`)
- `lsp/client.ts` — mock LSP (ready to swap with real luau-lsp in Tauri)
- `mcp/server.ts` — mock MCP tools mirroring `real-mcp.exe`
- `themes/index.ts` — ported Real Dark

**Option B — Tauri shell**:
- `src-tauri/tauri.conf.json` wraps `npm run dev` / `dist`, bundles `bin/luau-lsp.exe` as resource
- `src-tauri/src/main.rs` + `Cargo.toml` with `tauri-plugin-shell` for sidecar spawn
- No Spoofer/Loader — intentionally omitted (ToS/ban risk)

## Run
```bash
npm run dev      # open #workspace in sidebar → Luau Workspace
npm run typecheck
npm run build
# Tauri (requires Rust):
# cargo install tauri-cli
# place luau-lsp binary in src-tauri/bin/
# npm run tauri dev
```

## Upgrade to real Monaco
```bash
npm i monaco-editor @monaco-editor/react
# then replace MonacoLuauEditor textarea with <Editor language="lua" />
```
