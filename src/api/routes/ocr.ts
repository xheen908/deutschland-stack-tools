import { FastifyInstance } from 'fastify';
import { extractWBA } from '../../ocr/wba-extractor';
import { createTempFile } from '../../utils/tempfiles';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

export default async function ocrRoute(fastify: FastifyInstance) {
  fastify.post('/ocr/wba', async (request, reply) => {
    const data = await request.file();
    
    if (!data) {
      return reply.status(400).send({ error: 'BAD_REQUEST', message: 'No file uploaded' });
    }

    const { file, filename } = data;
    const ctx = await createTempFile(filename);
    
    try {
      // Save file to disk
      await pipeline(file, createWriteStream(ctx.filepath));
      
      // Run OCR Extractor
      const result = await extractWBA(ctx.filepath);
      
      return reply.status(200).send(result);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return reply.status(500).send({
        error: 'OCR_EXTRACTION_FAILED',
        message: errorMsg,
      });
    } finally {
      await ctx.cleanup();
    }
  });
}
