  const { ipcRenderer } = require("electron");

  // ==========================================
  // GLOBAL VARIABLES & STATE MANAGEMENT
  // ==========================================
  let isLocked = false;
  let itemsCache = [];
  let heroesCache = [];
  let selectedHero = null;
  let currentLevel = 1;
  const maxLevels = 18;
  const skills = ["mouse-right", "q", "e", "r"];
  
  // Skill order state: 4 skills x 18 levels matrix
  const state = Array(4).fill(null).map(() => Array(maxLevels).fill(null));

  // DOM elements
  const slots = document.querySelectorAll(".item-slot");
  const modal = document.getElementById("item-modal");
  const table = document.getElementById("skill-table");
  const heroBtn = document.getElementById("choose-hero-btn");
  const heroBtn2 = document.getElementById("selected-hero-preview");
  const heroModal = document.getElementById("hero-modal");
  const selectedHeroSpan = document.getElementById("selected-hero");

  // ==========================================
  // OVERLAY LOCK/UNLOCK SYSTEM
  // ==========================================
ipcRenderer.on("update-clickable-status", (_, isClickable) => {
  const status = document.getElementById("status");
  const overlayBox = document.getElementById("overlay-box");
  isLocked = !isClickable;

  // Toggle locked class on interactive elements
  document.querySelectorAll(".item-slot, #skill-table td").forEach((el) => {
    el.classList.toggle("locked", isLocked);
  });

  // Ajoute cette ligne ici :
  document.getElementById('selected-hero-preview').classList.toggle('locked', isLocked);

  // Update UI status
  if (isClickable) {
    status.className = "active";
    status.innerText = "UNLOCKED";
    overlayBox.style.display = "block";
  } else {
    status.className = "inactive";
    status.innerText = "LOCKED";
    overlayBox.style.display = "none";
  }
});

  // ==========================================
  // ITEM SLOTS MANAGEMENT
  // ==========================================
  
  // Load items from JSON file
  async function loadItems() {
    if (itemsCache.length === 0) {
      try {
        const res = await fetch("assets/json/items.json");
        itemsCache = await res.json();
      } catch (err) {
        console.error("Error loading items:", err);
      }
    }
  }

  // Show item selection modal
  function showItemModal(targetSlot) {
    modal.innerHTML = `
      <button id="close-item-modal">✖</button>
      ${itemsCache.map(item => 
        `<img src="${item.image}" data-id="${item.id}" class="item-choice" 
             title="${item.name}" style="width:64px;height:64px;margin:6px;cursor:pointer;border:2px solid #222;">`
      ).join("")}
    `;
    modal.style.display = "block";

    // Close modal handler
    document.getElementById("close-item-modal").onclick = () => {
      modal.style.display = "none";
    };

    // Item selection handlers
    document.querySelectorAll(".item-choice").forEach((img) => {
      img.addEventListener("click", () => {
        if (isLocked) return;
        const selected = itemsCache.find((i) => i.id == img.dataset.id);
        targetSlot.innerHTML = `<img src="${selected.image}" alt="${selected.name}" style="width: 64px; height: 64px;">`;
        modal.style.display = "none";
      });
    });
  }

  // Initialize item slots
  slots.forEach((slot) => {
    // Right-click to clear slot
    slot.addEventListener("contextmenu", (e) => {
      if (isLocked) return;
      e.preventDefault();
      slot.innerHTML = "";
    });

    // Left-click to select item
    slot.addEventListener("click", async () => {
      if (isLocked) return;
      await loadItems();
      showItemModal(slot);
    });
  });

  // ==========================================
  // SKILL ORDER TABLE MANAGEMENT
  // ==========================================

  // Create skill table dynamically
  function createTable() {
    for (let i = 0; i < skills.length; i++) {
      const row = document.createElement("tr");

      // Skill icon column
      const iconCell = document.createElement("td");
      iconCell.classList.add("skill-icon");
      const img = document.createElement("img");
img.src = `assets/images/${skills[i]}.png`;
      img.alt = skills[i].toUpperCase();
      iconCell.appendChild(img);
      row.appendChild(iconCell);

      // Level columns
      for (let j = 0; j < maxLevels; j++) {
        const cell = document.createElement("td");
        cell.dataset.row = i;
        cell.dataset.col = j;
        cell.addEventListener("click", handleLeftClick);
        cell.addEventListener("contextmenu", handleRightClick);
        row.appendChild(cell);
      }

      table.appendChild(row);
    }
  }

  // Add skill level on left-click
  function handleLeftClick(e) {
    if (isLocked) return;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);

    if (state[row][col] === null && currentLevel <= maxLevels) {
      state[row][col] = currentLevel;
      e.target.classList.add("skill-level");
      e.target.textContent = currentLevel++;
    }
  }

  // Remove skill level on right-click and reorganize
  function handleRightClick(e) {
    if (isLocked) return;
    e.preventDefault();
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);

    if (state[row][col] !== null) {
      const removed = state[row][col];
      state[row][col] = null;
      e.target.classList.remove("skill-level");
      e.target.textContent = "";

      // Reorganize remaining levels
      for (let i = 0; i < state.length; i++) {
        for (let j = 0; j < state[i].length; j++) {
          if (state[i][j] && state[i][j] > removed) {
            state[i][j] -= 1;
            const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
            cell.textContent = state[i][j];
          }
        }
      }
      currentLevel -= 1;
    }
  }

  // ==========================================
  // HERO SELECTION SYSTEM
  // ==========================================
  
  // Load heroes from JSON file
  async function loadHeroes() {
    if (heroesCache.length === 0) {
      try {
        const res = await fetch("assets/json/heroes.json");
        heroesCache = await res.json();
      } catch (err) {
        console.error("Error loading heroes:", err);
        heroesCache = [];
      }
    }
  }

  // Show hero selection modal
  async function showHeroModal() {
    await loadHeroes();

    heroModal.innerHTML = `
      <button id="close-hero-modal" style="">✖</button>
      ${heroesCache.map(hero => 
        `<img src="${hero.image}" data-id="${hero.id}" title="${hero.display_name || hero.name}" 
             class="hero-choice" style="width:64px;height:64px;margin:6px;cursor:pointer;border:2px solid #222;">`
      ).join("")}
    `;
    heroModal.style.display = "block";

    // Close modal handler
    document.getElementById("close-hero-modal").onclick = () => {
      heroModal.style.display = "none";
    };

    // Hero selection handlers
    document.querySelectorAll(".hero-choice").forEach((img) => {
      img.addEventListener("click", () => {
        selectedHero = heroesCache.find((h) => h.id == img.dataset.id);
        
        // Update hero preview
        const preview = document.getElementById("selected-hero-preview");
        preview.innerHTML = `<img src="${selectedHero.image}" alt="${selectedHero.display_name || selectedHero.name}" 
                                  title="${selectedHero.display_name || selectedHero.name}">`;
    
        heroModal.style.display = "none";
        loadHeroConfig(selectedHero.id);
      });
    });
  }

  // ==========================================
  // CONFIGURATION SAVE/LOAD SYSTEM
  // ==========================================
  
  // Save current configuration to localStorage
  function saveHeroConfig() {
    if (!selectedHero) return;
    
    const config = {
      items: Array.from(slots).map(slot => slot.querySelector("img")?.src || null),
      skillOrder: state.map(row => [...row])
    };
    
    localStorage.setItem("heroConfig_" + selectedHero.id, JSON.stringify(config));
  }

  // Load configuration from localStorage
  function loadHeroConfig(heroId) {
    const configStr = localStorage.getItem("heroConfig_" + heroId);
    
    if (!configStr) {
      clearAllConfig();
      return;
    }

    const config = JSON.parse(configStr);

    // Load items
    slots.forEach((slot, i) => {
      slot.innerHTML = config.items[i] ? 
        `<img src="${config.items[i]}" style="width:64px;height:64px;">` : "";
    });

    // Load skill order
    for (let i = 0; i < state.length; i++) {
      for (let j = 0; j < state[i].length; j++) {
        state[i][j] = config.skillOrder[i][j];
        const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
        
        if (cell) {
          if (state[i][j]) {
            cell.classList.add("skill-level");
            cell.textContent = state[i][j];
          } else {
            cell.classList.remove("skill-level");
            cell.textContent = "";
          }
        }
      }
    }
    
    currentLevel = Math.max(1, ...state.flat().filter(x => x !== null)) + 1;
  }

  // Clear all items and skill order
  function clearAllConfig() {
    // Clear items
    slots.forEach(slot => slot.innerHTML = "");
    
    // Clear skill order
    for (let i = 0; i < state.length; i++) {
      for (let j = 0; j < state[i].length; j++) {
        state[i][j] = null;
        const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
        if (cell) {
          cell.classList.remove("skill-level");
          cell.textContent = "";
        }
      }
    }
    currentLevel = 1;
  }

  // ==========================================
  // EVENT LISTENERS & INITIALIZATION
  // ==========================================
  
  // Initialize skill table
  createTable();

  // Hero selection buttons
  heroBtn.addEventListener("click", showHeroModal);
  heroBtn2.addEventListener("click", showHeroModal);

  // Configuration buttons
  document.getElementById("save-config-btn").addEventListener("click", saveHeroConfig);
  document.getElementById("clear-config-btn").addEventListener("click", clearAllConfig);

  // Close hero modal when clicking outside
  document.addEventListener("click", (e) => {
    if (heroModal.style.display === "block" && 
        !heroModal.contains(e.target) && 
        e.target !== heroBtn && 
        e.target !== heroBtn2) {
      heroModal.style.display = "none";
    }
  });

// Overlay resizer logic
let overlayScale = parseFloat(localStorage.getItem('overlayScale')) || 1.0;
const minScale = 0.5;
const scaleStep = 0.1;

function applyOverlayScale() {
  document.getElementById('overlay-wrapper').style.transform = `scale(${overlayScale})`;
}

// Applique la taille au chargement
applyOverlayScale();

document.getElementById('size-btn').addEventListener('click', () => {
  overlayScale -= scaleStep;
  if (overlayScale < minScale) overlayScale = 1.0;
  localStorage.setItem('overlayScale', overlayScale); // Sauvegarde la taille
  applyOverlayScale();
});