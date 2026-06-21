import path from 'path';
import { runSubprocess } from '../utils/subprocess';
import { OdfValidationResult, ValidationIssue } from '../types';
import { logger } from '../utils/logger';
import fs from 'fs';

const ODF_VALIDATOR_JAR = process.env.ODF_VALIDATOR_JAR || path.join(__dirname, '../../tools/odfvalidator.jar');

export const validateOdf = async (filepath: string): Promise<OdfValidationResult> => {
  if (!fs.existsSync(ODF_VALIDATOR_JAR)) {
    logger.warn(`ODF Validator JAR not found at ${ODF_VALIDATOR_JAR}`);
    return {
      performed: false,
      reason: 'ODF Validator engine not available. Please run download-tools.sh',
    };
  }

  try {
    // Note: odfvalidator returns exit code 1 if the document is invalid.
    const { stdout, stderr, exitCode } = await runSubprocess('java', [
      '-jar',
      ODF_VALIDATOR_JAR,
      '-c',
      '-v',
      filepath,
    ]);

    return parseOdfOutput(stdout, stderr, exitCode);
  } catch (error: any) {
    logger.error({ err: error }, 'ODF Validation process failed');
    return {
      performed: true,
      valid: false,
      errors: [{ message: 'Validation engine crashed or timed out', severity: 'error' }],
    };
  }
};

const parseOdfOutput = (stdout: string, stderr: string, exitCode: number | null): OdfValidationResult => {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const output = (stdout + '\n' + stderr).split('\n');

  let conformanceLevel = 'Unknown';
  let hasValidStructure = true;

  for (const line of output) {
    if (line.trim() === '') continue;

    // Example output from ODF Validator:
    // file.odt:  Error: Invalid ZIP structure
    // file.odt:  Warning: Missing something
    // file.odt:  Info: Conformance Level: ODF 1.3
    
    // In actual ODF Validator output it looks slightly different, we do our best to map it.
    const lowerLine = line.toLowerCase();

    if (lowerLine.includes('error:')) {
      errors.push({
        message: line.split('Error:')[1]?.trim() || line,
        severity: 'error',
      });
      hasValidStructure = false;
    } else if (lowerLine.includes('warning:')) {
      warnings.push({
        message: line.split('Warning:')[1]?.trim() || line,
        severity: 'warning',
      });
    } else if (lowerLine.includes('conforms to')) {
      const match = line.match(/conforms to (.*)/i);
      if (match) {
        conformanceLevel = match[1].trim();
      }
    }
  }

  // fallback logic: if exitCode is 0, it's valid according to ODFValidator
  const valid = exitCode === 0 && hasValidStructure;

  return {
    performed: true,
    valid,
    conformance_level: conformanceLevel,
    errors,
    warnings,
  };
};
