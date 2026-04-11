# st-core.fscss

> Pure CSS statistical dashboard components for the FSCSS ecosystem.  
> No JavaScript. No SVG. No canvas - just CSS doing the work.

**MIT Licensed** · [github.com/fscss-ttr/st-core.fscss](https://github.com/fscss-ttr/st-core.fscss)  
Requires FSCSS **v1.1.24+**

---

## Table of Contents

1. [What is st-core?](#1-what-is-st-core)
2. [How It Works](#2-how-it-works)
3. [Installation](#3-installation)
   - [CDN (runtime)](#cdn-runtime)
   - [CLI (compiled, production)](#cli-compiled-production)
4. [Design Tokens — `@st-root`](#4-design-tokens--st-root)
5. [Layout Helpers](#5-layout-helpers)
   - [`@st-container`](#st-container)
   - [`@st-phone`](#st-phone)
6. [Chart System](#6-chart-system)
   - [`@st-chart-points`](#st-chart-points)
   - [`@st-chart-fill`](#st-chart-fill)
   - [`@st-chart-line`](#st-chart-line)
   - [`@st-chart-line-width`](#st-chart-line-width)
   - [`@st-chart-dot`](#st-chart-dot)
   - [`@st-chart-grid`](#st-chart-grid)
   - [`@st-chart-axis-x`](#st-chart-axis-x)
   - [`@st-chart-axis-y`](#st-chart-axis-y)
7. [Multi-Chart — Multiple Lines, One Renderer](#7-multi-chart--multiple-lines-one-renderer)
8. [JS Control Layer](#8-js-control-layer)
9. [UI Components](#9-ui-components)
   - [`@st-stat-card`](#st-stat-card)
   - [`@st-cat-bar-fill`](#st-cat-bar-fill)
10. [Full Examples](#10-full-examples)
    - [Single-line chart](#single-line-chart)
    - [Multi-line chart](#multi-line-chart)
11. [Design Token Reference](#11-design-token-reference)
12. [Tips & Patterns](#12-tips--patterns)

---

## 1. What is st-core?

**st-core.fscss** is a lightweight, pure CSS data visualization system built on FSCSS.
It enables developers to create charts, dashboards, and stat UIs using CSS variables and modern layout techniques — without relying on heavy JavaScript libraries.
With optional minimal JavaScript, developers can dynamically update data by rewriting CSS variables, allowing smooth, native animations powered entirely by the browser.

**Key ideas:**

- Data lives in CSS custom properties (`--st-p1` … `--st-p8`).
- Shapes are rendered via `clip-path: polygon()` - no SVG, no canvas.
- JavaScript is optional - it only needs to write CSS variables. CSS does the rest.
- Everything compiles to plain `.css` via the FSCSS CLI for zero-runtime production output.

**Components:**

| Mixin | What it builds |
|---|---|
| `@st-root` | Design token variables on `:root` |
| `@st-container` | Full-height flex center layout |
| `@st-phone` | Mock phone/device frame |
| `@st-chart-points` | Inject data (sets `--st-p1`–`--st-p8`) |
| `@st-chart-fill` | Area fill under a line |
| `@st-chart-line` | Line stroke (clip-path polygon) |
| `@st-chart-line-width` | Override stroke thickness |
| `@st-chart-dot` | Positioned data point marker |
| `@st-chart-grid` | Background grid lines |
| `@st-chart-axis-x` | X-axis label row |
| `@st-chart-axis-y` | Y-axis label column |
| `@st-stat-card` | Statistic card: label / value / delta |
| `@st-cat-bar-fill` | Gradient progress bar |

---

## 2. How It Works

Charts in st-core are pure CSS `clip-path: polygon()` shapes. Each of the 8 data points maps to a CSS custom property — `--st-p1` through `--st-p8` — which represent Y positions across the chart width.

```
--st-p1  --st-p2  --st-p3  --st-p4  --st-p5  --st-p6  --st-p7  --st-p8
  |        |        |        |        |        |        |        |
 0%      14%      28%      42%      57%      71%      85%     100%   ← X positions (fixed)
```

The fill, line, and dot elements all inherit these variables from their parent chart container, so you set data once and all layers react.

**Y-axis convention:**  
Values are passed on a `0–100` scale where `100 = top of chart`. st-core inverts them to CSS coordinates internally — you always think in natural chart terms (bigger = higher).

**The "CSS does the work, JS passes the data" pattern:**  
Updating a chart at runtime is just:

```js
chart.style.setProperty('--st-p1', '42');
chart.style.setProperty('--st-p2', '65');
// etc.
```

No redraw. No DOM manipulation. CSS reacts immediately.

---

## 3. Installation

### CDN (runtime)

Add the FSCSS runtime to your HTML — it compiles `fscss` syntax in-browser:

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.1.24/exec.min.js" async></script>
```

Then import st-core inside a `<style>` block:

```css
/* Import everything */
@import((*) from st-core)

/* Or use exec init style */
@import(exec(_init st-core))
```

All `@st-*` mixins are now available in that stylesheet.

### CLI (compiled, production)

For production use, compile `.fscss` → `.css` with the FSCSS CLI. The output is a plain CSS file — no runtime, no CDN dependency.

```bash
# Install FSCSS CLI
npm install -g fscss

# Compile
fscss dashboard.fscss dashboard.css
```

Then link the compiled file normally:

```html
<link rel="stylesheet" href="dashboard.css">
```

The compiled output is pure CSS. `clip-path`, `custom properties`, `linear-gradient` — all standard, all browser-native. **No FSCSS runtime needed in production.**

> The FSCSS VS Code extension also auto-compiles on save: `.fscss` → `.css` whenever you hit save.

---

## 4. Design Tokens — `@st-root`

Call this once at the top of your stylesheet. It writes all CSS custom properties to `:root` (or a custom selector).

```css
@st-root()
/* defaults to :root */

/* or target a custom element */
@st-root(root.html)
```

**What it sets:**

```
Colors:   --st-bg, --st-surface, --st-card
          --st-accent, --st-accent-2, --st-accent-dim
          --st-green, --st-red
          --st-text, --st-muted, --st-border

Radius:   --st-radius-xl (40px)  --st-radius-lg (16px)
          --st-radius-md (12px)  --st-radius-sm (10px)

Spacing:  --st-pad (24px)

Chart:    --st-p1 … --st-p8          (default Y values)
          --st-chart-line-width       (1.5px)
```

Override any token locally — they're just CSS custom properties:

```css
/* global theme change */
:root {
  --st-accent:   #00d4ff;
  --st-accent-2: #80eaff;
  --st-bg:       #0a0f1e;
}

/* scoped override — only affects this component */
.revenue-chart {
  --st-accent: #32D8D4;
}
```

---

## 5. Layout Helpers

### `@st-container`

Turns any selector into a full-viewport flex center. Useful for demo wrappers.

```css
@st-container(body)
@st-container(.app-root)
```

### `@st-phone`

Renders a mock device/phone frame — dark surface, rounded corners, glow shadow.

```css
@st-phone(.phone-wrapper)
```

```html
<div class="phone-wrapper">
  <!-- dashboard content -->
</div>
```

---

## 6. Chart System

### `@st-chart-points`

**This is how you feed data to a chart.** Call it inside the chart container's CSS block. It sets `--st-p1` through `--st-p8` on that element.

```css
.chart {
  position: relative;
  height: 200px;
  overflow: hidden;

  @st-chart-points(20, 35, 33, 30, 48, 35, 66, 37)
  /*               p1  p2  p3  p4  p5  p6  p7  p8 */
}
```

- 8 values, left to right (p1 = leftmost point).
- Scale is `0–100`. Higher = higher on chart.
- All child fill/line/dot elements automatically inherit these values.
- Default: `0, 0, 0, 0, 0, 0, 0, 0`

---

### `@st-chart-fill`

Renders the gradient area fill beneath the chart line.

```css
@st-chart-fill(.chart-fill)
```

```html
<div class="chart">
  <div class="chart-fill"></div>
</div>
```

Color comes from `--st-accent`. Tweak opacity as needed:

```css
.chart-fill {
  opacity: 0.7;
}
```

---

### `@st-chart-line`

Renders the line stroke via a thin `clip-path` polygon shape.

```css
@st-chart-line(.chart-line)
```

```html
<div class="chart">
  <div class="chart-fill"></div>
  <div class="chart-line"></div>
</div>
```

Line color comes from `background` on `.chart-line`. Override the glow:

```css
.chart-line {
  filter: drop-shadow(0 0 10px var(--st-accent-2));
}
```

---

### `@st-chart-line-width`

Sets the stroke thickness. Call it inside the `.chart-line` block.

```css
.chart-line {
  @st-chart-line-width(2px)
}
```

Writes `--st-chart-line-width` on that element. Root default is `1.5px`.

---

### `@st-chart-dot`

Places a circular data point marker at a specific `(x, y)` position.

```css
@st-chart-dot(.chart-dot, x, y)
/* x = left offset in % (0–100)     */
/* y = chart value (0–100 scale)    */
/* optional 4th param: dot size     */

@st-chart-dot(.chart-dot, 57, 42)
@st-chart-dot(.chart-dot, 57, 42, 16px)
```

```html
<div class="chart">
  <div class="chart-fill"></div>
  <div class="chart-line"></div>
  <div class="chart-dot" data-point="$405.67"></div>
</div>
```

**Tooltip via pseudo-elements** — use `attr(data-point)`:

```css
.chart-dot::after {
  content: attr(data-point);
  background: var(--st-accent);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 9px;
  border-radius: var(--st-radius-sm);
  position: absolute;
  top: -38px;
  left: -20px;
  white-space: nowrap;
}

/* arrow */
.chart-dot::before {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--st-accent);
  transform: rotate(45deg);
  position: absolute;
  top: -16px;
  left: 2px;
}
```

---

### `@st-chart-grid`

Renders horizontal and vertical grid lines via `repeating-linear-gradient`.

```css
@st-chart-grid(.chart-grid, rows, cols)
/* defaults: rows=10, cols=7 */

@st-chart-grid(.chart-grid, 8, 7)
```

```html
<div class="chart">
  <div class="chart-fill"></div>
  <div class="chart-line"></div>
  <div class="chart-grid"></div>
</div>
```

Horizontal lines: `--st-muted`. Vertical lines: `--st-accent`. Default opacity: `0.2`. Reduce for subtlety:

```css
.chart-grid {
  opacity: 0.08;
}
```

---

### `@st-chart-axis-x`

Styles a flex row of x-axis labels.

```css
@st-chart-axis-x(.x-axis)
```

```html
<div class="x-axis">
  <span>Mon</span>
  <span>Tue</span>
  <span>Wed</span>
  <span>Thu</span>
  <span>Fri</span>
  <span>Sat</span>
  <span>Sun</span>
</div>
```

Uses `justify-content: space-between` — one `<span>` per chart column. Color: `--st-muted`.

---

### `@st-chart-axis-y`

Styles a flex column of y-axis labels, positioned absolutely inside the chart container.

```css
@st-chart-axis-y(.y-axis)
```

```html
<div class="chart">
  <div class="chart-fill"></div>
  <div class="chart-line"></div>
  <div class="chart-grid"></div>

  <div class="y-axis">
    <span>0</span>
    <span>25</span>
    <span>50</span>
    <span>75</span>
    <span>100</span>
  </div>
</div>
```

Uses `flex-direction: column-reverse` so labels read bottom-to-top (low values at bottom). Positioned absolutely inside the chart.

---

## 7. Multi-Chart — Multiple Lines, One Renderer

You can render multiple independent data series on the same chart container. Define the renderer **once** with `@st-chart-line`, then apply it to multiple elements. Each element overrides `@st-chart-points` individually.

**Pattern:**

```css
/* chart container — sets the default dataset (line-1 inherits this) */
.chart {
  position: relative;
  height: 200px;
  @st-chart-points(20, 25, 21, 37, 30, 60, 27, 50)
}

/* ONE renderer declaration */
@st-chart-line(.chart-line)

.chart-line {
  @st-chart-line-width(2.5px)
}

/* line-1 — inherits chart container's @st-chart-points */
.line-1 { background: #32D8D4; }

/* line-2 — overrides with its own data */
.line-2 {
  background: #E8A030;
  @st-chart-points(10, 20, 16, 15, 66, 50, 80, 54)
}

/* line-3 — overrides with its own data */
.line-3 {
  background: #B840C8;
  @st-chart-points(5, 39, 20, 30, 27, 70, 60, 70)
}
```

```html
<div class="chart">
  <div class="chart-line line-1"></div>
  <div class="chart-line line-2"></div>
  <div class="chart-line line-3"></div>
  <div class="chart-grid"></div>
  <div class="y-axis">
    <span>0</span><span>20</span><span>40</span>
    <span>60</span><span>80</span><span>100</span>
  </div>
</div>

<div class="x-axis">
  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span>
  <span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
</div>
```

**Key rules:**

- The chart container sets a default dataset — the first line element inherits it.
- Each additional line element calls `@st-chart-points` inside its own block to override.
- `@st-chart-line` is declared once — every element with that class becomes a rendered line.
- Line color is set via `background` on each element.
- Grid and axes are shared — they sit inside the chart container once.

---

## 8. JS Control Layer

st-core is pure CSS, but you can drive it from JavaScript by writing CSS custom properties. This is the recommended pattern for live/real-time data.

**Update a single chart:**

```js
function setChartData(el, values) {
  values.forEach((v, i) => {
    el.style.setProperty(`--st-p${i + 1}`, v);
  });
}

const chart = document.querySelector('.chart');
setChartData(chart, [20, 35, 40, 55, 48, 72, 60, 80]);
```

**Update a specific line in a multi-chart:**

```js
function setLineData(el, values) {
  values.forEach((v, i) => {
    el.style.setProperty(`--st-p${i + 1}`, v);
  });
}

const line2 = document.querySelector('.line-2');
setLineData(line2, [10, 18, 30, 25, 60, 55, 70, 65]);
```

**Animate between datasets:**

```js
function animateTo(el, from, to, duration = 600) {
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t; // ease-in-out
    from.forEach((_, i) => {
      const val = from[i] + (to[i] - from[i]) * ease;
      el.style.setProperty(`--st-p${i + 1}`, val.toFixed(2));
    });
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
```

CSS handles the polygon geometry on every frame — no layout thrash, no redraws. Just variable writes.

---

## 9. UI Components

### `@st-stat-card`

A dark card with a label, large value, and a delta badge.

```css
@st-stat-card(.stat-card)
```

```html
<div class="stat-card">
  <div class="st-stat-label">Portfolio Value</div>
  <div class="st-stat-value">$84,201</div>
  <div class="st-stat-delta up">▲ +12.4% this month</div>
</div>
```

Delta color classes:

- `.up` → `--st-green`
- `.down` → `--st-red`

The mixin styles `.st-stat-label`, `.st-stat-value`, and `.st-stat-delta` as child selectors automatically.

---

### `@st-cat-bar-fill`

A gradient horizontal progress bar fill. Goes inside a track container.

```css
@st-cat-bar-fill(.cat-bar-fill, 0)
/* second param = base fill width (overridden per-element via CSS var) */
```

```html
<div class="cat-bar-track">
  <div class="cat-bar-fill"></div>
</div>
```

Set individual widths per bar:

```css
.bar-equities { --st-cat-bar-fill-range: 82%; }
.bar-crypto   { --st-cat-bar-fill-range: 61%; }
.bar-forex    { --st-cat-bar-fill-range: 45%; }
```

Gradient runs `--st-accent` → `--st-accent-2` left to right.

---

## 10. Full Examples

### Single-line chart

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.1.24/exec.min.js" async></script>

<style>
@import((*) from st-core)

@st-root()
@st-container(body)
@st-phone(.wrapper)

@st-chart-fill(.chart-fill)
@st-chart-line(.chart-line)
@st-chart-dot(.chart-dot, 70, 60)
@st-stat-card(.stat-card)
@st-chart-axis-x(.x-axis)
@st-chart-axis-y(.y-axis)
@st-chart-grid(.chart-grid, 10, 7)

.chart {
  width: 100%;
  height: 200px;
  border-radius: 25px;
  position: relative;
  overflow: hidden;
  background: var(--st-surface);
  @st-chart-points(20, 25, 21, 37, 30, 60, 27, 50)
}

.chart-line {
  @st-chart-line-width(2px)
  filter: drop-shadow(0 0 8px var(--st-accent));
}

.chart-fill { opacity: 0.85; }

.chart-dot {
  position: relative;
  overflow: visible;
  --st-accent: #c4a8ff;
}

.chart-dot::after {
  content: attr(data-point);
  background: var(--st-accent);
  padding: 6px 8px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  border-radius: var(--st-radius-sm);
  position: absolute;
  top: -40px;
  left: -22px;
  white-space: nowrap;
}

.chart-dot::before {
  content: '';
  width: 10px;
  height: 10px;
  background: var(--st-accent);
  transform: rotate(45deg);
  position: absolute;
  top: -18px;
  left: 2px;
}
</style>

<div class="wrapper">
  <div class="stat-card">
    <div class="st-stat-label">TOTAL EXPENSES</div>
    <div class="st-stat-value">$1,326.03</div>
    <div class="st-stat-delta up">▲ +5.1% vs last week</div>
  </div>

  <div class="chart">
    <div class="chart-fill"></div>
    <div class="chart-line"></div>
    <div class="chart-dot" data-point="$405.67"></div>
    <div class="chart-grid"></div>
    <div class="y-axis">
      <span>0</span><span>20</span><span>40</span>
      <span>60</span><span>80</span><span>100</span>
    </div>
  </div>

  <div class="x-axis">
    <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span>
    <span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
  </div>
</div>
```

---

### Multi-line chart

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.1.24/exec.min.js" async></script>

<style>
@import((*) from st-core)

@st-root()

/* Chart container — default dataset (line-1) */
.chart {
  position: relative;
  height: 200px;
  @st-chart-points(20, 25, 21, 37, 30, 60, 27, 50)
}

/* Single renderer — all .chart-line elements become lines */
@st-chart-line(.chart-line)

.chart-line {
  @st-chart-line-width(2.5px)
}

/* Line colors and individual datasets */
.line-1 { background: #32D8D4; }

.line-2 {
  background: #E8A030;
  @st-chart-points(10, 20, 16, 15, 66, 50, 80, 54)
}

.line-3 {
  background: #B840C8;
  @st-chart-points(5, 39, 20, 30, 27, 70, 60, 70)
}

@st-chart-grid(.chart-grid, 10, 7)
@st-chart-axis-y(.y-axis)
@st-chart-axis-x(.x-axis)

.chart-grid { opacity: 0.08; }
</style>

<div class="chart">
  <div class="chart-line line-1"></div>
  <div class="chart-line line-2"></div>
  <div class="chart-line line-3"></div>
  <div class="chart-grid"></div>
  <div class="y-axis">
    <span>0</span><span>20</span><span>40</span>
    <span>60</span><span>80</span><span>100</span>
  </div>
</div>

<div class="x-axis">
  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span>
  <span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
</div>
```

---

## 11. Design Token Reference

| Variable | Default | Purpose |
|---|---|---|
| `--st-bg` | `#0e0d14` | Page background |
| `--st-surface` | `#161422` | Surface / chart background |
| `--st-card` | `#1c1a2e` | Card background |
| `--st-accent` | `#9d7eff` | Primary accent (purple) |
| `--st-accent-2` | `#c4a8ff` | Secondary accent (lighter) |
| `--st-accent-dim` | `#3a2e6e` | Dimmed accent |
| `--st-green` | `#4fffb0` | Positive / up delta |
| `--st-red` | `#ff5e7d` | Negative / down delta |
| `--st-text` | `#e8e3ff` | Primary text |
| `--st-muted` | `#6b6488` | Muted / secondary text |
| `--st-border` | `rgba(157,126,255,.15)` | Border color |
| `--st-radius-xl` | `40px` | Phone frame radius |
| `--st-radius-lg` | `16px` | Card radius |
| `--st-radius-md` | `12px` | Medium radius |
| `--st-radius-sm` | `10px` | Small elements (tooltips etc.) |
| `--st-pad` | `24px` | Standard padding |
| `--st-p1` … `--st-p8` | varies | Chart Y values (set by `@st-chart-points`) |
| `--st-chart-line-width` | `1.5px` | Line stroke width |

---

## 12. Tips & Patterns

**Override a token for one component only:**

```css
.revenue-chart {
  --st-accent: #32D8D4;
  --st-accent-2: #80eaff;
}
```

**Multiple independent charts on the same page:**  
Each chart container has its own `@st-chart-points` call, so `--st-p1`–`--st-p8` are scoped. Charts don't interfere with each other.

**Responsive sizing:**  
Charts use `width: 100%` and percentage-based `clip-path`, so they scale naturally with their container. Only `height` needs a fixed value.

**Compile to pure CSS for production:**  
Run `fscss compile` and ship the `.css` file. No FSCSS runtime in production — it's just standard CSS with `clip-path`, `custom properties`, and `linear-gradient`.

```bash
fscss dashboard.fscss dist/dashboard.css
```

**Custom theme after `@st-root()`:**

```css
@st-root()

:root {
  --st-accent:   #00d4ff;
  --st-accent-2: #80eaff;
  --st-bg:       #0a0f1e;
}
```

**Layer order inside `.chart`:**  
For correct visual stacking, place elements in this order:

```html
<div class="chart">
  <div class="chart-fill"></div>   <!-- 1. area fill (bottom) -->
  <div class="chart-line"></div>   <!-- 2. line stroke -->
  <div class="chart-dot"></div>    <!-- 3. dot marker -->
  <div class="chart-grid"></div>   <!-- 4. grid (on top, low opacity) -->
  <div class="y-axis"></div>       <!-- 5. axis labels (top) -->
</div>
```

---

> MIT License · Built with [FSCSS](https://fscss.devtem.org) · [fscss-ttr](https://github.com/fscss-ttr/st-core.fscss)

