import { toNumber, formatNumber, showError, hideError } from "../utils.js";
import { addHistoryEntry } from "../history.js";

const FORCE_TO_N = { N: 1, kN: 1000 };
const AREA_TO_M2 = { mm2: 1e-6, cm2: 1e-4, m2: 1 };

export function initStressCalculator() {
  const view = document.getElementById("view-stress");
  if (!view) return;

  const form = document.getElementById("stressForm");
  const errorEl = document.getElementById("stressError");
  const resultCard = document.getElementById("stressResult");
  const valueEl = document.getElementById("stressValue");
  const unitOutEl = document.getElementById("stressUnitOut");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError(errorEl);
    resultCard.hidden = true;

    const force = toNumber(document.getElementById("stressForce").value);
    const area = toNumber(document.getElementById("stressArea").value);
    const forceUnit = document.getElementById("stressForceUnit").value;
    const areaUnit = document.getElementById("stressAreaUnit").value;

    if (force === null || area === null) return showError(errorEl, "Enter both force and area.");
    if (area <= 0) return showError(errorEl, "Area must be greater than zero.");
    if (force < 0) return showError(errorEl, "Force should not be negative — use magnitude only.");

    const forceN = force * FORCE_TO_N[forceUnit];
    const areaM2 = area * AREA_TO_M2[areaUnit];
    const stressPa = forceN / areaM2;

    const { display, unit } = scalePressure(stressPa);
    valueEl.textContent = formatNumber(display, 4);
    unitOutEl.textContent = `${unit} · σ = F / A`;
    resultCard.hidden = false;

    addHistoryEntry("Stress", `F=${force} ${forceUnit}, A=${area} ${areaUnit}`, `${formatNumber(display, 4)} ${unit}`);
  });
}

function scalePressure(pa) {
  if (Math.abs(pa) >= 1e6) return { display: pa / 1e6, unit: "MPa" };
  if (Math.abs(pa) >= 1e3) return { display: pa / 1e3, unit: "kPa" };
  return { display: pa, unit: "Pa" };
}
