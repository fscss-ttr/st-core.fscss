# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| Latest | Yes |
| Older releases | No |

## Scope

This repository contains FSCSS source only: design tokens and `@define` mixins. There is no bundled JavaScript, build step, or executable code here, and any HTML in this repo is sample/demo markup only. As such there is no meaningful application attack surface (no code execution, no data handling, no network calls) originating from this repository itself.

If you're looking to report a vulnerability in the FSCSS compiler or its JavaScript runtime, please report it against the [FSCSS repository](https://github.com/fscss-ttr/FSCSS) instead, not here.

## Reporting a concern

If you still believe you've found a security-relevant issue specific to this repository, for example a malicious or compromised file in the source, a supply-chain concern, or a problem with how a mixin resolves when imported remotely, please report it privately through [GitHub Security Advisories](https://github.com/fscss-ttr/st-core.fscss/security/advisories/new) for this repository rather than opening a public issue.

We'll acknowledge reports within 5 business days.
