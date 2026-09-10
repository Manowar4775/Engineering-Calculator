import { toNumber, formatNumber, showError, hideError } from "../utils.js";
import { addHistoryEntry } from "../history.js";

export function initBmiCalculator() {
  const view = document.getElementById("view-bmi");
  if (!view) return;

  const form = document.getElementById("bmiForm");
  const unitSwitch = view.querySelector(".unit-switch");
  const resultCard = document.getElementById("bmiResult");
  const valueEl = document.getElementById("bmiValue");
  const categoryEl = document.getElementById("bmiCategory");
  const errorEl = document.getElementById("bmiError");
  const marker = document.getElementById("bmiMarker");

  let units = "metric";

  unitSwitch.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-units]");
    if (!btn) return;
    units = btn.dataset.units;
    unitSwitch.querySelectorAll("[data-units]").forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", String(active));
    });
    view.querySelectorAll("[data-units-group]").forEach((group) => {
      group.hidden = group.dataset.unitsGroup !== units;
    });
    resultCard.hidden = true;
    hideError(errorEl);
  });

  function category(bmi) {
    if (bmi < 18.5) return { label: "Underweight", pos: (bmi / 18.5) * 18.5 };
    if (bmi < 25) return { label: "Normal weight", pos: 18.5 + ((bmi - 18.5) / (25 - 18.5)) * (45 - 18.5) };
    if (bmi < 30) return { label: "Overweight", pos: 45 + ((bmi - 25) / (30 - 25)) * (62 - 45) };
    return { label: "Obesity", pos: 62 + Math.min(((bmi - 30) / 15) * 38, 38) };
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError(errorEl);
    resultCard.hidden = true;

    let weightKg, heightM;

    if (units === "metric") {
      const w = toNumber(document.getElementById("bmiWeightKg").value);
      const h = toNumber(document.getElementById("bmiHeightCm").value);
      if (w === null || h === null) return showError(errorEl, "Enter both weight and height.");
      if (w <= 0 || h <= 0) return showError(errorEl, "Weight and height must be greater than zero.");
      weightKg = w;
      heightM = h / 100;
    } else {
      const lb = toNumber(document.getElementById("bmiWeightLb").value);
      const ft = toNumber(document.getElementById("bmiHeightFt").value) ?? 0;
      const inch = toNumber(document.getElementById("bmiHeightIn").value) ?? 0;
      if (lb === null || (ft === 0 && inch === 0)) return showError(errorEl, "Enter your weight and height.");
      if (lb <= 0 || ft < 0 || inch < 0 || ft + inch <= 0) return showError(errorEl, "Weight and height must be greater than zero.");
      weightKg = lb * 0.45359237;
      heightM = (ft * 12 + inch) * 0.0254;
    }

    const bmi = weightKg / (heightM * heightM);
    if (!Number.isFinite(bmi)) return showError(errorEl, "Couldn't compute a BMI from those values.");

    const { label, pos } = category(bmi);
    valueEl.textContent = formatNumber(bmi, 1);
    categoryEl.textContent = label;
    marker.style.left = `${Math.min(100, Math.max(0, pos))}%`;
    resultCard.hidden = false;

    addHistoryEntry("BMI", `weight ${formatNumber(weightKg, 1)} kg, height ${formatNumber(heightM, 2)} m`, `${formatNumber(bmi, 1)} (${label})`);
  });
}
