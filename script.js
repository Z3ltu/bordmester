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
  const colors = ["#FF5733","#33FF57","#3357FF","#FF33A6","#FFC300","#8E44AD","#00CED1","#FF8C00"];
  let startAngle = 0, arc = 0, spinAngle = 0, spinning = false;

  function setStatus(msg){ statusDiv.textContent = msg || ""; }

  // Sikrer at ingen ens navne står ved siden af hinanden
  function arrangeNames(list) {
    if (list.length <= 1) return list.slice();
    let pool = list.slice();
    pool.sort(() => Math.random() - 0.5);

    for (let attempt = 0; attempt < 1000; attempt++) {
      let valid = true;
      for (let i = 0; i < pool.length; i++) {
        let next = pool[(i + 1) % pool.length];
        if (pool[i] === next) { valid = false; break; }
      }
      if (valid) return pool;
      pool.sort(() => Math.random() - 0.5);
    }
    return pool;
  }

  function shuffleColors(n){
    let shuffled = colors.slice();
    while (shuffled.length < n) shuffled = shuffled.concat(colors);
    return shuffled.slice(0, n);
  }

  function drawWheel(highlightIndex = null){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!names.length) return;
    arc = Math.PI * 2 / names.length;
    const wheelColors = shuffleColors(names.length);

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

  // Korrekt beregning af hvilket felt pilen peger på
  function rotateWheel(){
    spinAngle *= 0.97;
    startAngle += (spinAngle * Math.PI) / 180;
    drawWheel();

    if (spinAngle > 0.2) {
      requestAnimationFrame(rotateWheel);
    } else {
      spinning = false;
      if (!names.length) return;

      // pilen er ved vinkel 0 (øverst)
      let adjusted = (2 * Math.PI - (startAngle % (2 * Math.PI))) % (2 * Math.PI);
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

  // Klik på faste navne-knapper
  document.querySelectorAll(".nameBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (spinning) {
        setStatus("Du kan ikke tilføje navne mens hjulet drejer.");
        return;
      }
      const n = btn.dataset.name;
      if (!firstName) firstName = n;
      names.push(n, n);
      names = arrangeNames(names);
      drawWheel();
      setStatus(`Tilføjet: ${n} × 2`);
    });
  });

  // Tilføj nyt navn via inputfelt
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
    names.push(newName, newName);
    names = arrangeNames(names);
    drawWheel();
    newNameInput.value = "";
    setStatus(`Tilføjet: ${newName} × 2`);
  });

  // Klik på hjulet → highlight og fjern navnet 2×
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
          if (n === clickedName && count < 2) {
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
