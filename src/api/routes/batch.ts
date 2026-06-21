import { FastifyInstance } from 'fastify';
import { processFileValidation } from '../../validators';
import { createTempFile } from '../../utils/tempfiles';
import { UnsupportedFormatError } from '../../validators/detector';
import fs from 'fs/promises';
import { pipeline } from 'stream/promises';

export default async function batchRoute(fastify: FastifyInstance) {
  fastify.post('/validate/batch', async (request, reply) => {
    const parts = request.parts();
    const results: any[] = [];
    
    let total = 0;
    let valid = 0;
    let invalid = 0;
    let warnings = 0;
    const startTime = Date.now();

    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'files[]') {
        total++;
        const ctx = await createTempFile(part.filename);
        try {
          await pipeline(part.file, require('fs').createWriteStream(ctx.filepath));
          const stats = await fs.stat(ctx.filepath);
          
          const result = await processFileValidation(ctx.filepath, part.filename, stats.size, 'auto', false);
          results.push(result);

          if (result.status === 'valid') valid++;
          if (result.status === 'invalid') invalid++;
          if (result.status === 'warning') warnings++;

        } catch (err: any) {
          if (err instanceof UnsupportedFormatError) {
            results.push({
              status: 'invalid',
              filename: part.filename,
              error: err.message,
            });
            invalid++;
          } else {
            results.push({
              status: 'invalid',
              filename: part.filename,
              error: 'Internal processing error',
            });
            invalid++;
          }
        } finally {
          await ctx.cleanup();
        }
      }
    }

    if (total === 0) {
      return reply.status(400).send({ error: 'BAD_REQUEST', message: 'No files uploaded in files[]' });
    }

    return reply.status(200).send({
      total,
      valid,
      invalid,
      warnings,
      results,
      processing_time_ms: Date.now() - startTime,
    });
  });
}
