const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const resultDiv = document.getElementById("result");
const spinBtn = document.getElementById("spinBtn");
const resetBtn = document.getElementById("resetBtn");
const saveNamesBtn = document.getElementById("saveNamesBtn");

let names = JSON.parse(localStorage.getItem("bordmester_names") || "[]");
let colors = ["#FF5733","#33FF57","#3357FF","#FF33A6","#FFC300","#8E44AD","#00CED1","#FF8C00"];

let startAngle = 0;
let arc = names.length ? Math.PI * 2 / names.length : 0;
let spinAngle = 0;
let spinning = false;

// Sikrer at ingen ens navne står ved siden af hinanden
function arrangeNames(list) {
  if (list.length <= 1) return list;
  let arranged = [];
  let pool = [...list];

  arranged.push(pool.shift()); // første navn
  while (pool.length) {
    let next = pool.find(n => n !== arranged[arranged.length-1]);
    if (!next) {
      // hvis kun samme navn tilbage, byt med første
      next = pool[0];
      arranged[0] = next;
    }
    arranged.push(next);
    pool.splice(pool.indexOf(next),1);
  }
  return arranged;
}

function shuffleColors(n) {
  let shuffled = [...colors];
  while (shuffled.length < n) shuffled = shuffled.concat(colors);
  shuffled = shuffled.slice(0,n);
  for (let i=1;i<shuffled.length;i++) {
    if (shuffled[i] === shuffled[i-1]) {
      [shuffled[i], shuffled[(i+1)%shuffled.length]] = [shuffled[(i+1)%shuffled.length], shuffled[i]];
    }
  }
  return shuffled;
}

function drawWheel() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if (!names.length) return;

  arc = Math.PI * 2 / names.length;
  let wheelColors = shuffleColors(names.length);

  for (let i=0;i<names.length;i++) {
    const angle = startAngle + i*arc;
    ctx.fillStyle = wheelColors[i];
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, canvas.height/2);
    ctx.arc(canvas.width/2, canvas.height/2, canvas.width/2, angle, angle+arc);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(angle+arc/2);
    ctx.textAlign="right";
    ctx.fillStyle="white";
    ctx.font="16px Arial";
    ctx.fillText(names[i], canvas.width/2-10,10);
    ctx.restore();
  }

  // pil udenfor hjulet
  ctx.fillStyle="#000";
  ctx.beginPath();
  ctx.moveTo(canvas.width/2-15,0);
  ctx.lineTo(canvas.width/2+15,0);
  ctx.lineTo(canvas.width/2,30);
  ctx.closePath();
  ctx.fill();
}

function rotateWheel() {
  spinAngle *= 0.97;
  startAngle += spinAngle * Math.PI/180;
  drawWheel();

  if (spinAngle > 0.2) {
    requestAnimationFrame(rotateWheel);
  } else {
    spinning=false;
    const selectedIndex = Math.floor(((Math.PI*2 - startAngle) % (Math.PI*2)) / arc);
    resultDiv.textContent = "Valgt: "+names[selectedIndex];
  }
}

spinBtn.addEventListener("click",()=>{
  if (!spinning && names.length) {
    spinAngle = Math.random()*30+30;
    spinning=true;
    rotateWheel();
  }
});

resetBtn.addEventListener("click",()=>{
  names=[];
  localStorage.removeItem("bordmester_names");
  resultDiv.textContent="";
  ctx.clearRect(0,0,canvas.width,canvas.height);
});

saveNamesBtn.addEventListener("click",()=>{
  const checkboxes = document.querySelectorAll("#nameList input[type=checkbox]");
  let list = Array.from(checkboxes).filter(cb=>cb.checked).map(cb=>cb.value);

  // indsæt hver navn 2x
  list = list.flatMap(n => [n,n]);

  // arranger så ingen naboer er ens (på nær første der kan ændres)
  list = arrangeNames(list);

  if (list.length) {
    names=list;
    localStorage.setItem("bordmester_names",JSON.stringify(names));
    drawWheel();
  }
});

// init
drawWheel();
