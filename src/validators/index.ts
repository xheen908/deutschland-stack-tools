import { detectFormat, UnsupportedFormatError } from './detector';
import { validateOdf } from './odf';
import { validatePdfUa } from './pdfua';
import { ValidateResponse, ValidationMode } from '../types';

export const processFileValidation = async (
  filepath: string,
  originalFilename: string,
  filesize: number,
  mode: ValidationMode = 'auto',
  strict: boolean = false
): Promise<ValidateResponse> => {
  const startTime = Date.now();
  let detectedFormat = 'UNKNOWN' as any;
  let odfResult = { performed: false };
  let pdfResult = { performed: false };

  try {
    if (mode === 'auto') {
      detectedFormat = await detectFormat(filepath, originalFilename);
    } else if (mode === 'odf') {
      detectedFormat = 'ODF';
    } else if (mode === 'pdfua') {
      detectedFormat = 'PDF';
    }

    if (detectedFormat === 'ODF') {
      odfResult = await validateOdf(filepath);
    } else if (detectedFormat === 'PDF') {
      pdfResult = await validatePdfUa(filepath);
    }
  } catch (error: any) {
    if (error instanceof UnsupportedFormatError) {
      throw error; // Let the caller handle 400
    }
    throw error;
  }

  const processingTimeMs = Date.now() - startTime;

  // Compute summary
  let errorsCount = 0;
  let warningsCount = 0;
  let status: 'valid' | 'invalid' | 'warning' = 'valid';
  let isCompliant = true;

  if (detectedFormat === 'ODF') {
    const odf = odfResult as any;
    errorsCount += odf.errors?.length || 0;
    warningsCount += odf.warnings?.length || 0;
    if (odf.valid === false || errorsCount > 0) {
      status = 'invalid';
      isCompliant = false;
    } else if (warningsCount > 0) {
      status = 'warning';
    }
  } else if (detectedFormat === 'PDF') {
    const pdf = pdfResult as any;
    errorsCount += pdf.errors?.length || 0;
    warningsCount += pdf.warnings?.length || 0;
    if (pdf.valid === false || errorsCount > 0) {
      status = 'invalid';
      isCompliant = false;
    } else if (warningsCount > 0) {
      status = 'warning';
    }
  }

  if (strict && warningsCount > 0) {
    status = 'invalid';
    isCompliant = false;
  }

  return {
    status,
    filename: originalFilename,
    filesize,
    detected_format: detectedFormat,
    odf_version: (odfResult as any).conformance_level,
    checks: {
      odf: odfResult as any,
      pdfua: pdfResult as any,
    },
    summary: {
      errors_count: errorsCount,
      warnings_count: warningsCount,
      deutschland_stack_compliant: isCompliant,
    },
    processing_time_ms: processingTimeMs,
    validator_versions: {
      odf_validator: '0.13.0',
      verapdf: '1.30.2',
    },
  };
};
