// Elements
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const resultDiv = document.getElementById("result");
const statusDiv = document.getElementById("status");
const spinBtn = document.getElementById("spinBtn");
const resetBtn = document.getElementById("resetBtn");
const nameListDiv = document.getElementById("nameList");
const newNameInput = document.getElementById("newNameInput");
const addNameBtn = document.getElementById("addNameBtn");

// State
let names = JSON.parse(localStorage.getItem("bordmester_names") || "[]"); // starts empty if none saved
let colors = ["#FF5733","#33FF57","#3357FF","#FF33A6","#FFC300","#8E44AD","#00CED1","#FF8C00"];
let startAngle = 0;
let arc = names.length ? Math.PI * 2 / names.length : 0;
let spinAngle = 0;
let spinning = false;

// Helpers
function saveNames() {
  localStorage.setItem("bordmester_names", JSON.stringify(names));
}
function setStatus(msg) {
  statusDiv.textContent = msg || "";
}

// Ensure no identical neighbors (first may be adjusted when second is added)
function arrangeNames(list) {
  if (list.length <= 1) return list;
  const pool = [...list];
  const arranged = [pool.shift()];
  while (pool.length) {
    const candidateIndex = pool.findIndex(n => n !== arranged[arranged.length - 1]);
    if (candidateIndex === -1) {
      // Only identical left → swap with first to break adjacency
      const next = pool[0];
      arranged[0] = next;
      arranged.push(next);
      pool.shift();
    } else {
      const next = pool[candidateIndex];
      arranged.push(next);
      pool.splice(candidateIndex, 1);
    }
  }
  // Also ensure last != first for circular adjacency
  if (arranged.length > 1 && arranged[0] === arranged[arranged.length - 1]) {
    for (let i = arranged.length - 2; i >= 0; i--) {
      if (arranged[i] !== arranged[0]) {
        [arranged[arranged.length - 1], arranged[i]] = [arranged[i], arranged[arranged.length - 1]];
        break;
      }
    }
  }
  return arranged;
}

function shuffleColors(n) {
  let shuffled = [...colors];
  while (shuffled.length < n) shuffled = shuffled.concat(colors);
  shuffled = shuffled.slice(0, n);
  for (let i = 1; i < shuffled.length; i++) {
    if (shuffled[i] === shuffled[i - 1]) {
      const j = (i + 1) % shuffled.length;
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  }
  // circular adjacency check for colors too
  if (shuffled.length > 1 && shuffled[0] === shuffled[shuffled.length - 1]) {
    [shuffled[shuffled.length - 1], shuffled[0]] = [shuffled[0], shuffled[shuffled.length - 1]];
  }
  return shuffled;
}

// Drawing
function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!names.length) return;

  arc = Math.PI * 2 / names.length;
  const wheelColors = shuffleColors(names.length);

  for (let i = 0; i < names.length; i++) {
    const angle = startAngle + i * arc;
    ctx.fillStyle = wheelColors[i];
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, angle, angle + arc);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText(names[i], canvas.width / 2 - 10, 10);
    ctx.restore();
  }

  // Pointer outside the wheel (top center)
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 15, 0);
  ctx.lineTo(canvas.width / 2 + 15, 0);
  ctx.lineTo(canvas.width / 2, 30);
  ctx.closePath();
  ctx.fill();
}

// Spinning
function rotateWheel() {
  spinAngle *= 0.97;
  startAngle += (spinAngle * Math.PI) / 180;
  drawWheel();

  if (spinAngle > 0.2) {
    requestAnimationFrame(rotateWheel);
  } else {
    spinning = false;
    // Announce the name under the pointer
    const index = Math.floor(((Math.PI * 2 - startAngle) % (Math.PI * 2)) / arc);
    const chosen = names[index];
    resultDiv.textContent = "🎉 Pilen peger på: " + chosen;
    setStatus("");
  }
}

// Events
spinBtn.addEventListener("click", () => {
  if (!spinning && names.length) {
    spinAngle = Math.random() * 30 + 30;
    spinning = true;
    setStatus("⏳ Spinner…");
    rotateWheel();
  } else if (!names.length) {
    setStatus("Tilføj navne først (via knapper eller feltet).");
  }
});

resetBtn.addEventListener("click", () => {
  names = [];
  saveNames();
  resultDiv.textContent = "";
  setStatus("Hjulet er nulstillet.");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Robust click handling via event delegation
nameListDiv.addEventListener("click", (e) => {
  const btn = e.target.closest(".nameBtn");
  if (!btn) return;
  const n = btn.dataset.name;
  // Add 2x and re-arrange to avoid adjacency
  names.push(n, n);
  names = arrangeNames(names);
  saveNames();
  drawWheel();
  setStatus(`Tilføjet: ${n} × 2`);
});

// Add new (non-fixed) names via input
addNameBtn.addEventListener("click", () => {
  const newName = newNameInput.value.trim();
  if (!newName) {
    setStatus("Indtast et navn for at tilføje.");
    return;
  }
  // Prevent adding if it's one of the fixed buttons
  const isFixed = Array.from(nameListDiv.querySelectorAll(".nameBtn"))
    .some(b => b.dataset.name.toLowerCase() === newName.toLowerCase());
  if (isFixed) {
    setStatus("Det navn findes allerede som fast navn. Brug knappen i stedet.");
    return;
  }

  names.push(newName, newName);
  names = arrangeNames(names);
  saveNames();
  drawWheel();
  newNameInput.value = "";
  setStatus(`Tilføjet: ${newName} × 2`);
});

// Init
drawWheel();
