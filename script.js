// ... behold alt det eksisterende ...

// Hjælp: fjern alle forekomster af et navn (eller 2 stk)
function removeName(targetName) {
  // fjern 2 forekomster
  let count = 0;
  names = names.filter(n => {
    if (n === targetName && count < 2) {
      count++;
      return false;
    }
    return true;
  });
  names = arrangeNames(names);
  saveNames();
  drawWheel();
  setStatus(`Fjernet: ${targetName} × ${count}`);
}

// Canvas click → find hvilket navn der blev klikket
canvas.addEventListener("click", (e) => {
  if (!names.length) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left - canvas.width/2;
  const y = e.clientY - rect.top - canvas.height/2;
  const angle = Math.atan2(y, x);
  let adjusted = angle - startAngle;
  if (adjusted < 0) adjusted += 2*Math.PI;
  const index = Math.floor(adjusted / arc);
  const clickedName = names[index];
  if (clickedName) removeName(clickedName);
});

// Tilføj nyt navn via inputfelt
addNameBtn.addEventListener("click", () => {
  const newName = (newNameInput.value || "").trim();
  if (!newName) { setStatus("Indtast et navn."); return; }
  const isFixed = fixedNames.some(fn => fn.toLowerCase() === newName.toLowerCase());
  if (isFixed) { setStatus("Navnet findes allerede som fast navn."); return; }

  // Tilføj 2×
  names.push(newName, newName);

  // Hvis vi nu har 3 unikke navne, reducer første navn til 1×
  const unique = [...new Set(names)];
  if (unique.length >= 3) {
    const first = unique[0];
    let removed = 0;
    names = names.filter(n => {
      if (n === first && removed < 1) { removed++; return true; }
      if (n === first) return false;
      return true;
    });
  }

  names = arrangeNames(names);
  saveNames();
  drawWheel();
  newNameInput.value = "";
  setStatus(`Tilføjet: ${newName} × 2`);
});
