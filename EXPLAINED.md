# How `st-core@v2.fscss` Works under the Hood

`st-core@v2` renders SVG-free, canvas-free charts by leaning on two FSCSS primitives: **array iteration** (`@arr`, `inline("...")` loops) and **inline calculation** (`num()`, `calc()`). Every visual piece — fills, strokes, dots, grids, stat cards — reduces to CSS custom properties written once and read many times.

This document walks through every `@define` in the source, in the order they appear.

---

## Table of Contents

1. [`@st-root` — Design Tokens](#1-st-root--design-tokens)
2. [`@st-chart` — Legacy Fixed-Point Normalizer](#2-st-chart--legacy-fixed-point-normalizer)
3. [`@st-chart-points` — Array Normalization](#3-st-chart-points--array-normalization)
4. [`@st-container` — Viewport Wrapper](#4-st-container--viewport-wrapper)
5. [`@st-phone` — Device Frame](#5-st-phone--device-frame)
6. [`@st-chart-fill` — Area Fill](#6-st-chart-fill--area-fill)
7. [`@st-chart-line-width` — Stroke Width Setter](#7-st-chart-line-width--stroke-width-setter)
8. [`@st-chart-line` — Polyline Stroke](#8-st-chart-line--polyline-stroke)
9. [`@st-chart-dot` — Single Manual Marker](#9-st-chart-dot--single-manual-marker)
10. [`@st-cat-bar-fill` — Bar Fill](#10-st-cat-bar-fill--bar-fill)
11. [`@st-stat-card` — Stat Card Component](#11-st-stat-card--stat-card-component)
12. [`@st-chart-axis-x` / `@st-chart-axis-y` — Axis Wrappers](#12-st-chart-axis-x--st-chart-axis-y--axis-wrappers)
13. [`@st-chart-grid` — Background Grid](#13-st-chart-grid--background-grid)
14. [`@st-chart-dots` — Auto-Generated Markers](#14-st-chart-dots--auto-generated-markers)
15. [The One Rule That Ties It All Together](#15-the-one-rule-that-ties-it-all-together)

---

## 1. `@st-root` — Design Tokens

```css
@define st-root(root:root){`
:@use(root){
  --st-bg: #0e0d14;
  --st-surface: #161422;
  --st-card: #1c1a2e;
  --st-accent: #9d7eff;
  --st-accent-2: #c4a8ff;
  --st-accent-dim: #3a2e6e;
  --st-green: #4fffb0;
  --st-red: #ff5e7d;
  --st-text: #e8e3ff;
  --st-muted: #6b6488;
  --st-border: rgba(157,126,255,.15);

  --st-radius-xl: 40px;
  --st-radius-lg: 16px;
  --st-radius-md: 12px;
  --st-radius-sm: 10px;

  --st-pad: 24px;

  --st-p1: 68%; --st-p2: 59%; --st-p3: 70%; --st-p4: 35%;
  --st-p5: 58%; --st-p6: 22%; --st-p7: 42%; --st-p8: 55%;

  --st-peak-x: 71%;
  --st-peak-y: var(--st-p6);
  --st-cat-bar-fill-range: 0;
  --st-chart-line-width: 1.5px;
}
`}
```

- **`root` parameter defaults to `root`**, meaning a bare `@st-root()` targets `:root`. Pass a selector (`@st-root(root.wrapper)`) to scope the whole token set to a subtree instead — useful for a themed card sitting inside a page with a different palette.
- Every color, radius, and spacing value the rest of the library references is defined here as a CSS custom property. Nothing downstream hardcodes a color; they all read `var(--st-*)`.
- **`--st-p1` through `--st-p8` ship with default values.** This is a safety net: if you use a component that reads `--st-p$i` before anything has written to it (skipped `@st-chart-points` by mistake), you get a plausible-looking placeholder shape instead of a broken layout.
- `--st-peak-x` / `--st-peak-y` are convenience tokens for annotating a single standout point (e.g. positioning a callout dot at the chart's highest value) — `--st-peak-y` even aliases `--st-p6` as a worked example.
- `--st-chart-line-width` is the single source of truth for stroke thickness, read by `@st-chart-line` and overridable by `@st-chart-line-width`.

---

## 2. `@st-chart` — Legacy Fixed-Point Normalizer

```css
@define st-chart(p1: 88, p2: 59, p3: 70, p4: 35, p5: 58, p6: 22, p7: 42, p8: 55){
  --st-p1: num(100 - @use(p1))%;
  --st-p2: num(100 - @use(p2))%;
  /* ... through p8 */
}
```

- This is the **v1 API**, kept in v2 for backward compatibility and quick one-off use. It takes exactly 8 named parameters (each with a default), so it never needs an `@arr` at all.
- The math is the same inversion `@st-chart-points` does (`100 - value`), just applied to 8 hardcoded named args instead of looped over an array.
- Use this when you genuinely have a fixed 8-point series and don't want the ceremony of declaring an `@arr`. Anything dynamic-length should use `@st-chart-points` instead.

---

## 3. `@st-chart-points` — Array Normalization

```css
@define st-chart-points(p){`
inline("
@arr @use(p)-idx[count(@arr.@use(p)!.length, 1)]

empty-@arr.@use(p)-idx[]{
  $idx: @arr.@use(p)-idx[];
  --st-p$idx: num(100 - @arr.@use(p)[$idx])%;
}")
`}
```

Charts render top-down in CSS (`0%` is the top of the box), but data conceptually grows bottom-up. This mixin bridges that gap.

- **`@arr @use(p)-idx[count(@arr.@use(p)!.length, 1)]`** builds a throwaway index array the same length as your data array — effectively `[1, 2, 3, ..., N]`. `count(length, 1)` counts up from 1 to the array's length.
- **`empty-@arr.@use(p)-idx[]{ ... }`** is an FSCSS loop construct: it iterates that index array, binding each index to `$idx`.
- Inside the loop, `--st-p$idx: num(100 - @arr.@use(p)[$idx])%;` does two things per iteration:
  1. Looks up the raw value at that index in your original array (`@arr.@use(p)[$idx]`).
  2. Inverts it (`100 - value`) and writes it to the correspondingly-numbered CSS variable (`--st-p1`, `--st-p2`, ...).
- This is the **only** mixin in the file that writes `--st-p*` from an arbitrary-length array. Every other chart mixin (`@st-chart-fill`, `@st-chart-line`, `@st-chart-dots`) only *reads* those variables — they never set them independently. That's why calling `@st-chart-points(arrayName)` on an element is mandatory before any renderer on that element (or its descendants) will show the right shape.

---

## 4. `@st-container` — Viewport Wrapper

```css
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

Purely presentational — centers content in the viewport with the design-token background and text color. Defaults to `body` so `@st-container(body)` is the common call, but accepts any selector for a scoped demo frame.

---

## 5. `@st-phone` — Device Frame

```css
@define st-phone(st:.st-phone){`
@use(st){
  width: 360px;
  background: var(--st-surface);
  border-radius: var(--st-radius-xl);
  border: 1px solid var(--st-border);
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(157,126,255,.08),
    0 40px 80px rgba(0,0,0,.6),
    0 0 120px rgba(100,60,220,.12) inset;
}
`}
```

A fixed-width (`360px`) card frame meant to mimic a phone-sized dashboard surface — rounded via `--st-radius-xl`, layered shadow for depth, `overflow: hidden` so chart fills/lines never bleed past the rounded corners.

---

## 6. `@st-chart-fill` — Area Fill

```css
@define st-chart-fill(st:.st-chart-fill, p){`
@use(st){
  position: absolute;
  inset: 0;

  @arr @use(p)-idx[count(@arr.@use(p)!.length, 1)]
  clip-path: polygon(
    inline("{}
      empty-@arr.@use(p)-idx[] {
        $i: @arr.@use(p)-idx[];
        num( <$i - 1> * 100 / <@arr.@use(p)!.length - 1>)% var(--st-p$i),
      }
      100% 100%,
      0% 100%
    }")
  );

  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--st-accent) 35%, transparent),
    transparent
  );
}
`}
```

- Same `-idx` array trick as `@st-chart-points`, but here it's used to generate `clip-path: polygon()` stops instead of writing variables.
- **X-positioning** is computed inline, per point: `(i - 1) * 100 / (length - 1)` spreads points evenly from `0%` to `100%` regardless of how many points there are — this is the "automatic X-spacing" v2 advertises.
- **Y-positioning** reads `var(--st-p$i)` — the value `@st-chart-points` wrote. `@st-chart-fill` never touches the raw array values for Y; it only knows the array's *length* (to build the index loop), not its contents.
- The loop only produces the **top edge** of the shape. `100% 100%, 0% 100%` are appended afterward to close the polygon down to the bottom corners, which is what makes it a filled area rather than a line.
- `background` is a top-to-bottom gradient from a translucent `--st-accent` down to fully transparent — the polygon just defines the *shape*, the gradient defines the *look*.

---

## 7. `@st-chart-line-width` — Stroke Width Setter

```css
@define st-chart-line-width(st){
  --st-chart-line-width: @use(st);
}
```

The simplest mixin in the file: one parameter, one variable write. Call it on a `.chart-line` (or any scope) to override the `1.5px` default set in `@st-root`. Because `@st-chart-line` reads `var(--st-chart-line-width)` at draw time, this can also be changed live via JS (`element.style.setProperty('--st-chart-line-width', '3px')`) without recompiling anything.

---

## 8. `@st-chart-line` — Polyline Stroke

```css
@define st-chart-line(st:.st-chart-line, p){`
@use(st){
  position: absolute;
  inset: 0;

  @arr @use(p)-idx[count(@arr.@use(p)!.length, 1)]
  @arr @use(p)-reversed-idx[@arr.@use(p)-idx!.reverse]

  clip-path: polygon(
    inline("{}
      empty-@arr.@use(p)-idx[] {
        $i: @arr.@use(p)-idx[];
        num( <$i - 1> * 100 / <@arr.@use(p)!.length - 1>)% var(--st-p$i),
      }
    ")
    inline("{}
      empty-@arr.@use(p)-reversed-idx[] reverse {
        $i: @arr.@use(p)-reversed-idx[];
        num( <$i - 1> * 100 / <@arr.@use(p)!.length - 1>)%
          calc(var(--st-p$i) + var(--st-chart-line-width)),
      }
    ")
    -100% calc(var(--st-p1) + var(--st-chart-line-width))
  );

  background: var(--st-accent);
}
`}
```

`clip-path: polygon()` has no concept of "stroke width" — it only fills or doesn't. To fake a line with visible thickness, this mixin draws a thin *closed band*: the top edge follows the data, the bottom edge follows the same data offset downward by `--st-chart-line-width`.

- **Two index arrays are built**: `@use(p)-idx` (forward, `[1..N]`) and `@use(p)-reversed-idx` (the same array reversed, `[N..1]`).
- **First loop (forward)** walks the data left to right, placing each point at `var(--st-p$i)` — this traces the *top* edge of the stroke, exactly like `@st-chart-fill`'s top edge.
- **Second loop (reverse)** walks the *same* data right to left, but each Y value is `calc(var(--st-p$i) + var(--st-chart-line-width))` — pushed down by the stroke width. Walking in reverse is what closes the polygon without crossing itself: forward along the top, then backward along a parallel line just below it.
- **The trailing `-100% calc(var(--st-p1) + var(--st-chart-line-width))`** stitches the loop shut, returning to (approximately) the starting point's offset position so the polygon closes cleanly.
- `background: var(--st-accent)` fills that thin closed band solid, which is what reads visually as a "line."
- Just like `@st-chart-fill`, this mixin never reads raw array values for Y — only `var(--st-p$i)`. It depends entirely on `@st-chart-points` having run first.

---

## 9. `@st-chart-dot` — Single Manual Marker

```css
@define st-chart-dot(st:.st-chart-dot, x:0, y:0, size: 12px){`
@use(st){
  position: absolute;
  left: calc(@use(x)% - 6px);
  top: calc(num(-<@use(y)> + 100)% - 6px);
  %2(width, height[: @use(size);])
  border-radius: 50%;
  background: #fff;
  border: 2.5px solid var(--st-accent);
}
`}
```

- Unlike every other chart mixin, this one takes **explicit `x`, `y`, `size` values**, not an array reference. It's for manually placed markers — annotating a specific peak, a tooltip anchor, a highlight — independent of the dataset entirely.
- `top: calc(num(-<y> + 100)% - 6px)` applies the same top-down inversion as `@st-chart-points` (`100 - y`), but inline and one-off rather than through the variable system.
- The `-6px` offset on both axes centers a default-sized dot on the exact coordinate (half of the implicit ~12px marker).
- `%2(width, height[: @use(size);])` is an FSCSS shorthand that expands to setting both `width` and `height` to the same `size` value in one call, avoiding two separate declarations.
- `border: 2.5px solid var(--st-accent)` with a white fill gives the "ring" marker look used for callouts, distinct from the plain filled dots `@st-chart-dots` produces.

---

## 10. `@st-cat-bar-fill` — Bar Fill

```css
@define st-cat-bar-fill(st:.st-cat-bar-fill, range:0){`
@use(st){
  --st-cat-bar-fill-range: @use(range)%;
  height: 100%;
  width: var(--st-cat-bar-fill-range);
  border-radius: 999px;
  background: linear-gradient(90deg, var(--st-accent), var(--st-accent-2));
  transform-origin: left;
}
`}
```

Unrelated to the line/area chart system entirely — this is for horizontal progress/category bars (e.g. "Category X: 75% of budget"). `range` is a plain percentage (not an array), written to `--st-cat-bar-fill-range` and then consumed as `width`. `transform-origin: left` is set up in case the caller wants to animate the fill in with a `scaleX` transform from zero.

---

## 11. `@st-stat-card` — Stat Card Component

```css
@define st-stat-card(st:.st-stat-card){`
@use(st) {
  background: var(--st-card);
  border-radius: var(--st-radius-lg);
  border: 1px solid var(--st-border);
  padding: var(--st-pad);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
@use(st) .st-stat-label { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--st-muted); }
@use(st) .st-stat-value { font-size: 28px; font-weight: 700; color: var(--st-text); line-height: 1; }
@use(st) .st-stat-delta { font-size: 12px; font-weight: 600; }
@use(st) .st-stat-delta.up { color: var(--st-green); }
@use(st) .st-stat-delta.down { color: var(--st-red); }
`}
```

A single mixin call generates five related rules at once: the card container plus its three fixed inner-class conventions (`.st-stat-label`, `.st-stat-value`, `.st-stat-delta`) and the two delta-direction modifiers (`.up` / `.down`). This is why the "Full Mobile Dashboard Frame" example only needs `@st-stat-card(.stat-card)` once and then just uses the fixed class names inside its markup — the mixin owns that internal naming contract.

---

## 12. `@st-chart-axis-x` / `@st-chart-axis-y` — Axis Wrappers

```css
@define st-chart-axis-x(st:.st-chart-axis-x){`
@use(st){
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: var(--st-pad);
  font-size: 0.8em;
  color: var(--st-muted);
}
`}

@define st-chart-axis-y(st:.y-axis){`
@use(st){
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  position: absolute;
  font-size: 0.5em;
  color: var(--st-muted);
  padding: 0;
  opacity: .8;
}
`}
```

Both are pure layout helpers with no array or variable dependency — they don't know about your data at all, they just space out whatever `<span>` labels you hand-write inside them.

- **X axis**: a horizontal flex row, `justify-content: space-between` spreads labels evenly left to right — matches the same visual spacing the chart mixins compute mathematically, but here it's free from flexbox.
- **Y axis**: `flex-direction: column-reverse` is the key detail — it stacks labels bottom-to-top so a `0, 20, 40...100` label list reads correctly against a chart where `0%` is the top of the box. `position: absolute` overlays it on the chart rather than pushing content beside it.

---

## 13. `@st-chart-grid` — Background Grid

```css
@define st-chart-grid(st:.st-chart-grid, rows:10, cols:7){`
@use(st){
  position: absolute;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    to bottom, $st-muted 0, $st-muted 1px, transparent 1px, transparent calc(100% / @use(rows))
  ), repeating-linear-gradient(
    to right, $st-accent 0, $st-accent 1px, transparent 1px, transparent calc(100% / @use(cols))
  );
  opacity: .2;
}`}
```

No polygons here — the grid is two stacked `repeating-linear-gradient`s doing double duty as ruled lines:

- The first gradient draws horizontal lines every `100% / rows`, the second draws vertical lines every `100% / cols`. Each is a hard 1px stripe of color followed by transparent space, repeated.
- `$st-muted` / `$st-accent` (note the `$` shorthand rather than `var(--st-muted)`) tint the two axes differently — a subtle visual cue distinguishing horizontal from vertical rules.
- `opacity: .2` keeps the whole thing faint so it reads as a background reference grid rather than competing with the actual data line/fill on top of it.

---

## 14. `@st-chart-dots` — Auto-Generated Markers

```css
@define st-chart-dots(st:.st-chart-dot-, p, size: 8px){`
  @arr @use(p)-idx[count(@arr.@use(p)!.length, 1)]

  @use(st)@arr.@use(p)-idx[] {
    $i: @arr.@use(p)-idx[];
    position: absolute;
    left: calc(num( <$i - 1> * 100 / <@arr.@use(p)!.length - 1>)% - 6px);
    top: calc(num(-@arr.@use(p)[$i] + 100)% - 6px);
    %2(width, height[: @use(size);])
    border-radius: 50%;
    background: #fff;
    border: 2.5px solid var(--st-accent);
  }
`}
```

This one generates a `.dot-1`, `.dot-2`, ... `.dot-N` rule per array index (via `@use(st)@arr.@use(p)-idx[]`, concatenating the selector prefix with each index) and is worth reading carefully — it writes `top` **twice**.

- **First block** computes `top` directly from the raw array value: `calc(num(-@arr.@use(p)[$i] + 100)% - 6px)`. This positions each dot from the *array itself*, with no dependency on `--st-p*` variables at all — a self-contained fallback.
- **Second block**, emitted afterward, overrides `top` again with `calc(var(--st-p$i) - 6px)` — reading the CSS variable instead of recomputing from the array.
- Because **CSS resolves duplicate declarations in source order, last one wins**, the second block's `top` is what actually takes effect at render time. The first block's computation is functionally dead once the second runs — but it does mean that if `@st-chart-points(p)` was *never* called on an ancestor, `--st-p$i` is undefined and `top` falls back to its initial/auto value rather than silently using the array-derived first computation.
- **Practical upshot**: `@st-chart-dots`, like `@st-chart-fill` and `@st-chart-line`, effectively requires `@st-chart-points(p)` to have run somewhere in scope for correct positioning, even though its `left` calculation (X-axis) is entirely self-sufficient and never touches `--st-p*` at all. Only the vertical positioning has this dependency.

---

## 15. The One Rule That Ties It All Together

Across every chart mixin in this file, the split is consistent:

| Concern | Who owns it | Depends on `--st-p*`? |
|---|---|---|
| X-position (horizontal spacing) | Computed inline in each mixin from array **length** | No |
| Y-position (vertical value) | `var(--st-p$i)`, written only by `@st-chart-points` | Yes |
| Line/fill/dot **shape** | `@st-chart-fill` / `@st-chart-line` / `@st-chart-dots` | Reads, never writes |
| Line/fill/dot **values** | `@st-chart-points(array)` | Writes, on whichever element calls it |

Every renderer mixin needs the array purely to know *how many* points to loop over. The array's actual values only ever reach the page through `--st-p1`…`--st-p{n}`, and those variables are inherited down the DOM like any other custom property. That's the entire reason a multi-series chart requires `@st-chart-points(seriesN)` on each series' own element — skip it, and that element silently inherits whatever its nearest ancestor last set.

## Integrations

Official samples … **[integration/](./integration/)**

| Folder | Stack | Notes |
|--------|--------|--------|
| integration/html | HTML + JS | Runtime or compiled CSS |
| integration/svelte | Svelte / SvelteKit | Compiled CSS + reactive `--st-pN` |

**Add your stack:** See [integration/README.md](integration/README.md)
