const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let lspProcess = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Luau Workspace — Real+Madium reference (no Spoofer)',
    icon: path.join(__dirname, '../public/vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
  });

  // In dev, load vite server; in packaged, load dist/index.html
  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL(devUrl + '/#workspace').catch(() => win.loadFile(path.join(__dirname, '../dist/index.html')));
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'workspace' });
  }
}

function startLsp() {
  // Sidecar: mirrors Real/bin/luau-lsp.exe + Madium/Bin/lsp/luau-lsp.exe
  // Public binary at src-tauri/bin/luau-lsp.exe (also copied to electron/bin)
  const candidates = [
    path.join(__dirname, '../src-tauri/bin/luau-lsp.exe'),
    path.join(__dirname, 'bin/luau-lsp.exe'),
    path.join(process.resourcesPath || '', 'bin/luau-lsp.exe'),
  ];
  const exe = candidates.find(p => { try { return require('fs').existsSync(p); } catch { return false; } });
  if (!exe) {
    console.log('[lsp] luau-lsp.exe not found, using mock');
    return;
  }
  console.log('[lsp] spawning', exe, 'lsp');
  lspProcess = spawn(exe, ['lsp'], { stdio: ['pipe', 'pipe', 'pipe'] });
  lspProcess.on('error', e => console.error('[lsp] spawn error', e));
  lspProcess.on('exit', c => console.log('[lsp] exit', c));
}

app.whenReady().then(() => {
  startLsp();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => {
  if (lspProcess) try { lspProcess.kill(); } catch {}
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('lsp-status', () => ({ version: 'luau-lsp@1.68.1', sidecar: !!lspProcess }));
