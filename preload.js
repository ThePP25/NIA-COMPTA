const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('nia', {
  read: (n) => ipcRenderer.invoke('nia:read', n),
  write: (n, d) => ipcRenderer.invoke('nia:write', n, d),
  path: () => ipcRenderer.invoke('nia:path'),
  saveFile: (name, content) => ipcRenderer.invoke('nia:saveFile', name, content),
  quit: () => ipcRenderer.invoke('nia:quit')
});
