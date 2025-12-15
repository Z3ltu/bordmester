document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("wheel"), ctx = canvas.getContext("2d");
  const resultDiv = document.getElementById("result"), statusDiv = document.getElementById("status");
  const spinBtn = document.getElementById("spinBtn"), resetBtn = document.getElementById("resetBtn");
  const newNameInput = document.getElementById("newNameInput"), addNameBtn = document.getElementById("addNameBtn");

  let names = [], firstName = null, spinning = false;
  const fixedNames = ["Anders","Rikke","Lars","Charlotte","Patrick","Marianne","Lars Henrik","Brian"];
  const baseColors = ["#FF5733","#33A852","#3369E8","#FF33A6","#FFB300","#8E44AD","#00CED1","#FF8C00","#2ECC71","#E74C3C","#3498DB"];
  let startAngle = Math.random() * 2 * Math.PI, arc = 0;

  const setStatus = msg => statusDiv.textContent = msg || "";

  const arrangeNames = list => {
    for (let attempt=0; attempt<500; attempt++) {
      list.sort(()=>Math.random()-0.5);
      if (list.every((n,i)=>n!==list[(i+1)%list.length])) return list;
    }
    return list;
  };

  const getColors = n => Array.from({length:n},(_,i)=>{
    let c = baseColors[i%baseColors.length];
    if (i>0 && c===baseColors[(i-1)%baseColors.length]) c = baseColors[(i+1)%baseColors.length];
    return c;
  });

  function drawWheel(highlight=null){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (!names.length) return;
    arc = 2*Math.PI/names.length;
    const colors = getColors(names.length);
    names.forEach((name,i)=>{
      const angle = startAngle+i*arc;
      ctx.fillStyle = colors[i];
      ctx.beginPath(); ctx.moveTo(canvas.width/2,canvas.height/2);
      ctx.arc(canvas.width/2,canvas.height/2,canvas.width/2,angle,angle+arc);
      ctx.closePath(); ctx.fill();
      if (highlight===i){ctx.strokeStyle="yellow";ctx.lineWidth=5;ctx.stroke();}
      ctx.save(); ctx.translate(canvas.width/2,canvas.height/2); ctx.rotate(angle+arc/2);
      ctx.textAlign="right"; ctx.fillStyle="#fff"; ctx.font="16px Arial";
      ctx.fillText(name,canvas.width/2-10,10); ctx.restore();
    });
    ctx.fillStyle="#000"; ctx.beginPath();
    ctx.moveTo(canvas.width/2-15,0); ctx.lineTo(canvas.width/2+15,0); ctx.lineTo(canvas.width/2,30);
    ctx.closePath(); ctx.fill();
  }

  function rotateWheel(){
    const duration = 6000+Math.random()*4000, decel = 3000+Math.random()*2000;
    const startT = performance.now(), endT = startT+duration, decelT = endT-decel;
    function step(now){
      if (now>=endT){
        spinning=false; if(!names.length) return;
        const pointer=-Math.PI/2;
        let adj=(pointer-(startAngle%(2*Math.PI)))%(2*Math.PI); if(adj<0) adj+=2*Math.PI;
        const chosen=names[Math.floor(adj/arc)];
        resultDiv.textContent="🎉 Pilen peger på: "+chosen; setStatus(""); return;
      }
      let speed = now<decelT?0.3:0.3*(1-(now-decelT)/decel);
      startAngle+=speed; drawWheel(); requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  spinBtn.onclick=()=>{ if(!spinning&&names.length){spinning=true;setStatus("⏳ Spinner…");rotateWheel();} else if(!names.length) setStatus("Tilføj navne først."); };
  resetBtn.onclick=()=>{ names=[]; firstName=null; resultDiv.textContent=""; setStatus("Hjulet er nulstillet."); ctx.clearRect(0,0,canvas.width,canvas.height); startAngle=Math.random()*2*Math.PI; };

  const addName = n => { if(spinning) return setStatus("Du kan ikke tilføje navne mens hjulet drejer."); if(!firstName) firstName=n; names.push(n,n); names=arrangeNames(names); drawWheel(); setStatus(`Tilføjet: ${n} × 2`); };

  document.querySelectorAll(".nameBtn").forEach(btn=>btn.onclick=()=>addName(btn.dataset.name));
  addNameBtn.onclick=()=>{ const n=(newNameInput.value||"").trim(); if(!n) return setStatus("Indtast et navn."); if(fixedNames.some(fn=>fn.toLowerCase()===n.toLowerCase())) return setStatus("Navnet findes allerede som fast navn."); addName(n); newNameInput.value=""; };

  canvas.onclick=e=>{
    if(!names.length) return;
    const rect=canvas.getBoundingClientRect(), x=e.clientX-rect.left-canvas.width/2, y=e.clientY-rect.top-canvas.height/2;
    let adj=(Math.atan2(y,x)-startAngle)%(2*Math.PI); if(adj<0) adj+=2*Math.PI;
    const idx=Math.floor(adj/arc), clicked=names[idx];
    if(clicked){ drawWheel(idx); setTimeout(()=>{ let c=0; names=names.filter(n=>n!==clicked||c++>=2); names=arrangeNames(names); drawWheel(); setStatus(`Fjernet: ${clicked} × ${c}`); },500); }
  };

  drawWheel(); setStatus("Hjulet starter tomt. Tilføj navne med knapper eller feltet.");
});
