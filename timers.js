let intervals = [];
let warningPlayed = [];
let endPlayed = [];
let timersRunning = false;

function startAllTimers() {
  if (timersRunning) return;
  timersRunning = true;
  warningPlayed = [];
  endPlayed = [];
  document.querySelectorAll('.timer').forEach((timerDiv, index) => {
    const duration = parseInt(timerDiv.dataset.duration);
    const span = timerDiv.querySelector('span');
    const indicator = timerDiv.querySelector('.timer-indicator');
    let remaining = duration;
    warningPlayed[index] = false;
    endPlayed[index] = false;

    // Clear existing interval if any
    if (intervals[index]) clearInterval(intervals[index]);

    const update = () => {
      // Indicateur couleur
      indicator.classList.remove("red", "yellow");
      if (remaining <= 0) {
        indicator.classList.add("red");
        span.textContent = 'READY ';
        if (!endPlayed[index]) {
          document.getElementById("timer-end-sound").play();
          endPlayed[index] = true;
        }
        clearInterval(intervals[index]);
        return;
      } else if (remaining <= 20) {
        indicator.classList.add("yellow");
        if (!warningPlayed[index]) {
          document.getElementById("timer-warning-sound").play();
          warningPlayed[index] = true;
        }
      }
      // Vert par défaut (pas de classe)
      const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
      const seconds = String(remaining % 60).padStart(2, '0');
      span.textContent = `${minutes}:${seconds}`;
      remaining--;
    };

    update(); // initial update
    intervals[index] = setInterval(update, 1000);
  });
}