<script>
  /** Human-scale values 0–100 (higher = taller on chart) */
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
