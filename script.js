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
  const baseColors = ["#FF5733","#33A852","#3369E8","#FF33A6","#FFB300","#8E44AD","#00CED1","#FF8C00","#2ECC71","#E74C3C","#3498DB"];
  let startAngle = 0, arc = 0, spinAngle = 0, spinning = false;

  function setStatus(msg){ statusDiv.textContent = msg || ""; }

  // Ingen nabo-duplikater i navne
  function arrangeNames(list) {
    if (list.length <= 1) return list.slice();
    let pool = list.slice();
    for (let attempt = 0; attempt < 2000; attempt++) {
      pool.sort(() => Math.random() - 0.5);
      let valid = true;
      for (let i = 0; i < pool.length; i++) {
        let next = pool[(i + 1) % pool.length];
        if (pool[i] === next) { valid = false; break; }
      }
      if (valid) return pool;
    }
    return pool;
  }

  // Farver følger navnenes rækkefølge og undgår nabo-duplikater
  function getWheelColors(n) {
    const colors = [];
    for (let i = 0; i < n; i++) {
      let color = baseColors[i % baseColors.length];
      if (i > 0 && color === colors[i-1]) {
        color = baseColors[(i+1) % baseColors.length];
      }
      colors.push(color);
    }
    if (colors.length > 1 && colors[0] === colors[colors.length-1]) {
      colors[colors.length-1] = baseColors[(colors.length) % baseColors.length];
    }
    return colors;
  }

  function drawWheel(highlightIndex = null){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!names.length) return;
    arc = Math.PI * 2 / names.length;
    const wheelColors = getWheelColors(names.length);

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

      ctx.save();
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.rotate(angle + arc/2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "16px Arial";
      ctx.fillText(names[i], canvas.width/2 - 10, 10);
      ctx.restore();
    }

    // pilen øverst
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(canvas.width/2 - 15, 0);
    ctx.lineTo(canvas.width/2 + 15, 0);
    ctx.lineTo(canvas.width/2, 30);
    ctx.closePath();
    ctx.fill();
  }

  // Korrekt beregning: pilens vinkel er -π/2 (øverst i canvas)
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

  // Faste navne-knapper – tilføj 3×
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

  // Tilføj nyt navn via inputfelt – tilføj 3×
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

    let adjusted = (angle - startAngle) % (2 * Math.PI);
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
