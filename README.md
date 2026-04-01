# st-core

**st-core** is a lightweight FSCSS-based UI library for statistical dashboards and components. It provides a design system of CSS variables (colors, spacing, radii, etc.) and reusable plugins for data-driven UI:

- **Chart components:** built with pure CSS (no JS). Includes a filled area chart (`st-chart-fill`), a line chart (`st-chart-line`), and a data point marker (`st-chart-dot`) that can be positioned on the chart. These use CSS `clip-path` and custom properties to define and animate chart shapes.
- **Category bar fill:** a simple bar fill component (`st-cat-bar-fill`) for showing progress along a bar.
- **Statistic cards:** a card layout (`st-stat-card`) with numeric value, label, and delta styling.  
- **Layout helpers:** a full-height container (`st-container`) and a mock phone frame (`st-phone`).

st-core is implemented entirely in CSS/FSCSS, following the same **FSCSS plugin logic** as libraries like the [Circle Progress component](https://github.com/Figsh/Circle-progress.fscss). No JavaScript is required for the charts or cards; all behavior comes from FSCSS directives and CSS variables【7†L1-L9】.

## Installation

Include FSCSS v1.1.24 or higher, then import **st-core** via `@import`:

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.1.24/exec.min.js" defer></script>
```
This (better) 
```scss
@import(exec(_init st-core))
```
Or this 
```scss
@import((*) from st-core)
```

The library supports FSCSS **1.1.24+**. Once imported, you can use the st-core plugins and variables in your CSS.

## Usage

First, initialize the design tokens on the root element:

```scss
@st-root()
@st-container(body)
```

This sets up the CSS custom properties (colors, spacing, chart defaults, etc.) and applies the `st-container` flex layout to `<body>`. The `st-root()` call must be made once in your stylesheet (usually on `:root` or `html`).

### Charts

Use the chart plugins to create a chart container and its elements:

```scss
@st-chart-fill(.chart-fill)
@st-chart-line(.chart-line)
@st-chart-dot(.chart-dot, x, y)
```

- `@st-chart-fill(selector)` styles a block with the filled area below the line.
- `@st-chart-line(selector)` styles the line of the chart.
- `@st-chart-dot(selector, x, y)` positions a point at percentage `(x,y)` on the chart.

In your HTML/CSS, define the chart dimensions and provide data:

```scss
.chart {
  position: relative;
  width: 300px;
  height: 300px;
  border-radius: 25px;
  overflow: hidden;

  /* Set the data points (y-values in %) */
  @st-chart-points(20, 35, 33, 30, 48, 35, 66, 37)
}
```

This call sets custom properties `--st-p1` through `--st-p8` based on the provided percentages. The chart elements use these values via `clip-path`.

You can also adjust the stroke width of the line:

```scss
.chart-line {
  @st-chart-line-width(2px)
}
```

### Stat Cards and Bars

Define a stat card:

```scss
@st-stat-card(.st-stat-card)
```

Then in HTML:

```html
<div class="st-stat-card">
  <div class="st-stat-label">Revenue</div>
  <div class="st-stat-value">$1.2M</div>
  <div class="st-stat-delta up">+5%</div>
</div>
```

Category bars use:

```scss
@st-cat-bar-fill(.st-cat-bar-fill, 50)
```

This creates a colored bar fill up to `50%` width inside its container.

## Example

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.1.24/exec.min.js" defer></script>
<style>
@import(exec(*) from st-core)

/* Initialize root and layout */
@st-root()
@st-container(body)

/* Chart components */
@st-chart-fill(.chart-fill)
@st-chart-line(.chart-line)
@st-chart-dot(.chart-dot, 84, 66)

/* Chart container */
.chart {
  position: relative;
  width: 300px;
  height: 300px;
  border-radius: 25px;
  border: 2px solid var(--st-accent);
  overflow: hidden;

  /* Define 8 data points (y-values) */
  @st-chart-points(20, 35, 33, 30, 48, 35, 66, 37)
}

/* Customize line thickness */
.chart-line {
  @st-chart-line-width(2px)
}

/* Style for the data point */
.chart-dot {
  position: relative;
  overflow: visible;
}

/* Tooltip on the dot */
.chart-dot:after {
  content: attr(data-point);
  background: var(--st-accent);
  color: #fff;
  font-weight: 700;
  padding: 5px;
  font-size: 12px;
  border-radius: 10px;
  position: absolute;
  top: -35px;
  left: -17px;
}
.chart-dot:before {
  content: '';
  background: var(--st-accent);
  padding: 10px;
  transform: rotate(45deg);
  position: absolute;
  top: -29px;
  left: -5px;
}
</style>

<div class="chart">
  <div class="chart-fill"></div>
  <div class="chart-line"></div>
  <div class="chart-dot" data-point="$45.07"></div>
</div>
```

In this example, `@st-chart-points` provides the data. The line and fill are drawn automatically from those values, and the dot is positioned at (84%, 66%). All colors and sizes come from the design tokens defined by `@st-root()`.

## License

st-core is open source and free to use under the MIT License.

