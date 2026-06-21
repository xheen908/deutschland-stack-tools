import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { WBAData } from '../types/wba';

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'llama3.2-vision';

/**
 * Extrahier WBA-Daten aus einem 6-seitigen WBA PDF-Dokument.
 */
export async function extractWBA(filePath: string): Promise<WBAData> {
  const absolutePath = path.resolve(filePath);
  let base64Images: string[] = [];

  if (absolutePath.toLowerCase().endsWith('.pdf')) {
    const pythonScript = path.join(__dirname, 'pdf-to-images.py');
    const result = execSync(`python3 ${pythonScript} "${absolutePath}"`, { maxBuffer: 50 * 1024 * 1024 });
    base64Images = JSON.parse(result.toString());
  } else {
    const imageBuffer = fs.readFileSync(absolutePath);
    base64Images.push(imageBuffer.toString('base64'));
  }

  const pagePrompts = [
    // Page 1
    `Extrahiere die Metadaten und persönlichen Daten aus dieser ersten Seite des WBA. 
     WICHTIGER HINWEIS: Ein handschriftliches 'ß' wird oft als 'b' gelesen. Wenn es wie "Hauptstrabe" aussieht, korrigiere es bitte zu "Hauptstraße".
     Das Kästchen 'Wohnen Sie allein' hat 'Nein' angekreuzt, setze also 'wohnt_alleine' auf false. Lies die BG-Nummer genau!
     ZIEL-SCHEMA:
     {
       "antrags_metadaten": { "dokumenten_typ": "string", "bewilligungszeitraum_ende": "string", "bg_nummer": "string" },
       "persoenliche_daten": {
         "vorname": "string", "nachname": "string", "geburtsdatum": "string",
         "anschrift": { "strasse": "string", "hausnummer": "string", "plz": "string", "ort": "string" },
         "wohnt_alleine": "boolean"
       }
     }`,
    // Page 2
    `Extrahiere die Kosten der Unterkunft aus dieser zweiten Seite des WBA. 
     WICHTIGER HINWEIS: Bei Ja/Nein Fragen (z.B. Kosten geändert) bedeutet das zweite Kästchen NEIN (false).
     Es sind auch Daten zum 'Eigentum / Eigenheim' (Wohnfläche, Zinsen, etc.) eingetragen. Lies diese zwingend mit aus, wenn sie angekreuzt oder befüllt sind!
     ZIEL-SCHEMA:
     {
       "kosten_unterkunft": {
         "kosten_geaendert": "boolean", "wohnart": ["Miete", "Eigentum"],
         "miete": { "grundmiete": "number", "nebenkosten": "number", "heizkosten": "number" },
         "eigentum": { "wohnflaeche_qm": "number", "zinsen_angekreuzt": "boolean", "nebenkosten_angekreuzt": "boolean", "heizkosten_angekreuzt": "boolean" }
       }
     }`,
    // Page 3
    `Extrahiere die Einkommensverhältnisse aus dieser dritten Seite des WBA.
     WICHTIGER HINWEIS: In der Tabelle ist die erste Spalte (Name der Person) z.B. "Anna Larissa Müller" und die zweite Spalte (Arbeitgeber / Art) "Kindergeld". Vertausche dies nicht.
     ZIEL-SCHEMA:
     {
       "einkommen": {
         "einkommen_vorhanden": "boolean",
         "details": [ { "person": "string", "art_des_einkommens": "string", "betrag_monatlich": "number" } ],
         "ausgaben_geaendert": "boolean", "freiberuflich": "boolean", "ehrenamt": "boolean"
       }
     }`,
    // Page 4
    `Extrahiere weitere Einkommen und erste Änderungen aus dieser vierten Seite des WBA.
     ZIEL-SCHEMA:
     {
       "einkommen_fortsetzung": { "sozialleistungen": "boolean", "weitere_einkommen": "boolean" },
       "aenderungen": { "familienverhaeltnisse_geaendert": "boolean", "ansprueche_dritte": "boolean", "unfall_schadenereignis": "boolean" }
     }`,
    // Page 5
    `Extrahiere weitere Änderungen aus dieser fünften Seite des WBA.
     ZIEL-SCHEMA:
     {
       "aenderungen_fortsetzung": { "vergangene_aenderungen": "boolean", "sonstige_aenderungen_text": "string" }
     }`,
    // Page 6
    `Extrahiere den Abschluss aus dieser sechsten Seite des WBA.
     ZIEL-SCHEMA:
     {
       "abschluss": { "datum": "string", "unterschrift_vorhanden": "boolean", "unterschrieben_von": "string" }
     }`
  ];

  let finalJson: any = {};

  for (let i = 0; i < base64Images.length; i++) {
    const prompt = `
Du bist ein hochpräziser Datenextraktions-Spezialist. Lese die handschriftlichen Felder auf DIESER EINEN SEITE sorgfältig aus.
Wenn ein Feld leer oder nicht angekreuzt ist, setze den Wert auf null, "" oder false.
    
${pagePrompts[i] || pagePrompts[pagePrompts.length - 1]}

Gib NUR das JSON-Objekt zurück.
`;

    const requestBody = {
      model: MODEL,
      prompt: prompt,
      images: [base64Images[i]],
      stream: false,
      format: "json",
      options: { temperature: 0.0 }
    };

    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Ollama API Error on Page ${i + 1}: ${response.status}`);
    }

    const data = await response.json();
    try {
      const pageJson = JSON.parse(data.response);
      finalJson = { ...finalJson, ...pageJson };
    } catch (e) {
      console.error(`Fehler beim Parsen von Seite ${i + 1}`);
    }
  }

  // Merge fortsetzung fields safely
  if (finalJson.einkommen_fortsetzung) {
    finalJson.einkommen = { ...(finalJson.einkommen || {}), ...finalJson.einkommen_fortsetzung };
    delete finalJson.einkommen_fortsetzung;
  }
  if (finalJson.aenderungen_fortsetzung) {
    finalJson.aenderungen = { ...(finalJson.aenderungen || {}), ...finalJson.aenderungen_fortsetzung };
    delete finalJson.aenderungen_fortsetzung;
  }

  // Ensure core keys are at least defined
  finalJson.antrags_metadaten = finalJson.antrags_metadaten || {};
  finalJson.persoenliche_daten = finalJson.persoenliche_daten || {};
  finalJson.kosten_unterkunft = finalJson.kosten_unterkunft || {};
  finalJson.einkommen = finalJson.einkommen || {};
  finalJson.aenderungen = finalJson.aenderungen || {};
  finalJson.abschluss = finalJson.abschluss || {};

  // Post-Processing: Fix common OCR handwriting errors
  if (finalJson.persoenliche_daten?.anschrift?.strasse) {
    // LLMs often confuse handwritten 'ß' with 'b'
    finalJson.persoenliche_daten.anschrift.strasse = finalJson.persoenliche_daten.anschrift.strasse.replace(/strabe/i, 'straße');
  }

  return finalJson as WBAData;
}
