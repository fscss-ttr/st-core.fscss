# Integrations

How to use **st-core@v2** with app frameworks and plain HTML.

st-core compiles to **normal CSS** (`clip-path`, custom properties). Frameworks only need to **set `--st-p1…N`** (and optional tokens like `--st-accent`) when data changes. No SVG, canvas, or chart JS library required.

| Path | Stack | Production mode |
|------|--------|------------------|
| [html/](./html/) | Static HTML + optional small JS | Runtime *or* CLI-compiled CSS |
| [svelte/](./svelte/) | Svelte / SvelteKit | **CLI compile** recommended |

---

## Shared idea

```text
Your UI layer (Svelte, Vue, React, vanilla…)
        │
        │  sets --st-p1, --st-p2, …  (and maybe --st-accent)
        ▼
CSS from st-core (compiled .css or runtime-expanded .fscss)
        │
        ▼
Chart paint (clip-path fill / line / dots)
```

- **FSCSS** builds geometry (array length at compile/expand time).  
- **Your stack** owns reactive or imperative data.  
- **CSS** animates when variables change (`transition: clip-path …`).

Series **length** must match the compiled template (or a documented max). See each folder’s README for fixed vs bounded-dynamic length.

---

## Official samples

### [html/](./html/)

Browser demos: runtime `fscss@1.2.3` + `@import((*) from st-core@v2)`, or a precompiled stylesheet. Good for docs, CodePen, and zero-bundler pages.

### [svelte/](./svelte/)

Production-oriented pattern:

1. `st-core.fscss` → `fscss` CLI → `st-core.css`  
2. Import CSS into the app  
3. `<Chart data={…} />` maps values to `--st-pN`  

Details: [svelte/README.md](./svelte/README.md)

---

## Contribute your stack

We only ship a few official folders. **Integrations for other tools are welcome** if you use st-core in production or teaching and want to share the pattern.

### What to add

1. Create `integration/<name>/` (e.g. `react`, `vue`, `solid`, `astro`, `vanilla-ts`).
2. Include:
   - **README.md** — setup, compile vs runtime, length limits, copy-paste minimal example  
   - **Sample source** — smallest app or component that draws a chart from an array  
   - Optional `package.json` scripts (`build:st-core`, etc.)
3. Open a PR against [st-core.fscss](https://github.com/fscss-ttr/st-core.fscss) and link the new folder from this file’s table.

### Guidelines

- Prefer **compiled CSS** for bundled apps (Vite, webpack, SvelteKit, Next, etc.).  
- Prefer **runtime** only for playgrounds and docs that intentionally load the FSCSS engine.  
- Document how you map `data[]` → `--st-p${i}` (including `100 - value` for Y).  
- Call out **fixed N** vs **max N** polygon templates.  
- Keep samples dependency-light and MIT-compatible.  
- Don’t vendor the whole st-core source unless needed; `@import((*) from st-core@v2)` or a built CSS file is enough.

### Ideas we don’t have yet

Vue 3 / Nuxt · React / Next · Solid · Astro · Angular · Lit · Qwik · plain TypeScript + Vite  

If your stack isn’t listed, a minimal folder + README is a great contribution.

---

## See also

- [Main README](../README.md)  
- [EXPLAINED.md](../EXPLAINED.md) — fill/line/`num` internals  
- [FSCSS arrays](https://fscss.devtem.org/arrays) · [num()](https://fscss.devtem.org/docs#num)

MIT · fscss-ttr
