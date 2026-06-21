# 🇩🇪 deutschland-stack-tools

> ODF & PDF/UA compliance validator for Germany's 2028 open-source mandate.
> Built in 48 hours by one developer. Free. Open Source. Self-hostable.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://ghcr.io/xheen908/deutschland-stack-tools)
[![Tests](https://img.shields.io/badge/tests-passing-success.svg)](#)
[![Built for Deutschland-Stack](https://img.shields.io/badge/built%20for-Deutschland--Stack-black)](#)

---

## Why this exists

On June 18, 2026, Germany's federal and state governments agreed on the 
"Deutschland-Stack" — mandating ODF and PDF/UA as the only permitted document 
formats for all public administration by 2028.

Thousands of agencies now need a way to validate compliance.
This tool does exactly that.

---

## Quick Start

### Docker (30 seconds)
```bash
docker run -p 3000:3000 ghcr.io/xheen908/deutschland-stack-tools:latest
curl -F "file=@dokument.odt" http://localhost:3000/api/v1/validate
```

### CLI
```bash
npm install -g deutschland-stack-tools
dst validate dokument.odt
dst validate bericht.pdf
dst batch ./dokumente/ --report report.json
```

---

## What it validates

| Standard | Details |
|----------|---------|
| ODF 1.2 / 1.3 / 1.4 | .odt, .ods, .odp |
| PDF/UA-1 (ISO 14289-1) | Matterhorn Protocol, 136 checks |
| PDF/UA-2 (ISO 14289-2) | Latest accessibility standard |

---

## API

`POST /api/v1/validate` — Upload & validate a single document  
`POST /api/v1/validate/batch` — Validate multiple documents  
`GET /api/v1/health` — Health check  
`GET /api/v1/info` — Standards information  

[→ Full API Documentation](docs/api.md)

---

## Built with

- [Apache ODF Toolkit](https://odftoolkit.org) — ODF validation engine
- [veraPDF](https://verapdf.org) — PDF/UA validation engine  
- [Fastify](https://fastify.dev) — REST API framework
- [Commander.js](https://github.com/tj/commander.js) — CLI framework

---

## Legal basis

- Deutschland-Stack Beschluss, 18. Juni 2026
- [OSBA Open Source Wettbewerb 2026](https://open-source-wettbewerb.de)
- ODF: OASIS OpenDocument Format v1.4
- PDF/UA: ISO 14289-1:2014 / ISO 14289-2:2024

---

*Made in Duisburg 🇩🇪 · MIT License · Self-hostable · No vendor lock-in*
