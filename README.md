<meta
  name="description"
  content="Lightweight data visualizations with st-core.fscss — pure CSS area, line, and spider/radar charts. No SVG, no canvas."
/>
<meta
  name="keywords"
  content="st-core v2, st-core.fscss, CSS charts, pure CSS charts, spider chart, radar chart, FSCSS, data visualization"
/>

# st-core.fscss

> Pure CSS statistical dashboard components for the FSCSS ecosystem.
> No JavaScript dependencies. No SVG. No canvas — just pure CSS array processing.
>
> **Area · Line · Spider / Radar**

**MIT Licensed** · [github.com/fscss-ttr/st-core.fscss](https://github.com/fscss-ttr/st-core.fscss)  
Requires FSCSS **v1.2.3+**

**[SOURCE CODE EXPLANATION](https://github.com/fscss-ttr/st-core.fscss/blob/main/EXPLAINED.md)** · **[TEMPLATES](https://github.com/fscss-ttr/st-core.fscss/blob/main/templates/)**

---

**Playground:**

**[Try visually via st-core@v2 free Visual chart Builder](https://hub.devtem.org/st-core.fscss/visual-builder/)**

[![Visual builder](/visual-builder.jpg)](https://hub.devtem.org/st-core.fscss/visual-builder/)

---

## Table of Contents

1. [What is st-core v2?](#1-what-is-st-core-v2)
2. [What's New in v2?](#2-whats-new-in-v2)
3. [How It Works](#3-how-it-works)
4. [Installation](#4-installation)
   - [CDN / Runtime Mode](#cdn--runtime-mode)
   - [CLI / Compiled Mode](#cli--compiled-mode)
5. [Design Tokens — `@st-root`](#5-design-tokens--st-root)
6. [Layout Helpers](#6-layout-helpers)
7. [Linear Chart System](#7-linear-chart-system)
8. [Spider / Radar Chart System](#8-spider--radar-chart-system)
   - [`@st-spider-points`](#st-spider-points)
   - [`@st-spider-fill`](#st-spider-fill)
   - [`@st-spider-line`](#st-spider-line)
   - [`@st-spider-dots`](#st-spider-dots)
   - [`@st-spider-grid`](#st-spider-grid)
   - [`@st-spider-spokes` / `@st-spider-spokes-n`](#st-spider-spokes--st-spider-spokes-n)
   - [Axis labels](#axis-labels)
   - [Multi-series radar](#multi-series-radar)
   - [JS updates for spider](#js-updates-for-spider)
9. [JS Control Layer (linear)](#9-js-control-layer-linear)
10. [UI Components](#10-ui-components)
11. [Full Examples](#11-full-examples)
    - [Minimal linear chart](#minimal-linear-chart)
    - [Multi-line & multi-area chart (with opacity)](#multi-line--multi-area-chart-with-opacity)
    - [Dynamic JS interactive chart](#dynamic-js-interactive-chart)
    - [Full mobile dashboard frame](#full-mobile-dashboard-frame)
    - [Minimal spider chart](#minimal-spider-chart)
    - [Two teams + axis labels](#two-teams--axis-labels)
    - [Multi-series radar](#multi-series-radar-example)
12. [Design Token Reference](#12-design-token-reference)
13. [Performance & SEO](#13-performance--seo)
14. [Integrations](#14-integrations)

---

## 1. What is st-core v2?

**st-core.fscss** is a CSS visualization system built on top of FSCSS. It builds responsive charts and statistical dashboards using standard CSS custom properties and dynamic `clip-path: polygon()` generation.

Supported chart families:

| Family | Coordinates | Typical use |
|--------|-------------|-------------|
| **Linear** (area / line) | Cartesian X/Y (`--st-pN`) | Time series, revenue, trends |
| **Spider / radar** | Polar (`--st-sxN` / `--st-syN`) | Skills, multi-axis comparison |

---

## 2. What's New in v2?

In **v1**, charts were locked to 8 fixed points (`--st-p1` … `--st-p8`).

**In v2:**

- **Dynamic datasets (`@arr`)** — any length (5, 12, 50+ points)
- **Automatic X-spacing** — even distribution from `array.length`
- **In-line normalization** — `num(100 - value)%` for natural 0–100 scores
- **Dual-edge polyline strokes** — closed top/bottom polygon for line width
- **Spider / radar charts** — polar polygons, dynamic spokes, multi-series, axis labels

---

## 3. How It Works

### Linear charts

```css
@arr myData[50, 10, 97, 35, 66, 50, 80, 54]

@st-chart-fill(.chart-fill, myData)
@st-chart-line(.chart-line, myData)

.chart {
  @st-chart-points(myData)   /* writes --st-p1 … --st-pN */
  position: relative;
  height: 200px;
}
```

### Spider / radar charts

```css
@arr skills[80, 65, 90, 55, 70, 85]

@st-spider-fill(.spider-fill, skills)
@st-spider-line(.spider-line, skills)
@st-spider-dots(.spider-dot-, skills, 9px)
@st-spider-grid(.spider-grid)
@st-spider-spokes(.spider-spokes, skills)   /* or @st-spider-spokes-n(.spokes, 6) */

.spider {
  @st-spider-points(skills, 42)   /* writes --st-sxN / --st-syN */
  position: relative;
  width: 280px;
  height: 280px;
  border-radius: 50%;
}
```

**Rule of thumb:** renderers (`fill` / `line` / `dots`) only need the array for *length*. Coordinate values are written by `@st-chart-points` or `@st-spider-points` on the **host element**. Children inherit those custom properties.

---

## 4. Installation

### CDN / Runtime Mode

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.2.5/runtime.min.js" async></script>
```

```css
@import((*) from st-core@v2)
```

Or from this repo via jsDelivr:

```css
@import((*) from "https://cdn.jsdelivr.net/gh/fscss-ttr/st-core.fscss@main/st-core@v2.fscss")
```

Or a local path:

```css
@import((*) from "/st-core@v2.fscss")
```

### CLI / Compiled Mode

```bash
npm install -g fscss@latest
fscss input.fscss output.css
```

---

## 5. Design Tokens — `@st-root`

```css
@st-root()                 /* :root */
@st-root(root.my-scope)    /* scoped theme */
@st-spider-root()          /* optional spider token defaults */
```

Spider-related tokens (also included in `@st-root` when using the full module):

| Token | Default | Role |
|-------|---------|------|
| `--st-spider-fill-opacity` | `35%` | Fill transparency in `color-mix` |
| `--st-spider-stroke-scale` | `0.97` | Inner edge of dual-pass stroke |

Override per series:

```css
.series-a {
  --st-accent: #ff9f43;
  --st-spider-fill-opacity: 22%;
}
```

---

## 6. Layout Helpers

### `@st-container`

```css
@st-container(body)
```

### `@st-phone`

```css
@st-phone(.wrapper)
```

---

## 7. Linear Chart System

### `@st-chart-points`

Writes inverted Y values onto the host:

```css
.chart {
  @st-chart-points(myData)
}
```

### `@st-chart-fill` / `@st-chart-line`

```css
@st-chart-fill(.chart-fill, myData)
@st-chart-line(.chart-line, myData)
```

### `@st-chart-line-width`

```css
.chart-line {
  @st-chart-line-width(2.5px);
}
```

### `@st-chart-dot` / `@st-chart-dots`

```css
@st-chart-dot(.chart-dot, 70, 60, 12px)
@st-chart-dots(.dot-, myData, 8px)   /* → .dot-1 … .dot-N */
```

### `@st-chart-grid` / axes

```css
@st-chart-grid(.chart-grid, 10, 7)
@st-chart-axis-x(.x-axis)
@st-chart-axis-y(.y-axis)
```

---

## 8. Spider / Radar Chart System

Polar charts map each value to a vertex on a circle. Angle `0°` is at the **top**. Radius is a percentage of the box (`rmax`, default `42`).

### `@st-spider-points`

**Must** be called on the host that owns the series:

```css
.spider {
  @st-spider-points(skills, 42)   /* array, max radius % */
  position: relative;
  width: 280px;
  height: 280px;
  border-radius: 50%;
}
```

Writes:

```css
--st-sx1: calc(50% + (r * 1%) * sin(0deg));
--st-sy1: calc(50% - (r * 1%) * cos(0deg));
/* … one pair per data point */
```

### `@st-spider-fill`

Closed polar polygon filled with `color-mix` of `--st-accent`:

```css
@st-spider-fill(.spider-fill, skills)
```

### `@st-spider-line`

Dual-pass stroke (outer path + inner path scaled by `--st-spider-stroke-scale`):

```css
@st-spider-line(.spider-line, skills)
```

### `@st-spider-dots`

Generates `.spider-dot-1` … `.spider-dot-N`. **Add matching elements in HTML.**

```css
@st-spider-dots(.spider-dot-, skills, 9px)
```

```html
<div class="spider-dot-1"></div>
<!-- … one per point -->
```

### `@st-spider-grid`

Concentric rings via radial gradient:

```css
@st-spider-grid(.spider-grid)
```

### `@st-spider-spokes` / `@st-spider-spokes-n`

Thin radial axis lines. Prefer matching the data array so spoke count = vertex count:

```css
@st-spider-spokes(.spider-spokes, skills)   /* from array length */
@st-spider-spokes-n(.spider-spokes, 6)      /* explicit count */
```

### Axis labels

Labels are plain absolutely positioned elements around the host. Example for 6 axes:

```html
<div class="spider-wrap">
  <!-- grid, spokes, fill, line, dots -->
  <span class="spider-label speed">Speed</span>
  <span class="spider-label quality">Quality</span>
  <span class="spider-label ux">UX</span>
  <span class="spider-label scale">Scale</span>
  <span class="spider-label cost">Cost</span>
  <span class="spider-label support">Support</span>
</div>
```

```css
.spider-label {
  position: absolute;
  font-size: 0.7rem;
  color: var(--st-muted);
  white-space: nowrap;
  pointer-events: none;
  z-index: 3;
}
.spider-label.speed   { top: -18px; left: 50%; transform: translateX(-50%); }
.spider-label.quality { top: 14%; right: -36px; }
.spider-label.ux      { bottom: 14%; right: -28px; }
.spider-label.scale   { bottom: -18px; left: 50%; transform: translateX(-50%); }
.spider-label.cost    { bottom: 14%; left: -28px; }
.spider-label.support { top: 14%; left: -42px; }
```

For other axis counts, place labels at angles `(i - 1) * 360 / N` (0° = top).

### Multi-series radar

Each series is a **separate host** with its own `@st-spider-points` so coordinates never clash. See the [full multi-series example](#multi-series-radar-example) below.

### JS updates for spider

Polar positions are CSS `calc()` with `sin` / `cos`. To animate data at runtime, set `--st-sxN` / `--st-syN`:

```js
function polarVars(values, rmax = 42) {
  const n = values.length;
  return values.map((v, i) => {
    const ang = (i * 360) / n;
    const r = (v / 100) * rmax;
    return (
      `--st-sx${i + 1}: calc(50% + (${r} * 1%) * sin(${ang} * 1deg));` +
      `--st-sy${i + 1}: calc(50% - (${r} * 1%) * cos(${ang} * 1deg));`
    );
  }).join(' ');
}

const host = document.querySelector('.spider');
host.style.cssText = polarVars([80, 65, 90, 55, 70, 85]);
```

Polygon length (number of vertices) is fixed at compile time from the `@arr` length. Changing *length* at runtime requires a matching compiled renderer or a max-length template (same constraint as linear charts).

---

## 9. JS Control Layer (linear)

```js
const normalize = (n) => (100 - n) + '%';

function updatePoints(el, pointsArray) {
  el.style.cssText = pointsArray
    .map((v, i) => `--st-p${i + 1}: ${normalize(v)};`)
    .join(' ');
}

updatePoints(document.querySelector('.chart'), [50, 20, 85, 40, 95]);
```

---

## 10. UI Components

### `@st-stat-card`

```css
@st-stat-card(.stat-card)
```

```html
<div class="stat-card">
  <div class="st-stat-label">TOTAL EXPENSES</div>
  <div class="st-stat-value">$1,326.03</div>
  <div class="st-stat-delta up">+5.1% vs last week</div>
</div>
```

### `@st-cat-bar-fill`

```css
@st-cat-bar-fill(.bar-fill, 75)
```

```html
<div class="bar-track" style="height:8px;background:var(--st-surface);border-radius:999px;overflow:hidden">
  <div class="bar-fill"></div>
</div>
```

---

## 11. Full Examples

### Minimal linear chart

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.2.5/runtime.min.js" async></script>
<style>
@import((*) from st-core@v2)
@st-root()

@arr myData[20, 45, 28, 80, 65, 90, 40]

@st-chart-fill(.chart-fill, myData)
@st-chart-line(.chart-line, myData)

.chart {
  @st-chart-points(myData)
  position: relative;
  height: 200px;
  width: 100%;
  max-width: 400px;
  background: var(--st-surface);
  border-radius: 16px;
}
</style>

<div class="chart">
  <div class="chart-fill"></div>
  <div class="chart-line"></div>
</div>
```

### Multi-line & multi-area chart (with opacity)

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.2.5/runtime.min.js" async></script>
<style>
@import((*) from st-core@v2)
@st-root()

@arr seriesA[30, 50, 75, 40, 85, 60]
@arr seriesB[10, 25, 45, 20, 55, 30]

@st-chart-fill(.fill-a, seriesA)
@st-chart-line(.line-a, seriesA)
@st-chart-fill(.fill-b, seriesB)
@st-chart-line(.line-b, seriesB)

.chart {
  position: relative;
  height: 220px;
  width: 100%;
  background: var(--st-bg);
}

/* Each series owns its own points scope */
.fill-a {
  @st-chart-points(seriesA)
  opacity: 0.6;
  --st-accent: #9d7eff;
}
.line-a {
  @st-chart-points(seriesA)
  --st-accent: #9d7eff;
}

.fill-b {
  @st-chart-points(seriesB)
  opacity: 0.3;
  --st-accent: #4fffb0;
}
.line-b {
  @st-chart-points(seriesB)
  --st-accent: #4fffb0;
}
</style>

<div class="chart">
  <div class="chart-fill fill-a"></div>
  <div class="chart-line line-a"></div>
  <div class="chart-fill fill-b"></div>
  <div class="chart-line line-b"></div>
</div>
```

### Dynamic JS interactive chart

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/fscss@1.2.5/runtime.min.js" async></script>
  <style>
    @import((*) from st-core@v2)
    @st-root()

    @arr chartData[40, 60, 20, 80, 50]

    @st-chart-fill(.chart-fill, chartData)
    @st-chart-line(.chart-line, chartData)

    .chart {
      @st-chart-points(chartData)
      position: relative;
      height: 200px;
      width: 350px;
      background: var(--st-surface);
      border-radius: 12px;
    }

    .chart-fill, .chart-line {
      transition: clip-path 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
  </style>
</head>
<body>
  <div class="chart">
    <div class="chart-fill"></div>
    <div class="chart-line"></div>
  </div>
  <button id="randomize">Randomize Data</button>

  <script>
    const fill = document.querySelector('.chart-fill');
    const line = document.querySelector('.chart-line');

    document.getElementById('randomize').addEventListener('click', () => {
      const randomPoints = Array.from({ length: 5 }, () => Math.floor(Math.random() * 80) + 10);
      const styleVars = randomPoints.map((v, i) => `--st-p${i + 1}: ${100 - v}%;`).join(' ');
      fill.style.cssText = styleVars;
      line.style.cssText = styleVars;
    });
  </script>
</body>
</html>
```

### Full mobile dashboard frame

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.jsdelivr.net/npm/fscss@1.2.5/runtime.min.js" async></script>
  <style>
    @import((*) from st-core@v2)

    @st-root()
    @st-container(body)
    @st-phone(.wrapper)

    .wrapper {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 24px;
    }

    @arr myData[56, 67, 70, 43, 67, 80]

    @st-chart-fill(.chart-fill, myData)
    @st-chart-line(.chart-line, myData)
    @st-chart-dot(.chart-dot, 70, 60)
    @st-stat-card(.stat-card)
    @st-chart-axis-x(.x-axis)
    @st-chart-axis-y(.y-axis)
    @st-chart-grid(.chart-grid, 10, 7)

    .chart {
      width: 100%;
      height: 200px;
      border-radius: 20px;
      position: relative;
      overflow: hidden;
      background: var(--st-surface);
      @st-chart-points(myData)
    }

    .chart-fill, .chart-line {
      transition: clip-path 0.8s ease-in-out;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="stat-card">
      <div class="st-stat-label">TOTAL EXPENSES</div>
      <div class="st-stat-value">$1,326.03</div>
      <div class="st-stat-delta up">+5.1% vs last week</div>
    </div>

    <div class="chart">
      <div class="chart-fill"></div>
      <div class="chart-line"></div>
      <div class="chart-dot"></div>
      <div class="chart-grid"></div>
      <div class="y-axis">
        <span>0</span><span>20</span><span>40</span>
        <span>60</span><span>80</span><span>100</span>
      </div>
    </div>

    <div class="x-axis">
      <span>Mon</span><span>Tue</span><span>Wed</span>
      <span>Thu</span><span>Fri</span><span>Sat</span>
    </div>
  </div>
</body>
</html>
```

### Minimal spider chart

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.2.5/runtime.min.js" async></script>
<style>
@import((*) from st-core@v2)
@st-root()
@st-spider-root()

@arr skills[80, 65, 90, 55, 70, 85]

@st-spider-fill(.spider-fill, skills)
@st-spider-line(.spider-line, skills)
@st-spider-dots(.spider-dot-, skills, 9px)
@st-spider-grid(.spider-grid)
@st-spider-spokes(.spider-spokes, skills)

.spider {
  @st-spider-points(skills, 42)
  position: relative;
  width: 280px;
  height: 280px;
  background: var(--st-surface);
  border-radius: 50%;
}
</style>

<div class="spider">
  <div class="spider-grid"></div>
  <div class="spider-spokes"></div>
  <div class="spider-fill"></div>
  <div class="spider-line"></div>
  <div class="spider-dot-1"></div>
  <div class="spider-dot-2"></div>
  <div class="spider-dot-3"></div>
  <div class="spider-dot-4"></div>
  <div class="spider-dot-5"></div>
  <div class="spider-dot-6"></div>
</div>
```

### Two teams + axis labels

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.2.5/runtime.min.js" async></script>
<style>
@import((*) from st-core@v2)
@st-root()
@st-spider-root()

@arr teamA[92, 78, 85, 55, 48, 80]
@arr teamB[68, 82, 70, 95, 62, 58]

@st-spider-fill(.fill-a, teamA)
@st-spider-line(.line-a, teamA)
@st-spider-dots(.dot-a-, teamA, 10px)

@st-spider-fill(.fill-b, teamB)
@st-spider-line(.line-b, teamB)
@st-spider-dots(.dot-b-, teamB, 10px)

@st-spider-grid(.spider-grid)
@st-spider-spokes-n(.spider-spokes, 6)

.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  justify-content: center;
}

.skill-card {
  width: 340px;
  background: var(--st-card);
  border-radius: 20px;
  border: 1px solid var(--st-border);
  padding: 28px 24px 32px;
}

.skill-card h2 {
  font-size: 0.82rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--st-accent);
  margin: 0 0 22px;
}

.spider-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-width: 280px;
  margin: 0 auto;
  background: var(--st-surface);
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--st-border);
}

.spider-wrap.team-a {
  @st-spider-points(teamA, 42)
  --st-accent: #9d7eff;
  --st-spider-fill-opacity: 28%;
}
.spider-wrap.team-b {
  @st-spider-points(teamB, 42)
  --st-accent: #4fffb0;
  --st-spider-fill-opacity: 30%;
}

.spider-label {
  position: absolute;
  font-size: 0.7rem;
  color: var(--st-muted);
  white-space: nowrap;
  pointer-events: none;
  z-index: 3;
}
.spider-label.speed   { top: -18px; left: 50%; transform: translateX(-50%); }
.spider-label.quality { top: 14%; right: -36px; }
.spider-label.ux      { bottom: 14%; right: -28px; }
.spider-label.scale   { bottom: -18px; left: 50%; transform: translateX(-50%); }
.spider-label.cost    { bottom: 14%; left: -28px; }
.spider-label.support { top: 14%; left: -42px; }

body {
  margin: 0;
  min-height: 100vh;
  background: var(--st-bg);
  color: var(--st-text);
  font-family: system-ui, sans-serif;
  padding: 40px 20px;
}
</style>

<div class="cards">
  <div class="skill-card">
    <h2>Skills · Team A</h2>
    <div class="spider-wrap team-a">
      <div class="spider-grid"></div>
      <div class="spider-spokes"></div>
      <div class="fill-a"></div>
      <div class="line-a"></div>
      <div class="dot-a-1"></div><div class="dot-a-2"></div>
      <div class="dot-a-3"></div><div class="dot-a-4"></div>
      <div class="dot-a-5"></div><div class="dot-a-6"></div>
      <span class="spider-label speed">Speed</span>
      <span class="spider-label quality">Quality</span>
      <span class="spider-label ux">UX</span>
      <span class="spider-label scale">Scale</span>
      <span class="spider-label cost">Cost</span>
      <span class="spider-label support">Support</span>
    </div>
  </div>

  <div class="skill-card">
    <h2>Skills · Team B</h2>
    <div class="spider-wrap team-b">
      <div class="spider-grid"></div>
      <div class="spider-spokes"></div>
      <div class="fill-b"></div>
      <div class="line-b"></div>
      <div class="dot-b-1"></div><div class="dot-b-2"></div>
      <div class="dot-b-3"></div><div class="dot-b-4"></div>
      <div class="dot-b-5"></div><div class="dot-b-6"></div>
      <span class="spider-label speed">Speed</span>
      <span class="spider-label quality">Quality</span>
      <span class="spider-label ux">UX</span>
      <span class="spider-label scale">Scale</span>
      <span class="spider-label cost">Cost</span>
      <span class="spider-label support">Support</span>
    </div>
  </div>
</div>
```

### Multi-series radar example

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.2.5/runtime.min.js" async></script>
<style>
@import((*) from st-core@v2)
@st-root()
@st-spider-root()

@arr seriesA[70, 55, 40, 85, 90]
@arr seriesB[45, 75, 60, 50, 55]
@arr seriesC[85, 40, 70, 35, 65]
@arr seriesD[55, 30, 80, 70, 45]
@arr seriesE[30, 90, 55, 60, 75]

@st-spider-fill(.fill-a, seriesA)
@st-spider-line(.line-a, seriesA)
@st-spider-dots(.dot-a-, seriesA, 9px)

@st-spider-fill(.fill-b, seriesB)
@st-spider-line(.line-b, seriesB)
@st-spider-dots(.dot-b-, seriesB, 9px)

@st-spider-fill(.fill-c, seriesC)
@st-spider-line(.line-c, seriesC)
@st-spider-dots(.dot-c-, seriesC, 9px)

@st-spider-fill(.fill-d, seriesD)
@st-spider-line(.line-d, seriesD)
@st-spider-dots(.dot-d-, seriesD, 9px)

@st-spider-fill(.fill-e, seriesE)
@st-spider-line(.line-e, seriesE)
@st-spider-dots(.dot-e-, seriesE, 9px)

@st-spider-grid(.spider-grid)
@st-spider-spokes-n(.multi-spokes, 5)

.multi-spider {
  position: relative;
  width: 320px;
  height: 320px;
  margin: 0 auto;
  background: var(--st-card);
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--st-border);
}

/* Each series = own coordinate scope */
.series-a {
  @st-spider-points(seriesA, 42)
  position: absolute; inset: 0;
  --st-accent: #ff9f43; --st-spider-fill-opacity: 22%;
}
.series-b {
  @st-spider-points(seriesB, 42)
  position: absolute; inset: 0;
  --st-accent: #54a0ff; --st-spider-fill-opacity: 18%;
}
.series-c {
  @st-spider-points(seriesC, 42)
  position: absolute; inset: 0;
  --st-accent: #ff6b9d; --st-spider-fill-opacity: 20%;
}
.series-d {
  @st-spider-points(seriesD, 42)
  position: absolute; inset: 0;
  --st-accent: #ff6b35; --st-spider-fill-opacity: 15%;
}
.series-e {
  @st-spider-points(seriesE, 42)
  position: absolute; inset: 0;
  --st-accent: #a55eea; --st-spider-fill-opacity: 18%;
}

.legend {
  display: flex; flex-wrap: wrap; gap: 12px 20px;
  justify-content: center; margin-top: 20px;
  font-size: 0.78rem; color: var(--st-text);
}
.legend i {
  width: 11px; height: 11px; border-radius: 50%;
  display: inline-block; margin-right: 6px; vertical-align: middle;
}

body {
  margin: 0; min-height: 100vh; background: var(--st-bg);
  color: var(--st-text); font-family: system-ui, sans-serif;
  padding: 40px 20px; text-align: center;
}
</style>

<div class="multi-spider">
  <div class="spider-grid" style="opacity:.4"></div>
  <div class="multi-spokes"></div>

  <div class="series-a">
    <div class="fill-a"></div><div class="line-a"></div>
    <div class="dot-a-1"></div><div class="dot-a-2"></div>
    <div class="dot-a-3"></div><div class="dot-a-4"></div>
    <div class="dot-a-5"></div>
  </div>
  <div class="series-b">
    <div class="fill-b"></div><div class="line-b"></div>
    <div class="dot-b-1"></div><div class="dot-b-2"></div>
    <div class="dot-b-3"></div><div class="dot-b-4"></div>
    <div class="dot-b-5"></div>
  </div>
  <div class="series-c">
    <div class="fill-c"></div><div class="line-c"></div>
    <div class="dot-c-1"></div><div class="dot-c-2"></div>
    <div class="dot-c-3"></div><div class="dot-c-4"></div>
    <div class="dot-c-5"></div>
  </div>
  <div class="series-d">
    <div class="fill-d"></div><div class="line-d"></div>
    <div class="dot-d-1"></div><div class="dot-d-2"></div>
    <div class="dot-d-3"></div><div class="dot-d-4"></div>
    <div class="dot-d-5"></div>
  </div>
  <div class="series-e">
    <div class="fill-e"></div><div class="line-e"></div>
    <div class="dot-e-1"></div><div class="dot-e-2"></div>
    <div class="dot-e-3"></div><div class="dot-e-4"></div>
    <div class="dot-e-5"></div>
  </div>
</div>

<div class="legend">
  <span><i style="background:#ff9f43"></i>Series A</span>
  <span><i style="background:#54a0ff"></i>Series B</span>
  <span><i style="background:#ff6b9d"></i>Series C</span>
  <span><i style="background:#ff6b35"></i>Series D</span>
  <span><i style="background:#a55eea"></i>Series E</span>
</div>
```

---

## 12. Design Token Reference

| Variable | Default | Usage |
|----------|---------|--------|
| `--st-bg` | `#0e0d14` | Page background |
| `--st-surface` | `#161422` | Chart / surface |
| `--st-card` | `#1c1a2e` | Cards |
| `--st-accent` | `#9d7eff` | Primary stroke / fill |
| `--st-accent-2` | `#c4a8ff` | Gradients |
| `--st-green` | `#4fffb0` | Positive delta |
| `--st-red` | `#ff5e7d` | Negative delta |
| `--st-text` | `#e8e3ff` | Primary text |
| `--st-muted` | `#6b6488` | Labels / muted UI |
| `--st-border` | `rgba(157,126,255,.15)` | Grid / spokes |
| `--st-radius-xl` | `40px` | Device frame |
| `--st-radius-lg` | `16px` | Cards |
| `--st-pad` | `24px` | Card padding |
| `--st-chart-line-width` | `1.5px` | Linear stroke |
| `--st-spider-fill-opacity` | `35%` | Radar fill strength |
| `--st-spider-stroke-scale` | `0.97` | Radar stroke thickness |

---

## 13. Performance & SEO

- **Zero hydration** — charts paint with CSS only  
- **Small compiled output** — polygons + variables (~1 kb class)  
- **GPU-friendly updates** — animate via custom properties / `clip-path`  
- **SEO-friendly** — real DOM structure, no canvas/SVG dependency  

---

## 14. Integrations

Official samples: **[integration/](./integration/)** · **[templates/](./templates/)**

| Folder | Stack | Notes |
|--------|--------|--------|
| `integration/html` | HTML + JS | Runtime or compiled CSS |
| `integration/svelte` | Svelte / SvelteKit | Compiled CSS + reactive `--st-pN` / polar vars |
| `templates/admin-dashboard` | HTML dashboard | Revenue chart, stat cards, range tabs |
| `templates/…` | Other demos | See repo `templates/` |

**Add your stack:** [integration/README.md](integration/README.md)

---

[Add your idea](https://github.com/fscss-ttr/st-core.fscss/blob/main/CONTRIBUTING.md)

> MIT License · Built with [FSCSS](https://fscss.devtem.org) · [fscss-ttr](https://github.com/fscss-ttr)

