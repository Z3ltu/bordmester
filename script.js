document.addEventListener("DOMContentLoaded", () => {
  const c=document.getElementById("wheel"),ctx=c.getContext("2d"),
        res=document.getElementById("result"),stat=document.getElementById("status"),
        spin=document.getElementById("spinBtn"),reset=document.getElementById("resetBtn"),
        inp=document.getElementById("newNameInput"),add=document.getElementById("addNameBtn");
  let names=[],first=null,spinning=false,startAngle=Math.random()*2*Math.PI,arc=0;
  const fixed=["Anders","Rikke","Lars","Charlotte","Patrick","Marianne","Lars Henrik","Brian"],
        colors=["#FF5733","#33A852","#3369E8","#FF33A6","#FFB300","#8E44AD","#00CED1","#FF8C00","#2ECC71","#E74C3C","#3498DB"];
  const setStat=m=>stat.textContent=m||"";
  const arrange=l=>{for(let t=0;t<500;t++){l.sort(()=>Math.random()-0.5);if(l.every((n,i)=>n!==l[(i+1)%l.length]))return l;}return l;};
  const getCols=n=>Array.from({length:n},(_,i)=>colors[i%colors.length]);
  function drawWheel(h=null){
    ctx.clearRect(0,0,c.width,c.height); if(!names.length)return;
    arc=2*Math.PI/names.length; const cols=getCols(names.length);
    names.forEach((n,i)=>{const a=startAngle+i*arc;
      ctx.fillStyle=cols[i]; ctx.beginPath(); ctx.moveTo(c.width/2,c.height/2);
      ctx.arc(c.width/2,c.height/2,c.width/2,a,a+arc); ctx.closePath(); ctx.fill();
      if(h===i){ctx.strokeStyle="yellow";ctx.lineWidth=5;ctx.stroke();}
      ctx.save(); ctx.translate(c.width/2,c.height/2); ctx.rotate(a+arc/2);
      ctx.textAlign="right"; ctx.fillStyle="#fff"; ctx.font="16px Arial";
      ctx.fillText(n,c.width/2-10,10); ctx.restore();
    });
    ctx.fillStyle="#000"; ctx.beginPath();
    ctx.moveTo(c.width/2-15,0); ctx.lineTo(c.width/2+15,0); ctx.lineTo(c.width/2,30);
    ctx.closePath(); ctx.fill();
  }
  function rotateWheel(){
    const dur=4000+Math.random()*4000,decel=3000+Math.random()*2000,
          st=performance.now(),end=st+dur,decelS=end-decel;
    function step(now){
      if(now>=end){spinning=false;if(!names.length)return;
        const p=-Math.PI/2; let adj=(p-(startAngle%(2*Math.PI)))%(2*Math.PI);
        if(adj<0)adj+=2*Math.PI; const idx=Math.floor(adj/arc);
        res.textContent="🎉 Pilen peger på: "+names[idx]; setStat(""); return;}
      let speed=now<decelS?0.3:0.3*(1-(now-decelS)/decel);
      startAngle+=speed; drawWheel(); requestAnimationFrame(step);
    } requestAnimationFrame(step);
  }
  spin.onclick=()=>{if(!spinning&&names.length){spinning=true;setStat("⏳ Spinner…");rotateWheel();}else if(!names.length)setStat("Tilføj navne først.");};
  reset.onclick=()=>{names=[];first=null;res.textContent="";setStat("Hjulet er nulstillet.");ctx.clearRect(0,0,c.width,c.height);startAngle=Math.random()*2*Math.PI;};
  const addName=n=>{if(spinning)return setStat("Du kan ikke tilføje navne mens hjulet drejer."); if(!first)first=n; names.push(n,n); names=arrange(names); drawWheel(); setStat(`Tilføjet: ${n} × 2`);};
  document.querySelectorAll(".nameBtn").forEach(b=>b.onclick=()=>addName(b.dataset.name));
  add.onclick=()=>{const n=(inp.value||"").trim(); if(!n)return setStat("Indtast et navn."); if(fixed.some(f=>f.toLowerCase()===n.toLowerCase()))return setStat("Navnet findes allerede som fast navn."); addName(n); inp.value="";};
  c.onclick=e=>{if(!names.length)return; const r=c.getBoundingClientRect(),x=e.clientX-r.left-c.width/2,y=e.clientY-r.top-c.height/2;
    let adj=(Math.atan2(y,x)-startAngle)%(2*Math.PI); if(adj<0)adj+=2*Math.PI;
    const idx=Math.floor(adj/arc),clicked=names[idx];
    if(clicked){drawWheel(idx);setTimeout(()=>{let cnt=0;names=names.filter(n=>n!==clicked||cnt++>=2);names=arrange(names);drawWheel();setStat(`Fjernet: ${clicked} × ${cnt}`);},500);}
  };
  drawWheel(); setStat("Hjulet starter tomt. Tilføj navne med knapper eller feltet.");
});
