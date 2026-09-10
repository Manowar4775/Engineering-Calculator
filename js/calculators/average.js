import { formatNumber, showError, hideError } from "../utils.js";
import { addHistoryEntry } from "../history.js";

export function initAverageCalculator() {
  const view = document.getElementById("view-average");
  if (!view) return;

  const form = document.getElementById("avgForm");
  const input = document.getElementById("avgInput");
  const errorEl = document.getElementById("avgError");
  const resultCard = document.getElementById("avgResult");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError(errorEl);
    resultCard.hidden = true;

    const raw = input.value.trim();
    if (!raw) return showError(errorEl, "Enter at least one number.");

    const parts = raw.split(/[,\s]+/).filter(Boolean);
    const numbers = [];
    for (const part of parts) {
      const n = Number(part);
      if (!Number.isFinite(n)) return showError(errorEl, `"${part}" isn't a valid number.`);
      numbers.push(n);
    }
    if (numbers.length === 0) return showError(errorEl, "Enter at least one number.");

    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / numbers.length;
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);

    document.getElementById("avgMean").textContent = formatNumber(mean, 4);
    document.getElementById("avgSum").textContent = formatNumber(sum, 4);
    document.getElementById("avgMin").textContent = formatNumber(min, 4);
    document.getElementById("avgMax").textContent = formatNumber(max, 4);
    document.getElementById("avgCount").textContent = String(numbers.length);
    resultCard.hidden = false;

    addHistoryEntry("Average", `${numbers.length} numbers`, `mean ${formatNumber(mean, 4)}`);
  });
}
