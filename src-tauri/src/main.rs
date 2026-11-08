// Tauri main — Luau Workspace shell (Option B)
// Wraps the Vite React app and sidecars the PUBLIC luau-lsp binary.
// Mirrors Real's bin/luau-lsp.exe + Madium's Bin/lsp/luau-lsp.exe without proprietary code.
// No spoofer/loader/bypass logic — intentionally omitted.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_shell::ShellExt;

#[tauri::command]
fn lsp_status() -> String {
    // In production, spawn sidecar: app.shell().sidecar("bin/luau-lsp").unwrap().command().args(["lsp"]).spawn()
    "luau-lsp@1.68.1 sidecar placeholder — drop real binary to src-tauri/bin/luau-lsp.exe".into()
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![lsp_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
