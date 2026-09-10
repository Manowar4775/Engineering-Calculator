import { toNumber, formatNumber, showError, hideError } from "../utils.js";

// Every category except temperature is defined as a factor to its base unit;
// value_in_base = value * factor, value_in_target = value_in_base / factor.
const CATEGORIES = {
  length: {
    base: "m",
    units: {
      mm: 0.001, cm: 0.01, m: 1, km: 1000,
      in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344,
    },
  },
  area: {
    base: "m2",
    units: {
      mm2: 1e-6, cm2: 1e-4, m2: 1, km2: 1e6,
      in2: 0.00064516, ft2: 0.09290304, acre: 4046.8564224, hectare: 10000,
    },
  },
  mass: {
    base: "kg",
    units: { mg: 1e-6, g: 0.001, kg: 1, tonne: 1000, oz: 0.028349523125, lb: 0.45359237 },
  },
  force: {
    base: "N",
    units: { N: 1, kN: 1000, dyn: 1e-5, lbf: 4.4482216153, kgf: 9.80665 },
  },
  pressure: {
    base: "Pa",
    units: { Pa: 1, kPa: 1000, MPa: 1e6, bar: 1e5, atm: 101325, psi: 6894.757293168 },
  },
  energy: {
    base: "J",
    units: { J: 1, kJ: 1000, cal: 4.184, kcal: 4184, Wh: 3600, kWh: 3.6e6 },
  },
};

const TEMP_UNITS = ["C", "F", "K"];

function toCelsius(value, unit) {
  if (unit === "C") return value;
  if (unit === "F") return (value - 32) * (5 / 9);
  return value - 273.15; // K
}
function fromCelsius(value, unit) {
  if (unit === "C") return value;
  if (unit === "F") return value * (9 / 5) + 32;
  return value + 273.15; // K
}

export function initConverter() {
  const view = document.getElementById("view-converter");
  if (!view) return;

  const categoryEl = document.getElementById("convCategory");
  const fromValueEl = document.getElementById("convFromValue");
  const fromUnitEl = document.getElementById("convFromUnit");
  const toValueEl = document.getElementById("convToValue");
  const toUnitEl = document.getElementById("convToUnit");
  const swapBtn = document.getElementById("convSwap");
  const errorEl = document.getElementById("convError");

  function unitList(category) {
    return category === "temperature" ? TEMP_UNITS : Object.keys(CATEGORIES[category].units);
  }

  function populateUnits() {
    const cat = categoryEl.value;
    const units = unitList(cat);
    fromUnitEl.innerHTML = units.map((u) => `<option value="${u}">${u}</option>`).join("");
    toUnitEl.innerHTML = units.map((u) => `<option value="${u}">${u}</option>`).join("");
    fromUnitEl.value = units[0];
    toUnitEl.value = units[Math.min(1, units.length - 1)];
  }

  function convert() {
    hideError(errorEl);
    const cat = categoryEl.value;
    const value = toNumber(fromValueEl.value);
    if (value === null) { toValueEl.value = ""; return; }

    const fromUnit = fromUnitEl.value;
    const toUnit = toUnitEl.value;

    try {
      let result;
      if (cat === "temperature") {
        if (toUnit === "K" && toCelsius(value, fromUnit) < -273.15) {
          throw new Error("That's below absolute zero.");
        }
        result = fromCelsius(toCelsius(value, fromUnit), toUnit);
      } else {
        const { units } = CATEGORIES[cat];
        const base = value * units[fromUnit];
        result = base / units[toUnit];
      }
      toValueEl.value = formatNumber(result, 6);
    } catch (err) {
      toValueEl.value = "";
      showError(errorEl, err.message || "Couldn't convert that value.");
    }
  }

  categoryEl.addEventListener("change", () => { populateUnits(); convert(); });
  fromValueEl.addEventListener("input", convert);
  fromUnitEl.addEventListener("change", convert);
  toUnitEl.addEventListener("change", convert);
  swapBtn.addEventListener("click", () => {
    const f = fromUnitEl.value;
    fromUnitEl.value = toUnitEl.value;
    toUnitEl.value = f;
    if (toValueEl.value !== "") fromValueEl.value = toValueEl.value;
    convert();
  });

  populateUnits();
}
