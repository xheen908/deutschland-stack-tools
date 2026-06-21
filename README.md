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
# Standard validation server
docker run -p 3000:3000 ghcr.io/xheen908/deutschland-stack-tools:latest
curl -F "file=@dokument.odt" http://localhost:3000/api/v1/validate

# WITH AI OCR Engine enabled (requires local Ollama on Mac/Windows)
docker run -p 3000:3000 -e OLLAMA_API_URL="http://host.docker.internal:11434/api/generate" ghcr.io/xheen908/deutschland-stack-tools:latest
```

### CLI
```bash
npm install -g deutschland-stack-tools
dst validate dokument.odt
dst validate bericht.pdf
dst batch ./dokumente/ --report report.json

# Extract WBA Form via local AI Vision Engine
dst ocr wba ./test-real-wba-scanned.pdf
```

---

## 🤖 WBA AI OCR Engine (New!)

Behörden-Formulare manuell abzutippen kostet Millionen an Steuergeldern.
`deutschland-stack-tools` kommt jetzt mit einer eingebauten **autarken AI Vision Engine** zur Datenextraktion, speziell optimiert für den **"Weiterbewilligungsantrag SGB II" (WBA)**.

- **100% DSGVO-Konform:** Die Daten (wie BG-Nummer, Anschrift, Einkommen) verlassen den Server niemals. Es gibt keine Cloud-API.
- **Lokale KI:** Nutzt [Ollama](https://ollama.com/) und das 11B Parameter `llama3.2-vision` Modell direkt via `localhost:11434`.
- **Page-by-Page Extraction:** Umgeht das Kontext-Limit von Open Source Vision Modellen durch iteratives Prompting pro PDF-Seite und mergt die Ergebnisse zu einem maschinenlesbaren, strukturierten JSON.
- **Handschrift-Korrektur:** Erkennt angekreuzte Checkboxen und korrigiert typische KI-Lesefehler bei deutscher Handschrift automatisch (z.B. "ß" vs "b").

```bash
dst ocr wba ./eingescannter_antrag.pdf
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
`POST /api/v1/ocr/wba` — OCR Extract WBA Form (Returns structured JSON)
`GET /api/v1/health` — Health check  
`GET /api/v1/info` — Standards information  

[→ Full API Documentation](docs/api.md)

---

## 🧪 End-to-End Test Suite & Transparency

We believe in radical transparency. The EU mandate requires 100% reliable enforcement. To prove this tool works in the real world, it includes a fully automated End-to-End (E2E) Test Suite that fetches real files (both valid and invalid) from the web and validates them against the API.

### What the tests prove:
1. **Unsupported File Format:** Rejects files that are not strictly ODF or PDF, preventing malicious uploads.
2. **Fake PDF (Parsing Fehler):** Catches corrupted files that try to spoof the PDF magic bytes (`%PDF`).
3. **Echtes PDF (aber nicht PDF/UA):** Correctly flags a standard, working PDF as `invalid` because it lacks semantic tags and alt-texts (Matterhorn Protocol failure).
4. **Echtes ODT (Sollte Valid oder Warning sein):** Successfully parses a real open standard document and returns the exact XML structure warnings.

### Running the tests yourself:
```bash
./tests/e2e/test-api.sh
```

### Example Test Run Output:
```text
=============================================
Deutschland-Stack-Tools E2E Testsuite
API Base URL: http://localhost:3000/api/v1
=============================================
Lade Testdateien herunter...
Starte Tests...
---------------------------------------------
Test: Unsupported File Format ... ✅ BESTANDEN (UNSUPPORTED_FORMAT erkannt)
Test: Fake PDF (Parsing Fehler) ... ✅ BESTANDEN
Test: Echtes PDF (aber nicht PDF/UA) ... ✅ BESTANDEN
Test: Echtes ODT (Sollte Valid oder Warning sein) ... ✅ BESTANDEN
Test: WBA OCR API Endpoint ... ✅ BESTANDEN (JSON extrahiert)
---------------------------------------------
Tests abgeschlossen.
✅ Bestanden: 5
```

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
