import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { logger } from './logger';

export interface TempFileContext {
  filepath: string;
  dirpath: string;
  cleanup: () => Promise<void>;
}

export const createTempFile = async (originalFilename: string): Promise<TempFileContext> => {
  const uuid = crypto.randomUUID();
  // Using os.tmpdir() to be cross-platform compatible, but prefixing as requested
  const baseTmpDir = process.env.NODE_ENV === 'production' ? '/tmp' : os.tmpdir();
  const dirpath = path.join(baseTmpDir, `dst-${uuid}`);
  
  await fs.mkdir(dirpath, { recursive: true });
  
  // Sanitize filename to avoid path traversal or weird characters
  const safeFilename = path.basename(originalFilename).replace(/[^a-zA-Z0-9.-]/g, '_');
  const filepath = path.join(dirpath, safeFilename);

  const cleanup = async () => {
    try {
      await fs.rm(dirpath, { recursive: true, force: true });
      logger.debug({ dirpath }, 'Cleaned up temp directory');
    } catch (err) {
      logger.error({ err, dirpath }, 'Failed to clean up temp directory');
    }
  };

  return {
    filepath,
    dirpath,
    cleanup,
  };
};

export const writeBufferToTempFile = async (buffer: Buffer, originalFilename: string): Promise<TempFileContext> => {
  const ctx = await createTempFile(originalFilename);
  await fs.writeFile(ctx.filepath, buffer);
  return ctx;
};
