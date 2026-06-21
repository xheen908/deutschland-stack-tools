import { Command } from 'commander';
import { extractWBA } from '../../ocr/wba-extractor';
import { logger } from '../../utils/logger';
import fs from 'fs';

export const ocrCmd = (): Command => {
  const ocrCommand = new Command('ocr')
    .description('OCR and Intelligent Document Processing commands');

  ocrCommand
    .command('wba <pdfPath>')
    .description('Extract data from a 6-page WBA PDF form using LLaMA-Vision')
    .action(async (pdfPath: string) => {
      try {
        if (!fs.existsSync(pdfPath)) {
          logger.error(`File not found: ${pdfPath}`);
          process.exit(1);
        }

        logger.info(`Starting WBA OCR extraction for: ${pdfPath}`);
        const result = await extractWBA(pdfPath);
        
        logger.info('Extraction completed successfully. Result:');
        console.log(JSON.stringify(result, null, 2));
      } catch (err) {
        logger.error(`OCR Extraction failed: ${(err as Error).message}`);
        process.exit(1);
      }
    });

  return ocrCommand;
};
