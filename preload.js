
const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs seguras para o renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Navegação
  navigateTo: (route) => ipcRenderer.send('navigate-to', route),
  
  // Eventos da aplicação
  onNewProject: (callback) => ipcRenderer.on('new-project', callback),
  onExportPdf: (callback) => ipcRenderer.on('export-pdf', callback),
  onNavigateTo: (callback) => ipcRenderer.on('navigate-to', callback),
  
  // Remover listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
