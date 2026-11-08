const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('luauWorkspace', {
  getLspStatus: () => ipcRenderer.invoke('lsp-status'),
  isElectron: true,
});
