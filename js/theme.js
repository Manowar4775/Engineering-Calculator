// Dark/light mode toggle, persisted to localStorage and respecting system preference on first visit.

const STORAGE_KEY = "engcalc.theme";

export function initTheme() {
  const stored = safeGet();
  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  const theme = stored || (prefersLight ? "light" : "dark");
  document.body.setAttribute("data-theme", theme);

  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const current = document.body.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.body.setAttribute("data-theme", next);
      safeSet(next);
    });
  }
}

function safeGet() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeSet(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore
  }
}
