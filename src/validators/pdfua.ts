import { runSubprocess } from '../utils/subprocess';
import { PdfUaValidationResult, ValidationIssue } from '../types';
import { logger } from '../utils/logger';

const VERAPDF_BIN = process.env.VERAPDF_BIN || 'verapdf';

export const validatePdfUa = async (filepath: string): Promise<PdfUaValidationResult> => {
  try {
    const { stdout, stderr } = await runSubprocess(VERAPDF_BIN, [
      '--format',
      'json',
      '--flavour',
      'ua1',
      filepath,
    ]);

    // verapdf returns non-zero if validation fails or tool fails.
    // If we have stdout that parses as JSON, we consider it a successful run of the tool.
    return parsePdfUaOutput(stdout, stderr);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      logger.warn(`veraPDF binary not found at ${VERAPDF_BIN}`);
      return {
        performed: false,
        reason: 'veraPDF engine not available in PATH. Please run download-tools.sh or install it.',
      };
    }
    
    logger.error({ err: error }, 'PDF/UA Validation process failed');
    return {
      performed: true,
      valid: false,
      errors: [{ message: 'Validation engine crashed or timed out', severity: 'error' }],
    };
  }
};

const parsePdfUaOutput = (stdout: string, stderr: string): PdfUaValidationResult => {
  try {
    const jsonStart = stdout.indexOf('{');
    const jsonEnd = stdout.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('No JSON output found from veraPDF');
    }

    const cleanJsonStr = stdout.substring(jsonStart, jsonEnd + 1);
    const result = JSON.parse(cleanJsonStr);

    // veraPDF JSON structure:
    // result.jobs[0].validationReport.details.rules
    // result.jobs[0].validationReport.isCompliant
    // result.jobs[0].validationReport.profileName

    const job = result.jobs?.[0];
    if (!job || !job.validationReport) {
       return {
         performed: true,
         valid: false,
         errors: [{ message: 'Invalid JSON structure from veraPDF', severity: 'error' }],
       };
    }

    const isCompliant = job.validationReport.compliant;
    const profileName = job.validationReport.profileName || 'Unknown PDF/UA Profile';
    const rules = job.validationReport.details?.ruleSummaries || [];

    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    // Map Matterhorn Protocol failures
    for (const rule of rules) {
      if (rule.ruleStatus === 'FAILED' || rule.status === 'failed') {
        errors.push({
          code: rule.specification + '-' + rule.clause,
          message: rule.description || 'Matterhorn Protocol Failure',
          severity: 'error',
          location: rule.object || 'Document',
        });
      }
    }

    return {
      performed: true,
      valid: isCompliant,
      conformance_level: profileName,
      errors,
      warnings,
    };
  } catch (err: any) {
    logger.error({ err, stdout, stderr }, 'Failed to parse veraPDF JSON output');
    return {
      performed: true,
      valid: false,
      errors: [{ message: 'Failed to parse veraPDF output', severity: 'error' }],
    };
  }
};
