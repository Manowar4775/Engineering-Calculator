import { toNumber, formatNumber, showError, hideError } from "../utils.js";
import { addHistoryEntry } from "../history.js";

export function initStrainCalculator() {
  const view = document.getElementById("view-strain");
  if (!view) return;

  const form = document.getElementById("strainForm");
  const modeSwitch = view.querySelector(".unit-switch");
  const errorEl = document.getElementById("strainError");
  const resultCard = document.getElementById("strainResult");
  const valueEl = document.getElementById("strainValue");
  const percentEl = document.getElementById("strainPercent");
  const typeEl = document.getElementById("strainType");
  const deltaOutEl = document.getElementById("strainDeltaOut");

  let mode = "final";

  modeSwitch.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-strain-mode]");
    if (!btn) return;
    mode = btn.dataset.strainMode;
    modeSwitch.querySelectorAll("[data-strain-mode]").forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", String(active));
    });
    view.querySelectorAll("[data-strain-group]").forEach((group) => {
      group.hidden = group.dataset.strainGroup !== mode;
    });
    resultCard.hidden = true;
    hideError(errorEl);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError(errorEl);
    resultCard.hidden = true;

    const l0 = toNumber(document.getElementById("strainL0").value);
    if (l0 === null) return showError(errorEl, "Enter the original length.");
    if (l0 <= 0) return showError(errorEl, "Original length must be greater than zero.");

    let delta;
    if (mode === "final") {
      const l1 = toNumber(document.getElementById("strainL1").value);
      if (l1 === null) return showError(errorEl, "Enter the final length.");
      if (l1 < 0) return showError(errorEl, "Final length cannot be negative.");
      delta = l1 - l0;
    } else {
      const d = toNumber(document.getElementById("strainDelta").value);
      if (d === null) return showError(errorEl, "Enter the change in length.");
      delta = d;
    }

    const strain = delta / l0;
    const type = strain > 0 ? "Tensile (stretching)" : strain < 0 ? "Compressive (shortening)" : "No deformation";

    valueEl.textContent = formatNumber(strain, 6);
    percentEl.textContent = `${formatNumber(strain * 100, 4)} % strain`;
    typeEl.textContent = type;
    deltaOutEl.textContent = `ΔL = ${formatNumber(delta, 4)}`;
    resultCard.hidden = false;

    addHistoryEntry("Strain", `L0=${l0}, ΔL=${formatNumber(delta, 4)}`, formatNumber(strain, 6));
  });
}
