import { initTheme } from "./theme.js";
import { initNav } from "./nav.js";
import { initHistoryPanel } from "./history.js";
import { initBasicCalculator } from "./calculators/basic.js";
import { initScientificCalculator } from "./calculators/scientific.js";
import { initBmiCalculator } from "./calculators/bmi.js";
import { initStressCalculator } from "./calculators/stress.js";
import { initStrainCalculator } from "./calculators/strain.js";
import { initConverter } from "./calculators/converter.js";
import { initPercentageCalculator } from "./calculators/percentage.js";
import { initAverageCalculator } from "./calculators/average.js";

function boot() {
  initTheme();
  initNav();
  initHistoryPanel();

  initBasicCalculator();
  initScientificCalculator();
  initBmiCalculator();
  initStressCalculator();
  initStrainCalculator();
  initConverter();
  initPercentageCalculator();
  initAverageCalculator();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
