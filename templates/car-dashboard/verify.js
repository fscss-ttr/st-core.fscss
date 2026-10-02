const fs = require("fs");
const path = require("path");
const dir = __dirname;
// basename, so this runs under any template name:  node verify.js [basename]
const base = process.argv[2] || "car";
const js = fs.readFileSync(path.join(dir, `${base}.js`), "utf8");
const fs2 = fs.readFileSync(path.join(dir, `${base}.fscss`), "utf8");
const html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
const css = fs.readFileSync(path.join(dir, `${base}.css`), "utf8");

let fail = 0;
const ok = (c, m) => { console.log((c ? "  PASS  " : "  FAIL  ") + m); if (!c) fail++; };

// fscss reports success even when a remote import fails, emitting
// `/* Failed import: <url> */` and then compiling nothing useful - no
// tokens, no chart helpers. Observed once on a transient CDN hiccup.
// This must be the very first check.
console.log("=== remote import health ===");
const failedImport = css.match(/\/\*\s*Failed import:[^*]*\*\//g) || [];
ok(failedImport.length === 0, "no failed remote import" +
   (failedImport.length ? "\n         " + failedImport.join("\n         ") + "\n         (re-run fscss - the CDN fetch failed)" : ""));
ok(/--st-radius-lg/.test(css) && /--st-cat-bar-fill-range/.test(css),
   "st-core helpers actually landed in the output");

console.log("=== JS SERIES vs FSCSS @arr ===");
for (const k of ["7d", "30d", "90d"]) {
  const j = js.match(new RegExp('"' + k + '":\\s*\\{\\s*data:\\s*\\[([\\d,\\s]+)\\]'));
  const f = fs2.match(new RegExp("speed-" + k + "\\[([\\d,\\s]+)\\]"));
  const ja = j ? j[1].split(",").map(s => s.trim()).filter(Boolean) : [];
  const fa = f ? f[1].split(",").map(s => s.trim()).filter(Boolean) : [];
  ok(ja.join() === fa.join(), k + ": " + ja.length + " pts, identical=" + (ja.join() === fa.join()));
  if (ja.join() !== fa.join()) { console.log("      JS  = " + ja.join()); console.log("      FSC = " + fa.join()); }
}

console.log("\n=== axis-x label count vs data count ===");
for (const k of ["7d", "30d", "90d"]) {
  const start = html.indexOf('id="range-' + k + '"');
  const next = html.indexOf('<div class="range', start + 10);
  const block = html.slice(start, next === -1 ? html.length : next);
  const ax = block.match(/<div class="axis-x"[^>]*>([\s\S]*?)<\/div>/);
  const labels = ax ? (ax[1].match(/<span>/g) || []).length : 0;
  const j = js.match(new RegExp('"' + k + '":\\s*\\{\\s*data:\\s*\\[([\\d,\\s]+)\\]'));
  const n = j[1].split(",").filter(s => s.trim()).length;
  ok(labels === n, k + ": " + labels + " labels vs " + n + " points");
}

console.log("\n=== aria wiring ===");
for (const m of html.matchAll(/aria-controls="([^"]+)"/g)) {
  ok(html.includes('id="' + m[1] + '"'), 'aria-controls -> ' + m[1]);
}
for (const m of html.matchAll(/aria-labelledby="([^"]+)"/g)) {
  ok(html.includes('id="' + m[1] + '"'), 'aria-labelledby -> ' + m[1]);
}

console.log("\n=== tab roving state ===");
const tabs = [...html.matchAll(/<button class="tab" role="tab" id="tab-(\w+)"[^>]*aria-selected="(\w+)"[^>]*tabindex="(-?\d+)"/g)];
ok(tabs.length === 3, "3 role=tab buttons found: " + tabs.length);
const sel = tabs.filter(t => t[2] === "true");
const t0 = tabs.filter(t => t[3] === "0");
ok(sel.length === 1, "exactly 1 aria-selected=true");
ok(t0.length === 1 && sel[0][1] === t0[0][1], "exactly 1 tabindex=0, and it is the selected one");
for (const t of tabs) console.log("      tab-" + t[1] + "  selected=" + t[2] + "  tabindex=" + t[3]);

console.log("\n=== JS ids ===");
for (const m of new Set([...js.matchAll(/\$\("#([\w-]+)"\)/g)].map(x => x[1]))) {
  ok(html.includes('id="' + m + '"'), '$("#' + m + '")');
}

console.log("\n=== per-range CSS geometry ===");
// Brace-aware block scan. The chart helpers emit their rules NESTED inside
// the range container (.speed-7d { .speed-fill-7d { clip-path: ... } }),
// and a selector can appear in several rules at once (a grouped animation
// rule listed before the geometry rule). So neither a regex over
// `sel { ... }` nor indexOf(sel) + next "polygon(" is safe: the first
// silently reports a different range's polygon, the second cannot span
// nested braces. Collect every block with its own selector + body, then
// take the one that both owns the selector and carries the polygon.
const blocks = [];
{
  const src = css.replace(/\/\*[\s\S]*?\*\//g, " "); // comments may hold braces/quotes
  let depth = 0, selStart = 0;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") {
      const sel = src.slice(selStart, i).trim();
      let d = 0, j = i;
      for (; j < src.length; j++) {
        if (src[j] === "{") d++;
        else if (src[j] === "}") { d--; if (!d) break; }
      }
      blocks.push({ sel, body: src.slice(i + 1, j) });
      // Record the block but keep scanning INSIDE it, otherwise nested
      // rules (which is where the chart helpers live) are never visited.
      selStart = i + 1;
      continue;
    }
    if (ch === "}") { depth = 0; selStart = i + 1; }
    else if (ch === ";" && depth === 0) selStart = i + 1;
  }
}
const poly = (sel) => {
  for (const b of blocks) {
    if (!b.sel.split(",").some((s) => s.trim() === sel)) continue;
    const s = b.body.indexOf("polygon(");
    if (s < 0) continue;
    let d = 0, j = s + 7;
    while (j < b.body.length) { if (b.body[j] === "(") d++; else if (b.body[j] === ")") { d--; if (!d) break; } j++; }
    return b.body.slice(s + 8, j).split(",").filter((x) => x.trim()).length;
  }
  return null;
};
const exp = { "7d": [9, 15], "30d": [12, 21], "90d": [14, 25] };
for (const k of ["7d", "30d", "90d"]) {
  const f = poly(".speed-fill-" + k), l = poly(".speed-line-" + k);
  ok(f === exp[k][0] && l === exp[k][1], k + ": fill " + f + " (exp " + exp[k][0] + "), line " + l + " (exp " + exp[k][1] + ")");
}

console.log("\n=== range-switch animation ===");
for (const k of ["chartGridIn", "chartFillIn", "chartLineIn", "chartPeakIn", "chartAxisIn"]) {
  ok(css.includes("@keyframes " + k), "declares " + k);
}
// `backwards` matters: the delays are staggered, so without it an element
// sits at full opacity for its whole delay instead of holding from-state.
const animRule = (sel) => {
  const b = blocks.find((x) => x.sel.split(",").some((s) => s.trim() === sel) && /animation:/.test(x.body));
  return b ? b.body : "";
};
for (const [sel, name] of [[".speed-fill-7d", "chartFillIn"], [".speed-line-7d", "chartLineIn"], [".speed-grid-7d", "chartGridIn"]]) {
  const body = animRule(sel);
  ok(new RegExp("animation:\\s*" + name + "\\b").test(body) && /backwards/.test(body),
     sel + " animates " + name + " with backwards fill");
}
ok(/transform-origin:\s*50%\s+100%/.test(animRule(".speed-fill-7d")), "fill scales from the baseline");
const peakBody = blocks.find((x) => x.sel === ".peak" && /animation:/.test(x.body))?.body || "";
ok(/animation:\s*chartPeakIn\b/.test(peakBody) && /backwards/.test(peakBody), "peak pops in with backwards fill");
ok(/transition:/.test(peakBody) && /left/.test(peakBody) && /top/.test(peakBody), "peak glides on left/top");
ok(/@media \(prefers-reduced-motion: reduce\)/.test(css), "reduced-motion block still present");
// fscss parses at-rule names out of comments and hoists them as real
// rules, so a comment mentioning one silently corrupts the output.
const declared = new Set([...css.matchAll(/@keyframes\s+([a-zA-Z-]+)/g)].map((x) => x[1]));
const expected = new Set(["badge", "chartAxisIn", "chartFillIn", "chartGridIn", "chartLineIn", "chartPeakIn", "drop", "halo", "ping", "rise"]);
const bogus = [...declared].filter((k) => !expected.has(k));
ok(bogus.length === 0, "no keyframes hoisted out of comments" + (bogus.length ? " -> " + bogus.join(", ") : ""));

console.log("\n=== regression guards ===");
ok(!/:has\(/.test(css), "no :has()");

// The bug that killed the whole theme: @st-root() emits its own `:root{}`
// rule, so calling it inside `body{}` produced `body :root{...}` (matches
// nothing) AND made Chrome drop every declaration written after that
// nested block. Guard: :root must be a top-level rule.
let nestedRoot = false;
for (const m of css.matchAll(/(^|})\s*:root\s*\{/g)) {
  if (m[1] !== "}") nestedRoot = true;
}
ok(!nestedRoot && /(^|})\s*:root\s*\{/m.test(css), ":root is top-level (not nested inside body)");
const bodyRule = (css.match(/(?:^|})\s*body\{([^}]*)\}/) || [])[1] || "";
ok(!/:root/.test(bodyRule), "body rule contains no nested :root");
ok(!/\b(color|background|font-family)\s*:/.test(bodyRule) === false, "body rule kept its base declarations");
ok(/color\s*:\s*var\(--st-text\)/.test(bodyRule) && /font-family\s*:/.test(bodyRule),
   "body kept color + font-family  (got: " + bodyRule.trim().replace(/\s+/g, " ") + ")");

// No STYLE rule may contain declarations after a nested block - Chrome
// drops them. A regex cannot scope "later in the same rule", so walk the
// braces properly. @keyframes is exempt: nesting is its whole purpose.
function declsAfterNestedRule(cssText) {
  // Strip @keyframes (and their bodies) first.
  const text = cssText.replace(/@keyframes[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, "");
  const bad = [];

  // Walk top-level rules; for each, walk its body and note whether a
  // top-level declaration (depth 0 within the body) comes after a
  // nested block has already closed.
  let i = 0, depth = 0, selStart = 0, sawNested = false, sel = "";
  const isDecl = (t) => /(^|[;{}])\s*[-a-z]+\s*:/.test(t) && !/^\s*@/.test(t);

  while (i < text.length) {
    const c = text[i];
    if (c === "{") {
      if (depth === 0) {
        sel = text.slice(selStart, i).trim().split("\n").pop().trim();
        sawNested = false;
      } else if (depth === 1) {
        sawNested = true;           // entering a nested block
      }
      depth++;
      i++;
      continue;
    }
    if (c === "}") {
      depth--;
      if (depth < 0) { depth = 0; selStart = i + 1; }
      if (depth === 0) { selStart = i + 1; }
      i++;
      continue;
    }
    if (c === ";" && depth === 1 && sawNested) {
      // The statement just ended sits at the rule's own depth.
      bad.push(sel);
      sawNested = false;            // report once per rule
    }
    i++;
  }
  return [...new Set(bad)];
}
const dropRisk = declsAfterNestedRule(css);
ok(dropRisk.length === 0, "no style rule mixes a nested block with later declarations" +
   (dropRisk.length ? " -> " + dropRisk.slice(0, 4).join(", ") : ""));

// Scope the clip test to the .chart-wrap rule body itself - a loose
// file-wide regex would match any earlier overflow:hidden instead.
const wrapRule = (css.match(/\.chart-wrap\s*\{([^}]*)\}/) || [])[1] || "";
ok(!/overflow\s*:\s*hidden/.test(wrapRule), ".chart-wrap does not clip  (rule: " + wrapRule.trim() + ")");
const clipping = [...css.matchAll(/([\w\-\.]+)\s*\{[^}]*overflow:\s*hidden/g)].map(m => m[1]);
console.log("      selectors that do clip: " + (clipping.join(", ") || "none"));
ok(!/animation:[^;]*\bboth\b/.test(css), "no animation-fill-mode: both");
ok(!/@(arr|use|define|import)\b/.test(css), "no FSCSS token leakage");
ok(/#range-\$/.test(js) || /"#range-" \+/.test(js), "peak lookup uses key concat (no hardcoded ids)");

console.log("\n=== top-level :root sanity ===");
const rootRule = (css.match(/(?:^|})\s*:root\s*\{([\s\S]*?)\n\}/) || [])[1] || "";
for (const t of ["--st-bg", "--st-accent", "--st-card", "--st-radius-lg", "--st-pad"]) {
  ok(rootRule.includes(t), "root defines " + t);
}
ok(/--st-accent:\s*#f5a524/.test(rootRule), "--st-accent is the amber override, not the st-core purple");

console.log("\n=== stray top-level semicolons ===");
// Structural checks must ignore comments: this file's own comments
// mention ".bar-urban{ ... }" and the word ";" verbatim, which a naive
// regex happily matches.
const bare = css.replace(/\/\*[\s\S]*?\*\//g, " ");
// A bare `;` at top level is invalid, and Chrome discards the style rule
// that follows it. fscss emits one for a bare top-level mixin call that
// ends with `;` - verified to silently kill rules.
let d = 0, strayCount = 0;
for (const ch of bare) {
  if (ch === "{") d++;
  else if (ch === "}") d = Math.max(0, d - 1);
  else if (ch === ";" && d === 0) strayCount++;
}
ok(strayCount === 0, "no bare top-level ';' (Chrome drops the following rule) -> found " + strayCount);
for (const b of ["bar-urban", "bar-highway", "bar-mixed"]) {
  const rule = (bare.match(new RegExp("\\." + b + "\\s*\\{([^}]*)\\}")) || [])[1] || "";
  const range = (rule.match(/--st-cat-bar-fill-range:\s*([\d.]+%)/) || [])[1];
  ok(!!range, "." + b + " declares --st-cat-bar-fill-range" + (range ? " = " + range : ""));
}
ok(!/(\.[\w-]+)\s*\{\s*\1\s*\{/.test(bare), "no doubled selector (helper rule wrapped in itself)");

console.log(fail === 0 ? "\nALL CHECKS PASSED" : "\n" + fail + " CHECK(S) FAILED");
process.exit(fail === 0 ? 0 : 1);