import fs from 'fs/promises';
import path from 'path';
import { Format } from '../types';

export class UnsupportedFormatError extends Error {
  public supportedFormats = ['.odt', '.ods', '.odp', '.odf', '.pdf'];

  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedFormatError';
  }
}

export const detectFormat = async (filepath: string, originalFilename: string): Promise<Format> => {
  const ext = path.extname(originalFilename).toLowerCase();

  // Basic extension check for explicit rejection
  if (ext === '.docx' || ext === '.xlsx' || ext === '.pptx') {
    throw new UnsupportedFormatError(`File type ${ext} is not supported. Convert to ODF first.`);
  }

  // Read first 8 bytes for magic numbers
  const fileHandle = await fs.open(filepath, 'r');
  const buffer = Buffer.alloc(8);
  await fileHandle.read(buffer, 0, 8, 0);
  await fileHandle.close();

  // PDF Magic Bytes: %PDF- (25 50 44 46 2D)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46 && buffer[4] === 0x2D) {
    if (ext !== '.pdf') {
      throw new UnsupportedFormatError(`Detected PDF content but file extension is ${ext}. File must end in .pdf`);
    }
    return 'PDF';
  }

  // ZIP Magic Bytes (ODF files are ZIP archives): PK\x03\x04 (50 4B 03 04)
  if (buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) {
    // Valid ODF extensions
    if (['.odt', '.ods', '.odp', '.odf'].includes(ext)) {
      return 'ODF';
    } else {
      throw new UnsupportedFormatError(`File type ${ext} is not supported as an ODF document.`);
    }
  }

  throw new UnsupportedFormatError(`Unable to detect supported format (ODF or PDF).`);
};
