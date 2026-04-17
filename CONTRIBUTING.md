 # Contributing to st-core.fscss

Thanks for your interest in contributing. st-core is a focused plugin — a single `.fscss` source file that compiles to pure CSS. Contributions should stay true to that philosophy: lightweight, zero-runtime, CSS-first.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [What We Accept](#2-what-we-accept)
3. [Getting Started](#3-getting-started)
4. [Working on `st-core.fscss`](#4-working-on-st-corefscss)
5. [Mixin Conventions](#5-mixin-conventions)
6. [Testing Your Changes](#6-testing-your-changes)
7. [Submitting a Pull Request](#7-submitting-a-pull-request)
8. [Reporting Issues](#8-reporting-issues)
9. [Ground Rules](#9-ground-rules)

---

## 1. Project Structure

```
st-core.fscss/
├── demo/                       ←  demo assets folder
│   ├── js/
│   │   └── demo.js             ←  demo  js control for demo.html
│   └── src/
│       ├── demo.fscss          ←  FSCSS source for demo.html
│       ├── multi-chart.fscss   ←  FSCSS source for multi-chart.html
│       └── static_demo.fscss  ←  FSCSS source for static_demo.html
│
├── .gitattributes              ←  highlighting config
├── CONTRIBUTING.md             ←  contributor guide
├── LICENSE                     ←  MIT license
├── README.md                   ←  docs & usage guide
│
├── demo.html                   ←  single chart demo
├── multi-chart.html            ←  multi-line chart demo
├── static_demo.html            ←  static chart demo
│
├── package.json                ←  FSCSS registry metadata
└── st-core.fscss               ←  core library source (all mixins live here)
```

The entire library is `st-core.fscss`. That's the only file you need to edit when adding or changing mixins.

---

## 2. What We Accept

**Good contributions:**

- New `@st-*` mixins that fit the statistical dashboard use case
- Bug fixes for existing mixins (incorrect `clip-path`, layout issues, variable scoping)
- Improvements to `demo.html` or `multi-chart.html` that better showcase a feature
- README / documentation fixes
- `package.json` metadata updates (e.g. adding a new mixin to `file.usage.helpers`)

**Out of scope:**

- Anything that requires JavaScript to render (CSS does the work here)
- External dependencies — no npm packages, no CDN imports beyond the FSCSS runtime
- Mixins that duplicate existing ones without meaningful improvement
- Breaking changes to existing `@st-*` mixin signatures without a strong reason

If you're unsure, open an issue first before writing code.

---

## 3. Getting Started

You need the FSCSS CLI to compile and test locally.

```bash
# Install FSCSS CLI globally
npm install -g fscss

# Clone the repo
git clone https://github.com/fscss-ttr/st-core.fscss.git
cd st-core.fscss
```

Verify your FSCSS version matches the requirement:

```bash
fscss --version
# should be 1.1.24 or higher
```

---

## 4. Working on `st-core.fscss`

All mixins are defined in `st-core.fscss` using FSCSS `@define` blocks. The pattern looks like this:

```fscss
@define st-example-mixin(selector:default) {`
  @use(selector){
    /* your CSS here */
  }
`}
```

For mixins with multiple parameters:

```fscss
@define st-chart-example(selector:default, param1:default, param2:default) {`
  @use(selector){
    --st-example-var: @use(param);
    height: @use(param2);
  }
`}
```

**When adding a new mixin:**

1. Follow the `st-` prefix — every mixin in this library is namespaced `st-*`.
2. Use existing design tokens (`--st-accent`, `--st-surface`, `--st-radius-*` etc.) where appropriate — don't hardcode colors or sizes.
3. Make it overridable — if your mixin sets a value, expose it as a CSS custom property so consumers can override it locally.
4. Add it to `package.json` under `file.usage.helpers`.

**When editing an existing mixin:**

- Don't change the parameter order — that's a breaking change.
- If you need to extend behavior, add an optional parameter at the end.
- Test that `demo.html` and `multi-chart.html` still render correctly after your change.

---

## 5. Mixin Conventions

| Rule | Example |
|---|---|
| Prefix all mixins `st-` | `@define st-my-mixin` |
| First param is always `$selector` | `@define st-thing(selector)` |
| Use design tokens, not hardcoded values | `var(--st-accent)` not `#9d7eff` |
| Expose customizable values as CSS vars | `--st-thing-size: $size:` |
| Keep mixins single-purpose | one visual concern per mixin |

**Naming pattern for chart mixins:**

```
st-chart-{what it renders}
```

Examples: `st-chart-fill`, `st-chart-line`, `st-chart-dot`, `st-chart-grid`

**Naming pattern for UI components:**

```
st-{component-name}
```

Examples: `st-stat-card`, `st-cat-bar-fill`, `st-phone`

---

## 6. Testing Your Changes

There's no automated test suite — testing is visual, via the demo files.

**CDN test (quickest):**

Open `demo.html` or `multi-chart.html` in a browser. These use the FSCSS CDN runtime (`exec.min.js`), so changes to `st-core.fscss` are picked up immediately on reload.

**Compiled test (production check):**

```bash
# Compile the source
fscss st-core.fscss st-core.css

# Then open static_demo.html — it references the compiled output
```

Both tests should pass before you submit a PR. If the compiled output looks different from the CDN version, that's a bug worth noting in your PR description.

---

## 7. Submitting a Pull Request

1. Fork the repo and create a branch from `main`:

   ```bash
   git checkout -b feat/my-new-mixin
   # or
   git checkout -b fix/chart-line-clipping
   ```

2. Make your changes in `st-core.fscss` (and `package.json` if adding a mixin).

3. Test visually in `demo.html` and/or `multi-chart.html`.

4. Keep the PR focused — one mixin or one fix per PR.

5. Write a clear PR description:
   - What does it add or fix?
   - Which demo file shows it working?
   - Any design decisions worth explaining?

6. Open the PR against `main`.

**PR title format:**

```
feat: add @st-chart-bar mixin
fix: correct y-axis absolute positioning
docs: update token reference table
```

---

## 8. Reporting Issues

Use [GitHub Issues](https://github.com/fscss-ttr/st-core.fscss/issues).

A good bug report includes:

- Which mixin is affected
- FSCSS version (`fscss --version`)
- Browser + OS
- A minimal reproduction — ideally a snippet using the CDN runtime

For feature requests, describe the component and why it fits the st-core scope (pure CSS, statistical dashboard context).

---

## 9. Ground Rules

- **CSS-first.** If it needs JavaScript to render, it doesn't belong in st-core. JS is welcome in demos to drive CSS variables — not to render shapes.
- **No external dependencies.** The library is one `.fscss` file. Keep it that way.
- **Respect the token system.** New mixins should consume `--st-*` variables, not introduce isolated hardcoded values.
- **FSCSS v1.1.24+.** Don't use features from newer FSCSS versions without updating the `fscss_version` field in `package.json`.
- **Be specific with selectors.** Mixins take a `$selector` param for a reason — don't write mixins that bleed styles onto global elements.

---

> MIT License · [fscss-ttr](https://github.com/fscss-ttr) · [FSCSS](https://fscss.devtem.org)
