# st-core.fscss

> Pure CSS statistical dashboard components for the FSCSS ecosystem.
> No JavaScript dependencies. No SVG. No canvas — just pure CSS array processing.

**MIT Licensed** · [github.com/fscss-ttr/st-core.fscss](https://github.com/fscss-ttr/st-core.fscss)
Requires FSCSS **v1.2.3+**

**[SOURCE CODE EXPLANATION](https://github.com/fscss-ttr/st-core.fscss/blob/main/EXPLAINED.md)** · **[LEGACY V1 DOCS](https://github.com/fscss-ttr/st-core.fscss/blob/main/v1/README.md)**

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
   - [`@st-container`](#st-container)
   - [`@st-phone`](#st-phone)
7. [Chart System & Mixins](#7-chart-system--mixins)
   - [`@st-chart-points`](#st-chart-points)
   - [`@st-chart-fill`](#st-chart-fill)
   - [`@st-chart-line`](#st-chart-line)
   - [`@st-chart-line-width`](#st-chart-line-width)
   - [`@st-chart-dot`](#st-chart-dot)
   - [`@st-chart-dots`](#st-chart-dots)
   - [`@st-chart-grid`](#st-chart-grid)
   - [`@st-chart-axis-x` & `@st-chart-axis-y`](#st-chart-axis-x--st-chart-axis-y)
8. [JS Control Layer](#8-js-control-layer)
9. [UI Components](#9-ui-components)
   - [`@st-stat-card`](#st-stat-card)
   - [`@st-cat-bar-fill`](#st-cat-bar-fill)
10. [Full Examples](#10-full-examples)
    - [Simple Minimal Demo](#simple-minimal-demo)
    - [Multi-Line & Multi-Area Chart (with Opacity)](#multi-line--multi-area-chart-with-opacity)
    - [Dynamic JS Interactive Chart](#dynamic-js-interactive-chart)
    - [Full Mobile Dashboard Frame](#full-mobile-dashboard-frame)
11. [Design Token Reference](#11-design-token-reference)
12. [Performance & SEO](#12-performance--seo)
13. [Integrations](#13-integrations) 
---

## 1. What is st-core v2?

**st-core.fscss** is a CSS visualization system built on top of FSCSS. It allows you to build responsive charts and statistical dashboards using standard CSS custom properties and dynamic polygon generation.

---

## 2. What's New in v2?

In **v1**, charts were strictly constrained to 8 fixed data points mapped to hardcoded CSS variables (`--st-p1` through `--st-p8`).

**In v2:**

- **Dynamic Datasets (`@arr`)** — Pass FSCSS arrays (`@arr myData[...]`) of *any length* (5, 12, 50+ data points).
- **Automatic X-Spacing** — Points are dynamically distributed evenly across `0%` to `100%` chart width based on dataset size (`array.length`).
- **In-Line Normalization** — Dynamic inline math (`num(100 - @arr[])%`) normalizes natural values (0–100) directly inside style calculations.
- **Dual-Edge Polygon Polyline** — Line strokes generated via closed top-to-bottom array loop calculations for precision rendering.

---

## 3. How It Works

st-core@v2 processes FSCSS array data to dynamically generate `clip-path: polygon()` rules:

```css
/* Define an array in FSCSS */
@arr myData[50, 10, 97, 35, 66, 50, 80, 54, 70, 60]

/* Apply mixins with array references */
@st-chart-fill(.chart-fill, myData)
@st-chart-line(.chart-line, myData)
```

The mixin reads the array length, computes horizontal steps (`0%, 11%, 22% ... 100%`), normalizes Y heights, and outputs standard CSS declarations.

`@st-chart-fill` / `@st-chart-line` declare the **renderer** for a selector — the array they take just tells the renderer how many points to expect. The actual per-element Y values are written separately by `@st-chart-points(array)` on each element (container or child) — see [`@st-chart-points`](#st-chart-points) below. Any element that doesn't call it inherits the values from its nearest ancestor that did.

---

## 4. Installation

**See [integration and templates](integration/)**

### CDN / Runtime Mode

Include the **FSCSS v1.2.3+** runtime in your document:

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.2.4/runtime.min.js" async></script>
```

Then import st-core@v2 directly inside your `<style>` block:

```css
@import((*) from st-core@v2)
```

### CLI / Compiled Mode

Compile `.fscss` files directly into production-ready `.css` files using the CLI:

```bash
# Upgrade or install FSCSS CLI v1.2.3+
npm install -g fscss@latest

# Compile stylesheet
fscss input.fscss output.css
```

---

## 5. Design Tokens — `@st-root`

Initializes global CSS custom properties for theming, radii, and grid colors:

```css
@st-root()        /* Targets :root */
```
Or
```css
@st-root(root.class...)    /* Targets custom scope */
```

---

## 6. Layout Helpers

### `@st-container`

Center-aligned viewport container for demos and dashboards:

```css
@st-container(body)
```

### `@st-phone`

Device frame container with rounded borders and glow shadows:

```css
@st-phone(.wrapper)
```

---

## 7. Chart System & Mixins

### `@st-chart-points`

Inverts array coordinates and writes normalized variable targets onto the container element:

```css
.chart {
  @st-chart-points(myData)
}
```

This is the call that actually sets `--st-p1`…`--st-p{n}` on an element. Call it once per dataset you need — on the chart container for the default series, and again on any child that needs a different array (see the [multi-line example](#multi-line--multi-area-chart-with-opacity)).

### `@st-chart-fill`

Fills the area beneath the line plot using an automatically bounded polygon gradient:

```css
@st-chart-fill(.chart-fill, myData)
```

### `@st-chart-line`

Draws the line stroke using a dual-pass closed polygon:

```css
@st-chart-line(.chart-line, myData)
```

### `@st-chart-line-width`

Overrides stroke width on a target line element:

```css
.chart-line {
  @st-chart-line-width(2.5px);
}
```

### `@st-chart-dot`

Positions a single custom marker dot (ideal for tooltips or peaks):

```css
/* Params: selector, x%, y%, size */
@st-chart-dot(.chart-dot, 70, 60, 12px)
```

### `@st-chart-dots`

Auto-generates positioning rules for every point marker in the array:

```css
/* Generates .dot-1, .dot-2 ... .dot-N */
@st-chart-dots(.dot-, myData, 8px)
```

### `@st-chart-grid`

Generates vertical and horizontal chart background lines:

```css
/* selector, rows, cols */
@st-chart-grid(.chart-grid, 10, 7)
```

### `@st-chart-axis-x` & `@st-chart-axis-y`

Formative axis wrapper helpers:

```css
@st-chart-axis-x(.x-axis)
@st-chart-axis-y(.y-axis)
```

---

## 8. JS Control Layer

Updating charts dynamically via JavaScript consists of changing the `--st-p{n}` CSS variables on the element:

```js
const chartLine = document.querySelector(".chart-line");
const normalize = (n) => (100 - n) + '%';

function updatePoints(pointsArray) {
  const cssVars = pointsArray
    .map((v, i) => `--st-p${i + 1}: ${normalize(v)};`)
    .join(' ');

  chartLine.style.cssText = cssVars;
}

// Update runtime values
updatePoints([50, 20, 85, 40, 95]);
```

---

## 9. UI Components

### `@st-stat-card`

Renders stat cards with label, text, and change indicator styles:

```css
@st-stat-card(.stat-card)
```

### `@st-cat-bar-fill`

Renders progress bar component fills:

```css
/* selector, range */
@st-cat-bar-fill(.bar-fill, 75)
```

---

## 10. Full Examples

### Simple Minimal Demo

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.2.4/runtime.min.js" async></script>

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

### Multi-Line & Multi-Area Chart (with Opacity)

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.2.4/runtime.min.js" async></script>

<style>
@import((*) from st-core@v2)

@st-root()

@arr seriesA[30, 50, 75, 40, 85, 60]
@arr seriesB[10, 25, 45, 20, 55, 30]

/* Series A — renderer + points */
@st-chart-fill(.fill-a, seriesA)
@st-chart-line(.line-a, seriesA)

/* Series B — renderer + points */
@st-chart-fill(.fill-b, seriesB)
@st-chart-line(.line-b, seriesB)

.chart {
  @st-chart-points(seriesA)
  position: relative;
  height: 220px;
  width: 100%;
  background: var(--st-bg);
}

/* .fill-a / .line-a inherit seriesA from .chart, but set it
   explicitly for clarity and to avoid relying on inheritance */
.fill-a {
  @st-chart-points(seriesA)
  opacity: 0.6;
  --st-accent: #9d7eff;
}
.line-a {
  @st-chart-points(seriesA)
  --st-accent: #9d7eff;
}

/* .fill-b / .line-b MUST set their own points — otherwise they
   inherit .chart's seriesA values and render the wrong data */
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

### Dynamic JS Interactive Chart

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/fscss@1.2.4/runtime.min.js" async></script>
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

### Full Mobile Dashboard Frame

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.jsdelivr.net/npm/fscss@1.2.4/runtime.min.js" async></script>
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
        <span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span>
      </div>
    </div>

    <div class="x-axis">
      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
    </div>
  </div>

</body>
</html>
```

---

## 11. Design Token Reference

| Variable          | Default Value | Usage                       |
| ------------------ | -------------- | ---------------------------- |
| `--st-bg`          | `#0e0d14`      | Page body background         |
| `--st-surface`     | `#161422`      | Surface/container background |
| `--st-card`        | `#1c1a2e`      | Card component background    |
| `--st-accent`      | `#9d7eff`      | Primary brand accent         |
| `--st-accent-2`    | `#c4a8ff`      | Secondary accent gradient    |
| `--st-green`       | `#4fffb0`      | Positive delta state         |
| `--st-red`         | `#ff5e7d`      | Negative delta state         |
| `--st-text`        | `#e8e3ff`      | Primary text color           |
| `--st-muted`       | `#6b6488`      | Muted labels / grid stroke   |
| `--st-radius-xl`   | `40px`         | Outer device frame radius    |
| `--st-radius-lg`   | `16px`         | Component card radius        |

---

## 12. Performance & SEO

- **Zero Hydration Overhead** — Pure CSS charts require zero JS initialization before rendering.
- **Low Compiled Size** — Compiles to lightweight CSS shapes and variables (~0.8 kb minified).
- **GPU-Accelerated Transitions** — Animating dataset updates through CSS custom properties leverages browser composite threads.

---

## 13. Integrations

Official samples **[integration/](./integration/)**

| Folder | Stack | Notes |
|--------|--------|--------|
| integration/html | HTML + JS | Runtime or compiled CSS |
| integration/svelte | Svelte / SvelteKit | Compiled CSS + reactive `--st-pN` |

**Add your stack:** See [integration/README.md](integration/README.md) …

---

[Add your idea](https://github.com/fscss-ttr/st-core.fscss/blob/main/CONTRIBUTING.md)
> MIT License · Built with [FSCSS](https://fscss.devtem.org) · [fscss-ttr](https://github.com/fscss-ttr)
