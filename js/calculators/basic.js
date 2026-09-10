import { evaluateExpression, ExprError } from "../exprEval.js";
import { formatNumber } from "../utils.js";
import { addHistoryEntry } from "../history.js";

const DISPLAY_SYMBOLS = { "*": "×", "/": "÷", "-": "−" };

export function initBasicCalculator() {
  const view = document.getElementById("view-basic");
  if (!view) return;

  const exprEl = document.getElementById("basicExpression");
  const resultEl = document.getElementById("basicResult");
  const keys = document.getElementById("basicKeys");

  let expr = "";
  let justEvaluated = false;

  function render() {
    exprEl.textContent = prettify(expr);
    resultEl.classList.remove("is-error");
    if (expr === "") {
      resultEl.textContent = "0";
      return;
    }
    try {
      const value = evaluateExpression(expr);
      resultEl.textContent = formatNumber(value);
    } catch {
      resultEl.textContent = "…";
    }
  }

  function prettify(raw) {
    return raw.replace(/[*/\-]/g, (m) => DISPLAY_SYMBOLS[m] ?? m);
  }

  function press(key) {
    if (key === "AC") {
      expr = "";
      justEvaluated = false;
      render();
      return;
    }
    if (key === "DEL") {
      expr = expr.slice(0, -1);
      justEvaluated = false;
      render();
      return;
    }
    if (key === "+/-") {
      // Toggle sign of the trailing number.
      const match = expr.match(/(-?\d*\.?\d+)$/);
      if (match) {
        const num = match[1];
        const toggled = num.startsWith("-") ? num.slice(1) : `-${num}`;
        expr = expr.slice(0, match.index) + toggled;
      } else if (expr === "" || /[+\-*/(]$/.test(expr)) {
        expr += "-";
      }
      render();
      return;
    }
    if (key === "=") {
      evaluate();
      return;
    }

    if (justEvaluated) {
      // Starting a fresh expression after "=", unless continuing with an operator.
      if (/^[+\-*/%]$/.test(key)) {
        // continue from previous result
      } else {
        expr = "";
      }
      justEvaluated = false;
    }
    expr += key;
    render();
  }

  function evaluate() {
    if (expr === "") return;
    try {
      const value = evaluateExpression(expr);
      const formatted = formatNumber(value);
      addHistoryEntry("Basic", prettify(expr), formatted);
      resultEl.classList.remove("is-error");
      resultEl.textContent = formatted;
      exprEl.textContent = `${prettify(expr)} =`;
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

  document.addEventListener("keydown", (e) => {
    if (view.hidden) return;
    if (document.activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;

    const map = {
      Enter: "=", "=": "=", Escape: "AC", Backspace: "DEL",
      "*": "*", "/": "/", "+": "+", "-": "-", ".": ".", "%": "%",
      "(": "(", ")": ")",
    };
    if (e.key in map) {
      e.preventDefault();
      press(map[e.key]);
    } else if (/^[0-9]$/.test(e.key)) {
      press(e.key);
    }
  });

  render();
}
