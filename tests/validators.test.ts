import { processFileValidation } from '../src/validators';
import path from 'path';

describe('Process Validation Coordinator', () => {
  it('should properly process an ODF file', async () => {
    const filePath = path.join(__dirname, 'fixtures/odf/valid-odt-1.3.odt');
    const result = await processFileValidation(filePath, 'valid-odt-1.3.odt', 100, 'auto', false);
    
    // Without the actual tool, it will just say 'performed: false' due to ENOENT or file missing.
    // The main point is to ensure the wrapper coordinates the detection and calls correctly without crashing.
    expect(result.detected_format).toBe('ODF');
    expect(result.filename).toBe('valid-odt-1.3.odt');
  });

  it('should properly process a PDF file', async () => {
    const filePath = path.join(__dirname, 'fixtures/pdf/valid-pdfua1.pdf');
    const result = await processFileValidation(filePath, 'valid-pdfua1.pdf', 100, 'auto', false);
    
    expect(result.detected_format).toBe('PDF');
    expect(result.filename).toBe('valid-pdfua1.pdf');
  });
});
