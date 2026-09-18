# st-core.fscss, explained

This document walks through `st-core.fscss` mixin by mixin, so anyone opening the source for the first time can see what each block does and how it fits together, without needing to trace FSCSS's compiler internally.

Every block in the file is an `@define` mixin. When a mixin is called elsewhere, FSCSS expands its body and replaces every `@use(...)` with the argument that was passed in. Nothing here reaches the browser as FSCSS syntax; by the time it ships, it's plain CSS.

## Mechanisms used in this file

| Mechanism | Purpose here |
|---|---|
| `@define name(params)` | Declares a reusable mixin |
| `@use(param)` | Injects an argument value at expansion time |
| Backtick string | Wraps a multi-line CSS body inside a mixin |
| `num(...)` | Compile-time arithmetic |
| `%2(prop1, prop2[: val;])` | Shorthand for assigning one value to two properties |
| `@arr name[...]` | Declares an array |
| `@arr.name[]` | Loops over every item in an array, expanding the call once per item |
| `$token` / `var(--st-*)` | Design tokens, referenced either as an FSCSS variable or a compiled custom property |
| `clip-path: polygon()` | Shape drawing, used for the chart fill and line |
| `color-mix()` | Native CSS color mixing, used for the fill gradient |

## `st-root(root: root)`

```fscss
@define st-root(root:root){`
:@use(root){
  /* colors, radii, spacing, chart defaults ... */
}
`}
```

Writes the full design-token set: colors, radii, spacing, and the eight default chart data points (`--st-p1` through `--st-p8`), plus the peak marker and line-width defaults. `@use(root)` becomes whatever selector is passed in, defaulting to `:root`. The backtick string is the literal CSS rule body that gets emitted.

Expands to something like:

```css
:root {
  --st-bg: #0e0d14;
  --st-surface: #161422;
  ...
  --st-p1: 68%; ... --st-p8: 55%;
  --st-chart-line-width: 1.5px;
}
```

Call this once, near the top of a stylesheet, before anything else in the file is used, since every other mixin here reads from the tokens it sets.

## `st-chart(...)` and `st-chart-points(...)`

```fscss
@define st-chart(p1: 88, p2: 59, p3: 70, p4: 35, p5: 58, p6: 22, p7: 42, p8: 55){
  --st-p1: num(100 - @use(p1))%;
  ...
}
```

Both mixins take eight parameters and write the eight `--st-pN` custom properties that every chart-drawing mixin below reads from. `num(100 - @use(pN))` is where the actual data transform happens: a human-friendly value (say, 70, meaning "70% up the chart") is inverted into a CSS top-offset percentage, since positioning from the top of the container is the opposite direction from a chart's usual bottom-up reading.

`st-chart` and `st-chart-points` are identical in structure; they exist as two names with different default values so a chart can be reset to its defaults with one and given real data with the other.

## `st-container(st: body)`

```fscss
@define st-container(st:body){`
  @use(st){
    min-height: 100vh;
    background: var(--st-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    color: var(--st-text);
    padding: var(--st-pad);
  }
`}
```

A single-parameter mixin that turns whatever selector you pass (default `body`) into a full-viewport, centered flex container, styled from the tokens `st-root` set up.

## `st-phone(st: .st-phone)`

```fscss
@define st-phone(st:.st-phone){`
  @use(st){
    width: 360px;
    background: var(--st-surface);
    border-radius: var(--st-radius-xl);
    border: 1px solid var(--st-border);
    overflow: hidden;
    box-shadow: ...;
  }
`}
```

Applies a fixed-width device-frame look: a 360px surface with rounded corners, a subtle border, and a layered `box-shadow` for depth. Purely presentational, built entirely from tokens.

## `st-chart-fill(st: .st-chart-fill)`

```fscss
clip-path: polygon(
  0% var(--st-p1),
  14% var(--st-p2),
  28% var(--st-p3),
  42% var(--st-p4),
  57% var(--st-p5),
  71% var(--st-p6),
  85% var(--st-p7),
  100% var(--st-p8),
  100% 100%,
  0% 100%
);
background: linear-gradient(180deg, color-mix(in srgb, var(--st-accent) 35%, transparent), transparent);
```

Builds the shaded area under the chart line. The first eight polygon points trace the data curve using the `--st-pN` variables; the last two (`100% 100%`, `0% 100%`) close the shape down to the bottom edge of the container, turning a line into a filled area. The gradient fades a 35%-opacity accent color into transparency using native `color-mix()`.

## `st-chart-line-width(st)`

```fscss
@define st-chart-line-width(st){
  --st-chart-line-width: @use(st);
}
```

A one-line mixin whose only job is writing the `--st-chart-line-width` custom property, which the line mixin below reads to control stroke thickness.

## `st-chart-line(st: .st-chart-line)`

```fscss
clip-path: polygon(
  0% var(--st-p1), ... 100% var(--st-p8),
  100% calc(var(--st-p8) + var(--st-chart-line-width)),
  ...
  0% calc(var(--st-p1) + var(--st-chart-line-width))
);
background: var(--st-accent);
filter: drop-shadow(0 0 6px var(--st-accent));
```

Draws the visible line itself. Since `clip-path: polygon()` can only fill a shape, not stroke a path, the trick is to trace the data curve forward, then trace it again in reverse offset by `--st-chart-line-width`, closing a thin sliver of a shape that reads as a stroked line. `drop-shadow` adds the glow.

## `st-chart-dot(st: .st-chart-dot, x: 0, y: 0, size: 12px)`

```fscss
@use(st){
  position: absolute;
  left: calc(@use(x)% - 6px);
  top: calc(num(-@use(y)+100)% - 6px);
  %2(width, height[: @use(size);])
  border-radius: 50%;
  background: #fff;
  border: 2.5px solid var(--st-accent);
}
```

Positions a single circular marker at a given `(x, y)`. `top` uses the same `-y + 100` inversion as the chart-point mixins, for the same reason. `%2(width, height[: value;])` is FSCSS's shorthand for assigning one value to two properties at once, here making the dot a perfect circle.

## `st-cat-bar-fill(st: .st-cat-bar-fill, range: 0)`

```fscss
--st-cat-bar-fill-range: @use(range)%;
height: 100%;
width: var(--st-cat-bar-fill-range);
border-radius: 999px;
background: linear-gradient(90deg, var(--st-accent), var(--st-accent-2));
transform-origin: left;
```

A horizontal progress-bar fill. The width is driven by a custom property rather than the raw parameter directly, which means it stays available for animation or a later runtime update (see the inline-styles feature in v1.2.0 for exactly that pattern).

## `st-stat-card(st: .st-stat-card)`

```fscss
@use(st) { /* card container */ }
@use(st) .st-stat-label { ... }
@use(st) .st-stat-value { ... }
@use(st) .st-stat-delta.up { color: var(--st-green); }
@use(st) .st-stat-delta.down { color: var(--st-red); }
```

One mixin, five rules. `@use(st)` expands to the same base selector each time, so calling `st-stat-card()` once generates the card container plus descendant styles for its label, value, and up/down delta indicators in a single call.

## `st-chart-axis-x(st: .st-chart-axis-x)` and `st-chart-axis-y(st: .y-axis)`

Two small layout mixins. The x-axis mixin lays its children out horizontally with `justify-content: space-between`; the y-axis mixin does the same in reverse column order, positioned absolutely so it sits alongside the chart rather than in normal flow. Both use the muted text token for their labels.

## `st-chart-grid(st: .st-chart-grid, rows: 10, cols: 7)`

```fscss
background: repeating-linear-gradient(
  to bottom, $st-muted 0, $st-muted 1px, transparent 1px,
  transparent calc(100% / @use(rows))
),
repeating-linear-gradient(
  to right, $st-accent 0, $st-accent 1px, transparent 1px,
  transparent calc(100% / @use(cols))
);
opacity: .2;
```

Draws the background grid using two stacked repeating gradients, one horizontal and one vertical, each one pixel wide. Line spacing comes directly from the `rows` and `cols` parameters via `calc(100% / n)`. `$st-muted` and `$st-accent` here are FSCSS variable references that resolve to the matching custom properties from `st-root`.

## `st-chart-dots(st: .st-chart-dot-, size: 5px)`

```fscss
@arr st-dot-x[0, 14, 28, 42, 57, 71, 85, 100]
@arr st-i[count(8)]
@arr st-dot-y[10,20,16,15,66,50,80,54]

@use(st){ /* preserve */ }

@st-chart-dot(
  @use(st)@arr.st-i[],
  @arr.st-dot-x[@arr.st-i[]],
  @arr.st-dot-y[@arr.st-i[]],
  @use(size)
)

@use(st)@arr.st-i[]{
  top: calc(var(--st-p@arr.st-i[]) - 6px);
}
```

The most involved mixin in the file, and the one worth reading slowest. Three arrays are declared first: fixed X positions for eight dots, an index array of length 8 from `count(8)`, and a set of sample Y values.

The `@st-chart-dot(...)` call then uses `@arr.st-i[]`, empty brackets, which tells FSCSS to expand the entire call once per item in the index array rather than resolving to a single value. That single line becomes eight separate `@st-chart-dot` calls, one per index, each with its own generated class suffix (`.st-chart-dot-1`, `.st-chart-dot-2`, and so on), its own X, and its own sample Y.

The final rule repeats the same expand-over-index trick to override each generated dot's `top` a second time, this time pulling from the live `--st-pN` variable that matches its own index instead of the hard-coded sample Y array. In effect: the sample Y values position the dots on first paint, and the second rule immediately re-anchors each dot to the real, currently-set chart data. Update `--st-p1` through `--st-p8` later (by calling `st-chart-points()` again, or via the JS API) and the dots move with the line.

## Reading order, if you're new to the file

1. `st-root()` first, always. Every other mixin assumes its tokens exist.
2. `st-chart-points()` (or `st-chart()`) to set the actual data.
3. `st-container()` and `st-phone()` for the outer shell.
4. `st-chart-fill()`, `st-chart-line()`, `st-chart-dots()`, in that order, for the chart itself.
5. `st-chart-grid()`, `st-chart-axis-x()`, `st-chart-axis-y()` for the surrounding chrome.
6. `st-stat-card()` and `st-cat-bar-fill()` are independent of the chart and can be used anywhere.

## Notes for contributors

- Every mixin that draws a shape (`st-chart-fill`, `st-chart-line`, `st-chart-dot`) depends on the `--st-pN` naming convention staying at exactly eight points. Extending the chart to a variable number of points would mean revisiting `st-chart-dots()`'s array-expansion logic, not just adding more variables.
- `st-chart-line-width` is intentionally split out from `st-chart-line` so the stroke thickness can be changed without recompiling the whole line mixin.
- None of this file relies on FSCSS's v1.2.0 inline-style processing, but it composes well with it: every mixin here works identically whether it's called from a .fscss file, `<style>` block or from a `style="..."` attribute, which is what makes runtime updates to a live chart possible without a rebuild.
