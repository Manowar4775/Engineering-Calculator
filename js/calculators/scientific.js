import { evaluateExpression, ExprError } from "../exprEval.js";
import { formatNumber } from "../utils.js";
import { addHistoryEntry } from "../history.js";

const DISPLAY_SYMBOLS = { "*": "×", "/": "÷", "-": "−" };

// Function button -> [normal token, inverse token]. Prefix functions insert
// "name(" so the user (or auto-close) supplies the argument and ")".
const FN_PAIRS = {
  sin: ["sin", "asin"],
  cos: ["cos", "acos"],
  tan: ["tan", "atan"],
};

export function initScientificCalculator() {
  const view = document.getElementById("view-scientific");
  if (!view) return;

  const exprEl = document.getElementById("sciExpression");
  const resultEl = document.getElementById("sciResult");
  const fnKeys = document.getElementById("sciFnKeys");
  const keys = document.getElementById("sciKeys");
  const invBtn = document.getElementById("sciInv");
  const angleSwitch = view.querySelector("[data-angle-mode]")?.parentElement;

  let expr = "";
  let justEvaluated = false;
  let inv = false;
  let angleMode = "deg";

  function prettify(raw) {
    return raw.replace(/[*/\-]/g, (m) => DISPLAY_SYMBOLS[m] ?? m);
  }

  function autoClosed(raw) {
    const open = (raw.match(/\(/g) || []).length;
    const close = (raw.match(/\)/g) || []).length;
    return raw + ")".repeat(Math.max(0, open - close));
  }

  function render() {
    exprEl.textContent = prettify(expr);
    resultEl.classList.remove("is-error");
    if (expr === "") {
      resultEl.textContent = "0";
      return;
    }
    try {
      const value = evaluateExpression(autoClosed(expr), { angleMode });
      resultEl.textContent = formatNumber(value);
    } catch {
      resultEl.textContent = "…";
    }
  }

  function insert(text) {
    if (justEvaluated) { expr = ""; justEvaluated = false; }
    expr += text;
    render();
  }

  function press(key) {
    if (key === "AC") { expr = ""; justEvaluated = false; render(); return; }
    if (key === "DEL") { expr = expr.slice(0, -1); justEvaluated = false; render(); return; }
    if (key === "+/-") {
      const match = expr.match(/(-?\d*\.?\d+)$/);
      if (match) {
        const num = match[1];
        const toggled = num.startsWith("-") ? num.slice(1) : `-${num}`;
        expr = expr.slice(0, match.index) + toggled;
      } else {
        expr += "-";
      }
      render();
      return;
    }
    if (key === "=") { evaluate(); return; }

    if (justEvaluated) {
      if (!/^[+\-*/^]$/.test(key)) expr = "";
      justEvaluated = false;
    }
    expr += key;
    render();
  }

  function pressFn(fn) {
    if (justEvaluated) { expr = ""; justEvaluated = false; }
    switch (fn) {
      case "sin": case "cos": case "tan": {
        const [normal, inverse] = FN_PAIRS[fn];
        insert(`${inv ? inverse : normal}(`);
        return;
      }
      case "log": insert("log("); return;
      case "ln": insert("ln("); return;
      case "sq": insert("^2"); return;
      case "cube": insert("^3"); return;
      case "sqrt": insert("sqrt("); return;
      case "cbrt": insert("cbrt("); return;
      case "pow": insert("^"); return;
      case "recip": insert("^(-1)"); return;
      case "abs": insert("abs("); return;
      case "fact": insert("!"); return;
      case "exp": insert("exp("); return;
      case "pi": insert("pi"); return;
      case "e": insert("e"); return;
    }
  }

  function evaluate() {
    if (expr === "") return;
    const closed = autoClosed(expr);
    try {
      const value = evaluateExpression(closed, { angleMode });
      const formatted = formatNumber(value);
      addHistoryEntry("Scientific", prettify(closed), formatted);
      resultEl.classList.remove("is-error");
      resultEl.textContent = formatted;
      exprEl.textContent = `${prettify(closed)} =`;
      expr = String(value);
      justEvaluated = true;
    } catch (err) {
      resultEl.classList.add("is-error");
      resultEl.textContent = err instanceof ExprError ? err.message : "Invalid expression";
    }
  }

  keys.addEventListener("click", (e) => {
    const btn = e.target.closest(".key");
    if (!btn) return;
    press(btn.dataset.key);
  });

  fnKeys.addEventListener("click", (e) => {
    const btn = e.target.closest(".key");
    if (!btn) return;
    pressFn(btn.dataset.fn);
  });

  invBtn.addEventListener("click", () => {
    inv = !inv;
    invBtn.setAttribute("aria-pressed", String(inv));
  });

  angleSwitch?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-angle-mode]");
    if (!btn) return;
    angleMode = btn.dataset.angleMode;
    angleSwitch.querySelectorAll("[data-angle-mode]").forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", String(active));
    });
    render();
  });

  document.addEventListener("keydown", (e) => {
    if (view.hidden) return;
    if (document.activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;

    const map = {
      Enter: "=", "=": "=", Escape: "AC", Backspace: "DEL",
      "*": "*", "/": "/", "+": "+", "-": "-", ".": ".", "^": "^",
      "(": "(", ")": ")",
    };
    if (e.key in map) { e.preventDefault(); press(map[e.key]); }
    else if (/^[0-9]$/.test(e.key)) { press(e.key); }
  });

  render();
}
