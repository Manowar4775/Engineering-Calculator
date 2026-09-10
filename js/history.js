// Calculation history: persisted to localStorage, shared by every calculator.

const STORAGE_KEY = "engcalc.history.v1";
const MAX_ENTRIES = 200;

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — fail silently,
    // the app still works without persistence.
  }
}

/** Add a calculation to history. `source` labels which calculator produced it. */
export function addHistoryEntry(source, expression, result) {
  const entries = readAll();
  entries.unshift({
    source,
    expression,
    result,
    time: Date.now(),
  });
  if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES;
  writeAll(entries);
  renderHistory();
}

export function clearHistory() {
  writeAll([]);
  renderHistory();
}

function relativeTime(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export function renderHistory() {
  const list = document.getElementById("historyList");
  const count = document.getElementById("historyCount");
  if (!list) return;

  const entries = readAll();
  if (count) count.textContent = `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;

  if (entries.length === 0) {
    list.innerHTML = `<li class="history-empty">No calculations yet. Results will appear here as you work.</li>`;
    return;
  }

  list.innerHTML = entries
    .map((e) => {
      const expr = escapeHtml(e.expression);
      const res = escapeHtml(String(e.result));
      const src = escapeHtml(e.source);
      return `<li>
        <span><span class="history-expr">${expr} =</span> <span class="history-eq">${res}</span></span>
        <span class="history-meta">${src} · ${relativeTime(e.time)}</span>
      </li>`;
    })
    .join("");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

export function initHistoryPanel() {
  const clearBtn = document.getElementById("historyClear");
  if (clearBtn) clearBtn.addEventListener("click", clearHistory);
  renderHistory();
}
