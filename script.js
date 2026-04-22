// Plate sizes
const platesLb = [45, 35, 25, 10, 5, 2.5];
const platesKg = [25, 20, 15, 10, 5, 2.5, 1.25];

// Default inventory (how many of each plate, per side)
const defaultInventoryLb = {
  45: 4, 35: 0, 25: 2, 10: 2, 5: 2, 2.5: 2
};
const defaultInventoryKg = {
  25: 2, 20: 2, 15: 2, 10: 2, 5: 2, 2.5: 2, 1.25: 2
};

// Plate visual styles
const plateStylesKg = {
  25:   { color: "#d32f2f", height: 110, width: 14 },
  20:   { color: "#1976d2", height: 105, width: 14 },
  15:   { color: "#fbc02d", height: 100, width: 14 },
  10:   { color: "#388e3c", height: 85,  width: 14 },
  5:    { color: "#f5f5f5", height: 70,  width: 12 },
  2.5:  { color: "#d32f2f", height: 55,  width: 10 },
  1.25: { color: "#1976d2", height: 45,  width: 8  },
};
const plateStylesLb = {
  45:  { color: "#d32f2f", height: 110, width: 14 }, // red (like 25 kg)
  35:  { color: "#fbc02d", height: 100, width: 14 }, // yellow (like 15 kg)
  25:  { color: "#388e3c", height: 85,  width: 13 }, // green (like 10 kg)
  10:  { color: "#f5f5f5", height: 70,  width: 12 }, // white (like 5 kg)
  5:   { color: "#1976d2", height: 55,  width: 10 }, // blue (mapped down)
  2.5: { color: "#d32f2f", height: 45,  width: 8  }, // red small
};

// Track current unit
let currentUnit = "lb";

// ---------- Unit switch ----------
document.getElementById("unit-toggle").addEventListener("change", function(e) {
  currentUnit = e.target.checked ? "kg" : "lb";
  document.getElementById("bar").value = currentUnit === "kg" ? 20 : 45;
  renderInventory();
  // Clear stale results
  document.getElementById("result").textContent = "";
  document.getElementById("plates-left").innerHTML = "";
  document.getElementById("plates-right").innerHTML = "";
});

// ---------- Inventory ----------
function renderInventory() {
  const grid = document.getElementById("inventory-grid");
  grid.innerHTML = "";

  const plates = currentUnit === "kg" ? platesKg : platesLb;
  const defaults = currentUnit === "kg" ? defaultInventoryKg : defaultInventoryLb;

  for (const weight of plates) {
    const row = document.createElement("div");
    row.className = "inventory-row";

    const label = document.createElement("label");
    label.textContent = `${weight} ${currentUnit}`;

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.value = defaults[weight];
    input.dataset.weight = weight;
    input.className = "inventory-input";

    row.appendChild(label);
    row.appendChild(input);
    grid.appendChild(row);
  }
}

function getInventory() {
  const inventory = {};
  document.querySelectorAll(".inventory-input").forEach(function(input) {
    const weight = parseFloat(input.dataset.weight);
    const count = parseInt(input.value) || 0;
    inventory[weight] = count;
  });
  return inventory;
}

// ---------- Calculate ----------
document.getElementById("calculate").addEventListener("click", function() {
  const target = parseFloat(document.getElementById("target").value);
  const bar = parseFloat(document.getElementById("bar").value);
  const plates = currentUnit === "kg" ? platesKg : platesLb;
  const styles = currentUnit === "kg" ? plateStylesKg : plateStylesLb;
  const inventory = getInventory();

  const resultBox = document.getElementById("result");
  const leftBox = document.getElementById("plates-left");
  const rightBox = document.getElementById("plates-right");

  leftBox.innerHTML = "";
  rightBox.innerHTML = "";

  if (isNaN(target) || isNaN(bar)) {
    resultBox.textContent = "Please enter valid numbers.";
    return;
  }

  if (target < bar) {
    resultBox.textContent = "Target weight must be at least as heavy as the bar.";
    return;
  }

  const perSide = (target - bar) / 2;
  let remaining = perSide;
  const platesUsed = [];
  // Track how many of each plate we've used
  const used = {};

  for (const plate of plates) {
    while (remaining >= plate && (used[plate] || 0) < (inventory[plate] || 0)) {
      platesUsed.push(plate);
      used[plate] = (used[plate] || 0) + 1;
      remaining -= plate;
    }
  }

  const achieved = (perSide - remaining) * 2 + bar;

  if (platesUsed.length === 0 && perSide === 0) {
    resultBox.textContent = `Just the bar (${bar} ${currentUnit}).`;
  } else if (platesUsed.length === 0) {
    resultBox.textContent = `Can't load any plates with your current inventory.`;
  } else {
    let message = `Each side: ${platesUsed.join(" + ")} ${currentUnit}`;
    if (remaining > 0) {
      message += ` (closest achievable: ${achieved} ${currentUnit}, short by ${remaining * 2} ${currentUnit})`;
    }
    resultBox.textContent = message;
  }

  for (const weight of platesUsed) {
    const style = styles[weight];
    leftBox.appendChild(makePlate(weight, style));
    rightBox.appendChild(makePlate(weight, style));
  }
});

function makePlate(weight, style) {
  const plate = document.createElement("div");
  plate.className = "plate";
  plate.textContent = weight;
  plate.style.backgroundColor = style.color;
  plate.style.height = style.height + "px";
  plate.style.width = style.width + "px";
  const darkPlates = ["#1a1a1a", "#388e3c", "#1976d2", "#d32f2f"];
  if (darkPlates.includes(style.color)) {
    plate.style.color = "#fff";
  }
  return plate;
}

// Initial render on page load
renderInventory();