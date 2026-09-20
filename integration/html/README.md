# HTML integration

Browser samples for **st-core@v2** — no bundler required.

These demos load FSCSS source with:

```html
<link type="text/fscss" href="src/demo.fscss">
```

plus the FSCSS **runtime** (see each HTML file). The engine compiles linked `.fscss` in the page.

---

## Layout

```text
html/
└── demo/
    ├── js/
    │   └── demo.js           optional interactivity (--st-pN updates)
    ├── src/
    │   ├── demo.fscss
    │   ├── multi-chart.fscss
    │   ├── multi-chart-v2.fscss
    │   └── static_demo.fscss
    ├── multi-chart.html
    └── static_demo.html
```

Open any `.html` over a local server (or GitHub Pages) so `href` paths resolve.

---

## Samples

| File | Role |
|------|------|
| `static_demo.html` + `src/static_demo.fscss` | Single chart, mostly static |
| `multi-chart.html` + `src/multi-chart*.fscss` | Several series / charts |
| `js/demo.js` | Small script that writes CSS variables when you need live data |

Exact markup varies by file; pattern is always:

1. Runtime script (`fscss@1.2.3` or current)  
2. `<link type="text/fscss" href="src/….fscss">`  
3. Chart DOM: `.chart` → `.chart-fill` / `.chart-line` / …

---

## Production note

For real sites, prefer **CLI compile** to plain CSS and drop the runtime:

```bash
fscss src/static_demo.fscss static_demo.css
```

```html
<link rel="stylesheet" href="static_demo.css">
```

Use JS only to set `--st-p1`, `--st-p2`, … when data changes.  
Framework guides: [../svelte](../svelte/) · [../README.md](../README.md)

---

## Requirements

- FSCSS **≥ 1.2.3** (runtime or CLI)  
- st-core import inside the `.fscss` file, e.g. `@import((*) from st-core@v2)`

