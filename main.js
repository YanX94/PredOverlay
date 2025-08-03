const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

let win;
let isClickable = false;

function createWindow() {
  win = new BrowserWindow({
    titleBarStyle: 'customButtonsOnHover',
    width: 800,
    height: 600,
    frame: false,
    transparent: true,
    alwaysOnTop: true, // Initial alwaysOnTop (will be reinforced below)
    skipTaskbar: false, // Keep in taskbar to avoid losing access
    hasShadow: false,
    resizable: false,
    icon: path.join(__dirname, 'assets', 'ico.png'), // 👈 Icône personnalisée ici
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });


  win.webContents.openDevTools(); // 👈 Ouvre DevTools automatiquement

  // 🛠️ Renforce la priorité de la fenêtre (niveau screen-saver)
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true); // multi-écrans
  win.setIgnoreMouseEvents(true, { forward: true }); // Démarre non-cliquable
  win.loadFile('index.html');
}

app.disableHardwareAcceleration();

app.whenReady().then(() => {
  createWindow();




  // 🎮 F8 : toggle clic / overlay
  globalShortcut.register('F8', () => {
    isClickable = !isClickable;
    if (win) {
      win.setIgnoreMouseEvents(!isClickable, { forward: true });
      win.webContents.send('update-clickable-status', isClickable);
      if (isClickable) win.focus();
      console.log(`[Overlay] Mode cliquable: ${isClickable}`);
    }
  });

  // 🧲 F7 : remet l'overlay tout en haut
  globalShortcut.register('F7', () => {
    if (win) {
      win.setVisibleOnAllWorkspaces(true);
      win.setAlwaysOnTop(true, 'screen-saver');
      win.setMenuBarVisibility(false);
win.setAutoHideMenuBar(true);
      win.showInactive(); // Remonte sans voler le focus
      console.log('[Overlay] Forcé en avant-plan via F7');
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

