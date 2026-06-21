import { detectFormat, UnsupportedFormatError } from '../src/validators/detector';
import path from 'path';

describe('Format Detector', () => {
  it('should detect ODF format correctly', async () => {
    const filePath = path.join(__dirname, 'fixtures/odf/valid-odt-1.3.odt');
    const format = await detectFormat(filePath, 'valid-odt-1.3.odt');
    expect(format).toBe('ODF');
  });

  it('should detect PDF format correctly', async () => {
    const filePath = path.join(__dirname, 'fixtures/pdf/valid-pdfua1.pdf');
    const format = await detectFormat(filePath, 'valid-pdfua1.pdf');
    expect(format).toBe('PDF');
  });

  it('should reject explicitly unsupported extensions like docx', async () => {
    const filePath = path.join(__dirname, 'fixtures/unsupported/sample.docx');
    await expect(detectFormat(filePath, 'sample.docx')).rejects.toThrow(UnsupportedFormatError);
  });
});
