# Bin sidecars — place PUBLIC binaries here

This folder intentionally does NOT contain proprietary Real/Madium binaries.

To enable full LSP in Tauri (Option B):

1. Download public `luau-lsp` from https://github.com/JohnnyMorganz/luau-lsp/releases (v1.68.1 to match Real/Madium reference)
2. Place as `src-tauri/bin/luau-lsp.exe` (Windows) or `luau-lsp` (macOS/Linux)
3. Tauri will bundle it via `tauri.conf.json > bundle.resources`

Real 2.3.2 and Madium 1.6.8 both shipped the same 16.9 MB luau-lsp.exe — this is that public binary, not a copy of their proprietary `Real.dll`/`Madium-Module.dll`/`Spoofer.exe`/`Loader.exe`.

For web dev (Option A), no binary needed — the app uses the mock LSP client in `src/features/luau-workspace/lsp/client.ts`.
