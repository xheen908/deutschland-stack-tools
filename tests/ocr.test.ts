import { extractWBA } from '../src/ocr/wba-extractor';
import path from 'path';

describe('WBA OCR Extraction Engine (E2E)', () => {
  // Set timeout to 5 minutes as LLaMA-Vision takes time to process 6 pages locally
  jest.setTimeout(300000);

  it('should extract correct WBA schema from test PDF', async () => {
    const pdfPath = path.join(__dirname, 'fixtures', 'wba-dummy.pdf');
    const result = await extractWBA(pdfPath);

    // Validate the overarching structure exists
    expect(result).toBeDefined();
    expect(result.antrags_metadaten).toBeDefined();
    expect(result.persoenliche_daten).toBeDefined();
    expect(result.kosten_unterkunft).toBeDefined();
    expect(result.einkommen).toBeDefined();
    expect(result.aenderungen).toBeDefined();
    expect(result.abschluss).toBeDefined();

    // Validate specific dummy data
    expect(result.persoenliche_daten?.vorname).toContain('Anna');
    expect(result.kosten_unterkunft?.miete?.grundmiete).toBeDefined();
  });
});
