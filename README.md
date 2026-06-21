# 🇩🇪 deutschland-stack-tools

[🇺🇸 English](#english) | [🇩🇪 Deutsch](#deutsch)

---

<a name="english"></a>
## 🇺🇸 English

> **The automated compliance bouncer for the German government.**
> Built in 168 minutes to solve the EU's PDF/UA and ODF bottleneck.
> Free. Open Source. Self-hostable.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://ghcr.io/xheen908/deutschland-stack-tools)
[![Tests](https://img.shields.io/badge/tests-passing-success.svg)](#)
[![Built for Deutschland-Stack](https://img.shields.io/badge/built%20for-Deutschland--Stack-black)](#)

### The 168-Minute Story 🚀

On June 18, 2026, the German federal and state governments celebrated a "breakthrough" for the **Deutschland-Stack**: Mandating true digital sovereignty (ODF) and full EU accessibility (PDF/UA) for all public documents. 

But enforcing this at scale is a massive infrastructure problem. How do you automatically prevent millions of proprietary or non-accessible documents from entering government systems? Experts warned: *"The mandate must be accompanied by strict quality criteria, otherwise we force authorities to use unfit solutions."*

**The solution didn't take a million-euro 3-year government project.**
It took 168 minutes on a Sunday afternoon.

`deutschland-stack-tools` is the missing bridge: A lightning-fast, dockerized Node.js Microservice wrapping the official validation engines (veraPDF & ODF-Toolkit). It acts as the **automated bouncer (Türsteher)** for any government CMS or portal. If a document lacks alt-texts for the blind or secretly hides proprietary code, the API blocks the upload in milliseconds.

We built the tollbooth for digital sovereignty. Ready to deploy.

### Quick Start

#### Docker (30 seconds)
```bash
docker run -p 3000:3000 ghcr.io/xheen908/deutschland-stack-tools:latest
curl -F "file=@dokument.odt" http://localhost:3000/api/v1/validate
```

#### CLI
```bash
npm install -g deutschland-stack-tools
dst validate dokument.odt
dst validate bericht.pdf
dst batch ./dokumente/ --report report.json
```

### What it validates

| Standard | Details |
|----------|---------|
| ODF 1.2 / 1.3 / 1.4 | .odt, .ods, .odp |
| PDF/UA-1 (ISO 14289-1) | Matterhorn Protocol, 136 checks |
| PDF/UA-2 (ISO 14289-2) | Latest accessibility standard |

### API

`POST /api/v1/validate` — Upload & validate a single document  
`POST /api/v1/validate/batch` — Validate multiple documents  
`GET /api/v1/health` — Health check  
`GET /api/v1/info` — Standards information  

[→ Full API Documentation](docs/api.md)

### 🧪 End-to-End Test Suite & Transparency

We believe in radical transparency. The EU mandate requires 100% reliable enforcement. To prove this tool works in the real world, it includes a fully automated End-to-End (E2E) Test Suite that fetches real files (both valid and invalid) from the web and validates them against the API.

#### What the tests prove:
1. **Unsupported File Format:** Rejects files that are not strictly ODF or PDF, preventing malicious uploads.
2. **Fake PDF:** Catches corrupted files that try to spoof the PDF magic bytes (`%PDF`).
3. **Real PDF (but not PDF/UA):** Correctly flags a standard, working PDF as `invalid` because it lacks semantic tags and alt-texts (Matterhorn Protocol failure).
4. **Real ODT:** Successfully parses a real open standard document and returns the exact XML structure warnings.

#### Running the tests yourself:
```bash
./tests/e2e/test-api.sh
```

---

<a name="deutsch"></a>
## 🇩🇪 Deutsch

> **Der automatisierte Compliance-Türsteher für die deutsche Verwaltung.**
> Gebaut in 168 Minuten, um den PDF/UA- und ODF-Flaschenhals der EU zu lösen.
> Kostenlos. Open Source. Self-hostable.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://ghcr.io/xheen908/deutschland-stack-tools)
[![Tests](https://img.shields.io/badge/tests-passing-success.svg)](#)
[![Built for Deutschland-Stack](https://img.shields.io/badge/built%20for-Deutschland--Stack-black)](#)

### Die 168-Minuten-Geschichte 🚀

Am 18. Juni 2026 feierten Bund und Länder einen "Durchbruch" für den **Deutschland-Stack**: Die verpflichtende Einführung echter digitaler Souveränität (ODF) und vollständiger EU-Barrierefreiheit (PDF/UA) für alle öffentlichen Dokumente.

Doch die flächendeckende Durchsetzung ist ein gewaltiges Infrastrukturproblem. Wie verhindert man automatisch, dass Millionen von proprietären oder nicht barrierefreien Dokumenten in Behördensysteme gelangen? Experten warnten: *"Das Mandat muss von strengen Qualitätskriterien begleitet werden, sonst zwingen wir die Behörden, ungeeignete Lösungen zu nutzen."*

**Die Lösung brauchte kein 3-jähriges Millionenprojekt der Regierung.**
Sie dauerte 168 Minuten an einem Sonntagnachmittag.

`deutschland-stack-tools` ist die fehlende Brücke: Ein blitzschneller, als Docker-Container verpackter Node.js Microservice, der die offiziellen Validierungs-Engines (veraPDF & ODF-Toolkit) umschließt. Er fungiert als **automatisierter Türsteher** für jedes Behörden-CMS oder -Portal. Fehlen einem Dokument Alt-Texte für Blinde oder versteckt es proprietären Code, blockiert die API den Upload in Millisekunden.

Wir haben die Mautstelle für digitale Souveränität gebaut. Bereit für den Einsatz.

### Schnellstart

#### Docker (30 Sekunden)
```bash
docker run -p 3000:3000 ghcr.io/xheen908/deutschland-stack-tools:latest
curl -F "file=@dokument.odt" http://localhost:3000/api/v1/validate
```

#### CLI
```bash
npm install -g deutschland-stack-tools
dst validate dokument.odt
dst validate bericht.pdf
dst batch ./dokumente/ --report report.json
```

### Was validiert wird

| Standard | Details |
|----------|---------|
| ODF 1.2 / 1.3 / 1.4 | .odt, .ods, .odp |
| PDF/UA-1 (ISO 14289-1) | Matterhorn Protocol, 136 checks |
| PDF/UA-2 (ISO 14289-2) | Neuester Barrierefreiheits-Standard |

### API

`POST /api/v1/validate` — Einzelnes Dokument hochladen & validieren  
`POST /api/v1/validate/batch` — Mehrere Dokumente validieren  
`GET /api/v1/health` — Health Check  
`GET /api/v1/info` — Standards Informationen  

[→ Zur vollständigen API-Dokumentation](docs/api.md)

### 🧪 End-to-End Test-Suite & Transparenz

Wir glauben an radikale Transparenz. Das EU-Mandat erfordert eine 100% zuverlässige Durchsetzung. Um zu beweisen, dass dieses Tool in der realen Welt funktioniert, enthält es eine vollautomatische End-to-End (E2E) Test-Suite, die echte Dateien (sowohl gültige als auch ungültige) aus dem Internet abruft und gegen die API validiert.

#### Was die Tests beweisen:
1. **Unsupported File Format:** Lehnt Dateien ab, die nicht strikt ODF oder PDF sind, und verhindert so schädliche Uploads.
2. **Fake PDF (Parsing Fehler):** Erkennt beschädigte Dateien, die versuchen, die PDF Magic Bytes (`%PDF`) vorzutäuschen.
3. **Echtes PDF (aber nicht PDF/UA):** Markiert ein Standard-PDF korrekterweise als `invalid`, da ihm semantische Tags und Alt-Texte fehlen (Matterhorn-Protokoll-Fehler).
4. **Echtes ODT:** Parst ein echtes Open-Standard-Dokument erfolgreich und gibt exakte Warnungen zur XML-Struktur zurück.

#### Führe die Tests selbst aus:
```bash
./tests/e2e/test-api.sh
```

---

### Built with / Technologien

- [Apache ODF Toolkit](https://odftoolkit.org) — ODF validation engine
- [veraPDF](https://verapdf.org) — PDF/UA validation engine  
- [Fastify](https://fastify.dev) — REST API framework
- [Commander.js](https://github.com/tj/commander.js) — CLI framework

### Legal basis / Rechtliche Grundlage

- Deutschland-Stack Beschluss, 18. Juni 2026
- [OSBA Open Source Wettbewerb 2026](https://open-source-wettbewerb.de)
- ODF: OASIS OpenDocument Format v1.4
- PDF/UA: ISO 14289-1:2014 / ISO 14289-2:2024

---
*Made in Duisburg 🇩🇪 · MIT License · Self-hostable · No vendor lock-in*
