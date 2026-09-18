# How `st-core@v2.fscss` Works under the Hood

`st-core@v2` simplifies SVG-free chart rendering by leveraging FSCSS array iteration and inline calculation capabilities (`num()`).

---

## 1. Array Normalization (`@st-chart-points`)

Charts expect percentage height values measured from the bottom up, but CSS layout originates from the top left (`0,0`).

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
 * **Index Generator:** Creates a 1-based index array matching the data length ([1, 2, 3... N]).
 * **Inversion Calculation:** Inverts each data point (num(100 - value)%) and assigns it directly to --st-p1, --st-p2, etc.
## 2. Dynamic Fill Areas (@st-chart-fill)
To fill the region beneath the line graph, @st-chart-fill constructs a CSS polygon() clip-path dynamically across all array points:
```css
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

```
 1. **X-Positioning:** Calculates spacing automatically with ($i - 1) * 100 / (length - 1)%.
 2. **Y-Positioning:** Reads the generated variable var(--st-p$i).
 3. **Closing Points:** Anchors the clip path down to 100% 100% and 0% 100%.
## 3. Polyline Generation (@st-chart-line)
Creating a uniform line thickness using pure CSS clip-path requires a closed loop of top and bottom coordinates.
```css
clip-path: polygon(
  /* Forward loop: Top edge of the line */
  inline("{}
    empty-@arr.@use(p)-idx[] {
      $i: @arr.@use(p)-idx[];
      num( <$i - 1> * 100 / <@arr.@use(p)!.length - 1>)% var(--st-p$i),
    }
  ")
  /* Reverse loop: Bottom edge offset by line width */
  inline("{}
    empty-@arr.@use(p)-reversed-idx[] reverse {
      $i: @arr.@use(p)-reversed-idx[];
      num( <$i - 1> * 100 / <@arr.@use(p)!.length - 1>)% calc(var(--st-p$i) + var(--st-chart-line-width)), 
    }
  ")
);

```
## 4. Automatic Dot Placement (@st-chart-dots)
Places target indicators directly on calculated chart vertices:
```css
left: calc(num( <$i - 1> * 100 / <@arr.@use(p)!.length - 1>)% - 6px);
top: calc(var(--st-p$i) - 6px);

```
Centers dots using a -6px offset against standard sizing parameters.


---
