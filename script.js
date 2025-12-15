let availableNames = ["Lars","Brian","Charlotte","Rikke","Marianne","Anders","Lars Henrik","Patrick"];
let selectedNames = [];
const colors = ["red","yellow","green","blue","orange","purple","pink","cyan","lime","magenta"];
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
let startAngle = 0;
let spinning = false;

function renderAvailable(){
  const box = document.getElementById("available");
  box.innerHTML = "";
  availableNames.forEach(n => {
    const d = document.createElement("div");
    d.className = "nameItem";
    d.textContent = n;
    d.onclick = () => addToWheel(n);
    box.appendChild(d);
  });
}

function addNewName(){
  const i = document.getElementById("nameInput");
  const n = i.value.trim();
  if(!n) return;
  availableNames.push(n);
  i.value = "";
  renderAvailable();
}

function addToWheel(n){
  // Første navn: tilføj to gange
  if(selectedNames.length === 0){
    selectedNames.push(n);
    selectedNames.push(n);
  } else {
    // Efterfølgende: tilføj navnet 2x, undgå nabo-duplikater
    for(let k=0; k<2; k++){
      let placed = false;
      let attempts = 0;
      while(!placed && attempts < 200){
        attempts++;
        const p = Math.floor(Math.random() * (selectedNames.length + 1));
        const prev = (p > 0) ? selectedNames[p-1] : null;
        const next = (p < selectedNames.length) ? selectedNames[p] : null;
        if(prev !== n && next !== n){
          selectedNames.splice(p, 0, n);
          placed = true;
        }
      }
      if(!placed){
        let inserted = false;
        for(let p=0; p<=selectedNames.length; p++){
          const prev = (p > 0) ? selectedNames[p-1] : null;
          const next = (p < selectedNames.length) ? selectedNames[p] : null;
          if(prev !== n && next !== n){
            selectedNames.splice(p, 0, n);
            inserted = true;
            break;
          }
        }
        if(!inserted){
          selectedNames.push(n);
        }
      }
    }
  }
  drawWheel();
}

function drawWheel(){
  ctx.clearRect(0,0,400,400);
  if(selectedNames.length === 0) return;

  const arc = 2 * Math.PI / selectedNames.length;
  ctx.font = "18px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for(let i=0; i<selectedNames.length; i++){
    const ang = startAngle + i * arc;
    ctx.beginPath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.moveTo(200,200);
    ctx.arc(200,200,200,ang,ang+arc);
    ctx.fill();

    ctx.save();
    ctx.translate(200,200);
    ctx.rotate(ang + arc/2);
    ctx.fillStyle = "#000";
    ctx.fillText(selectedNames[i], 100, 0);
    ctx.restore();
  }
}

function spin(){
  if(spinning || !selectedNames.length) return;
  spinning = true;
  const total = 5000 + Math.random() * 3000;
  const slow = 3000 + Math.random() * 2000;
  const start = performance.now();

  function anim(t){
    const e = t - start;
    if(e < total - slow) {
      startAngle += 0.25;
    } else {
      const f = Math.max(0, 1 - (e - (total - slow)) / slow);
      startAngle += 0.25 * f;
    }
    drawWheel();
    if(e < total) {
      requestAnimationFrame(anim);
    } else {
      spinning = false;
      announceWinner();
    }
  }
  requestAnimationFrame(anim);
}

function announceWinner(){
  const arc = 2 * Math.PI / selectedNames.length;
  // Pil peger opad (270 grader = 1.5 * PI)
  const idx = Math.floor(((Math.PI*1.5 - startAngle) % (2*Math.PI) + 2*Math.PI) / arc) % selectedNames.length;
  alert("Vinderen er: " + selectedNames[idx]);
}

function resetWheel(){
  selectedNames = [];
  drawWheel();
}

// Robust klikdetektion: fjern 2x af navnet ved klik i segmentet
canvas.addEventListener("click", (e) => {
  if(!selectedNames.length) return;

  // Brug bounding rect + clientX/Y for præcise koordinater
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left - canvas.width/2;
  const y = e.clientY - rect.top - canvas.height/2;

  // Tjek om der klikkes inden for hjulets radius
  const r = Math.sqrt(x*x + y*y);
  const radius = canvas.width/2; // 200
  if(r > radius) return; // klik uden for hjulet ignoreres

  // Vinkel fra center til klikpunkt [0, 2π)
  let angle = Math.atan2(y, x);
  if(angle < 0) angle += 2 * Math.PI;

  // Beregn segmentindeks med hensyn til startAngle
  const arc = 2 * Math.PI / selectedNames.length;
  const idx = Math.floor(((angle - startAngle) % (2*Math.PI) + 2*Math.PI) / arc) % selectedNames.length;

  const nameToRemove = selectedNames[idx];
  if(!nameToRemove) return;

  // Fjern op til 2 forekomster af navnet
  let removed = 0;
  selectedNames = selectedNames.filter(n => {
    if(n === nameToRemove && removed < 2){
      removed++;
      return false;
    }
    return true;
  });

  drawWheel();
});
 
renderAvailable();
drawWheel();
