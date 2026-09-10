// Shared helpers used across calculators.

/** Format a number for display: trims float noise, uses scientific notation
 *  for very large or very small magnitudes. */
export function formatNumber(value, maxDecimals = 6) {
  if (!Number.isFinite(value)) return "Undefined";
  if (value === 0) return "0";

  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 1e-6 || abs >= 1e12)) {
    return value.toExponential(4).replace(/e\+?(-?)(\d+)/, "e$1$2");
  }

  const rounded = Number(value.toFixed(maxDecimals));
  return rounded.toLocaleString("en-US", { maximumFractionDigits: maxDecimals });
}

/** Parse a string to a finite number, or null if invalid/empty. */
export function toNumber(str) {
  if (str === null || str === undefined || String(str).trim() === "") return null;
  const n = Number(str);
  return Number.isFinite(n) ? n : null;
}

let toastTimer = null;
export function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

export function showError(el, message) {
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
}

export function hideError(el) {
  if (!el) return;
  el.hidden = true;
  el.textContent = "";
}

/** Copy text to the clipboard with a toast confirmation; falls back silently. */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard");
  } catch {
    showToast("Copy not available");
  }
}
