# guide to st-core.fscss

> **st-core.fscss** — Lightweight FSCSS-based UI library for statistical dashboards and components.  
> MIT Licensed · [github.com/fscss-ttr/st-core.fscss](https://github.com/fscss-ttr/st-core.fscss)  
> Requires FSCSS **v1.1.24+**

---

## Table of Contents

1. [What is st-core?](#1-what-is-st-core)
2. [Installation](#2-installation)
3. [Design Tokens — `@st-root`](#3-design-tokens--st-root)
4. [Layout Helpers](#4-layout-helpers)
   - [`@st-container`](#st-container)
   - [`@st-phone`](#st-phone)
5. [Chart System](#5-chart-system)
   - [How the chart system works](#how-it-works)
   - [`@st-chart-points` — setting data](#st-chart-points)
   - [`@st-chart-fill` — area fill](#st-chart-fill)
   - [`@st-chart-line` — line stroke](#st-chart-line)
   - [`@st-chart-line-width` — stroke thickness](#st-chart-line-width)
   - [`@st-chart-dot` — data point marker](#st-chart-dot)
   - [`@st-chart-grid` — background grid](#st-chart-grid)
   - [`@st-chart-axis-x` — x-axis labels](#st-chart-axis-x)
   - [`@st-chart-axis-y` — y-axis labels](#st-chart-axis-y)
6. [UI Components](#6-ui-components)
   - [`@st-stat-card` — statistic card](#st-stat-card)
   - [`@st-cat-bar-fill` — category bar](#st-cat-bar-fill)
7. [Full Example](#7-full-example)
8. [Design Token Reference](#8-design-token-reference)
9. [Tips & Patterns](#9-tips--patterns)

---

## 1. What is st-core?

st-core is an FSCSS plugin that gives you a complete design system and set of chart/dashboard components — built entirely in CSS. No JavaScript. No SVG. No canvas.

Everything is driven by FSCSS mixins (`@st-*`) and CSS custom properties. You call a mixin once, point it at a selector, and the component styles itself.

**Components included:**

| Mixin | What it builds |
|---|---|
| `@st-root` | Design token variables on `:root` |
| `@st-container` | Full-height flex layout |
| `@st-phone` | Mock phone/device frame |
| `@st-chart-fill` | Area fill under a line chart |
| `@st-chart-line` | Line stroke on a chart |
| `@st-chart-dot` | Positioned data point dot |
| `@st-chart-grid` | Background grid lines |
| `@st-chart-axis-x` | X-axis label row |
| `@st-chart-axis-y` | Y-axis label column |
| `@st-chart-points` | Inject data into a chart container |
| `@st-chart-line-width` | Override line stroke width |
| `@st-stat-card` | Statistic card with label/value/delta |
| `@st-cat-bar-fill` | Gradient progress bar fill |

---

## 2. Installation
> We are using FSCSS runtime in this demo. 
  
**Add the FSCSS runtime** to your HTML (use `async` or `defer`):

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.1.24/exec.min.js" async></script>
```

**Import st-core** in your `<style>` block, since we are using cdn in this example. Two ways:

```css
/* Import everything */
@import((*) from st-core)

/* Or use exec init style */
@import(exec(_init st-core))
```

That's it. All `@st-*` mixins are now available.

---

## 3. Design Tokens — `@st-root`

Call this once. It writes all CSS custom properties onto your root element.

```css
@st-root()
/* defaults to :root */

/* or target a custom root */
@st-root(html)
```

**What it sets:**

```
Colors:   --st-bg, --st-surface, --st-card
          --st-accent, --st-accent-2, --st-accent-dim
          --st-green, --st-red
          --st-text, --st-muted, --st-border

Radius:   --st-radius-xl (40px), --st-radius-lg (16px),
          --st-radius-md (12px), --st-radius-sm (10px)

Spacing:  --st-pad (24px)

Chart:    --st-p1 … --st-p8  (default Y values)
          --st-chart-line-width (1.5px)
```

You can override any token locally by redefining the variable on a child element — they're just CSS custom properties.

```css
.my-section {
  --st-accent: #ff6b6b;  /* local accent override */
}
```

---

## 4. Layout Helpers

### `@st-container`

Turns a selector into a full-viewport flex center. Good for demo pages.

```css
@st-container(body)

/* custom selector */
@st-container(.app-root)
```

### `@st-phone`

Renders a mock phone/device frame — dark surface, rounded corners, glow shadow, border.

```css
@st-phone(.phone-wrapper)
```

```html
<div class="phone-wrapper">
  <!-- your dashboard content -->
</div>
```

---

## 5. Chart System

### How it works

Charts are pure CSS `clip-path: polygon()` shapes. Each point on the chart maps to a CSS custom property `--st-p1` through `--st-p8` (Y-axis values, as percentages from the top).

The chart container must be `position: relative; overflow: hidden`. Fill, line, grid, and dot elements sit `position: absolute; inset: 0` inside it.

**Key mental model:**  
- Y values are expressed as a percentage **from the top** (CSS convention).  
- So a value of `20%` means near the top (high on the chart), `80%` means near the bottom (low).  
- `@st-chart-points` handles the conversion — you pass normal values (low number = low on chart), it inverts them for you.

---

### `@st-chart-points`

**This is how you feed data to a chart.** Call it inside the chart container's CSS block.

```css
.chart {
  position: relative;
  height: 200px;
  overflow: hidden;

  @st-chart-points(20, 35, 33, 30, 48, 35, 66, 37)
  /*               p1  p2  p3  p4  p5  p6  p7  p8 */
}
```

- Takes 8 values (p1–p8), representing Y positions left to right.
- Values are treated as `0–100` scale. Higher number = higher on the chart.
- Writes `--st-p1` … `--st-p8` as CSS variables on the container.
- The fill, line, and grid elements inside will automatically use these values.

**Default values:** `0, 0, 0, 0, 0, 0, 0, 0`

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

The fill reads `--st-p1`–`--st-p8` from the parent chart container. Color comes from `--st-accent`.

Optional tweaks:

```css
.chart-fill {
  opacity: .7;
}
```

---

### `@st-chart-line`

Renders the line stroke. Uses the same `clip-path` polygon trick — the "line" is a thin filled shape with a defined thickness.

```css
@st-chart-line(.chart-line)
```

```html
<div class="chart">
  <div class="chart-fill"></div>
  <div class="chart-line"></div>
</div>
```

The line has a default `filter: drop-shadow` glow using `--st-accent`. You can override:

```css
.chart-line {
  filter: drop-shadow(0 0 10px var(--st-accent-2));
}
```

---

### `@st-chart-line-width`

Sets the line stroke thickness. Call it inside `.chart-line`'s block.

```css
.chart-line {
  @st-chart-line-width(2px)
}
```

Writes `--st-chart-line-width` on that element. The default (from `@st-root`) is `1.5px`.

---

### `@st-chart-dot`

Places a circular data point marker at a specific `(x, y)` coordinate on the chart.

```css
@st-chart-dot(.chart-dot, x, y)
/* x = left position in % (0–100) */
/* y = value on chart (0–100, same scale as @st-chart-points) */
```

Example — dot at x=57%, y=42 (maps to 42% high on the chart):

```css
@st-chart-dot(.chart-dot, 57, 42)
```

```html
<div class="chart">
  <div class="chart-fill"></div>
  <div class="chart-line"></div>
  <div class="chart-dot" data-point="$405.67"></div>
</div>
```

**Adding a tooltip** — use `::after` with `attr(data-point)`:

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

/* tooltip arrow */
.chart-dot::before {
  content: '';
  width: 8px; height: 8px;
  background: var(--st-accent);
  transform: rotate(45deg);
  position: absolute;
  top: -16px;
  left: 2px;
}
```

The dot size defaults to `12px`. You can override via the optional `size` param:

```css
@st-chart-dot(.chart-dot, 57, 42, 16px)
```

---

### `@st-chart-grid`

Renders horizontal and vertical grid lines using `repeating-linear-gradient`.

```css
@st-chart-grid(.chart-grid, rows, cols)
/* defaults: rows=10, cols=7 */
```

```css
@st-chart-grid(.chart-grid, 8, 7)
```

```html
<div class="chart">
  <div class="chart-fill"></div>
  <div class="chart-line"></div>
  <div class="chart-grid"></div>
</div>
```

Horizontal lines use `--st-muted`, vertical lines use `--st-accent`. Opacity is `0.2` by default. Override as needed:

```css
.chart-grid {
  opacity: .1;
}
```

---

### `@st-chart-axis-x`

Styles a flex row of x-axis labels (days, times, categories, etc.).

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

Uses `justify-content: space-between` — one `<span>` per chart column. Font color: `--st-muted`.

---

### `@st-chart-axis-y`

Styles a flex column of y-axis labels positioned absolutely inside the chart.

```css
@st-chart-axis-y(.y-axis)
```

```html
<div class="chart">
  <div class="chart-fill"></div>
  <div class="y-axis">
    <span>0</span>
    <span>25</span>
    <span>50</span>
    <span>75</span>
    <span>100</span>
  </div>
</div>
```

Uses `flex-direction: column-reverse` so labels read bottom-to-top (low values at the bottom). Labels are `position: absolute` inside the chart.

---

## 6. UI Components

### `@st-stat-card`

A dark card with a label, large value, and a delta badge (up/down).

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

**Delta color classes:**
- `.up` → `--st-green`
- `.down` → `--st-red`

The mixin also styles `.st-stat-label`, `.st-stat-value`, and `.st-stat-delta` as child selectors automatically.

---

### `@st-cat-bar-fill`

A gradient horizontal progress bar fill. Goes inside a track container.

```css
@st-cat-bar-fill(.cat-bar-fill, range)
/* range = fill width as a number (written as % internally) */
```

```css
@st-cat-bar-fill(.cat-bar-fill, 0)
```

```html
<div class="cat-bar-track" style="height:8px; background: var(--st-surface); border-radius:999px; overflow:hidden;">
  <div class="cat-bar-fill"></div>
</div>
```

To set individual bar widths, override `--st-cat-bar-fill-range` per element:

```css
.bar-equities { --st-cat-bar-fill-range: 82%; }
.bar-crypto   { --st-cat-bar-fill-range: 61%; }
.bar-forex    { --st-cat-bar-fill-range: 45%; }
```

Gradient runs `--st-accent` → `--st-accent-2` (left to right).

---

## 7. Full Example

A minimal but complete dashboard page:

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.1.24/exec.min.js" async></script>

<style>
@import((*) from st-core)

/* ================= INIT ================= */

@st-root()
@st-container(body)

/* ================= COMPONENTS ================= */

@st-chart-fill(.chart-fill)
@st-chart-line(.chart-line)
@st-chart-dot(.chart-dot, 70, 60)

/* ================= CHART ================= */

.chart{
  width: 100%;
  height: 200px;
  border-radius: 25px;
  position: relative;
  overflow: hidden;

  background: var(--st-surface);

  /*  DATA (main power) */
  @st-chart-points(20,25,21,37,30,60,27,50)
}
@st-phone(.wrapper)
/* ================= LINE ================= */

.chart-line{
  /* controlled via helper */
  @st-chart-line-width(2px);

  /* optional override */
  filter: drop-shadow(0 0 8px var(--st-accent));
}

/* ================= FILL ================= */

.chart-fill{
  /* enhance fill visibility */
  opacity: .85;
}

/* ================= DOT ================= */

.chart-dot{
  position: relative;
  overflow: visible;

  /*  local customization */
  --st-accent: #c4a8ff; /* overrides root accent just for dot */
}

/* tooltip */
.chart-dot:after{
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

/* arrow */
.chart-dot:before{
  content: '';
  width: 10px;
  height: 10px;
  background: var(--st-accent);
  transform: rotate(45deg);
  position: absolute;
  top: -18px;
  left: 2px;
}

/* ================= EXTRA (USING st-core IDEA) ================= */


@st-stat-card(.stat-card)
@st-chart-axis-x(.x-axis)
@st-chart-axis-y(.y-axis)



@st-chart-grid(.chart-grid, 10, 7)
</style>
<div class="wrapper">
    <div class="stat-card">
    <div class="st-stat-label">TOTAL EXPENSES</div>
    <div class="st-stat-value">$1,326.03</div>
    <div class="st-stat-delta up">+5.1% vs last week</div>
  </div>
<div class="chart">
  <div class="chart-fill"></div>
  <div class="chart-line"></div>
  <div class="chart-dot" data-point="$405.67"></div>
  <div class="chart-grid"></div>
   <div class="y-axis">
   <span>0</span>
   <span>10</span>
   <span>20</span>
   <span>30</span>
   <span>40</span>
   <span>50</span>
   <span>60</span>
   <span>70</span>
   <span>80</span>
   <span>90</span>
   <span>100</span>
 </div>
  </div>
        <div class="x-axis days">
      <span>Sun</span>
      <span>Mon</span>
      <span>Tue</span>
      <span>Wed</span>
      <span>Thu</span>
      <span>Fri</span>
      <span>Sat</span>
      <span>Sun</span>
    </div>
   
  </div>
  
```

---

## 8. Design Token Reference

| Variable | Default | Purpose |
|---|---|---|
| `--st-bg` | `#0e0d14` | Page background |
| `--st-surface` | `#161422` | Surface / chart bg |
| `--st-card` | `#1c1a2e` | Card background |
| `--st-accent` | `#9d7eff` | Primary accent (purple) |
| `--st-accent-2` | `#c4a8ff` | Secondary accent (lighter) |
| `--st-accent-dim` | `#3a2e6e` | Dimmed accent |
| `--st-green` | `#4fffb0` | Positive / up delta |
| `--st-red` | `#ff5e7d` | Negative / down delta |
| `--st-text` | `#e8e3ff` | Primary text |
| `--st-muted` | `#6b6488` | Secondary / muted text |
| `--st-border` | `rgba(157,126,255,.15)` | Borders |
| `--st-radius-xl` | `40px` | Phone frame radius |
| `--st-radius-lg` | `16px` | Card radius |
| `--st-radius-md` | `12px` | Medium radius |
| `--st-radius-sm` | `10px` | Small (tooltip etc.) |
| `--st-pad` | `24px` | Standard padding |
| `--st-p1` … `--st-p8` | varies | Chart Y values |
| `--st-chart-line-width` | `1.5px` | Line stroke width |

---

## 9. Tips & Patterns

**Override a token just for one component:**

```css
.chart-dot {
  --st-accent: var(--st-accent-2); /* lighter dot color */
}
```

**Multiple charts on the same page:**  
Each chart container sets its own `--st-p1`–`--st-p8` via `@st-chart-points`, so charts are fully independent.

**Responsive chart:**  
The chart uses `width: 100%` and percentage-based clip-path, so it scales naturally. Just set `height` in fixed units.

**Combining with your own styles:**  
st-core sets only what you invoke. You can add any CSS alongside the `@st-*` mixins — they don't conflict with other selectors.

**Custom color theme:**  
Override tokens after `@st-root()`:

```css
@st-root()

:root {
  --st-accent: #00d4ff;
  --st-accent-2: #80eaff;
  --st-bg: #0a0f1e;
}
```

---

> MIT License · Built with [FSCSS](https://fscss.devtem.org) · [fscss-ttr](https://github.com/fscss-ttr)

