# PredOverlay

<div align="center">
  <img src="assets/images/ico_s.png" alt="PredOverlay Logo" width="128"/>
  
  **A Modern Game Overlay Tool for Strategic Planning**
  
  [![Version](https://img.shields.io/badge/version-0.87-blue.svg)](https://github.com/your-repo/predoverlay)
  [![Electron](https://img.shields.io/badge/electron-latest-brightgreen.svg)](https://electronjs.org/)
  [![License](https://img.shields.io/badge/license-GPL--3.0-green.svg)](LICENSE)
</div>

---

## 🎯 Overview

**PredOverlay** is a sophisticated, transparent overlay application designed for strategic gaming. It provides real-time item management, hero selection, and skill order planning with an intuitive interface that seamlessly integrates with your gaming experience.

### ✨ Key Features

- **🎮 Game Integration**: Transparent overlay that works with any fullscreen application
- **📦 Item Management**: Visual item inventory with 7 customizable slots
- **🦸 Hero Selection**: Comprehensive hero database with quick selection
- **🔧 Skill Planning**: Interactive 18-level skill order table
- **🎵 Audio Feedback**: Immersive sound effects for all interactions
- **⚙️ Persistent Storage**: Auto-save configurations per hero
- **🎨 Modern UI**: Clean, responsive design with smooth animations
- **📐 Scalable Interface**: Multiple overlay sizes for different setups

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **Python** (for data fetching scripts)
- **Windows/macOS/Linux** (Windows recommended for overlay features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/predoverlay.git
   cd predoverlay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Launch the application**
   ```bash
   npm start
   ```

---

## 🎮 How to Use

### Initial Setup

1. **Launch PredOverlay** - The application starts in the system tray
2. **Double-click the tray icon** to show/hide the overlay
3. **Press F8** to toggle between clickable and click-through modes

### Core Workflow

#### 1. Hero Selection 🦸‍♂️
- Click the **hero preview** or **mask button** (🎭) to open hero selection
- Browse through the hero database
- Click any hero to select and load their configuration
- Hero data is automatically fetched and cached

#### 2. Item Management 📦
- **Left-click** any item slot to open the item browser
- **Right-click** any slot to clear it instantly
- Browse through the item database with visual previews
- Items are organized and searchable

#### 3. Skill Order Planning 🔧
- **Left-click** skill table cells to assign skill levels (1-18)
- **Right-click** to remove skill points and auto-reorganize
- Each row represents a different skill (Q, W, E, R)
- Visual feedback shows your skill progression

#### 4. Configuration Management 💾
- **Auto-save**: Configurations save automatically per hero
- **Save button** (💾): Manual configuration save
- **Clear button** (🗑️): Reset all items and skills
- **Persistent storage**: Data survives application restarts

---

## 🎛️ Interface Guide

### Header Section
```
┌─────────────────────────────────────────────────────────┐
│ 🎯 PRED OVERLAY                            v.087        │
│ Interaction mode: UNLOCKED                              │
│ Press F8 to lock/unlock overlay      [🔄][🗑️][💾][🎭] │
└─────────────────────────────────────────────────────────┘
```

- **Status Indicator**: Shows LOCKED/UNLOCKED state
- **Resize Button** (🔄): Cycle through overlay sizes
- **Clear Button** (🗑️): Reset all configurations
- **Save Button** (💾): Manual configuration save
- **Hero Button** (🎭): Open hero selection

### Item Inventory
```
┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     ┌────┐
│ 1  │ │ 2  │ │ 3  │ │ 4  │ │ 5  │ │ 6  │ │ 7  │ ... │ 👤 │
└────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘     └────┘
```

- **7 Item Slots**: Store your item build
- **Hero Preview**: Shows selected hero portrait

### Skill Order Table
```
┌────┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐
│ 🖱️ │ 1│ 2│ 3│ 4│ 5│ 6│ 7│ 8│ 9│10│11│12│13│14│15│16│17│18│
├────┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤
│ Q  │  │  │ 1│  │  │ 2│  │  │ 3│  │  │ 4│  │  │ 5│  │  │  │
│ W  │  │ 1│  │  │ 2│  │  │ 3│  │  │ 4│  │  │ 5│  │  │  │  │
│ E  │ 1│  │  │ 2│  │  │ 3│  │  │ 4│  │  │ 5│  │  │  │  │  │
│ R  │  │  │  │  │  │ 1│  │  │  │  │  │ 2│  │  │  │  │  │ 3│
└────┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Function | Description |
|----------|----------|-------------|
| **F8** | Toggle Lock | Switch between clickable/click-through modes |
| **F7** | Force Focus | Emergency overlay restoration to foreground |
| **Right-Click** | Context Actions | Clear items, remove skill points |
| **Double-Click** | Show/Hide | Toggle overlay visibility (tray icon) |

---

## 🔧 Advanced Features

### Overlay Modes

#### 🔓 Unlocked Mode
- **Interactive**: Full mouse and keyboard interaction
- **Configurable**: Modify items, skills, and settings
- **Visual Feedback**: Hover effects and animations active

#### 🔒 Locked Mode  
- **Click-Through**: Mouse passes through to game
- **Read-Only**: View-only mode for gameplay reference
- **Reduced Interaction**: Locked elements cannot be modified

### Audio System

PredOverlay includes rich audio feedback:
- **Click Sounds**: Satisfying click feedback for interactions
- **Item Selection**: Audio cue when selecting items
- **Hero Selection**: Sound effect for hero changes
- **Volume Control**: Sounds are pre-balanced at 60% system volume

### Scaling System
- **Multiple Sizes**: Resize button cycles through different scales
- **Smart Scaling**: Maintains aspect ratio and positioning
- **Instant Apply**: No restart required for size changes

### Data Management

#### Auto-Fetching
- **Hero Database**: Updated from JSON files via Python scripts
- **Item Database**: Fresh item data with each launch
- **Image Assets**: Efficient asset management and caching

#### Storage System
- **Per-Hero Configs**: Each hero saves independent settings
- **LocalStorage**: Browser-based persistence
- **JSON Format**: Human-readable configuration files

---

## 🛠️ Development

### Project Structure
```
predoverlay/
├── assets/
│   ├── images/          # Icons and UI graphics
│   ├── sounds/          # Audio feedback files
│   ├── style/           # CSS stylesheets
│   └── fonts/           # Custom typography
├── js/
│   ├── script.js        # Core application logic
│   └── sounds.js        # Audio management
├── python/
│   └── json/            # Data fetching scripts
├── main.js              # Electron main process
├── index.html           # Application interface
└── package.json         # Project configuration
```

### Build Process
```bash
# Development mode
npm run dev

# Production build
npm run build

# Package for distribution
npm run dist
```

---

## 🤝 System Tray Integration

PredOverlay runs efficiently in your system tray:

### Tray Features
- **🖱️ Double-click**: Show/hide overlay
- **📋 Right-click menu**:
  - Show Overlay
  - Hide Overlay
  - Toggle Interaction (F8)
  - Force Foreground (F7)
  - Quit

### Background Operation
- **Minimal Resources**: Efficient memory and CPU usage
- **Always Available**: Persistent system tray presence
- **Quick Access**: Instant overlay activation

---

## 📋 System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.13, Ubuntu 18.04
- **RAM**: 4GB (2GB available)
- **Storage**: 500MB free space
- **Display**: 1920x1080 (recommended)

### Recommended Setup
- **OS**: Windows 11 (best overlay support)
- **RAM**: 8GB or higher
- **GPU**: Dedicated graphics card
- **Network**: Broadband (for data updates)

---

## 🐛 Troubleshooting

### Common Issues

#### Overlay Not Visible
1. Press **F7** to force overlay to foreground
2. Check if overlay is in click-through mode (press **F8**)
3. Look for the tray icon and double-click it

#### No Sound Effects
1. Verify system audio is working
2. Check Windows volume mixer for PredOverlay
3. Restart the application

#### Performance Issues
1. Close unnecessary applications
2. Use the resize button to reduce overlay scale
3. Disable hardware acceleration (automatically done)

#### Data Not Loading
1. Check internet connection for Python data scripts
2. Verify Python installation
3. Restart the application

---

## 📝 License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

### GPL v3.0 Summary
- ✅ **Commercial use** - You can use this software commercially
- ✅ **Modification** - You can modify the source code
- ✅ **Distribution** - You can distribute this software
- ✅ **Patent use** - Express grant of patent rights from contributors
- ⚠️ **Copyleft** - Derivative works must be under the same license
- ⚠️ **Disclose source** - Source code must be made available
- ⚠️ **License and copyright notice** - Must include license and copyright notice

---

## 🎯 Support

For support, feature requests, or bug reports:

- **📧 Email**: support@predoverlay.com
- **🐛 Issues**: [GitHub Issues](https://github.com/your-repo/predoverlay/issues)
- **💬 Discord**: [Join our community](https://discord.gg/predoverlay)

---

## 🤝 Contributing

Contributions are welcome! Since this project is under GPL v3.0:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

Please ensure your contributions comply with the GPL v3.0 license terms.

---

<div align="center">
  <sub>Built with ❤️ for the Predecessor community</sub>
  <br>
  <sub>Licensed under GPL v3.0 - Freedom to use, study, share and improve</sub>
</div>