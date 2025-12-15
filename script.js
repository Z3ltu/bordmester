const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const resultDiv = document.getElementById("result");
const spinBtn = document.getElementById("spinBtn");

const names = ["Anders", "Brian", "Lars", "Rikke", "Lars Henrik", "Marianne", "Patrick"];
const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A6", "#FFC300", "#8E44AD"];

let startAngle = 0;
let arc = Math.PI * 2 / names.length;
let spinAngle = 0;
let spinning = false;

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < names.length; i++) {
    const angle = startAngle + i * arc;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, angle, angle + arc);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(names[i], canvas.width / 2 - 10, 10);
    ctx.restore();
  }

  // Tegn pilen
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 10, 10);
  ctx.lineTo(canvas.width / 2 + 10, 10);
  ctx.lineTo(canvas.width / 2, 30);
  ctx.closePath();
  ctx.fill();
}

function rotateWheel() {
  spinAngle *= 0.97;
  startAngle += spinAngle * Math.PI / 180;
  drawWheel();

  if (spinAngle > 0.2) {
    requestAnimationFrame(rotateWheel);
  } else {
    spinning = false;
    const selectedIndex = Math.floor(((Math.PI * 2 - startAngle) % (Math.PI * 2)) / arc);
    resultDiv.textContent = "Valgt: " + names[selectedIndex];
  }
}

spinBtn.addEventListener("click", () => {
  if (!spinning) {
    spinAngle = Math.random() * 30 + 30;
    spinning = true;
    rotateWheel();
  }
});

drawWheel();

