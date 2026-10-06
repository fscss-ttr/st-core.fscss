/*
  st-core.fscss Visual Chart Builder
  File map:
    1. Imports and DOM refs
    2. Data helpers (parse, clamp, geometry)
    3. Generators (FSCSS, HTML, approximate CSS)
    4. Preview (DOM, FSCSS runtime, fallback paint, hover probe)
    5. UI (presets, stats, tabs, copy, events)
*/

import xfscss from "https://cdn.jsdelivr.net/npm/fscss@1.2.5/esm.js";

/* 1. DOM refs */
const $ = (s) => document.querySelector(s);
const dataInput = $("#data-input");
const chartPreview = $("#chart-preview");
const statusBox = $("#status");
const statusText = $("#status-text");
const outFscss = $("#out-fscss");
const outCss = $("#out-css");
const outHtml = $("#out-html");
const toast = $("#toast");
const buildBtn = $("#btn-build");
const sidebar = $(".sidebar");

const DEFAULT_ACCENT = "#9d7eff";

const PRESETS = [
  { name: "Rising", data: [20, 45, 28, 80, 65, 90, 40] },
  { name: "Decline", data: [80, 70, 55, 40, 35, 30, 25] },
  { name: "Volatile", data: [40, 60, 20, 80, 50, 70, 45] },
  { name: "Flat", data: [50, 52, 48, 55, 51, 53, 49] },
  { name: "Climb", data: [10, 25, 40, 55, 70, 85, 95] },
  { name: "Peaks", data: [90, 60, 85, 40, 70, 30, 55] },
];

/* 2. Data helpers */
function parseData(raw) {
  return raw
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function getOpts() {
  const accentRaw = $("#opt-accent").value.trim();
  const accentOk = !accentRaw || CSS.supports("color", accentRaw);
  $("#opt-accent").classList.toggle("invalid", !accentOk);

  return {
    data: parseData(dataInput.value).map((n) => clamp(n, 0, 100)),
    arrName: ($("#opt-arrname").value || "myData").replace(/[^a-zA-Z0-9_]/g, "") || "myData",
    chartClass: ($("#opt-class").value || "chart").replace(/[^a-zA-Z0-9_-]/g, "") || "chart",
    fill: $("#opt-fill").checked,
    line: $("#opt-line").checked,
    grid: $("#opt-grid").checked,
    dots: $("#opt-dots").checked,
    height: clamp(+$("#opt-height").value || 220, 80, 600),
    radius: clamp(+$("#opt-radius").value || 12, 0, 40),
    accent: accentOk && accentRaw ? accentRaw : DEFAULT_ACCENT,
    accentOk,
    gridRows: clamp(+$("#opt-grid-rows").value || 5, 2, 20),
    gridCols: clamp(+$("#opt-grid-cols").value || 6, 2, 30),
  };
}

/** X position (in %) of each point, spread evenly from 0 to 100. */
function xPositions(n) {
  return Array.from({ length: n }, (_, i) =>
    n === 1 ? 50 : Math.round((i / (n - 1)) * 1000) / 10
  );
}

/** Polygon points for the area fill. */
function fillPolygon(data) {
  const xs = xPositions(data.length);
  return ["0% 100%", ...data.map((v, i) => `${xs[i]}% ${100 - v}%`), "100% 100%"].join(", ");
}

/** Polygon points for the line: top edge, then the same path back down 1.5px lower. */
function linePolygon(data) {
  const n = data.length;
  const xs = xPositions(n);
  const top = data.map((v, i) => `${xs[i]}% ${100 - v}%`).join(", ");
  const bottom = [...data]
    .reverse()
    .map((v, i) => `${xs[n - 1 - i]}% calc(${100 - v}% + 1.5px)`)
    .join(", ");
  return `${top}, ${bottom}`;
}

/* 3. Generators */
function buildFscss(o) {
  const lines = [
    `@import((*) from st-core@v2)`,
    ``,
    `@st-root()`,
    ``,
    `@arr ${o.arrName}[${o.data.join(", ")}]`,
    ``,
  ];
  if (o.fill) lines.push(`@st-chart-fill(.${o.chartClass}-fill, ${o.arrName})`);
  if (o.line) lines.push(`@st-chart-line(.${o.chartClass}-line, ${o.arrName})`);
  if (o.grid) lines.push(`@st-chart-grid(.${o.chartClass}-grid, ${o.gridRows}, ${o.gridCols})`);
  if (o.dots) lines.push(`@st-chart-dots(.${o.chartClass}-dot-, ${o.arrName}, 8px)`);
  lines.push(
    ``,
    `.${o.chartClass} {`,
    `  @st-chart-points(${o.arrName})`,
    `  position: relative;`,
    `  height: ${o.height}px;`,
    `  width: 100%;`,
    `  max-width: 520px;`,
    `  background: var(--st-surface);`,
    `  border-radius: ${o.radius}px;`,
    `  overflow: hidden;`
  );
  if (o.accent !== DEFAULT_ACCENT) lines.push(`  --st-accent: ${o.accent};`);
  lines.push(`}`);
  if (o.fill || o.line) {
    lines.push(
      ``,
      `.${o.chartClass}-fill, .${o.chartClass}-line {`,
      `  transition: clip-path 0.5s cubic-bezier(0.4, 0, 0.2, 1);`,
      `}`
    );
  }
  return lines.join("\n");
}

function buildHtmlSnippet(o) {
  const children = [];
  if (o.grid) children.push(`    <div class="${o.chartClass}-grid"></div>`);
  if (o.fill) children.push(`    <div class="${o.chartClass}-fill"></div>`);
  if (o.line) children.push(`    <div class="${o.chartClass}-line"></div>`);
  if (o.dots) o.data.forEach((_, i) => children.push(`    <div class="${o.chartClass}-dot-${i + 1}"></div>`));

  const fscss = buildFscss(o)
    .split("\n")
    .map((l) => "    " + l)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>st-core chart</title>
  <script src="https://cdn.jsdelivr.net/npm/fscss@1.2.5/runtime.min.js" defer></script>
  <style>
${fscss}
  </style>
</head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0e0d14;font-family:system-ui,sans-serif">
  <div class="${o.chartClass}">
${children.join("\n")}
  </div>
</body>
</html>`;
}

/** Approximate expanded CSS, shown until the FSCSS runtime returns the real output. */
function buildApproxCss(o) {
  const xs = xPositions(o.data.length);
  const vars = o.data.map((v, i) => `  --st-p${i + 1}: ${100 - v}%;`).join("\n");
  const c = o.chartClass;

  const parts = [
    `/* Approximate CSS for your data. For production, compile with the FSCSS CLI:`,
    `   fscss chart.fscss chart.css`,
    `   (st-core@v2 expands the full dual-edge line and tokens) */`,
    ``,
    `:root {`,
    `  --st-bg: #0e0d14;`,
    `  --st-surface: #161422;`,
    `  --st-accent: ${o.accent};`,
    `  --st-text: #e8e3ff;`,
    `  --st-muted: #6b6488;`,
    `  --st-border: rgba(157,126,255,.15);`,
    `}`,
    ``,
    `.${c} {`,
    vars,
    `  position: relative;`,
    `  height: ${o.height}px;`,
    `  width: 100%;`,
    `  max-width: 520px;`,
    `  background: var(--st-surface);`,
    `  border-radius: ${o.radius}px;`,
    `  overflow: hidden;`,
    `}`,
  ];
  if (o.fill) {
    parts.push(
      ``,
      `.${c}-fill {`,
      `  position: absolute; inset: 0;`,
      `  background: linear-gradient(180deg, color-mix(in srgb, var(--st-accent) 55%, transparent), transparent);`,
      `  clip-path: polygon(${fillPolygon(o.data)});`,
      `}`
    );
  }
  if (o.line) {
    parts.push(
      ``,
      `.${c}-line {`,
      `  position: absolute; inset: 0;`,
      `  background: var(--st-accent);`,
      `  clip-path: polygon(${linePolygon(o.data)});`,
      `}`
    );
  }
  if (o.grid) {
    parts.push(
      ``,
      `.${c}-grid {`,
      `  position: absolute; inset: 0;`,
      `  background-image:`,
      `    linear-gradient(to right, var(--st-border) 1px, transparent 1px),`,
      `    linear-gradient(to bottom, var(--st-border) 1px, transparent 1px);`,
      `  background-size: calc(100% / ${o.gridCols}) calc(100% / ${o.gridRows});`,
      `  pointer-events: none;`,
      `}`
    );
  }
  if (o.dots) {
    o.data.forEach((v, i) => {
      parts.push(
        ``,
        `.${c}-dot-${i + 1} {`,
        `  position: absolute;`,
        `  width: 8px; height: 8px;`,
        `  border-radius: 50%;`,
        `  background: var(--st-accent);`,
        `  left: ${xs[i]}%; top: ${100 - v}%;`,
        `  transform: translate(-50%, -50%);`,
        `  box-shadow: 0 0 0 3px color-mix(in srgb, var(--st-accent) 25%, transparent);`,
        `}`
      );
    });
  }
  return parts.join("\n");
}

/* 4. Preview */
let styleTag = null;
let currentClass = "";
let buildToken = 0;
const probe = createProbe();

function buildPreviewDom(o) {
  if (currentClass) chartPreview.classList.remove(currentClass);
  currentClass = o.chartClass;
  chartPreview.classList.add(currentClass);

  chartPreview.style.height = o.height + "px";
  chartPreview.style.borderRadius = o.radius + "px";
  chartPreview.replaceChildren();

  const add = (layer, cls, i) => {
    const el = document.createElement("div");
    el.className = cls;
    el.dataset.layer = layer;
    if (i !== undefined) el.style.animationDelay = 0.5 + i * 0.07 + "s";
    chartPreview.appendChild(el);
  };

  if (o.grid) add("grid", `${o.chartClass}-grid`);
  if (o.fill) add("fill", `${o.chartClass}-fill`);
  if (o.line) add("line", `${o.chartClass}-line`);
  if (o.dots) o.data.forEach((_, i) => add("dot", `${o.chartClass}-dot-${i + 1}`, i));
  chartPreview.appendChild(probe.root);
}

async function applyFscss(source) {
  if (styleTag && styleTag.parentNode) styleTag.parentNode.removeChild(styleTag);
  styleTag = null;

  const inject = (css) => {
    styleTag = document.createElement("style");
    styleTag.textContent = css;
    document.head.appendChild(styleTag);
    return { ok: true, css };
  };

  try {
    if (typeof xfscss === "function") {
      const result = await xfscss(source);
      if (typeof result === "string") return inject(result);
      if (result && result.css) return inject(result.css);
    }
    if (xfscss && typeof xfscss.reboot === "function") {
      styleTag = document.createElement("style");
      styleTag.type = "text/fscss";
      styleTag.textContent = source;
      document.head.appendChild(styleTag);
      xfscss.reboot();
      return { ok: true, css: null };
    }
    if (xfscss && typeof xfscss.exec === "function") {
      return new Promise((resolve) => {
        xfscss.exec({
          type: "TEXT",
          content: source,
          onSuccess: (el) => {
            styleTag = el;
            resolve({ ok: true, css: el && el.textContent ? el.textContent : null });
          },
          onError: (msg) => resolve({ ok: false, error: String(msg) }),
        });
      });
    }
  } catch (e) {
    return { ok: false, error: e.message || String(e) };
  }
  return { ok: false, error: "No usable xfscss API found (default, reboot or exec)" };
}

/** Paint approximate shapes on any layer the FSCSS runtime left empty. */
function paintFallback(o, force) {
  const needs = (el) => force || getComputedStyle(el).clipPath === "none";
  const xs = xPositions(o.data.length);

  const fillEl = chartPreview.querySelector('[data-layer="fill"]');
  if (fillEl && needs(fillEl)) {
    fillEl.style.clipPath = `polygon(${fillPolygon(o.data)})`;
    fillEl.style.background = `linear-gradient(180deg, color-mix(in srgb, ${o.accent} 55%, transparent), transparent)`;
  }
  const lineEl = chartPreview.querySelector('[data-layer="line"]');
  if (lineEl && needs(lineEl)) {
    lineEl.style.clipPath = `polygon(${linePolygon(o.data)})`;
    lineEl.style.background = o.accent;
  }
  const gridEl = chartPreview.querySelector('[data-layer="grid"]');
  if (gridEl && (force || getComputedStyle(gridEl).backgroundImage === "none")) {
    gridEl.style.backgroundImage =
      "linear-gradient(to right, rgba(157,126,255,.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(157,126,255,.15) 1px, transparent 1px)";
    gridEl.style.backgroundSize = `calc(100% / ${o.gridCols}) calc(100% / ${o.gridRows})`;
  }
  chartPreview.querySelectorAll('[data-layer="dot"]').forEach((d, i) => {
    if (!force && getComputedStyle(d).width !== "auto" && getComputedStyle(d).width !== "0px") return;
    Object.assign(d.style, {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: o.accent,
      left: xs[i] + "%",
      top: 100 - o.data[i] + "%",
      transform: "translate(-50%, -50%)",
      boxShadow: `0 0 0 3px color-mix(in srgb, ${o.accent} 25%, transparent)`,
    });
  });
}

function replayDraw() {
  chartPreview.classList.remove("is-drawing");
  void chartPreview.offsetWidth;
  chartPreview.classList.add("is-drawing");
}

function setStatus(kind, text) {
  statusBox.className = "status" + (kind ? " " + kind : "");
  statusText.textContent = text;
}

/** Hover readout: a guide line, a dot on the curve and a value tip. */
function createProbe() {
  const root = document.createElement("div");
  root.className = "probe";
  root.innerHTML = '<i class="probe-line"></i><i class="probe-dot"></i><b class="probe-tip"></b>';
  const [line, dot, tip] = root.children;
  let data = [];

  function show(clientX) {
    if (!data.length) return;
    const rect = chartPreview.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    const idx = data.length === 1 ? 0 : Math.round(ratio * (data.length - 1));
    const x = xPositions(data.length)[idx];
    const y = 100 - data[idx];

    line.style.left = x + "%";
    dot.style.left = x + "%";
    dot.style.top = y + "%";
    tip.style.left = `clamp(26px, ${x}%, calc(100% - 26px))`;
    tip.style.top = y + "%";
    tip.style.transform = data[idx] > 85 ? "translate(-50%, 90%)" : "translate(-50%, -150%)";
    tip.textContent = `#${idx + 1}: ${data[idx]}`;
    root.classList.add("on");
  }

  chartPreview.addEventListener("pointermove", (e) => show(e.clientX));
  chartPreview.addEventListener("pointerdown", (e) => show(e.clientX));
  chartPreview.addEventListener("pointerleave", () => root.classList.remove("on"));

  return { root, setData: (d) => (data = d) };
}

async function build() {
  const token = ++buildToken;
  const o = getOpts();
  updateStats(o.data);

  if (!o.data.length) {
    setStatus("err", "Enter at least one number between 0 and 100.");
    return;
  }

  outFscss.textContent = buildFscss(o);
  outHtml.textContent = buildHtmlSnippet(o);
  outCss.textContent = buildApproxCss(o);

  probe.setData(o.data);
  buildPreviewDom(o);
  chartPreview.style.setProperty("--st-accent", o.accent);
  o.data.forEach((v, i) => chartPreview.style.setProperty(`--st-p${i + 1}`, 100 - v + "%"));

  setStatus("busy", "Compiling FSCSS...");
  buildBtn.classList.add("is-busy");
  const result = await applyFscss(buildFscss(o));
  if (token !== buildToken) return; // a newer build started, drop this one
  buildBtn.classList.remove("is-busy");

  if (result.ok) {
    if (result.css) outCss.textContent = `/* Runtime-expanded CSS from FSCSS ESM */\n\n${result.css}`;
    paintFallback(o, false);
    const note = o.accentOk ? "" : " (accent color not valid, using default)";
    setStatus(o.accentOk ? "ok" : "err", `Preview ready: ${o.data.length} points, st-core@v2${note}`);
  } else {
    paintFallback(o, true);
    setStatus("err", `FSCSS runtime failed (${result.error || "unknown"}). Showing an approximate preview.`);
  }
  replayDraw();
}

/* 5. UI */
const debounce = (fn, ms) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

// Stats with a short count tween
const statValues = new WeakMap();
function tweenTo(el, to, decimals = 0) {
  const from = statValues.get(el) ?? 0;
  statValues.set(el, to);
  const start = performance.now();
  const dur = 350;
  const step = (now) => {
    const t = clamp((now - start) / dur, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (from + (to - from) * eased).toFixed(decimals);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function updateStats(data) {
  const n = data.length;
  tweenTo($("#stat-count"), n);
  tweenTo($("#stat-min"), n ? Math.min(...data) : 0);
  tweenTo($("#stat-max"), n ? Math.max(...data) : 0);
  tweenTo($("#stat-avg"), n ? data.reduce((a, b) => a + b, 0) / n : 0, 1);
}

// Presets with mini sparklines
function renderPresets() {
  const box = $("#presets");
  PRESETS.forEach((p) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "preset";
    const pts = p.data.map((v, i) => `${(i / (p.data.length - 1)) * 100},${100 - v}`).join(" ");
    btn.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}"/></svg>${p.name}`;
    btn.addEventListener("click", () => {
      dataInput.value = p.data.join(", ");
      build();
    });
    box.appendChild(btn);
  });
}

// Tabs
const tabs = [...document.querySelectorAll(".tab")];
const tabsBox = $("#tabs");

function moveIndicator() {
  const active = tabs.find((t) => t.classList.contains("active"));
  if (!active) return;
  tabsBox.style.setProperty("--tab-x", active.offsetLeft + "px");
  tabsBox.style.setProperty("--tab-w", active.offsetWidth + "px");
}

function selectTab(tab, focus = false) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    $("#panel-" + t.dataset.panel).hidden = !on;
  });
  moveIndicator();
  if (focus) tab.focus();
}

tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (e) => {
    const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    selectTab(tabs[(keys[e.key] + tabs.length) % tabs.length], true);
  });
});
window.addEventListener("resize", debounce(moveIndicator, 100));

// Copy
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
}

document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const kind = btn.dataset.copy;
    const text = { fscss: outFscss, css: outCss, html: outHtml }[kind].textContent;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Copied ${kind.toUpperCase()}`);
    } catch {
      showToast("Copy failed. Select the text manually.");
    }
  });
});

// Accent color picker and text stay in sync
const colorPicker = $("#opt-color");
const accentText = $("#opt-accent");
colorPicker.addEventListener("input", () => {
  accentText.value = colorPicker.value;
});
accentText.addEventListener("input", () => {
  if (/^#[0-9a-f]{6}$/i.test(accentText.value.trim())) colorPicker.value = accentText.value.trim();
});

// Events
buildBtn.addEventListener("click", build);
$("#btn-replay").addEventListener("click", replayDraw);
$("#btn-random").addEventListener("click", () => {
  const len = 5 + Math.floor(Math.random() * 6);
  dataInput.value = Array.from({ length: len }, () => Math.floor(Math.random() * 75) + 15).join(", ");
  build();
});
dataInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) build();
});
// Live preview while typing
sidebar.addEventListener("input", debounce(build, 450));

renderPresets();
selectTab(tabs[0]);
build();
