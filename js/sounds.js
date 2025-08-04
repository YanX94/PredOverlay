// ===============================
// SOUND ENGINE
// ===============================

// Preload sounds
const sounds = {
  click: new Audio("assets/sounds/click1.mp3"),
  item_select: new Audio("assets/sounds/item_select.mp3"),
  right_click: new Audio("assets/sounds/right-click.mp3"),
};

// Set volume to 60% for all sounds
Object.values(sounds).forEach(audio => {
  audio.volume = 0.6; // 60% volume (0.0 = 0%, 1.0 = 100%)
});

// Utility to play a sound (restart if already playing)
function playSound(name) {
  const snd = sounds[name];
  if (snd) {
    snd.currentTime = 0;
    snd.play();
  }
}

// DOM Ready initialization
document.addEventListener('DOMContentLoaded', () => {
  
  // Generic click sound for all buttons
  document.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => playSound("click"));
  });

  // Click sound for selected hero preview
  document.getElementById("selected-hero-preview")?.addEventListener("click", () => {
    playSound("click");
  });

  // Item slots sounds
  document.querySelectorAll(".item-slot").forEach((slot) => {
    slot.addEventListener("contextmenu", (e) => {
      if (isLocked) return;
      e.preventDefault();
      playSound("right_click");
      slot.innerHTML = "";
    });

    slot.addEventListener("click", async () => {
      if (isLocked) return;
      playSound("click");
      await loadItems();
      showItemModal(slot);
    });
  });
});

// Sound integration for modal functions (to be called from script.js)
window.addModalSounds = {
  item: (modal) => {
    modal.querySelector("#close-item-modal")?.addEventListener("click", () => playSound("click"));
    modal.querySelectorAll(".item-choice").forEach((img) => {
      img.addEventListener("click", () => playSound("item_select"));
    });
  },
  
  hero: (modal) => {
    modal.querySelector("#close-hero-modal")?.addEventListener("click", () => playSound("click"));
    modal.querySelectorAll(".hero-choice").forEach((img) => {
      img.addEventListener("click", () => playSound("item_select"));
    });
  },
  
  skillClick: () => playSound("click")
};