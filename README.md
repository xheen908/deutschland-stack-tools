# 🇩🇪 deutschland-stack-tools

> **The automated compliance bouncer for the German government.**
> Built in 168 minutes to solve the EU's PDF/UA and ODF bottleneck.
> Free. Open Source. Self-hostable.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://ghcr.io/xheen908/deutschland-stack-tools)
[![Tests](https://img.shields.io/badge/tests-passing-success.svg)](#)
[![Built for Deutschland-Stack](https://img.shields.io/badge/built%20for-Deutschland--Stack-black)](#)

---

## The 168-Minute Story 🚀

On June 18, 2026, the German federal and state governments celebrated a "breakthrough" for the **Deutschland-Stack**: Mandating true digital sovereignty (ODF) and full EU accessibility (PDF/UA) for all public documents. 

But enforcing this at scale is a massive infrastructure problem. How do you automatically prevent millions of proprietary or non-accessible documents from entering government systems? Experts warned: *"The mandate must be accompanied by strict quality criteria, otherwise we force authorities to use unfit solutions."*

**The solution didn't take a million-euro 3-year government project.**
It took 168 minutes on a Sunday afternoon.

`deutschland-stack-tools` is the missing bridge: A lightning-fast, dockerized Node.js Microservice wrapping the official validation engines (veraPDF & ODF-Toolkit). It acts as the **automated bouncer (Türsteher)** for any government CMS or portal. If a document lacks alt-texts for the blind or secretly hides proprietary code, the API blocks the upload in milliseconds.

We built the tollbooth for digital sovereignty. Ready to deploy.

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
