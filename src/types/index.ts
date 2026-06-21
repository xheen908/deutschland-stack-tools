export type ValidationStatus = 'valid' | 'invalid' | 'warning';
export type Format = 'ODF' | 'PDF' | 'UNKNOWN';
export type ValidationMode = 'odf' | 'pdfua' | 'auto';

export interface ValidationIssue {
  code?: string;
  message: string;
  severity: 'error' | 'warning';
  location?: string;
}

export interface OdfValidationResult {
  performed: boolean;
  valid?: boolean;
  conformance_level?: string;
  errors?: ValidationIssue[];
  warnings?: ValidationIssue[];
  reason?: string;
}

export interface PdfUaValidationResult {
  performed: boolean;
  valid?: boolean;
  conformance_level?: string;
  errors?: ValidationIssue[];
  warnings?: ValidationIssue[];
  reason?: string;
}

export interface ValidationSummary {
  errors_count: number;
  warnings_count: number;
  deutschland_stack_compliant: boolean;
}

export interface ValidatorVersions {
  odf_validator: string | null;
  verapdf: string | null;
}

export interface ValidateResponse {
  status: ValidationStatus;
  filename: string;
  filesize: number;
  detected_format: Format;
  odf_version?: string;
  checks: {
    odf: OdfValidationResult;
    pdfua: PdfUaValidationResult;
  };
  summary: ValidationSummary;
  processing_time_ms: number;
  validator_versions: ValidatorVersions;
}

export interface BatchValidateResponse {
  total: number;
  valid: number;
  invalid: number;
  warnings: number;
  results: ValidateResponse[];
  processing_time_ms: number;
}
