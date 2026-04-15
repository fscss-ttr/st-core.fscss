    /* ─── PAGE SHELL ──────────────────────────────────────────── */
    *,
    *::before,
    *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    html,
    body {
      height: 100%;
      background: #0a0a0f;
      font-family: 'DM Mono', monospace;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* subtle grid bg */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(196, 168, 255, .04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(196, 168, 255, .04) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }
    
    .page {
      width: 100%;
      max-width: 420px;
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    /* header */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .page-title {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 18px;
      color: #fff;
      letter-spacing: -.5px;
    }
    
    .page-badge {
      font-size: 10px;
      font-weight: 500;
      color: #c4a8ff;
      background: rgba(196, 168, 255, .12);
      border: 1px solid rgba(196, 168, 255, .2);
      padding: 4px 8px;
      border-radius: 99px;
      letter-spacing: .5px;
      text-transform: uppercase;
    }
    
    /* ─── FSCSS st-core ───────────────────────────────────────── */
    @import((*) from "./st-core.fscss") 
    @st-root()
    @st-container(body)
    .wrapper {
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }
    
    @st-chart-fill(.chart-fill) @st-chart-line(.chart-line) @st-chart-dot(.chart-dot, 70, 60) .chart {
      width: 100%;
      height: 200px;
      border-radius: 20px;
      position: relative;
      overflow: hidden;
      background: var(--st-surface);
      border: 1px solid rgba(255, 255, 255, .06);
      
      @st-chart-points(20, 25, 21, 37, 30, 60, 27, 50)
    }
    
    @st-phone(.wrapper)
    .chart-line {
      @st-chart-line-width(2px);
      filter: drop-shadow(0 0 8px var(--st-accent));
    }
    
    .chart-fill {
      opacity: .85;
    }
    
    .chart-dot {
      position: relative;
      overflow: visible;
      --st-accent: #c4a8ff;
    }
    
    .chart-dot .tooltip {
      background: var(--st-accent);
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 700;
      color: #0a0a0f;
      border-radius: 8px;
      position: absolute;
      top: -40px;
      left: -26px;
      white-space: nowrap;
      font-family: 'DM Mono', monospace;
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
    
    @st-stat-card(.stat-card) @st-chart-axis-x(.x-axis) @st-chart-axis-y(.y-axis) @st-chart-grid(.chart-grid, 10, 7) .chart-fill, .chart-line {
      height: 100%;
      transition: clip-path .9s cubic-bezier(.4, 0, .2, 1);
    }
    
    .chart-dot {
      transition: all 0.9s cubic-bezier(.4, 0, .2, 1);
    }
    
    /* stat card tweaks */
    .stat-card {
      border: 1px solid rgba(255, 255, 255, .07);
      border-radius: 16px !important;
    }
    
    /* ─── BUTTON ─────────────────────────────────────────────── */
    .update-btn {
      align-self: flex-start;
      background: transparent;
      color: #c4a8ff;
      padding: 10px 20px;
      border-radius: 10px;
      border: 1.5px solid rgba(196, 168, 255, .4);
      font-weight: 500;
      font-family: 'DM Mono', monospace;
      font-size: 12px;
      letter-spacing: .5px;
      cursor: pointer;
      transition: background .2s, border-color .2s, color .2s;
    }
    
    .update-btn:hover {
      background: rgba(196, 168, 255, .1);
      border-color: #c4a8ff;
      color: #fff;
    }
    
    .update-btn:active {
      background: rgba(196, 168, 255, .2);
    }
    
    /* ─── FOOTER ─────────────────────────────────────────────── */
    .page-footer {
      font-size: 10px;
      color: rgba(255, 255, 255, .2);
      letter-spacing: .5px;
      text-align: center;
      text-transform: uppercase;
    }
    
    .page-footer span {
      color: rgba(196, 168, 255, .4);
    }
