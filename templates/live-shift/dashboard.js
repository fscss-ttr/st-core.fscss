/**
 * Live Shift — random-walk series into st-core chart CSS variables
 * Keep POINTS in sync with @arr priceData length in dashboard.fscss
 */
(function () {
  const POINTS = 8;
  let series = [42, 55, 48, 68, 61, 79, 72, 85];
  let portfolio = 84210;
  let dayPnl = 1782;

  const fill = document.getElementById('fill');
  const line = document.getElementById('line');
  const portEl = document.getElementById('port-value');
  const portDelta = document.getElementById('port-delta');
  const pnlEl = document.getElementById('pnl-value');
  const pnlDelta = document.getElementById('pnl-delta');

  function normalize(v) {
    return 100 - Math.max(0, Math.min(100, v)) + '%';
  }

  function applySeries(arr) {
    const vars = arr.map((v, i) => `--st-p${i + 1}: ${normalize(v)};`).join(' ');
    fill.style.cssText = vars;
    line.style.cssText = vars;
  }

  function formatMoney(n) {
    const abs = Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
    return (n >= 0 ? '+' : '-') + '$' + abs;
  }

  function shift() {
    const last = series[series.length - 1];
    const delta = (Math.random() - 0.48) * 14;
    const next = Math.max(8, Math.min(95, last + delta));
    series = [...series.slice(1), Math.round(next)];

    applySeries(series);

    const pctMove = ((next - last) / 100) * 0.8;
    const change = portfolio * pctMove;
    portfolio += change;
    dayPnl += change;

    portEl.textContent = '$' + Math.round(portfolio).toLocaleString();
    const dayPct = ((dayPnl / (portfolio - dayPnl)) * 100).toFixed(2);
    const up = dayPnl >= 0;
    portDelta.textContent = (up ? '▲ +' : '▼ ') + Math.abs(dayPct) + '%';
    portDelta.className = 'st-stat-delta ' + (up ? 'up' : 'down');

    pnlEl.textContent = formatMoney(Math.round(dayPnl));
    pnlDelta.className = 'st-stat-delta ' + (up ? 'up' : 'down');

    let eq = 50 + Math.round(Math.random() * 20);
    let cr = 15 + Math.round(Math.random() * 20);
    let fx = 100 - eq - cr;
    if (fx < 5) {
      fx = 5;
      eq = 100 - cr - fx;
    }

    document.getElementById('eq-pct').textContent = eq + '%';
    document.getElementById('cr-pct').textContent = cr + '%';
    document.getElementById('fx-pct').textContent = fx + '%';
    document.getElementById('bar-eq').style.setProperty('--st-cat-bar-fill-range', eq + '%');
    document.getElementById('bar-cr').style.setProperty('--st-cat-bar-fill-range', cr + '%');
    document.getElementById('bar-fx').style.setProperty('--st-cat-bar-fill-range', fx + '%');
  }

  applySeries(series);
  setInterval(shift, 1200);
})();
