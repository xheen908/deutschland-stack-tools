import { spawn } from 'child_process';
import { logger } from './logger';

export interface SubprocessResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

export const runSubprocess = (
  command: string,
  args: string[],
  timeoutMs: number = 30000
): Promise<SubprocessResult> => {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    const child = spawn(command, args, { stdio: 'pipe' });

    const timeout = setTimeout(() => {
      logger.error({ command, args }, `Subprocess timed out after ${timeoutMs}ms`);
      child.kill('SIGTERM');
      
      // If it doesn't die gracefully, force kill it
      setTimeout(() => child.kill('SIGKILL'), 2000);
      
      reject(new Error(`Subprocess timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      logger.error({ err, command, args }, 'Subprocess error');
      reject(err);
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      resolve({ stdout, stderr, exitCode: code });
    });
  });
};
