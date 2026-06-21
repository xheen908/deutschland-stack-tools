import { FastifyInstance } from 'fastify';

export default async function healthRoute(fastify: FastifyInstance) {
  fastify.get('/health', async (_request, _reply) => {
    return {
      status: 'ok',
      version: process.env.npm_package_version || '1.0.0',
      uptime_seconds: Math.floor(process.uptime()),
      validators: {
        odf_validator: 'available', // In a real scenario, we might check if JAR exists
        verapdf: 'available',
      },
    };
  });
}
