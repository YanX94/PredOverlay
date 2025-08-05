const { ipcRenderer } = require("electron");

// ==========================================
// GLOBAL VARIABLES & STATE MANAGEMENT
// ==========================================

/**
 * Core application state variables
 */
let isLocked = false;           // Tracks overlay interaction lock state
let itemsCache = [];            // Cached items data from JSON
let heroesCache = [];           // Cached heroes data from JSON  
let selectedHero = null;        // Currently selected hero object
let currentLevel = 1;           // Current skill level being assigned
const maxLevels = 18;           // Maximum skill levels available
const skills = ["mouse-right", "q", "e", "r"]; // Skill identifiers

/**
 * Skill order state: 4 skills × 18 levels matrix
 * Each cell contains null or the level number when that skill was leveled
 */
const state = Array(4).fill(null).map(() => Array(maxLevels).fill(null));

/**
 * DOM element references for performance
 */
const slots = document.querySelectorAll(".item-slot");
const modal = document.getElementById("item-modal");
const table = document.getElementById("skill-table");
const heroBtn = document.getElementById("choose-hero-btn");
const heroBtn2 = document.getElementById("selected-hero-preview");
const heroModal = document.getElementById("hero-modal");

// ==========================================
// OVERLAY LOCK/UNLOCK SYSTEM
// ==========================================

/**
 * Handles overlay interaction state changes from main process
 * Updates UI elements and applies locked/unlocked styling
 */
ipcRenderer.on("update-clickable-status", (_, isClickable) => {
  const status = document.getElementById("status");
  const overlayBox = document.getElementById("overlay-box");
  isLocked = !isClickable;

  // Apply locked styling to interactive elements
  document.querySelectorAll(".item-slot, #skill-table td").forEach((el) => {
    el.classList.toggle("locked", isLocked);
  });

  // Apply locked styling to hero preview
  document.getElementById('selected-hero-preview').classList.toggle('locked', isLocked);

  // Update status display
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
// ITEM MANAGEMENT SYSTEM
// ==========================================

/**
 * Loads items data from JSON file with caching
 * @returns {Promise<void>}
 */
async function loadItems() {
  if (itemsCache.length === 0) {
    try {
      const response = await fetch("assets/json/items.json");
      itemsCache = await response.json();
    } catch (error) {
      console.error("Error loading items:", error);
      itemsCache = [];
    }
  }
}

/**
 * Displays item selection modal for a specific slot
 * @param {HTMLElement} targetSlot - The item slot being configured
 */
function showItemModal(targetSlot) {
  // Generate modal content with items grid
  modal.innerHTML = `
    <button id="close-item-modal">✖</button>
    ${itemsCache.map(item => 
      `<img src="${item.image}" data-id="${item.id}" class="item-choice" 
           title="${item.name}" style="width:64px;height:64px;margin:6px;cursor:pointer;border:2px solid #222;">`
    ).join("")}
  `;
  
  modal.style.display = "block";
  document.querySelector('.skill-order').style.display = 'none';

  // Add sound handlers via sound system
  window.addModalSounds.item(modal);

  // Handle modal close
  document.getElementById("close-item-modal").onclick = () => {
    modal.style.display = "none";
    applySkillTableVisibility();
  };

  // Handle item selection
  document.querySelectorAll(".item-choice").forEach((img) => {
    img.addEventListener("click", () => {
      if (isLocked) return;
      
      const selectedItem = itemsCache.find((item) => item.id == img.dataset.id);
      targetSlot.innerHTML = `<img src="${selectedItem.image}" alt="${selectedItem.name}" style="width: 64px; height: 64px;">`;
      
      modal.style.display = "none";
      applySkillTableVisibility();
    });
  });
}

/**
 * Initialize item slot event listeners
 */
function initializeItemSlots() {
  slots.forEach((slot) => {
    // Right-click to clear slot
    slot.addEventListener("contextmenu", (e) => {
      if (isLocked) return;
      e.preventDefault();
      slot.innerHTML = "";
    });

    // Left-click to open item selection
    slot.addEventListener("click", async () => {
      if (isLocked) return;
      await loadItems();
      showItemModal(slot);
    });
  });
}

// ==========================================
// SKILL ORDER TABLE SYSTEM
// ==========================================

/**
 * Creates the skill order table dynamically
 * Generates rows for each skill with level columns
 */
function createSkillTable() {
  skills.forEach((skill, skillIndex) => {
    const row = document.createElement("tr");

    // Create skill icon cell
    const iconCell = document.createElement("td");
    iconCell.classList.add("skill-icon");
    
    const skillIcon = document.createElement("img");
    skillIcon.src = `assets/images/${skill}.png`;
    skillIcon.alt = skill.toUpperCase();
    iconCell.appendChild(skillIcon);
    row.appendChild(iconCell);

    // Create level cells for this skill
    for (let levelIndex = 0; levelIndex < maxLevels; levelIndex++) {
      const levelCell = document.createElement("td");
      levelCell.dataset.row = skillIndex;
      levelCell.dataset.col = levelIndex;
      levelCell.addEventListener("click", handleLeftClick);
      levelCell.addEventListener("contextmenu", handleRightClick);
      row.appendChild(levelCell);
    }

    table.appendChild(row);
  });
}

/**
 * Handles left-click on skill table cells
 * Adds a skill level at the clicked position
 * @param {Event} event - Click event
 */
function handleLeftClick(event) {
  if (isLocked) return;
  
  window.addModalSounds.skillClick();
  
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  // Add skill level if cell is empty and we haven't exceeded max levels
  if (state[row][col] === null && currentLevel <= maxLevels) {
    state[row][col] = currentLevel;
    event.target.classList.add("skill-level");
    event.target.textContent = currentLevel++;
  }
}

/**
 * Handles right-click on skill table cells
 * Removes a skill level and reorganizes remaining levels
 * @param {Event} event - Right-click event
 */
function handleRightClick(event) {
  if (isLocked) return;
  
  event.preventDefault();
  window.addModalSounds.skillClick();
  
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  if (state[row][col] !== null) {
    const removedLevel = state[row][col];
    state[row][col] = null;
    event.target.classList.remove("skill-level");
    event.target.textContent = "";

    // Reorganize higher levels by decrementing them
    state.forEach((skillRow, skillIndex) => {
      skillRow.forEach((level, levelIndex) => {
        if (level && level > removedLevel) {
          state[skillIndex][levelIndex] = level - 1;
          const cell = document.querySelector(`[data-row="${skillIndex}"][data-col="${levelIndex}"]`);
          if (cell) cell.textContent = level - 1;
        }
      });
    });
    
    currentLevel--;
  }
}

// ==========================================
// HERO SELECTION SYSTEM
// ==========================================

/**
 * Loads heroes data from JSON file with caching
 * @returns {Promise<void>}
 */
async function loadHeroes() {
  if (heroesCache.length === 0) {
    try {
      const response = await fetch("assets/json/heroes.json");
      heroesCache = await response.json();
    } catch (error) {
      console.error("Error loading heroes:", error);
      heroesCache = [];
    }
  }
}

/**
 * Displays hero selection modal
 * @returns {Promise<void>}
 */
async function showHeroModal() {
  await loadHeroes();

  // Generate modal content with heroes grid
  heroModal.innerHTML = `
    <button id="close-hero-modal">✖</button>
    ${heroesCache.map(hero => 
      `<img src="${hero.image}" data-id="${hero.id}" title="${hero.display_name || hero.name}" 
           class="hero-choice" style="width:64px;height:64px;margin:6px;cursor:pointer;border:2px solid #222;">`
    ).join("")}
  `;
  
  heroModal.style.display = "block";
  document.querySelector('.skill-order').style.display = 'none';

  // Add sound handlers via sound system
  window.addModalSounds.hero(heroModal);

  // Handle modal close
  document.getElementById("close-hero-modal").onclick = () => {
    heroModal.style.display = "none";
    applySkillTableVisibility();
  };

  // Handle hero selection
  document.querySelectorAll(".hero-choice").forEach((heroImage) => {
    heroImage.addEventListener("click", () => {
      selectedHero = heroesCache.find((hero) => hero.id == heroImage.dataset.id);
      
      // Update hero preview display
      const preview = document.getElementById("selected-hero-preview");
      preview.innerHTML = `<img src="${selectedHero.image}" alt="${selectedHero.display_name || selectedHero.name}" 
                                title="${selectedHero.display_name || selectedHero.name}">`;
  
      heroModal.style.display = "none";
      loadHeroConfig(selectedHero.id);
      applySkillTableVisibility(); // <-- applique la visibilité après changement de héros
    });
  });
}

// ==========================================
// CONFIGURATION PERSISTENCE SYSTEM
// ==========================================

/**
 * Saves current configuration to localStorage
 * Stores items and skill order for the selected hero
 */
function saveHeroConfig() {
  if (!selectedHero) return;
  
  const configuration = {
    items: Array.from(slots).map(slot => 
      slot.querySelector("img")?.src || null
    ),
    skillOrder: state.map(row => [...row])
  };
  
  localStorage.setItem(`heroConfig_${selectedHero.id}`, JSON.stringify(configuration));
}

/**
 * Loads configuration from localStorage for a specific hero
 * @param {string} heroId - Hero identifier
 */
function loadHeroConfig(heroId) {
  const configString = localStorage.getItem(`heroConfig_${heroId}`);
  
  if (!configString) {
    clearAllConfig();
    return;
  }

  const configuration = JSON.parse(configString);

  // Restore item slots
  slots.forEach((slot, index) => {
    slot.innerHTML = configuration.items[index] ? 
      `<img src="${configuration.items[index]}" style="width:64px;height:64px;">` : "";
  });

  // Restore skill order
  state.forEach((skillRow, skillIndex) => {
    skillRow.forEach((_, levelIndex) => {
      state[skillIndex][levelIndex] = configuration.skillOrder[skillIndex][levelIndex];
      const cell = document.querySelector(`[data-row="${skillIndex}"][data-col="${levelIndex}"]`);
      
      if (cell) {
        if (state[skillIndex][levelIndex]) {
          cell.classList.add("skill-level");
          cell.textContent = state[skillIndex][levelIndex];
        } else {
          cell.classList.remove("skill-level");
          cell.textContent = "";
        }
      }
    });
  });
  
  // Update current level counter
  const allLevels = state.flat().filter(level => level !== null);
  currentLevel = allLevels.length > 0 ? Math.max(...allLevels) + 1 : 1;
  // NE PAS toucher à la visibilité du skill table ici !
}

/**
 * Clears all items and skill order configuration
 */
function clearAllConfig() {
  // Clear all item slots
  slots.forEach(slot => slot.innerHTML = "");
  
  // Clear skill order state and UI
  state.forEach((skillRow, skillIndex) => {
    skillRow.forEach((_, levelIndex) => {
      state[skillIndex][levelIndex] = null;
      const cell = document.querySelector(`[data-row="${skillIndex}"][data-col="${levelIndex}"]`);
      if (cell) {
        cell.classList.remove("skill-level");
        cell.textContent = "";
      }
    });
  });
  
  currentLevel = 1;
}

// ==========================================
// OVERLAY SCALING SYSTEM
// ==========================================

/**
 * Overlay scaling configuration
 */
let overlayScale = parseFloat(localStorage.getItem('overlayScale')) || 1.0;
const minScale = 0.5;
const scaleStep = 0.2;

/**
 * Applies the current scale to the overlay wrapper
 * Includes display cycling to force re-render and fix visual glitches
 */
function applyOverlayScale() {
  const wrapper = document.getElementById('overlay-wrapper');
  wrapper.style.transform = `scale(${overlayScale})`;
  
  // Force repaint to prevent rendering issues
  wrapper.style.display = 'none';
  void wrapper.offsetHeight; // Trigger reflow
  wrapper.style.display = '';
}

/**
 * Handles resize button clicks
 * Decreases scale by step, resets to 100% when reaching minimum
 */
function handleResizeButton() {
  overlayScale -= scaleStep;
  if (overlayScale < minScale) overlayScale = 1.0;
  
  localStorage.setItem('overlayScale', overlayScale);
  applyOverlayScale();
}

// ==========================================
// MODAL OUTSIDE CLICK HANDLER
// ==========================================

/**
 * Closes hero modal when clicking outside of it
 * @param {Event} event - Click event
 */
function handleOutsideClick(event) {
  if (heroModal.style.display === "block" && 
      !heroModal.contains(event.target) && 
      event.target !== heroBtn && 
      event.target !== heroBtn2) {
    heroModal.style.display = "none";
    applySkillTableVisibility();
  }
}

// ==========================================
// SETTINGS MODAL SYSTEM
// ==========================================

function applySkillTableVisibility() {
  const skillTableVisible = JSON.parse(localStorage.getItem("skillTableVisible") ?? "true");
  document.getElementById("toggle-skill-table").checked = skillTableVisible;
  document.querySelector(".skill-order").style.display = skillTableVisible ? "" : "none";
}

function applyOverlayOpacity() {
  const opacity = parseFloat(localStorage.getItem("overlayOpacity") ?? "1");
  document.getElementById("overlay-opacity").value = opacity;
  document.getElementById("opacity-value").textContent = Math.round(opacity * 100) + "%";
  document.getElementById("overlay-wrapper").style.opacity = opacity;
}
// ==========================================
// INITIALIZATION & EVENT BINDING
// ==========================================

/**
 * Initialize all application systems
 */
function initializeApplication() {
  // Create skill table
  createSkillTable();
  
  // Initialize item slots
  initializeItemSlots();
  
  // Apply saved overlay scale
  applyOverlayScale();
  
  // Bind hero selection buttons
  heroBtn.addEventListener("click", showHeroModal);
  heroBtn2.addEventListener("click", showHeroModal);
  
  // Bind configuration buttons
  document.getElementById("save-config-btn").addEventListener("click", saveHeroConfig);
  document.getElementById("clear-config-btn").addEventListener("click", clearAllConfig);
  document.getElementById('size-btn').addEventListener('click', handleResizeButton);
  
  // Bind outside click handler
  document.addEventListener("click", handleOutsideClick);

  // Appliquer la visibilité du skill table au démarrage
  applySkillTableVisibility();
}

// Start the application
initializeApplication();

// ==========================================
// SETTINGS MODAL LOGIC
// ==========================================
document.getElementById("settings-btn").addEventListener("click", () => {
  document.getElementById("settings-modal").style.display = "block";
});
document.getElementById("close-settings-modal").addEventListener("click", () => {
  document.getElementById("settings-modal").style.display = "none";
});

// Toggle skill table visibility
document.getElementById("toggle-skill-table").addEventListener("change", (e) => {
  const visible = e.target.checked;
  document.querySelector(".skill-order").style.display = visible ? "" : "none";
  localStorage.setItem("skillTableVisible", JSON.stringify(visible));
});

// Overlay opacity control
document.getElementById("overlay-opacity").addEventListener("input", (e) => {
  const opacity = parseFloat(e.target.value);
  document.getElementById("opacity-value").textContent = Math.round(opacity * 100) + "%";
  document.getElementById("overlay-wrapper").style.opacity = opacity;
  localStorage.setItem("overlayOpacity", opacity.toString());
});

// Appliquer le paramètre au démarrage (sécurité si DOMContentLoaded est utilisé ailleurs)
window.addEventListener("DOMContentLoaded", () => {
  applySkillTableVisibility();
  applyOverlayOpacity();
});