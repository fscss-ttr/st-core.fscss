<script>
  import './styles/st-core.css';
  import Chart from './lib/Chart.svelte';

  let dataPoints = [30, 65, 40, 85, 55, 90, 70];

  function randomizeData() {
    dataPoints = Array.from({ length: 7 }, () => Math.floor(Math.random() * 80) + 10);
  }
</script>

<main class="container">
  <h1>st-core@v2 · Svelte</h1>
  <Chart data={dataPoints} height="220px" />
  <button type="button" on:click={randomizeData}>Randomize</button>
  <p class="hint">Compiled CSS · reactive --st-pN only</p>
</main>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }
  h1 {
    font-size: 1.1rem;
    font-weight: 700;
  }
  button {
    background: var(--st-accent, #9d7eff);
    color: #fff;
    border: 0;
    padding: 10px 18px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
  }
  .hint {
    font-size: 12px;
    opacity: 0.55;
  }
</style>
