# Engineering Calculator

_Calculate. Convert. Understand._

An all-in-one engineering and scientific calculator built as a static
frontend app — no build step, no backend, no external APIs. Everything
runs in the browser and calculation history is kept in `localStorage`.

**[Live demo →](#)** _(add your deployed URL here)_

## What's inside

| Tool | Path |
|---|---|
| 🧮 Basic calculator | `#basic` |
| 🧍 BMI calculator (metric & imperial) | `#bmi` |
| ⚙️ Stress calculator (σ = F/A) | `#stress` |
| 📏 Strain calculator (ε = ΔL/L₀) | `#strain` |
| 🔬 Scientific calculator (trig, logs, powers) | `#scientific` |
| 🔄 Unit converter (7 categories) | `#converter` |
| 📊 Percentage calculator (4 modes) | `#percentage` |
| 📈 Average calculator (mean/sum/min/max) | `#average` |
| ≡ Calculation history | `#history` |

## Project structure

```
engineering-calculator/
├── index.html              # Single-page shell, one <section> per calculator
├── css/
│   └── style.css           # Design tokens, layout, components, dark/light themes
├── js/
│   ├── main.js              # App entry point — boots every module
│   ├── nav.js                # Hash-based view switching + mobile nav
│   ├── theme.js               # Dark/light mode toggle (persisted)
│   ├── history.js              # Shared calculation history (localStorage)
│   ├── utils.js                 # Number formatting, error/toast helpers
│   ├── exprEval.js               # Safe expression parser (no eval())
│   └── calculators/
│       ├── basic.js               # Standard arithmetic keypad
│       ├── scientific.js          # Trig / log / power functions
│       ├── bmi.js                 # BMI calculator
│       ├── stress.js              # Mechanical stress calculator
│       ├── strain.js              # Strain calculator
│       ├── converter.js           # Unit converter
│       ├── percentage.js          # Percentage calculator
│       └── average.js             # Average / mean calculator
└── README.md
```

Everything is loaded as native ES modules (`<script type="module">`), so
there's nothing to compile or bundle.

## Running locally

Because the app uses ES modules, open it through a local server rather than
a `file://` URL (browsers block module imports over `file://`):

```bash
# Option 1: Python
python3 -m http.server 8080

# Option 2: Node
npx serve .

# Option 3: VS Code
# Right-click index.html → "Open with Live Server"
```

Then visit `http://localhost:8080`.

## Deploying

### GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repo, go to **Settings → Pages**.
3. Under **Source**, choose the branch (e.g. `main`) and root folder (`/`).
4. Save — your site will be live at `https://<username>.github.io/<repo>/`.

### Netlify

1. Drag and drop this folder onto [app.netlify.com/drop](https://app.netlify.com/drop),
   **or** connect the GitHub repo.
2. Build command: _(leave blank)_. Publish directory: `.` (project root).
3. Deploy.

### Vercel

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Other**. Build command: _(leave blank)_. Output
   directory: `.`.
3. Deploy.

No environment variables or API keys are required for any of the above —
the app is entirely static.

## Notes on the implementation

- **No `eval()`.** The basic and scientific calculators use a small
  hand-written recursive-descent parser (`js/exprEval.js`) instead of
  evaluating strings as JavaScript.
- **`%` is a postfix "divide by 100" operator** (e.g. `50%` → `0.5`,
  `25+10%` → `25.1`), applied to the number immediately before it.
- **History** is shared across every calculator and stored under a single
  `localStorage` key; clearing it removes all entries.
- **Errors are handled inline** — division by zero, empty/invalid inputs,
  zero or negative BMI height/weight, zero area or original length, and
  invalid characters in an expression all produce a message instead of a
  broken UI.

## Version

v1.0.0
