import { Command } from 'commander';
import { processFileValidation } from '../../validators';
import fs from 'fs/promises';
import path from 'path';
import { ValidationMode } from '../../types';

export const validateCmd = () => {
  return new Command('validate')
    .description('Validate a single document')
    .argument('<file>', 'Path to the file to validate')
    .option('--mode <mode>', 'Validation mode: auto, odf, pdfua', 'auto')
    .option('--strict', 'Strict mode (treat warnings as errors)', false)
    .option('--json', 'Output raw JSON instead of human-readable text', false)
    .option('--output <file>', 'Save JSON output to a file')
    .action(async (file, options) => {
      try {
        const filepath = path.resolve(process.cwd(), file);
        const stats = await fs.stat(filepath);
        const filename = path.basename(filepath);

        const result = await processFileValidation(
          filepath,
          filename,
          stats.size,
          options.mode as ValidationMode,
          options.strict
        );

        if (options.output) {
          await fs.writeFile(path.resolve(process.cwd(), options.output), JSON.stringify(result, null, 2));
        }

        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
          process.exit(result.summary.deutschland_stack_compliant ? 0 : 1);
        }

        // Human readable output
        console.log(`✓ Validating: ${result.filename}`);
        console.log(`  Format detected: ${result.detected_format} ${result.odf_version || ''}`);
        console.log('');
        
        console.log(`  Compliance Check`);
        
        const typeKey = result.detected_format === 'ODF' ? 'odf' : 'pdfua';
        const typeResult = result.checks[typeKey as 'odf'|'pdfua'];
        
        if (typeResult.errors && typeResult.errors.length > 0) {
          for (const err of typeResult.errors) {
            console.log(`  ✗ Error: ${err.message} ${err.code ? `(${err.code})` : ''}`);
          }
        }
        
        if (typeResult.warnings && typeResult.warnings.length > 0) {
          for (const warn of typeResult.warnings) {
            console.log(`  ⚠ Warning: ${warn.message} ${warn.code ? `(${warn.code})` : ''}`);
          }
        }

        if ((!typeResult.errors || typeResult.errors.length === 0) && (!typeResult.warnings || typeResult.warnings.length === 0)) {
           console.log(`  ✓ No errors or warnings found`);
        }
        
        console.log('');
        console.log(`  Result: ${result.status.toUpperCase()} (with ${result.summary.warnings_count} warnings)`);
        console.log(`  Deutschland-Stack compliant: ${result.summary.deutschland_stack_compliant ? 'YES' : 'NO'}`);
        console.log('');
        console.log(`  Processing time: ${result.processing_time_ms}ms`);

        process.exit(result.summary.deutschland_stack_compliant ? 0 : 1);
      } catch (err: any) {
        console.error(`✗ Validation failed: ${err.message}`);
        process.exit(1);
      }
    });
};
