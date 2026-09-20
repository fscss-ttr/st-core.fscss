# st-core@v2 + Svelte

> **Compiled mode** for production. Svelte owns reactive data; st-core owns pure CSS chart geometry.

[st-core.fscss](https://github.com/fscss-ttr/st-core.fscss) · Requires **FSCSS ≥ 1.2.3** (CLI) to build CSS.

---

## Architecture

```text
Svelte component
      │
      ├── reactive data[]
      │
      └── style="--st-p1: …; --st-p2: …"
             │
             ▼
      compiled st-core CSS
             │
             ▼
       clip-path chart (no SVG / canvas / chart JS)
```

| Layer | Responsibility |
|--------|----------------|
| **FSCSS CLI** | Compile `@st-chart-fill` / `@st-chart-line` / points template → static CSS |
| **Svelte** | Reactive series → write `--st-pN` (and optional `--st-accent`) |
| **CSS** | Paint + `clip-path` transitions |

Do **not** ship `fscss` runtime in production only to expand static st-core defines. Compile once in the build; update variables at runtime.

Runtime CDN mode remains fine for prototypes and playgrounds.

---

## Folder layout

```text
integration/svelte/
├── README.md                 ← this guide
├── package.json              ← optional scripts
├── src/
│   ├── lib/
│   │   └── Chart.svelte      ← reusable chart
│   ├── styles/
│   │   ├── st-core.fscss     ← source (compile this)
│   │   └── st-core.css       ← generated (git-ignore or commit)
│   └── App.svelte            ← demo page
```

---

## 1. FSCSS source

`src/styles/st-core.fscss`:

```fscss
@import((*) from st-core@v2)

@st-root()

/* Compile-time length template — zeros are placeholders */
@arr chartData[0, 0, 0, 0, 0, 0, 0]

@st-chart-fill(.chart-fill, chartData)
@st-chart-line(.chart-line, chartData)

.chart {
  @st-chart-points(chartData)
  position: relative;
  width: 100%;
  height: 220px;
  background: var(--st-surface);
  border-radius: var(--st-radius-lg);
  overflow: hidden;
}

.chart-fill,
.chart-line {
  transition: clip-path 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

The array length at **compile time** fixes how many polygon stops exist. Svelte only replaces `--st-p1…N` values later.

---

## 2. Compile

```bash
npm install -g fscss@latest   # ≥ 1.2.3

fscss src/styles/st-core.fscss src/styles/st-core.css
```

Import CSS in the app (SvelteKit root layout, `main.js`, or component):

```js
import '../styles/st-core.css';
```

Optional `package.json` script:

```json
{
  "scripts": {
    "build:st-core": "fscss src/styles/st-core.fscss src/styles/st-core.css",
    "build": "npm run build:st-core && vite build"
  }
}
```

---

## 3. Reusable `Chart.svelte`

```svelte
<script>
  /** @type {number[]} values 0–100 (human scale; higher = taller) */
  export let data = [];
  export let height = '200px';
  export let color = '#9d7eff';

  $: cssVars = [
    ...data.map((value, index) => `--st-p${index + 1}: ${100 - value}%`),
    `--st-accent: ${color}`,
    `height: ${height}`
  ].join('; ');
</script>

<div class="chart" style={cssVars}>
  <div class="chart-fill"></div>
  <div class="chart-line"></div>
</div>
```

Svelte 5 runes variant (optional):

```svelte
<script>
  let { data = [], height = '200px', color = '#9d7eff' } = $props();
  let cssVars = $derived(
    [
      ...data.map((value, index) => `--st-p${index + 1}: ${100 - value}%`),
      `--st-accent: ${color}`,
      `height: ${height}`
    ].join('; ')
  );
</script>
```

Usage:

```svelte
<script>
  import Chart from './lib/Chart.svelte';
  let weeklyData = [45, 70, 30, 90, 60, 80, 50];
</script>

<Chart data={weeklyData} color="#4fffb0" height="250px" />
```

---

## 4. Demo `App.svelte`

```svelte
<script>
  import './styles/st-core.css';
  import Chart from './lib/Chart.svelte';

  let dataPoints = [30, 65, 40, 85, 55, 90, 70];

  function randomizeData() {
    dataPoints = Array.from({ length: 7 }, () => Math.floor(Math.random() * 80) + 10);
  }
</script>

<main class="container">
  <Chart data={dataPoints} height="220px" />
  <!-- Svelte 4: on:click | Svelte 5: onclick -->
  <button type="button" on:click={randomizeData}>Randomize</button>
</main>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
  }
  button {
    background: var(--st-accent);
    color: #fff;
    border: 0;
    padding: 10px 18px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
  }
</style>
```

---

## Fixed vs dynamic series length

| Mode | When | Compile template |
|------|------|------------------|
| **Fixed length** | Always N points (e.g. 7 days) | `@arr chartData[0,0,0,0,0,0,0]` matching N |
| **Bounded dynamic** | Length can vary up to max M | Compile M zeros; `data.slice(0, M)` in Svelte |

If Svelte switches from 5 to 8 points but CSS was compiled for 5, extra `--st-p6…` have no polygon stops. **Recompile** with a larger template, or always pass a fixed-length array (pad with zeros).

```js
const MAX = 20;
$: points = [...data.slice(0, MAX)];
while (points.length < MAX) points.push(0);
```

---

## Why not runtime in production?

| | Runtime CDN | Compiled CLI |
|--|-------------|--------------|
| Extra script | ~FSCSS runtime | None |
| When geometry expands | Every page load | Build time |
| Fits Svelte/Vite | Awkward | Native CSS import |
| Prototyping | Excellent | Optional |

Recommendation for docs:

> **Compiled mode is recommended for Svelte production.** Compile st-core during the build; use Svelte only to update `--st-pN`. Runtime mode is for prototypes and environments without the CLI.

---

## Related

- [st-core README](../../README.md)
- [EXPLAINED.md](../../EXPLAINED.md) — how fill/line loops work
- [FSCSS arrays](https://fscss.devtem.org/arrays) — `count`, derived arrays
- Same CSS-variable pattern works with **Vue**, **React**, or vanilla JS

MIT · st-core / FSCSS
