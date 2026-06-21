import { buildServer } from './api/server';
import { buildCli } from './cli';
import { logger } from './utils/logger';

const startApi = async () => {
  const server = await buildServer();
  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await server.listen({ port, host });
    logger.info(`Deutschland-Stack Tools API server running on http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

const main = async () => {
  const args = process.argv.slice(2);
  
  if (args[0] === 'serve') {
    // API Mode
    await startApi();
  } else {
    // CLI Mode
    const cli = buildCli();
    cli.parse(process.argv);
  }
};

main();
