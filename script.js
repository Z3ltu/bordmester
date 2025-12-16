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
  let spinning = false;
  let startAngle = Math.random() * 2 * Math.PI;
  let arc = 0;

  const fixedNames = ["Anders","Brian","Charlotte","Lars","Lars Henrik","Marianne","Patrick","Rikke"];
  const baseColors = ["#FF5733","#33A852","#3369E8","#FF33A6","#FFB300","#8E44AD","#00CED1","#FF8C00","#2ECC71","#E74C3C","#3498DB"];

  function setStatus(msg) { statusDiv.textContent = msg || ""; }

  function arrangeNames(list) {
    if (list.length <= 1) return list.slice();
    for (let attempt = 0; attempt < 500; attempt++) {
      list.sort(() => Math.random() - 0.5);
      if (list.every((n, i) => n !== list[(i + 1) % list.length])) return list;
    }
    return list;
  }

  function getWheelColors(n) {
    return Array.from({ length: n }, (_, i) => baseColors[i % baseColors.length]);
  }

  function drawWheel(highlightIndex = null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!names.length) return;

    arc = (2 * Math.PI) / names.length;
    const wheelColors = getWheelColors(names.length);

    names.forEach((name, i) => {
      const angle = startAngle + i * arc;
      ctx.fillStyle = wheelColors[i];
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, angle, angle + arc);
      ctx.closePath();
      ctx.fill();

      if (highlightIndex === i) {
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 5;
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "16px Arial";
      ctx.fillText(name, canvas.width / 2 - 10, 10);
      ctx.restore();
    });

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 15, 0);
    ctx.lineTo(canvas.width / 2 + 15, 0);
    ctx.lineTo(canvas.width / 2, 30);
    ctx.closePath();
    ctx.fill();
  }

  function rotateWheel() {
    const duration = 4000 + Math.random() * 4000;
    const decelTime = 5000 + Math.random() * 3000;
    const startTime = performance.now();
    const endTime = startTime + duration;
    const decelStart = endTime - decelTime;

    function step(now) {
      if (now >= endTime) {
        spinning = false;
        if (!names.length) return;

        const pointerAngle = -Math.PI / 2;
        let adjusted = (pointerAngle - (startAngle % (2 * Math.PI))) % (2 * Math.PI);
        if (adjusted < 0) adjusted += 2 * Math.PI;
        const index = Math.floor(adjusted / arc);
        const chosen = names[index];

        resultDiv.textContent = "🎉 Pilen peger på: " + chosen;
        setStatus("");
        return;
      }

      let speed;
      if (now < decelStart) {
        speed = 0.3;
      } else {
        const decelProgress = (now - decelStart) / decelTime;
        speed = 0.3 * Math.pow(1 - decelProgress, 3);
      }

      startAngle += speed;
      drawWheel();
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  spinBtn.addEventListener("pointerup", () => {
    if (!spinning && names.length) {
      spinning = true;
      setStatus("⏳ Spinner…");
      rotateWheel();
    } else if (!names.length) {
      setStatus("Tilføj navne først.");
    }
  });

  resetBtn.addEventListener("pointerup", () => {
    names = [];
    firstName = null;
    resultDiv.textContent = "";
    setStatus("Hjulet er nulstillet.");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    startAngle = Math.random() * 2 * Math.PI;

    document.querySelectorAll(".nameBtn").forEach(btn => {
      btn.classList.remove("disabled");
      btn.disabled = false;
    });
  });

  function addName(n) {
    if (spinning) return setStatus("Du kan ikke tilføje navne mens hjulet drejer.");
    if (!firstName) firstName = n;
    names.push(n, n);
    names = arrangeNames(names);
    drawWheel();
    setStatus(`Tilføjet: ${n} × 2`);

    const btn = document.querySelector(`.nameBtn[data-name="${n}"]`);
    if (btn) {
      btn.classList.add("disabled");
      btn.disabled = true;
    }
  }

  // Knapper: grøn = tilføj, grå = fjern
  document.querySelectorAll(".nameBtn").forEach(btn => {
    btn.addEventListener("pointerup", () => {
      const name = btn.dataset.name;

      if (btn.disabled) {
        let count = 0;
        names = names.filter(n => n !== name || count++ >= 2);
        names = arrangeNames(names);
        drawWheel();
        setStatus(`Fjernet: ${name} × ${Math.min(count, 2)}`);

        btn.classList.remove("disabled");
        btn.disabled = false;
      } else {
        addName(name);
      }
    });
  });

  addNameBtn.addEventListener("pointerup", () => {
    const n = (newNameInput.value || "").trim();
    if (!n) return setStatus("Indtast et navn.");
    if (fixedNames.some(fn => fn.toLowerCase() === n.toLowerCase())) {
      return setStatus("Navnet findes allerede som fast navn.");
    }
    addName(n);
    newNameInput.value = "";
  });

  canvas.addEventListener("pointerup", e => {
    if (spinning) return;
    if (!names.length) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    let adjusted = (Math.atan2(y, x) - startAngle) % (2 * Math.PI);
    if (adjusted < 0) adjusted += 2 * Math.PI;
    const idx = Math.floor(adjusted / arc);
    const clicked = names[idx];
    if (clicked) {
      drawWheel(idx);
      setTimeout(() => {
        let count = 0;
        names = names.filter(n => n !== clicked || count++ >= 2);
        names = arrangeNames(names);
        drawWheel();
        setStatus(`Fjernet: ${clicked} × ${Math.min(count, 2)}`);

        if (fixedNames.includes(clicked)) {
          const btn = document.querySelector(`.nameBtn[data-name="${clicked}"]`);
          if (btn) {
            btn.classList.remove("disabled");
            btn.disabled = false;
          }
        }
      }, 500);
    }
  });

  drawWheel();
  setStatus("Hjulet starter tomt. Tilføj navne med knapper eller feltet.");
});
