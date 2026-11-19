# FIGSHBudget template

Mobile-style **Home + Budget** double phone UI using:

---

**Preview:** https://hub.devtem.org/st-core.fscss/templates/budget-app/
[![Template Preview](/templates/budget-app/budget.jpg)](https://hub.devtem.org/st-core.fscss/templates/budget-app/)


| Module | Role |
|--------|------|
| **st-core@v2** | Tokens, phone shell helpers, area/line chart (`budgetData`) |
| **icon-mask** | Menu, search, nav, finance icons |

No Chart.js. Chart geometry is pure CSS (`clip-path` + `--st-pN`).

## Files

```text
budget-app/
├── index.html      # markup
├── budget.fscss    # source
├── budget.css      # CLI output (placeholder until compiled)
└── README.md
```

## Run 

```bash
npx serve .
# open index.html 
```

## Compile (production)

```bash
npm install -g fscss@1.2.6
fscss budget.fscss budget.css
```

In `index.html`, remove the runtime script and `type="text/fscss"` link; enable:

```html
<link rel="stylesheet" href="budget.css" />
```

## Chart data

Series is declared in FSCSS:

```fscss
@arr budgetData[42, 58, 35, 72, 48, 68, 55]
```

To live-update from JS (same contract as admin-dashboard):

```js
const el = document.getElementById('budgetChart');
el.style.cssText = values
  .map((v, i) => `--st-p${i + 1}: ${100 - v}%;`)
  .join(' ');
```

## Preview (hub)

https://hub.devtem.org/st-core.fscss/templates/budget-app/

## Requires

- FSCSS **1.2.3+** (1.2.4+ recommended)
- Published **st-core@v2** and **icon-mask** resolvable by your import path / CDN registry

## Related

- [admin-dashboard](../admin-dashboard/) - denser analytics shell
- [st-core.fscss](https://github.com/fscss-ttr/st-core.fscss)
- [icon-mask.fscss](https://github.com/fscss-ttr/icon-mask.fscss)
