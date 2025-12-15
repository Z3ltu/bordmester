document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("wheel");
  const ctx = canvas.getContext("2d");
  const resultDiv = document.getElementById("result");
  const statusDiv = document.getElementById("status");
  const spinBtn = document.getElementById("spinBtn");
  const resetBtn = document.getElementById("resetBtn");
  const newNameInput = document.getElementById("newNameInput");
  const addNameBtn = document.getElementById("addNameBtn");

  let names = [];
  let firstName = null;
  const fixedNames = ["Anders","Rikke","Lars","Charlotte","Patrick","Marianne","Lars Henrik","Brian"];

  // Base palette (kan udvides)
  const baseColors = ["#FF5733","#33A852","#3369E8","#FF33A6","#FFB300","#8E44AD","#00CED1","#FF8C00","#2ECC71","#E74C3C","#3498DB"];
  let startAngle = 0, arc = 0, spinAngle = 0, spinning = false;

  function setStatus(msg){ statusDiv.textContent = msg || ""; }

  // Ingen nabo-duplikater i navne
  function arrangeNames(list) {
    if (list.length <= 1) return list.slice();
    let pool = list.slice();

    // Forsøg med random omrokering
    for (let attempt = 0; attempt < 2000; attempt++) {
      pool.sort(() => Math.random() - 0.5);
      let valid = true;
      for (let i = 0; i < pool.length; i++) {
        let next = pool[(i + 1) % pool.length];
        if (pool[i] === next) { valid = false; break; }
      }
      if (valid) return pool;
    }

    // Fallback: greedy placering
    const counts = {};
    pool.forEach(n => counts[n] = (counts[n] || 0) + 1);
    const uniques = Object.keys(counts).sort((a,b) => counts[b]-counts[a]);
    const res = new Array(pool.length);
    let idx = 0;
    for (const name of uniques) {
      for (let i = 0; i < counts[name]; i++) {
        res[idx] = name;
        idx = (idx + 2) % res.length; // fordel med mellemrum
      }
    }
    // Hvis der stadig opstår nabo-dupl., roter lidt
    for (let shift = 0; shift < res.length; shift++) {
      let ok = true;
      for (let i = 0; i < res.length; i++) {
        if (res[i] === res[(i+1)%res.length]) { ok = false; break; }
      }
      if (ok) return res;
      res.push(res.shift());
    }
    return res;
  }

  // Generer farver uden nabo-duplikater (inkl. første/ sidste)
  function generateWheelColors(n){
    if (n <= baseColors.length) {
      // Tag en shuffled palet og trim
      const shuffled = baseColors.slice().sort(() => Math.random() - 0.5).slice(0, n);
      // Fix naboer hvis nogen er ens (usandsynligt når unikke farver, men for sikkerhed)
      for (let i = 1; i < shuffled.length; i++) {
        if (shuffled[i] === shuffled[i-1]) {
          // swap med en anden
          const j = (i + 2) % shuffled.length;
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
      }
      if (shuffled[0] === shuffled[shuffled.length-1]) {
        const j = Math.floor(shuffled.length/2);
        [shuffled[shuffled.length-1], shuffled[j]] = [shuffled[j], shuffled[shuffled.length-1]];
      }
      return shuffled;
    }
    // Hvis n > paletten, cykl med offset, så naboer ikke matcher
    const colors = [];
    const L = baseColors.length;
    for (let i = 0; i < n; i++) {
      // Skift offset for hver runde for at undgå gentagelse ved brud
      const ring = Math.floor(i / L);
      const pos = i % L;
      const idx = (pos + ring) % L;
      let candidate = baseColors[idx];
      // Sikr ingen nabo-dupl.
      if (i > 0 && candidate === colors[i-1]) {
        candidate = baseColors[(idx + 1) % L];
      }
      colors.push(candidate);
    }
    // Sikr også første/ sidste
    if (colors.length > 1 && colors[0] === colors[colors.length-1]) {
      colors[colors.length-1] = baseColors[(baseColors.indexOf(colors[colors.length-1]) + 1) % L];
    }
    return colors;
  }

  function drawWheel(highlightIndex = null){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!names.length) return;
    arc = Math.PI * 2 / names.length;
    const wheelColors = generateWheelColors(names.length);

    for (let i = 0; i < names.length; i++) {
      const angle = startAngle + i * arc;
      ctx.fillStyle = wheelColors[i];
      ctx.beginPath();
      ctx.moveTo(canvas.width/2, canvas.height/2);
      ctx.arc(canvas.width/2, canvas.height/2, canvas.width/2, angle, angle + arc);
      ctx.closePath();
      ctx.fill();

      if (highlightIndex === i) {
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 5;
        ctx.stroke();
      }

      // Tekst i midten af segmentet
      ctx.save();
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.rotate(angle + arc/2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "16px Arial";
      ctx.fillText(names[i], canvas.width/2 - 10, 10);
      ctx.restore();
    }

    // Pilen øverst (top)
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(canvas.width/2 - 15, 0);
    ctx.lineTo(canvas.width/2 + 15, 0);
    ctx.lineTo(canvas.width/2, 30);
    ctx.closePath();
    ctx.fill();
  }

  // Korrekt beregning: pilens vinkel er -π/2 (øverst i canvas-koordinater)
  function rotateWheel(){
    spinAngle *= 0.97;
    startAngle += (spinAngle * Math.PI) / 180;
    drawWheel();

    if (spinAngle > 0.2) {
      requestAnimationFrame(rotateWheel);
    } else {
      spinning = false;
      if (!names.length) return;

      const pointerAngle = -Math.PI / 2; // top
      let adjusted = (pointerAngle - (startAngle % (2 * Math.PI))) % (2 * Math.PI);
      if (adjusted < 0) adjusted += 2 * Math.PI;
      const index = Math.floor(adjusted / arc);
      const chosen = names[index];

      resultDiv.textContent = "🎉 Pilen peger på: " + chosen;
      setStatus("");
    }
  }

  spinBtn.addEventListener("click", () => {
    if (!spinning && names.length) {
      spinAngle = Math.random() * 30 + 30;
      spinning = true;
      setStatus("⏳ Spinner…");
      rotateWheel();
    } else if (!names.length) {
      setStatus("Tilføj navne først.");
    }
  });

  resetBtn.addEventListener("click", () => {
    names = [];
    firstName = null;
    resultDiv.textContent = "";
    setStatus("Hjulet er nulstillet.");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // Faste navne-knapper (lås under spin) – tilføj 3×
  document.querySelectorAll(".nameBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (spinning) {
        setStatus("Du kan ikke tilføje navne mens hjulet drejer.");
        return;
      }
      const n = btn.dataset.name;
      if (!firstName) firstName = n;
      names.push(n, n, n);
      names = arrangeNames(names);
      drawWheel();
      setStatus(`Tilføjet: ${n} × 3`);
    });
  });

  // Tilføj nyt navn via inputfelt (lås under spin) – tilføj 3×
  addNameBtn.addEventListener("click", () => {
    if (spinning) {
      setStatus("Du kan ikke tilføje navne mens hjulet drejer.");
      return;
    }
    const newName = (newNameInput.value || "").trim();
    if (!newName) {
      setStatus("Indtast et navn.");
      return;
    }
    const isFixed = fixedNames.some(fn => fn.toLowerCase() === newName.toLowerCase());
    if (isFixed) {
      setStatus("Navnet findes allerede som fast navn.");
      return;
    }
    if (!firstName) firstName = newName;
    names.push(newName, newName, newName);
    names = arrangeNames(names);
    drawWheel();
    newNameInput.value = "";
    setStatus(`Tilføjet: ${newName} × 3`);
  });

  // Klik på hjulet → highlight og fjern navnet 3×
  canvas.addEventListener("click", (e) => {
    if (!names.length) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top - canvas.height / 2;
    const angle = Math.atan2(y, x);
    let adjusted = angle - startAngle;
    if (adjusted < 0) adjusted += 2 * Math.PI;
    const index = Math.floor(adjusted / arc);
    const clickedName = names[index];
    if (clickedName) {
      drawWheel(index);
      setTimeout(() => {
        let count = 0;
        names = names.filter(n => {
          if (n === clickedName && count < 3) {
            count++;
            return false;
          }
          return true;
        });
        names = arrangeNames(names);
        drawWheel();
        setStatus(`Fjernet: ${clickedName} × ${count}`);
      }, 500);
    }
  });

  drawWheel();
  setStatus("Hjulet starter tomt. Tilføj navne med knapper eller feltet.");
});
