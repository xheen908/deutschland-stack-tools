import { Command } from 'commander';
import { processFileValidation } from '../../validators';
import fs from 'fs/promises';
import path from 'path';

export const batchCmd = () => {
  return new Command('batch')
    .description('Validate multiple documents in a directory')
    .argument('<directory>', 'Directory containing files to validate')
    .option('--recursive', 'Scan directory recursively', false)
    .option('--filter <type>', 'Filter by type: odf, pdf', 'all')
    .option('--report <file>', 'Save summary report to file')
    .action(async (directory, options) => {
      try {
        const dirPath = path.resolve(process.cwd(), directory);
        const filesToProcess: string[] = [];
        
        console.log(`Scanning: ${dirPath} (recursive: ${options.recursive})`);

        async function scanDir(currentPath: string) {
          const entries = await fs.readdir(currentPath, { withFileTypes: true });
          for (const entry of entries) {
             const fullPath = path.join(currentPath, entry.name);
             if (entry.isDirectory() && options.recursive) {
               await scanDir(fullPath);
             } else if (entry.isFile()) {
               const ext = path.extname(fullPath).toLowerCase();
               if (options.filter === 'odf' && !['.odt', '.ods', '.odp', '.odf'].includes(ext)) continue;
               if (options.filter === 'pdf' && ext !== '.pdf') continue;
               // Include valid ones if all
               if (options.filter === 'all' && !['.odt', '.ods', '.odp', '.odf', '.pdf'].includes(ext)) continue;
               
               filesToProcess.push(fullPath);
             }
          }
        }

        await scanDir(dirPath);

        console.log(`Found: ${filesToProcess.length} files`);
        console.log('');

        let validCount = 0;
        let invalidCount = 0;
        let warningsCount = 0;
        const results = [];

        for (let i = 0; i < filesToProcess.length; i++) {
          const filePath = filesToProcess[i];
          const filename = path.basename(filePath);
          try {
            const stats = await fs.stat(filePath);
            const result = await processFileValidation(filePath, filename, stats.size, 'auto', false);
            
            const mark = result.status === 'valid' ? '✓' : (result.status === 'warning' ? '⚠' : '✗');
            let infoStr = '';
            if (result.status === 'invalid') {
               const typeKey = result.detected_format === 'ODF' ? 'odf' : 'pdfua';
               const firstErr = result.checks[typeKey as 'odf'|'pdfua']?.errors?.[0];
               if (firstErr) infoStr = ` — INVALID: ${firstErr.message} (${firstErr.code || ''})`;
            }

            console.log(`[${i + 1}/${filesToProcess.length}] ${mark} ${filename}${infoStr}`);
            
            if (result.status === 'valid') validCount++;
            if (result.status === 'invalid') invalidCount++;
            if (result.status === 'warning') warningsCount++;
            
            results.push(result);
          } catch (err: any) {
            console.log(`[${i + 1}/${filesToProcess.length}] ✗ ${filename} — ERROR: ${err.message}`);
            invalidCount++;
          }
        }

        console.log('');
        console.log('Summary');
        console.log(`  Total:    ${filesToProcess.length}`);
        console.log(`  Valid:    ${validCount}`);
        console.log(`  Invalid:   ${invalidCount}`);
        console.log(`  Warnings:  ${warningsCount}`);
        console.log('');
        const compliantRatio = filesToProcess.length > 0 ? Math.round((validCount / filesToProcess.length) * 100) : 0;
        console.log(`  Deutschland-Stack Ready: ${validCount}/${filesToProcess.length} (${compliantRatio}%)`);

        if (options.report) {
          const reportObj = {
            total: filesToProcess.length,
            valid: validCount,
            invalid: invalidCount,
            warnings: warningsCount,
            results
          };
          await fs.writeFile(path.resolve(process.cwd(), options.report), JSON.stringify(reportObj, null, 2));
          console.log('');
          console.log(`  Report saved: ${options.report}`);
        }
        
      } catch (err: any) {
        console.error(`✗ Batch scanning failed: ${err.message}`);
        process.exit(1);
      }
    });
};
