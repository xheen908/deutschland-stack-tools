# API Integration für die WBA OCR Engine

Bisher ist unsere WBA Extraction Engine nur über die Kommandozeile (CLI) aufrufbar. Da der Deutschland-Stack als Microservice fungiert, muss dieses Feature natürlich "live" über eine HTTP API verfügbar gemacht werden.

## User Review Required
> [!IMPORTANT]
> Ist der Endpoint-Name `POST /api/v1/ocr/wba` für dich in Ordnung?

## Proposed Changes

### 1. API Route erstellen
Wir fügen dem Fastify-Server einen neuen Endpoint hinzu, der Datei-Uploads entgegennimmt.

#### [NEW] [src/api/routes/ocr.ts](file:///Users/xheen908/deutschland-stack-tools/src/api/routes/ocr.ts)
- Ein `POST /ocr/wba` Handler.
- Nutzt `@fastify/multipart` um die hochgeladene PDF-Datei als Stream zu empfangen.
- Speichert die Datei temporär in einem `tmp/` Ordner ab.
- Führt unsere bestehende Funktion `await extractWBA(tempFilePath)` aus.
- Löscht das temporäre PDF anschließend auf, um den Server sauber zu halten.
- Gibt das strukturierte JSON an den Client (z.B. ein Frontend oder ein anderes Backend-System) zurück.

### 2. Route registrieren
#### [MODIFY] [src/api/server.ts](file:///Users/xheen908/deutschland-stack-tools/src/api/server.ts)
- Importiert den neuen `ocrRoute` Handler und registriert ihn unter dem `/api/v1` Prefix.

### 3. E2E-Test Script erweitern
#### [MODIFY] [tests/e2e/test-api.sh](file:///Users/xheen908/deutschland-stack-tools/tests/e2e/test-api.sh)
- Hinzufügen einer Funktion, um die neue Route `POST /api/v1/ocr/wba` zu testen.
- Hochladen von `tests/fixtures/wba-dummy.pdf` gegen den laufenden Localhost-Server.
- Wir prüfen via `jq`, ob das zurückgegebene JSON die Eigenschaft `.antrags_metadaten.dokumenten_typ == "WBA"` enthält. (Der API-Test überspringt den OCR-Call elegant mit einem "Skip", wenn der Ollama-Server auf dem Host nicht läuft, um CI-Fehler zu vermeiden).

### 4. Dokumentation
#### [MODIFY] [README.md](file:///Users/xheen908/deutschland-stack-tools/README.md)
- Aktualisierung der README, um den neuen `curl`-Befehl für den OCR API-Endpoint aufzulisten.

## Verification Plan
### Automated Tests & Manual Verification
1. Server starten via `npm run dev` oder `npx ts-node src/index.ts serve`.
2. Einen `curl`-Upload des WBA-Dummys an den neuen Endpoint ausführen:
   `curl -F "file=@tests/fixtures/wba-dummy.pdf" http://localhost:3000/api/v1/ocr/wba`
3. Verifizieren, dass der Server das JSON korrekt als HTTP-Response (Status 200) zurückgibt.
4. Abschließender Git Commit.
