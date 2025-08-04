const { app, BrowserWindow, globalShortcut } = require('electron');
const { execFile } = require('child_process');
const path = require('path');

let win;
let isClickable = true;

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
win.setIgnoreMouseEvents(!isClickable, { forward: true }); // Démarre cliquable
  win.loadFile('index.html');
}

app.disableHardwareAcceleration();

app.whenReady().then(() => {
  // Exécute le script Python pour générer heroes.json
  execFile('python', [path.join(__dirname, 'python/json$fetch_heroes.py')], (error, stdout, stderr) => {
    if (error) {
      console.error('Erreur lors de l\'exécution de fetch_heroes.py:', error);
    }

    // Exécute le script Python pour générer items.json
    execFile('python', [path.join(__dirname, 'python/json/fetch_items.py')], (error2, stdout2, stderr2) => {
      if (error2) {
        console.error('Erreur lors de l\'exécution de fetch_items.py:', error2);
      }

      createWindow();

      // ...existing shortcut code...
      globalShortcut.register('F8', () => {
        isClickable = !isClickable;
        if (win) {
          win.setIgnoreMouseEvents(!isClickable, { forward: true });
          win.webContents.send('update-clickable-status', isClickable);
          if (isClickable) win.focus();
          console.log(`[Overlay] Mode cliquable: ${isClickable}`);
        }
      });

      globalShortcut.register('F7', () => {
        if (win) {
          win.setVisibleOnAllWorkspaces(true);
          win.setAlwaysOnTop(true, 'screen-saver');
          win.setMenuBarVisibility(false);
          win.setAutoHideMenuBar(true);
          win.showInactive();
          console.log('[Overlay] Forcé en avant-plan via F7');
        }
      });
    });
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});












































