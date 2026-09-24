# Admin dashboard template

[![Template Preview](preview.jpg)](https://hub.devtem.org/st-core.fscss/templates/admin-dashboard/)

HTML + FSCSS template built on:

| Module | Role |
|--------|------|
| [st-core@v2](https://github.com/fscss-ttr/st-core.fscss) | Tokens, revenue chart (`clip-path` + `--st-pN`) |
| [circle-progress](https://github.com/Figsh/Circle-progress.fscss) | Traffic multi-pie |
| [icon-mask](https://github.com/fscss-ttr/icon-mask.fscss) | Sidebar / toolbar icons |

Minimal page reset lives in `dashboard.fscss` (`* { box-sizing… }`). Responsive sidebar (off-canvas &lt; 1100px), swipe gestures, profile menu, chart range tabs.

---

## Files

```text
templates/admin-dashboard/
├── README.md
├── index.html          # markup + runtime or compiled CSS link
├── dashboard.fscss     # source styles + module imports
├── dashboard.css       # CLI output (generate this)
└── dashboard.js        # UI + --st-pN updates
```

---

## Quick preview (runtime)

Serve the folder (paths need a local server):

```bash
npx serve .
# open index.html — uses fscss@1.2.4 runtime + link type="text/fscss"
```

---

## Production (compiled CSS)

```bash
npm install -g fscss@1.2.4
fscss dashboard.fscss dashboard.css
```

In `index.html`, switch to:

```html
<link rel="stylesheet" href="dashboard.css">
```

JS only sets chart variables:

```js
--st-p1: 58%;  /* 100 - value */
```

Geometry stays in compiled CSS (same pattern as [integration/svelte](../../integration/svelte)).

**Note:** Chart polygon length is fixed at compile time from `@arr data7d` (7 points). Tabs for 30d/90d update `--st-pN` and labels; for true N-stop geometry per range, compile separate chart classes or a max-length template (see st-core docs).

---

## Stack roadmap

- **HTML** — this folder  
- **React / Next** — planned under `templates/admin-dashboard-react` (same FSCSS compile step, components map data → CSS variables)

---

## License

Same as st-core / FSCSS samples (MIT).
