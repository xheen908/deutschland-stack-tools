import { FastifyInstance } from 'fastify';

export default async function infoRoute(fastify: FastifyInstance) {
  fastify.get('/info', async (request, reply) => {
    return {
      service: 'deutschland-stack-tools',
      version: process.env.npm_package_version || '1.0.0',
      description: 'ODF & PDF/UA compliance validator for Germany\'s Deutschland-Stack mandate',
      legal_basis: 'Deutschland-Stack Beschluss vom 18.06.2026',
      mandatory_from: '2028-01-01',
      supported_standards: {
        ODF: ['1.2', '1.3', '1.4'],
        PDF_UA: ['PDF/UA-1 (ISO 14289-1)', 'PDF/UA-2 (ISO 14289-2)'],
      },
      links: {
        github: 'https://github.com/xheen908/deutschland-stack-tools',
        osba: 'https://osb-alliance.de',
        zendis: 'https://zendis.de',
      },
    };
  });
}
