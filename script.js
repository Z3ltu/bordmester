document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("wheel");
  const ctx = canvas.getContext("2d");
  const resultDiv = document.getElementById("result");
  const statusDiv = document.getElementById("status");
  const spinBtn = document.getElementById("spinBtn");
  const resetBtn = document.getElementById("resetBtn");
  const newNameInput = document.getElementById("newNameInput");
  const addNameBtn = document.getElementById("addNameBtn");

  let names = []; // starter tomt
  let firstName = null; // husker første navn
  const fixedNames = ["Anders","Rikke","Lars","Charlotte","Patrick","Marianne","Lars Henrik","Brian"];
  const colors = ["#FF5733","#33FF57","#3357FF","#FF33A6","#FFC300","#8E44AD","#00CED1","#FF8C00"];
  let startAngle = 0, arc = 0, spinAngle = 0, spinning = false;

  function setStatus(msg){ statusDiv.textContent = msg || ""; }

  function arrangeNames(list){
    if(list.length<=1) return list.slice();
    const pool=list.slice(); const arranged=[pool.shift()];
    while(pool.length){
      let idx=pool.findIndex(n=>n!==arranged[arranged.length-1]);
      if(idx===-1) idx=0;
      arranged.push(pool[idx]); pool.splice(idx,1);
    }
    if(arranged.length>1 && arranged[0]===arranged[arranged.length-1]){
      for(let i=arranged.length-2;i>=0;i--){
        if(arranged[i]!==arranged[0]){
          [arranged[arranged.length-1],arranged[i]]=[arranged[i],arranged[arranged.length-1]];
          break;
        }
      }
    }
    return arranged;
  }

  function shuffleColors(n){
    let shuffled=colors.slice();
    while(shuffled.length<n) shuffled=shuffled.concat(colors);
    shuffled=shuffled.slice(0,n);
    for(let i=1;i<shuffled.length;i++){
      if(shuffled[i]===shuffled[i-1]){
        const j=(i+1)%shuffled.length;
        [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
      }
    }
    if(shuffled.length>1 && shuffled[0]===shuffled[shuffled.length-1]){
      [shuffled[0],shuffled[shuffled.length-1]]=[shuffled[shuffled.length-1],shuffled[0]];
    }
    return shuffled;
  }

  function drawWheel(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(!names.length) return;
    arc=Math.PI*2/names.length;
    const wheelColors=shuffleColors(names.length);
    for(let i=0;i<names.length;i++){
      const angle=startAngle+i*arc;
      ctx.fillStyle=wheelColors[i];
      ctx.beginPath();
      ctx.moveTo(canvas.width/2,canvas.height/2);
      ctx.arc(canvas.width/2,canvas.height/2,canvas.width/2,angle,angle+arc);
      ctx.closePath(); ctx.fill();
      ctx.save();
      ctx.translate(canvas.width/2,canvas.height/2);
      ctx.rotate(angle+arc/2);
      ctx.textAlign="right"; ctx.fillStyle="#fff"; ctx.font="16px Arial";
      ctx.fillText(names[i],canvas.width/2-10,10);
      ctx.restore();
    }
    ctx.fillStyle="#000";
    ctx.beginPath();
    ctx.moveTo(canvas.width/2-15,0);
    ctx.lineTo(canvas.width/2+15,0);
    ctx.lineTo(canvas.width/2,30);
    ctx.closePath(); ctx.fill();
  }

  function rotateWheel(){
    spinAngle*=0.97; startAngle+=(spinAngle*Math.PI)/180; drawWheel();
    if(spinAngle>0.2){ requestAnimationFrame(rotateWheel); }
    else{
      spinning=false;
      if(!names.length) return;
      const index=Math.floor(((Math.PI*2-startAngle)%(Math.PI*2))/arc);
      const chosen=names[index];
      resultDiv.textContent="🎉 Pilen peger på: "+chosen;
      setStatus("");
    }
  }

  spinBtn.addEventListener("click",()=>{
    if(!spinning && names.length){
      spinAngle=Math.random()*30+30; spinning=true;
      setStatus("⏳ Spinner…"); rotateWheel();
    } else if(!names.length){ setStatus("Tilføj navne først."); }
  });

  resetBtn.addEventListener("click",()=>{
    names=[]; firstName=null;
    resultDiv.textContent=""; setStatus("Hjulet er nulstillet.");
    ctx.clearRect(0,0,canvas.width,canvas.height);
  });

  // Klik på faste navne-knapper
  document.querySelectorAll(".nameBtn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const n=btn.dataset.name;
      if(!firstName) firstName=n; // husk første navn
      names.push(n,n);
      names=arrangeNames(names);
      drawWheel();
      setStatus(`Tilføjet: ${n} × 2`);
    });
  });

  // Tilføj nyt navn via inputfelt
  addNameBtn.addEventListener("click",()=>{
    const newName=(newNameInput.value||"").trim();
    if(!newName){ setStatus("Indtast et navn."); return; }
    const isFixed=fixedNames.some(fn=>fn.toLowerCase()===newName.toLowerCase());
    if(isFixed){ setStatus("Navnet findes allerede som fast navn."); return; }
    if(!firstName) firstName=newName; // husk første navn
    names.push(newName,newName);
    names=arrangeNames(names);
    drawWheel();
    newNameInput.value="";
    setStatus(`Tilføjet: ${newName} × 2`);
  });

  // Klik på hjulet → fjern navnet 2×
  canvas.addEventListener("click",(e)=>{
    if(!names.length) return;
    const rect=canvas.getBoundingClientRect();
    const x=e.clientX-rect.left-canvas.width/2;
    const y=e.clientY-rect.top-canvas.height/2;
    const angle=Math.atan2(y,x);
    let adjusted=angle-startAngle;
    if(adjusted<0) adjusted+=2*Math.PI;
    const index=Math.floor(adjusted/arc);
    const clickedName=names[index];
    if(clickedName){
      let count=0;
      names=names.filter(n=>{
        if(n===clickedName && count<2){ count++; return false; }
        return true;
      });
      names=arrangeNames(names);
      drawWheel();
      setStatus(`Fjernet: ${clickedName} × ${count}`);
    }
  });

  drawWheel();
  setStatus("Hjulet starter tomt. Tilføj navne med knapper eller feltet.");
});
