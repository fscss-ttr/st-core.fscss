# st-core.fscss

> Pure CSS statistical dashboard components for the FSCSS ecosystem.  
> No JavaScript. No SVG. No canvas — just CSS doing the work.

**MIT Licensed** · [github.com/fscss-ttr/st-core.fscss](https://github.com/fscss-ttr/st-core.fscss)  
Requires FSCSS **v1.1.24+**

---

## Table of Contents

1. [What is st-core?](#1-what-is-st-core)
2. [How It Works](#2-how-it-works)
3. [Installation](#3-installation)
   - [CDN / Runtime](#cdn--runtime)
   - [CLI / Compiled](#cli--compiled)
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
   - [`@st-chart-dots`](#st-chart-dots)
   - [`@st-chart-grid`](#st-chart-grid)
   - [`@st-chart-axis-x`](#st-chart-axis-x)
   - [`@st-chart-axis-y`](#st-chart-axis-y)
7. [Multi-Chart — Multiple Lines, One Renderer](#7-multi-chart--multiple-lines-one-renderer)
8. [JS Control Layer](#8-js-control-layer)
9. [UI Components](#9-ui-components)
   - [`@st-stat-card`](#st-stat-card)
   - [`@st-cat-bar-fill`](#st-cat-bar-fill)
10. [Full Examples](#10-full-examples)
    - [Minimal chart](#minimal-chart)
    - [Single-line chart with tooltip dot](#single-line-chart-with-tooltip-dot)
    - [All-dots chart with `@st-chart-dots`](#all-dots-chart-with-st-chart-dots)
    - [Multi-line chart](#multi-line-chart)
    - [Full dashboard](#full-dashboard)
11. [Design Token Reference](#11-design-token-reference)
12. [Performance, SEO & Bundle Size](#12-performance-seo--bundle-size)
13. [Tips & Patterns](#13-tips--patterns)

---

## 1. What is st-core?

**st-core.fscss** (statistic core) is a lightweight, pure CSS data visualization system built on [FSCSS](https://fscss.devtem.org). It lets you build charts, dashboards, and stat UIs with nothing but CSS variables and modern layout — no JavaScript charting library, no SVG, no canvas.

With optional minimal JavaScript you can dynamically update data by writing CSS custom properties, triggering smooth, native CSS transitions powered entirely by the browser's paint engine.

**Key ideas:**

- Data lives in CSS custom properties (`--st-p1` … `--st-p8`).
- Shapes are rendered via `clip-path: polygon()` — no SVG, no canvas.
- JavaScript is optional — it only writes CSS variables. CSS does the rest.
- In compiled mode, st-core adds **~0.5 kb** to your stylesheet. No external scripts, no remote load, no runtime weight at all.
- In CDN/runtime mode the FSCSS engine itself is **~10 kb**. st-core is fetched as a tiny remote `.fscss` file and compiled in-browser on first load.
- Everything compiles to plain `.css` via the FSCSS CLI for zero-runtime production output.

**Components at a glance:**

| Mixin | What it builds |
|---|---|
| `@st-root` | Design token variables on `:root` |
| `@st-container` | Full-height flex center layout |
| `@st-phone` | Mock phone / device frame |
| `@st-chart-points` | Inject data — sets `--st-p1`–`--st-p8` on a container |
| `@st-chart-fill` | Gradient area fill under the line |
| `@st-chart-line` | Line stroke via `clip-path` polygon |
| `@st-chart-line-width` | Override the stroke thickness |
| `@st-chart-dot` | Single manually-placed data point marker with optional tooltip |
| `@st-chart-dots` | All 8 markers at once, auto-positioned from `--st-p{n}` |
| `@st-chart-grid` | Background grid lines |
| `@st-chart-axis-x` | X-axis label row |
| `@st-chart-axis-y` | Y-axis label column |
| `@st-stat-card` | Stat card: label / value / delta badge |
| `@st-cat-bar-fill` | Gradient progress bar fill |

---

## 2. How It Works

Charts in st-core are pure CSS `clip-path: polygon()` shapes. Eight data points map to CSS custom properties `--st-p1` through `--st-p8`, representing Y positions across fixed X stops.

```
--st-p1  --st-p2  --st-p3  --st-p4  --st-p5  --st-p6  --st-p7  --st-p8
  |        |        |        |        |        |        |        |
 0%      14%      28%      42%      57%      71%      85%     100%   ← X (fixed)
```

The fill, line, and dot elements all inherit these variables from their parent chart container — set data once and every layer reacts.

**Y-axis convention:**  
Values are passed on a `0–100` scale where `100 = top of chart`. st-core inverts them to CSS coordinates internally — you always think in natural terms (bigger = higher on screen).

**The "CSS does the work, JS passes the data" pattern:**  
Updating a chart at runtime is a few property writes:

```js
chart.style.setProperty('--st-p1', '42');
chart.style.setProperty('--st-p2', '65');
// ... etc.
```

No redraw. No DOM manipulation. The browser repaints the polygon instantly.

---

## 3. Installation

### CDN / Runtime

Add the FSCSS runtime to your page — it compiles `fscss` syntax in-browser as the page loads:

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.1.24/exec.min.js" async></script>
```

> **Weight:** ~10 kb for the FSCSS runtime. st-core itself is fetched as a tiny ~0.5 kb `.fscss` source and compiled on first load. Subsequent loads are cached by the browser.

Then import st-core inside any `<style>` block:

```css
/* Import every mixin */
@import((*) from st-core)

/* Or use exec init style */
@import(exec(_init st-core))
```

All `@st-*` mixins are now available.

---

### CLI / Compiled

For production, compile `.fscss` → `.css` with the FSCSS CLI:

```bash
# Install once
npm install -g fscss

# Compile
fscss dashboard.fscss dashboard.css
```

Link the output like any stylesheet:

```html
<link rel="stylesheet" href="dashboard.css">
```

**In compiled mode there is no runtime, no CDN dependency, no remote request.** The output is plain CSS — `clip-path`, custom properties, `linear-gradient` — all standard browser-native features. st-core adds roughly **~0.5 kb** to your compiled stylesheet. Your page loads and renders with zero JavaScript overhead from the chart system.

> The FSCSS VS Code extension also auto-compiles on save: `.fscss` → `.css` whenever you hit save.

**SEO note:** Because compiled st-core charts are pure HTML + CSS with no JavaScript rendering step, crawlers see your page structure immediately. There is no chart library boot time, no hydration phase, and no render-blocking script. This is the recommended approach for any SEO-sensitive page.

---

## 4. Design Tokens — `@st-root`

Call this once at the top of your stylesheet. It writes all design tokens to `:root` (or any custom selector you pass).

```css
@st-root()
/* writes to :root by default */

@st-root(root.html)
/* writes to html element */
```

**What it sets:**

```
Colors:   --st-bg        #0e0d14     page background
          --st-surface   #161422     surface / chart background
          --st-card      #1c1a2e     card background
          --st-accent    #9d7eff     primary accent (purple)
          --st-accent-2  #c4a8ff     secondary accent (lighter)
          --st-accent-dim #3a2e6e    dimmed accent
          --st-green     #4fffb0     positive delta
          --st-red       #ff5e7d     negative delta
          --st-text      #e8e3ff     primary text
          --st-muted     #6b6488     secondary / muted text
          --st-border    rgba(157,126,255,.15)

Radius:   --st-radius-xl  40px
          --st-radius-lg  16px
          --st-radius-md  12px
          --st-radius-sm  10px

Spacing:  --st-pad        24px

Chart:    --st-p1 … --st-p8         (default Y values)
          --st-chart-line-width      1.5px
```

Because these are CSS custom properties, you can override any of them — globally or scoped to a single component:

```css
/* global theme */
:root {
  --st-accent:   #00d4ff;
  --st-accent-2: #80eaff;
  --st-bg:       #0a0f1e;
}

/* scoped — only this chart gets a different accent */
.revenue-chart {
  --st-accent: #32D8D4;
}
```

---

## 5. Layout Helpers

### `@st-container`

Turns any element into a full-viewport flex center — useful for demos and wrappers.

```css
@st-container(body)
@st-container(.app-root)
```

### `@st-phone`

Renders a mock phone / device frame: dark surface, rounded corners, glow box-shadow.

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

**This is how you feed data into a chart.** Call it inside the chart container's CSS block. It sets `--st-p1` through `--st-p8` on that element — all child layers (fill, line, dots) inherit them automatically.

```css
.chart {
  position: relative;
  height: 200px;
  overflow: hidden;

  @st-chart-points(20, 35, 33, 30, 48, 35, 66, 37)
  /*               p1  p2  p3  p4  p5  p6  p7  p8 */
}
```

- 8 values, left to right. `p1` = leftmost point, `p8` = rightmost.
- Scale is `0–100`. Higher = higher on the chart.
- Values are inverted to CSS `%` coordinates internally — you always work in natural chart terms.
- Default fallback (from `@st-root`): a sample dataset so the chart isn't invisible before data arrives.

**Runtime data update:**

```js
const chart = document.querySelector('.chart');
[20, 35, 33, 30, 48, 35, 66, 37].forEach((v, i) => {
  chart.style.setProperty(`--st-p${i + 1}`, 100 - v + '%');
});
```

---

### `@st-chart-fill`

Renders a gradient area fill beneath the line using `clip-path: polygon()`.

```css
@st-chart-fill(.chart-fill)
```

```html
<div class="chart">
  <div class="chart-fill"></div>
</div>
```

The fill color is derived from `--st-accent` at 35% opacity via `color-mix`, fading to transparent at the bottom. Adjust the feel with `opacity`:

```css
.chart-fill { opacity: 0.7; }
```

Or override the accent entirely for this chart:

```css
.chart { --st-accent: #32D8D4; }
```

---

### `@st-chart-line`

Renders the line stroke as a thin `clip-path` polygon — a forward pass (top edge) and a return pass offset by `--st-chart-line-width` (bottom edge).

```css
@st-chart-line(.chart-line)
```

```html
<div class="chart">
  <div class="chart-fill"></div>
  <div class="chart-line"></div>
</div>
```

Line color is `--st-accent`. A `drop-shadow` glow filter is applied automatically. Override for a custom effect:

```css
.chart-line {
  --st-accent: #7012D0;
  filter: drop-shadow(0 0 12px #7012D0);
}
```

---

### `@st-chart-line-width`

Sets the stroke thickness. Call it inside a `.chart-line` block. Writes `--st-chart-line-width` on that element (default from `@st-root` is `1.5px`).

```css
.chart-line {
  @st-chart-line-width(2px)
}

/* thicker for emphasis */
.chart-line {
  @st-chart-line-width(3px)
}
```

---

### `@st-chart-dot`

Places **a single, manually-positioned** circular data point marker. You specify its x position (as a `%` of chart width) and its y value (on the `0–100` scale). Use this when you want to highlight one specific data point — a peak, a selected date, a live cursor position.

```css
@st-chart-dot(selector, x, y)
@st-chart-dot(selector, x, y, size)

/* examples */
@st-chart-dot(.chart-dot, 71, 60)          /* at 71% x, value 60 */
@st-chart-dot(.chart-dot, 71, 60, 14px)    /* custom size */
```

```html
<div class="chart">
  <div class="chart-fill"></div>
  <div class="chart-line"></div>
  <div class="chart-dot" data-point="$405.67"></div>
  <div class="chart-grid"></div>
</div>
```

**Parameters:**

| Param | Default | Description |
|---|---|---|
| `selector` | `.st-chart-dot` | CSS class to target |
| `x` | `0` | Horizontal position — % of chart width (0–100) |
| `y` | `0` | Chart value (0–100 scale, same as `@st-chart-points`) |
| `size` | `12px` | Dot diameter |

The dot renders as a white circle with a `2.5px` border in `--st-accent`. Position it exactly at a data point by matching its x to the x-stop and y to the `@st-chart-points` value:

```css
/* p6 is at x=71%, value=60 */
@st-chart-dot(.chart-dot, 71, 60)
```

**Tooltip via pseudo-elements:**

Add a `data-*` attribute to the dot element, then style `::after` and `::before` to build a floating label with a pointer arrow:

```css
.chart-dot {
  position: relative;
  overflow: visible;
}

/* label bubble */
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

```html
<div class="chart-dot" data-point="$405.67"></div>
```

**Moving the dot dynamically via JS:**

You can reposition the dot at runtime without touching the HTML — just write to its CSS custom properties or inline style:

```js
// Move dot to a new x position and y value
const dot = document.querySelector('.chart-dot');
dot.style.left = `calc(57% - 6px)`;
dot.style.top  = `calc(${100 - 48}% - 6px)`;

// Or update the data label
dot.dataset.point = '$312.40';
```

**Animating the dot to follow live data:**

```js
function moveDot(dotEl, xPct, yValue, label) {
  dotEl.style.left = `calc(${xPct}% - 6px)`;
  dotEl.style.top  = `calc(${100 - yValue}% - 6px)`;
  dotEl.dataset.point = label;
}

// Call on data update
moveDot(document.querySelector('.chart-dot'), 85, 72, '$512.00');
```

---

### `@st-chart-dots`

Generates **all 8 dot markers in a single call** — no manual placement or coordinate math. Each dot is automatically positioned at its chart x-stop and reads its Y from the parent container's `--st-p{n}` variable, so it stays perfectly pinned to the line no matter what data you set.

```css
@st-chart-dots(prefix, size)
/* prefix = class prefix shared by all dot elements */
/* size   = dot diameter (default: 5px)             */

@st-chart-dots(.chart-dot-, 7px)
```

This generates `.chart-dot-1` through `.chart-dot-8`, each positioned at its x-stop (`0%, 14%, 28%, 42%, 57%, 71%, 85%, 100%`) with `top` derived from `var(--st-p{n})`.

```html
<div class="chart">
  <div class="chart-fill"></div>
  <div class="chart-line"></div>
  <div class="chart-dot-1"></div>
  <div class="chart-dot-2"></div>
  <div class="chart-dot-3"></div>
  <div class="chart-dot-4"></div>
  <div class="chart-dot-5"></div>
  <div class="chart-dot-6"></div>
  <div class="chart-dot-7"></div>
  <div class="chart-dot-8"></div>
  <div class="chart-grid"></div>
</div>
```

**Dots automatically track `@st-chart-points` data** — update the parent's CSS variables via JS and all 8 dots reposition instantly.

**Styling a specific dot:**

```css
/* highlight the peak dot */
.chart-dot-6 {
  --st-accent: #c4a8ff;
  z-index: 2;
}
```

**Adding a tooltip to one dot:**

```css
.chart-dot-6 {
  position: relative;
  overflow: visible;
  --st-accent: #c4a8ff;
}

.chart-dot-6::after {
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

.chart-dot-6::before {
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

```html
<div class="chart-dot-6" data-point="$405.67"></div>
```

**When to use `@st-chart-dot` vs `@st-chart-dots`:**

| | `@st-chart-dot` | `@st-chart-dots` |
|---|---|---|
| Use case | Single highlighted point, live cursor, selected value | Show all 8 data points on the line |
| Positioning | Manual — you specify x and y | Automatic — reads `--st-p{n}` |
| HTML | One `<div>` | Eight `<div class="...-1">` through `<div class="...-8">` |
| Dynamic | Reposition via inline style or JS | Re-pinned automatically when `--st-p{n}` changes |

---

### `@st-chart-grid`

Renders horizontal and vertical grid lines using `repeating-linear-gradient`.

```css
@st-chart-grid(selector, rows, cols)
/* defaults: rows=10, cols=7 */

@st-chart-grid(.chart-grid)
@st-chart-grid(.chart-grid, 8, 7)
@st-chart-grid(.chart-grid, 5, 5)
```

```html
<div class="chart">
  <div class="chart-fill"></div>
  <div class="chart-line"></div>
  <div class="chart-grid"></div>
</div>
```

Horizontal lines use `--st-muted`, vertical lines use `--st-accent`. Default opacity is `0.2`. Dial it back for a subtler look:

```css
.chart-grid { opacity: 0.08; }
```

---

### `@st-chart-axis-x`

Styles a flex row of x-axis labels below the chart. Uses `justify-content: space-between` so one `<span>` aligns to each chart column.

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

Label color: `--st-muted`. Font size: `0.8em`. Padding: `--st-pad`.

---

### `@st-chart-axis-y`

Styles a flex column of y-axis labels positioned absolutely inside the chart container. Uses `flex-direction: column-reverse` so labels read bottom-to-top (lowest value at the bottom).

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

Label color: `--st-muted`. Font size: `0.5em`. Opacity: `0.8`. Positioned absolutely, spans full chart height.

---

## 7. Multi-Chart — Multiple Lines, One Renderer

Render multiple independent data series in the same chart container. Declare `@st-chart-line` once — every element with that class becomes a line. Each line element sets its own data via `@st-chart-points`.

```css
/* chart container — default dataset, inherited by line-1 */
.chart {
  position: relative;
  height: 200px;
  @st-chart-points(20, 25, 21, 37, 30, 60, 27, 50)
}

/* single renderer declaration */
@st-chart-line(.chart-line)

.chart-line {
  @st-chart-line-width(2.5px)
}

/* line-1 — inherits container's dataset */
.line-1 { background: #32D8D4; }

/* line-2 — own dataset */
.line-2 {
  background: #E8A030;
  @st-chart-points(10, 20, 16, 15, 66, 50, 80, 54)
}

/* line-3 — own dataset */
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
- Container sets the default dataset — `line-1` inherits it.
- Each additional line overrides with its own `@st-chart-points`.
- `@st-chart-line` is declared once — class membership makes an element a line.
- Line color is `background` on the element.
- Grid and axes sit inside the container once, shared by all lines.

**Updating a specific line at runtime:**

```js
const line2 = document.querySelector('.line-2');
[10, 18, 30, 25, 60, 55, 70, 65].forEach((v, i) => {
  line2.style.setProperty(`--st-p${i + 1}`, 100 - v + '%');
});
```

---

## 8. JS Control Layer

st-core is 100% CSS — JavaScript is entirely optional. When you do need interactivity, the API is the simplest possible: write CSS custom properties.

### Update a chart

```js
function setChartData(el, values) {
  values.forEach((v, i) => {
    el.style.setProperty(`--st-p${i + 1}`, (100 - v) + '%');
  });
}

const chart = document.querySelector('.chart');
setChartData(chart, [20, 35, 40, 55, 48, 72, 60, 80]);
```

### Animate between datasets

```js
function animateTo(el, from, to, duration = 600) {
  const start = performance.now();

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; // ease-in-out

    from.forEach((_, i) => {
      const val = from[i] + (to[i] - from[i]) * ease;
      el.style.setProperty(`--st-p${i + 1}`, (100 - val).toFixed(2) + '%');
    });

    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// Usage
const chart = document.querySelector('.chart');
const prev  = [20, 35, 33, 30, 48, 35, 66, 37];
const next  = [50, 60, 45, 70, 55, 80, 62, 75];

animateTo(chart, prev, next, 800);
```

CSS handles the polygon geometry on every frame — no layout thrash, no redraws, no DOM writes other than the variable updates.

### Live data with `setInterval`

```js
function randomData() {
  return Array.from({ length: 8 }, () => Math.round(Math.random() * 80 + 10));
}

let current = randomData();
const chart = document.querySelector('.chart');

setInterval(() => {
  const next = randomData();
  animateTo(chart, current, next, 500);
  current = next;
}, 2000);
```

### Move a single dot to a highlighted value

```js
function highlightPoint(dotEl, xPct, yValue, label) {
  dotEl.style.left = `calc(${xPct}% - 6px)`;
  dotEl.style.top  = `calc(${100 - yValue}% - 6px)`;
  dotEl.dataset.point = label;
}

highlightPoint(document.querySelector('.chart-dot'), 71, 60, '$405.67');
```

### Click / hover interaction

```js
const dots = document.querySelectorAll('[class^="chart-dot-"]');

dots.forEach((dot, i) => {
  dot.addEventListener('mouseenter', () => {
    dot.dataset.point = `Point ${i + 1}`;
    dot.style.setProperty('--st-accent', '#fff');
  });

  dot.addEventListener('mouseleave', () => {
    dot.style.removeProperty('--st-accent');
  });
});
```

---

## 9. UI Components

### `@st-stat-card`

A dark card with a label, a large value, and a colored delta badge.

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

The mixin styles `.st-stat-label`, `.st-stat-value`, and `.st-stat-delta` as child selectors automatically.

Delta color classes:
- `.up` → `--st-green` (`#4fffb0`)
- `.down` → `--st-red` (`#ff5e7d`)

---

### `@st-cat-bar-fill`

A gradient horizontal progress bar fill. Goes inside a track container. The fill width is driven by `--st-cat-bar-fill-range` so each bar can have its own value.

```css
@st-cat-bar-fill(.cat-bar-fill, 0)
/* second param = base fill width — usually 0, override per element */
```

```html
<div class="cat-bar-track">
  <div class="cat-bar-fill bar-equities"></div>
</div>
```

Set individual bar widths:

```css
.bar-equities { --st-cat-bar-fill-range: 82%; }
.bar-crypto   { --st-cat-bar-fill-range: 61%; }
.bar-forex    { --st-cat-bar-fill-range: 45%; }
```

Gradient runs `--st-accent` → `--st-accent-2` left to right. Update the fill width dynamically:

```js
document.querySelector('.bar-equities')
  .style.setProperty('--st-cat-bar-fill-range', '74%');
```

---

## 10. Full Examples

### Minimal chart

The smallest possible working chart — data, fill, line, nothing else.

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.1.24/exec.min.js" async></script>

<style>
@import((*) from st-core)

@st-root()

@st-chart-fill(.chart-fill)
@st-chart-line(.chart-line)

.chart {
  background: #121112;
  width: 300px;
  height: 200px;
  position: relative;
  @st-chart-points(19, 10, 27, 35, 66, 50, 80, 54)
}

.chart-line {
  --st-accent: #7012D0;
}
</style>

<div class="chart">
  <div class="chart-fill"></div>
  <div class="chart-line"></div>
</div>
```

---

### Single-line chart with tooltip dot

Use `@st-chart-dot` to manually place a single highlighted dot with a floating tooltip label — ideal for showing a selected value, a peak, or a live cursor.

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.1.24/exec.min.js" async></script>

<style>
@import((*) from st-core)

@st-root()
@st-container(body)
@st-phone(.wrapper)

@st-chart-fill(.chart-fill)
@st-chart-line(.chart-line)
@st-chart-dot(.chart-dot, 71, 60)
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

### All-dots chart with `@st-chart-dots`

Use `@st-chart-dots` to show all 8 data points at once, pinned to the line automatically. Highlight one specific dot with a tooltip.

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.1.24/exec.min.js" async></script>

<style>
@import((*) from st-core)

@st-root()

@st-chart-fill(.chart-fill)
@st-chart-line(.chart-line)
@st-chart-dots(.chart-dot-, 7px)
@st-chart-grid(.chart-grid)
@st-chart-axis-x(.x-axis)

.chart {
  background: #121112;
  width: 300px;
  height: 200px;
  position: relative;
  @st-chart-points(19, 10, 27, 35, 66, 50, 80, 54)
}

.chart-line { --st-accent: #7012D0; }

/* highlight the peak dot */
.chart-dot-7 {
  position: relative;
  overflow: visible;
  --st-accent: #c4a8ff;
}

.chart-dot-7::after {
  content: attr(data-point);
  background: var(--st-accent);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  position: absolute;
  top: -34px;
  left: -18px;
  white-space: nowrap;
}

.chart-dot-7::before {
  content: '';
  width: 7px;
  height: 7px;
  background: var(--st-accent);
  transform: rotate(45deg);
  position: absolute;
  top: -14px;
  left: 2px;
}
</style>

<div class="chart">
  <div class="chart-fill"></div>
  <div class="chart-line"></div>
  <div class="chart-dot-1"></div>
  <div class="chart-dot-2"></div>
  <div class="chart-dot-3"></div>
  <div class="chart-dot-4"></div>
  <div class="chart-dot-5"></div>
  <div class="chart-dot-6"></div>
  <div class="chart-dot-7" data-point="80%"></div>
  <div class="chart-dot-8"></div>
  <div class="chart-grid"></div>
</div>

<div class="x-axis">
  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span>
  <span>Fri</span><span>Sat</span><span>Sun</span><span>Mon</span>
</div>
```

---

### Multi-line chart

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.1.24/exec.min.js" async></script>

<style>
@import((*) from st-core)

@st-root()

.chart {
  position: relative;
  height: 200px;
  background: var(--st-surface);
  border-radius: var(--st-radius-lg);
  overflow: hidden;
  @st-chart-points(20, 25, 21, 37, 30, 60, 27, 50)
}

@st-chart-line(.chart-line)

.chart-line { @st-chart-line-width(2.5px) }

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

### Full dashboard

A complete phone-frame dashboard with stat card, line chart, all dots, grid, axes, and category bars.

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.1.24/exec.min.js" async></script>

<style>
@import((*) from st-core)

@st-root()
@st-container(body)
@st-phone(.wrapper)

@st-stat-card(.stat-card)
@st-chart-fill(.chart-fill)
@st-chart-line(.chart-line)
@st-chart-dots(.chart-dot-, 8px)
@st-chart-grid(.chart-grid, 10, 7)
@st-chart-axis-x(.x-axis)
@st-chart-axis-y(.y-axis)
@st-cat-bar-fill(.bar-fill)

.chart {
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
  background: var(--st-surface);
  border-radius: var(--st-radius-lg);
  @st-chart-points(20, 25, 21, 37, 30, 60, 27, 50)
}

.chart-line {
  @st-chart-line-width(2px)
  filter: drop-shadow(0 0 8px var(--st-accent));
}

.chart-fill  { opacity: 0.85; }
.chart-grid  { opacity: 0.08; }

/* peak dot tooltip */
.chart-dot-6 {
  position: relative;
  overflow: visible;
  --st-accent: #c4a8ff;
}

.chart-dot-6::after {
  content: attr(data-point);
  background: var(--st-accent);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 9px;
  border-radius: var(--st-radius-sm);
  position: absolute;
  top: -38px;
  left: -22px;
  white-space: nowrap;
}

.chart-dot-6::before {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--st-accent);
  transform: rotate(45deg);
  position: absolute;
  top: -16px;
  left: 2px;
}

/* category bars */
.bar-track {
  height: 6px;
  background: var(--st-accent-dim);
  border-radius: 999px;
  overflow: hidden;
  margin: 6px 0;
}

.bar-equities { --st-cat-bar-fill-range: 82%; }
.bar-crypto   { --st-cat-bar-fill-range: 61%; }
.bar-forex    { --st-cat-bar-fill-range: 45%; }
</style>

<div class="wrapper" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">

  <div class="stat-card">
    <div class="st-stat-label">Portfolio Value</div>
    <div class="st-stat-value">$84,201</div>
    <div class="st-stat-delta up">▲ +12.4% this month</div>
  </div>

  <div class="chart">
    <div class="chart-fill"></div>
    <div class="chart-line"></div>
    <div class="chart-dot-1"></div>
    <div class="chart-dot-2"></div>
    <div class="chart-dot-3"></div>
    <div class="chart-dot-4"></div>
    <div class="chart-dot-5"></div>
    <div class="chart-dot-6" data-point="$405.67"></div>
    <div class="chart-dot-7"></div>
    <div class="chart-dot-8"></div>
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

  <div>
    <p style="color: var(--st-muted); font-size: 11px; letter-spacing:.08em; text-transform:uppercase; margin-bottom:12px;">Allocation</p>

    <p style="color:var(--st-text); font-size:13px;">Equities <span style="color:var(--st-muted); float:right">82%</span></p>
    <div class="bar-track">
      <div class="bar-fill bar-equities"></div>
    </div>

    <p style="color:var(--st-text); font-size:13px;">Crypto <span style="color:var(--st-muted); float:right">61%</span></p>
    <div class="bar-track">
      <div class="bar-fill bar-crypto"></div>
    </div>

    <p style="color:var(--st-text); font-size:13px;">Forex <span style="color:var(--st-muted); float:right">45%</span></p>
    <div class="bar-track">
      <div class="bar-fill bar-forex"></div>
    </div>
  </div>

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
| `--st-accent-2` | `#c4a8ff` | Secondary accent (lighter purple) |
| `--st-accent-dim` | `#3a2e6e` | Dimmed accent — bar track, subtle fills |
| `--st-green` | `#4fffb0` | Positive / up delta |
| `--st-red` | `#ff5e7d` | Negative / down delta |
| `--st-text` | `#e8e3ff` | Primary text |
| `--st-muted` | `#6b6488` | Secondary / muted text, axis labels |
| `--st-border` | `rgba(157,126,255,.15)` | Border / divider color |
| `--st-radius-xl` | `40px` | Phone frame radius |
| `--st-radius-lg` | `16px` | Card / chart radius |
| `--st-radius-md` | `12px` | Medium radius |
| `--st-radius-sm` | `10px` | Small elements — tooltips, badges |
| `--st-pad` | `24px` | Standard padding |
| `--st-p1` … `--st-p8` | varies | Chart Y values — set by `@st-chart-points` |
| `--st-chart-line-width` | `1.5px` | Line stroke width |
| `--st-cat-bar-fill-range` | `0` | Category bar fill width — set per element |

---

## 12. Performance, SEO & Bundle Size

**Compiled mode (~0.5 kb)**

When you compile with the FSCSS CLI, st-core contributes roughly **~0.5 kb** to your stylesheet. There is no runtime script, no remote request, no external dependency. Your page loads and paints the chart with zero JavaScript overhead from the charting system — it's just CSS.

```bash
fscss dashboard.fscss dist/dashboard.css
```

**CDN / runtime mode (~10 kb)**

When using the CDN runtime, the FSCSS engine is ~10 kb (minified). st-core itself is fetched as a tiny remote `.fscss` file and compiled in-browser on first load, then cached. This is the right choice for rapid prototyping and development — ship compiled output for production.

**SEO**

Because st-core charts are pure HTML + CSS with no JavaScript rendering step:

- Crawlers see the page structure immediately — no hydration phase, no render-blocking script.
- No chart library boot time means faster Time to First Contentful Paint.
- HTML content (labels, axis values, stat cards) is fully indexable.
- In compiled mode there are zero third-party requests from the chart layer.

**Animations are free**

When you update `--st-p{n}` variables via JavaScript, the browser recomputes the `clip-path` polygon geometry natively — no layout thrash, no DOM writes beyond the variable update, no redraws of surrounding content. Add a CSS transition for smooth animation at zero JS cost:

```css
.chart-fill,
.chart-line {
  transition: clip-path 600ms ease-in-out;
}
```

---

## 13. Tips & Patterns

**Override a token for one component only:**

```css
.revenue-chart {
  --st-accent:   #32D8D4;
  --st-accent-2: #80eaff;
}
```

**Multiple independent charts on the same page:**  
Each chart container has its own `@st-chart-points` call, so `--st-p1`–`--st-p8` are scoped to that element. Charts don't bleed into each other.

**Responsive sizing:**  
Charts use `width: 100%` and percentage-based `clip-path`, so they scale naturally with their container. Only `height` needs a fixed value.

**Smooth CSS transitions on data update:**

```css
.chart-fill,
.chart-line {
  transition: clip-path 500ms ease-in-out;
}
```

Update the variables via JS and the browser animates the polygon automatically.

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
For correct visual stacking, place child elements in this order:

```html
<div class="chart">
  <div class="chart-fill"></div>    <!-- 1. area fill (bottom) -->
  <div class="chart-line"></div>    <!-- 2. line stroke -->
  <div class="chart-dot"></div>     <!-- 3a. single dot (@st-chart-dot) -->
  <div class="chart-dot-1"></div>   <!-- 3b. or all 8 dots (@st-chart-dots) -->
  ...
  <div class="chart-dot-8"></div>
  <div class="chart-grid"></div>    <!-- 4. grid (on top, low opacity) -->
  <div class="y-axis"></div>        <!-- 5. axis labels (top) -->
</div>
```

**Hide dots you don't need:**

```css
.chart-dot-1,
.chart-dot-2 {
  display: none;
}
```

**Use `data-point` on any dot for a no-JS tooltip:**

```html
<div class="chart-dot-5" data-point="$312"></div>
```

```css
.chart-dot-5::after {
  content: attr(data-point);
  /* ... tooltip styles */
}
```

No JavaScript needed — `attr()` reads the HTML attribute directly in CSS.

---

[Add your idea](https://github.com/fscss-ttr/st-core.fscss/CONTRIBUTING.md)

> MIT License · Built with [FSCSS](https://fscss.devtem.org) · [fscss-ttr](https://github.com/fscss-ttr)

