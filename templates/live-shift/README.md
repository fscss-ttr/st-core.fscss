# Live Shift · Trading dashboard

Phone-shell portfolio UI with **st-core@v2** pure-CSS chart (fill + line), stat cards, allocation bars, and a small JS loop that random-walks series values into `--st-pN`.

## Preview

Compile FSCSS, then open `index.html`:

```bash
npx fscss@1.2.5 dashboard.fscss dashboard.css
```

Hub preview: [https://hub.devtem.org/st-core.fscss/templates/live-shift/](https://hub.devtem.org/st-core.fscss/templates/live-shift/)

[![Template Preview](/templates/live-shift/live-shift.jpg)](https://hub.devtem.org/st-core.fscss/templates/live-shift/)

## Files

| File | Role |
|------|------|
| `index.html` | Markup + `dashboard.css` + `dashboard.js` |
| `dashboard.fscss` | Source (st-core@v2 + layout) |
| `dashboard.css` | Compiled output (or interim placeholder) |
| `dashboard.js` | Live series / P&amp;L / allocation updates |

## Runtime alternative

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.2.5/runtime.min.js" defer></script>
<style>
  /* paste dashboard.fscss */
</style>
```

## Notes

- Chart point count is **8** — keep `@arr priceData[...]` and `POINTS` / initial `series` in `dashboard.js` aligned.
- JS only sets CSS variables (`--st-p1`…`--st-p8`, `--st-cat-bar-fill-range`); geometry stays in CSS from st-core.

## Stack

- [st-core@v2](https://github.com/fscss-ttr/st-core.fscss)
- [FSCSS](https://www.npmjs.com/package/fscss)
