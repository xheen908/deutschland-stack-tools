import Fastify, { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { logger } from '../utils/logger';

// Route imports
import healthRoute from './routes/health';
import infoRoute from './routes/info';
import validateRoute from './routes/validate';
import batchRoute from './routes/batch';

export const buildServer = async (): Promise<FastifyInstance> => {
  const server = Fastify({
    logger: false, // We use our custom pino logger manually where needed or we can pass it
  });

  // Attach custom logger to fastify request cycle
  server.addHook('onRequest', (request, reply, done) => {
    logger.info({ method: request.method, url: request.url }, 'Incoming request');
    done();
  });
  
  server.addHook('onResponse', (request, reply, done) => {
    logger.info({ method: request.method, url: request.url, statusCode: reply.statusCode, time: reply.elapsedTime }, 'Request completed');
    done();
  });

  // Register multipart middleware
  const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '52428800', 10); // 50MB default
  await server.register(multipart, {
    limits: {
      fileSize: maxFileSize,
    },
  });

  // Register rate limit middleware
  const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
  await server.register(rateLimit, {
    max: rateLimitMax,
    timeWindow: '1 minute',
  });

  // Register routes
  server.register(healthRoute, { prefix: '/api/v1' });
  server.register(infoRoute, { prefix: '/api/v1' });
  server.register(validateRoute, { prefix: '/api/v1' });
  server.register(batchRoute, { prefix: '/api/v1' });

  // Custom error handler
  server.setErrorHandler((error, request, reply) => {
    if (error.code === 'FST_FILES_LIMIT_TOO_LARGE' || error.statusCode === 413) {
      reply.status(413).send({ error: 'PAYLOAD_TOO_LARGE', message: 'File exceeds the maximum allowed size.' });
      return;
    }
    
    if (error.statusCode === 429) {
      reply.status(429).send({ error: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded.' });
      return;
    }

    logger.error({ err: error, url: request.url }, 'Unhandled API error');
    reply.status(500).send({ error: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' });
  });

  return server;
};
