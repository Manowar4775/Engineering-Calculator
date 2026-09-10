import { toNumber, formatNumber, showError, hideError } from "../utils.js";
import { addHistoryEntry } from "../history.js";

export function initPercentageCalculator() {
  const view = document.getElementById("view-percentage");
  if (!view) return;

  const modeSwitch = view.querySelector(".unit-switch");
  const form = document.getElementById("pctForm");
  const errorEl = document.getElementById("pctError");
  const resultCard = document.getElementById("pctResult");
  const labelEl = document.getElementById("pctLabel");
  const valueEl = document.getElementById("pctValue");

  let mode = "of";

  modeSwitch.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-pct-mode]");
    if (!btn) return;
    mode = btn.dataset.pctMode;
    modeSwitch.querySelectorAll("[data-pct-mode]").forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", String(active));
    });
    view.querySelectorAll("[data-pct-group]").forEach((group) => {
      group.hidden = group.dataset.pctGroup !== mode;
    });
    resultCard.hidden = true;
    hideError(errorEl);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError(errorEl);
    resultCard.hidden = true;

    if (mode === "of") {
      const x = toNumber(document.getElementById("pctOfX").value);
      const y = toNumber(document.getElementById("pctOfY").value);
      if (x === null || y === null) return showError(errorEl, "Enter both values.");
      const result = (x / 100) * y;
      show(`${formatNumber(x)}% of ${formatNumber(y)}`, result, `${x}% of ${y}`, formatNumber(result));
      return;
    }

    if (mode === "increase" || mode === "decrease") {
      const fromId = mode === "increase" ? "pctIncFrom" : "pctDecFrom";
      const toId = mode === "increase" ? "pctIncTo" : "pctDecTo";
      const from = toNumber(document.getElementById(fromId).value);
      const to = toNumber(document.getElementById(toId).value);
      if (from === null || to === null) return showError(errorEl, "Enter both values.");
      if (from === 0) return showError(errorEl, "Original value cannot be zero.");
      const change = ((to - from) / Math.abs(from)) * 100;
      const label = mode === "increase" ? "Percentage increase" : "Percentage decrease";
      show(label, change, `${from} → ${to}`, `${change >= 0 ? "+" : ""}${formatNumber(change, 3)}%`);
      return;
    }

    if (mode === "difference") {
      const a = toNumber(document.getElementById("pctDiffA").value);
      const b = toNumber(document.getElementById("pctDiffB").value);
      if (a === null || b === null) return showError(errorEl, "Enter both values.");
      if (a === 0 && b === 0) return showError(errorEl, "Both values cannot be zero.");
      const diff = (Math.abs(a - b) / ((Math.abs(a) + Math.abs(b)) / 2)) * 100;
      show("Percentage difference", diff, `${a} vs ${b}`, `${formatNumber(diff, 3)}%`);
    }
  });

  function show(label, rawValue, exprLabel, formatted) {
    labelEl.textContent = label;
    valueEl.textContent = typeof formatted === "string" && formatted.includes("%") ? formatted : `${formatNumber(rawValue)}`;
    resultCard.hidden = false;
    addHistoryEntry("Percentage", exprLabel, formatted);
  }
}
