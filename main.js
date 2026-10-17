const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
let autoUpdater = null;
try { autoUpdater = require('electron-updater').autoUpdater; } catch (e) { autoUpdater = null; }
const path = require('path');
const fs = require('fs');
app.setName('NIA Compta');
const dir = () => path.join(app.getPath('userData'));
const safe = (n) => path.join(dir(), path.basename(String(n)));
let win = null;
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } };
function createWindow() {
  win = new BrowserWindow({ width: 1280, height: 820, minWidth: 900, minHeight: 600, title: 'NIA Compta', backgroundColor: '#F2F5F9', autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  win.loadFile(path.join(__dirname, 'index.html'));
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file://')) { e.preventDefault(); shell.openExternal(url); } });
}
ipcMain.handle('nia:read', (_e, n) => { const f = safe(n); return readJson(f) || readJson(f + '.bak'); });
ipcMain.handle('nia:write', (_e, n, data) => {
  const f = safe(n); fs.mkdirSync(path.dirname(f), { recursive: true });
  const tmp = f + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(data), 'utf8');
  if (fs.existsSync(f)) fs.copyFileSync(f, f + '.bak');
  fs.renameSync(tmp, f); return true;
});
ipcMain.handle('nia:path', () => dir());
ipcMain.handle('nia:quit', () => { app.quit(); });
ipcMain.handle('nia:saveFile', async (_e, name, content) => {
  const r = await dialog.showSaveDialog(win, { defaultPath: path.join(app.getPath('documents'), String(name)), filters: [{ name: 'Fichier', extensions: [String(name).split('.').pop()] }] });
  if (r.canceled || !r.filePath) return null;
  fs.writeFileSync(r.filePath, String(content), 'utf8'); return r.filePath;
});

// ---- Mises à jour automatiques via GitHub Releases ----
let manual = false;
function setupUpdater() {
  if (!autoUpdater || !app.isPackaged) return;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('update-available', (i) => { if (manual) dialog.showMessageBox(win, { type: 'info', message: 'Mise à jour ' + i.version + ' disponible', detail: 'Téléchargement en cours…' }); });
  autoUpdater.on('update-not-available', () => { if (manual) dialog.showMessageBox(win, { type: 'info', message: 'NIA Compta est à jour (version ' + app.getVersion() + ').' }); manual = false; });
  autoUpdater.on('error', (e) => { if (manual) dialog.showMessageBox(win, { type: 'warning', message: 'Recherche de mise à jour impossible', detail: String(e && e.message || e).slice(0, 300) }); manual = false; });
  autoUpdater.on('update-downloaded', (i) => {
    manual = false;
    dialog.showMessageBox(win, { type: 'question', buttons: ['Redémarrer maintenant', 'Plus tard'], defaultId: 0, message: 'Version ' + i.version + ' prête', detail: 'Vos données ne seront pas touchées. Redémarrer pour installer ?' })
      .then((r) => { if (r.response === 0) autoUpdater.quitAndInstall(); });
  });
  autoUpdater.checkForUpdates().catch(() => {});
}
function checkNow() {
  if (!autoUpdater || !app.isPackaged) { dialog.showMessageBox(win, { type: 'info', message: 'Les mises à jour fonctionnent avec la version installée (Setup.exe).' }); return; }
  manual = true; autoUpdater.checkForUpdates().catch(() => { manual = false; });
}
app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate([{ label: 'Édition', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] }, { label: 'Affichage', submenu: [{ role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'togglefullscreen' }] }, { label: 'Aide', submenu: [{ label: 'Version ' + app.getVersion(), enabled: false }, { label: 'Rechercher une mise à jour…', click: checkNow }] }]));
  createWindow();
  setupUpdater();
});
app.on('window-all-closed', () => app.quit());
