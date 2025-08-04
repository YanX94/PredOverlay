const { app, BrowserWindow, globalShortcut, Tray, Menu } = require('electron');
const { execFile } = require('child_process');
const path = require('path');

// ==========================================
// EARLY APP CONFIGURATION
// ==========================================

/**
 * Disable hardware acceleration for better overlay compatibility
 * Must be called before app.whenReady()
 */
app.disableHardwareAcceleration();

// ==========================================
// GLOBAL STATE MANAGEMENT
// ==========================================

/**
 * Main application window reference
 */
let mainWindow = null;

/**
 * System tray icon reference
 */
let tray = null;

/**
 * Tracks whether the overlay accepts mouse interactions
 * true = clickable overlay, false = click-through overlay
 */
let isOverlayClickable = true;

// ==========================================
// WINDOW CREATION & CONFIGURATION
// ==========================================

/**
 * Creates and configures the main overlay window
 * Sets up transparency, always-on-top behavior, and click-through functionality
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    // Window appearance
    width: 800,
    height: 600,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    
    // Window behavior
    alwaysOnTop: true,
    skipTaskbar: true,  // Hide from taskbar - now in system tray
    show: false,        // Don't show initially
    titleBarStyle: 'customButtonsOnHover',
    
    // Application icon
    icon: path.join(__dirname, 'assets', 'images', 'ico_s.png'),
    
    // Security and integration settings
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Enhanced always-on-top behavior for overlay functionality
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true);
  
  // Initialize overlay as clickable
  mainWindow.setIgnoreMouseEvents(!isOverlayClickable, { forward: true });
  
  // Load the main interface
  mainWindow.loadFile('index.html');
  
  // Show window after loading
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  
  // Prevent window from being closed, hide it instead
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
  
  // Development tools (remove in production)
  mainWindow.webContents.openDevTools();
}

// ==========================================
// SYSTEM TRAY MANAGEMENT
// ==========================================

/**
 * Creates and configures the system tray icon
 * Sets up context menu with quit option
 */
function createSystemTray() {
  // Create tray icon - corrected path
  const trayIconPath = path.join(__dirname, 'assets', 'images', 'ico_s.png');
  tray = new Tray(trayIconPath);
  
  // Set tooltip
  tray.setToolTip('PredOverlay - Game Overlay Tool');
  
  // Create context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Overlay',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: 'Hide Overlay',
      click: () => {
        if (mainWindow) {
          mainWindow.hide();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Toggle Interaction (F8)',
      click: () => {
        toggleOverlayInteraction();
      }
    },
    {
      label: 'Force Foreground (F7)',
      click: () => {
        forceOverlayToForeground();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        // Set quit flag and properly quit the application
        app.isQuiting = true;
        if (mainWindow) {
          mainWindow.close();
        }
        app.quit();
      }
    }
  ]);
  
  // Set context menu
  tray.setContextMenu(contextMenu);
  
  // Double-click to show/hide window
  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
  
  console.log('[Tray] System tray icon created');
}

// ==========================================
// DATA INITIALIZATION SYSTEM
// ==========================================

/**
 * Executes Python scripts to fetch and generate JSON data files
 * Handles heroes and items data preparation before window creation
 */
function initializeGameData() {
  const scriptsPath = path.join(__dirname, 'python', 'json');
  
  // Fetch heroes data
  const heroesScript = path.join(scriptsPath, 'fetch_heroes.py');
  execFile('python', [heroesScript], (error, stdout, stderr) => {
    if (error) {
      console.error('[Data Init] Failed to fetch heroes data:', error.message);
    } else {
      console.log('[Data Init] Heroes data updated successfully');
    }
    
    // Fetch items data after heroes completion
    const itemsScript = path.join(scriptsPath, 'fetch_items.py');
    execFile('python', [itemsScript], (error2, stdout2, stderr2) => {
      if (error2) {
        console.error('[Data Init] Failed to fetch items data:', error2.message);
      } else {
        console.log('[Data Init] Items data updated successfully');
      }
      
      // Create window and tray after data initialization
      createMainWindow();
      createSystemTray();
      registerGlobalShortcuts();
    });
  });
}

// ==========================================
// GLOBAL SHORTCUTS SYSTEM
// ==========================================

/**
 * Registers global keyboard shortcuts for overlay control
 * F8: Toggle click-through mode
 * F7: Force overlay to foreground
 */
function registerGlobalShortcuts() {
  // F8: Toggle overlay interaction mode
  globalShortcut.register('F8', () => {
    toggleOverlayInteraction();
  });
  
  // F7: Force overlay to foreground (emergency restore)
  globalShortcut.register('F7', () => {
    forceOverlayToForeground();
  });
  
  console.log('[Shortcuts] Global shortcuts registered (F7: Force foreground, F8: Toggle interaction)');
}

/**
 * Toggles between clickable and click-through overlay modes
 * Notifies the renderer process of the state change
 */
function toggleOverlayInteraction() {
  if (!mainWindow) return;
  
  isOverlayClickable = !isOverlayClickable;
  
  // Update window mouse event handling
  mainWindow.setIgnoreMouseEvents(!isOverlayClickable, { forward: true });
  
  // Notify renderer process of state change
  mainWindow.webContents.send('update-clickable-status', isOverlayClickable);
  
  // Focus window when made clickable
  if (isOverlayClickable) {
    mainWindow.show();
    mainWindow.focus();
  }
  
  const mode = isOverlayClickable ? 'CLICKABLE' : 'CLICK-THROUGH';
  console.log(`[Overlay] Interaction mode changed to: ${mode}`);
}

/**
 * Forces the overlay window to the foreground
 * Emergency function to restore overlay visibility
 */
function forceOverlayToForeground() {
  if (!mainWindow) return;
  
  // Restore all overlay properties
  mainWindow.show();
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setAutoHideMenuBar(true);
  mainWindow.focus();
  
  console.log('[Overlay] Forced to foreground via F7');
}

// ==========================================
// APPLICATION LIFECYCLE MANAGEMENT
// ==========================================

/**
 * Main application initialization
 * Starts data initialization when app is ready
 */
app.whenReady().then(() => {
  console.log('[App] Application ready, initializing...');
  initializeGameData();
});

/**
 * Cleanup on application quit
 * Unregisters all global shortcuts to prevent conflicts
 */
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (tray) {
    tray.destroy();
  }
  console.log('[App] Global shortcuts unregistered and tray destroyed');
});

/**
 * Handle application activation (macOS specific)
 * Creates window if none exists
 */
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    initializeGameData();
  }
});

/**
 * Prevent default quit behavior on window close (Windows/Linux)
 * Keep running in system tray instead of quitting
 */
app.on('window-all-closed', () => {
  // Don't quit the app when all windows are closed
  // Keep running in system tray
  if (process.platform !== 'darwin') {
    // On Windows/Linux, keep the app running for tray functionality
    console.log('[App] Window closed but keeping app running in system tray');
  }
});

/**
 * Handle before quit event
 * Clean up tray icon
 */
app.on('before-quit', () => {
  app.isQuiting = true;
});