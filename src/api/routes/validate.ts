import { FastifyInstance } from 'fastify';
import { processFileValidation } from '../../validators';
import { createTempFile } from '../../utils/tempfiles';
import { UnsupportedFormatError } from '../../validators/detector';
import fs from 'fs/promises';
import { pipeline } from 'stream/promises';

export default async function validateRoute(fastify: FastifyInstance) {
  fastify.post('/validate', async (request, reply) => {
    const data = await request.file();
    
    if (!data) {
      return reply.status(400).send({ error: 'BAD_REQUEST', message: 'No file uploaded' });
    }

    const { file, filename, fields } = data;
    const mode = fields.mode ? (fields.mode as any).value : 'auto';
    const strict = fields.strict ? (fields.strict as any).value === 'true' : false;

    const ctx = await createTempFile(filename);
    
    try {
      // Save file to disk
      await pipeline(file, require('fs').createWriteStream(ctx.filepath));
      
      const stats = await fs.stat(ctx.filepath);
      
      // Validate
      const result = await processFileValidation(ctx.filepath, filename, stats.size, mode, strict);
      
      return reply.status(200).send(result);
    } catch (err: any) {
      if (err instanceof UnsupportedFormatError) {
        return reply.status(400).send({
          error: 'UNSUPPORTED_FORMAT',
          message: err.message,
          supported_formats: err.supportedFormats,
        });
      }
      throw err; // Let fastify errorHandler catch it
    } finally {
      await ctx.cleanup();
    }
  });
}
