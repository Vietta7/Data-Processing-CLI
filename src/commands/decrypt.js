import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createDecipheriv, scryptSync } from 'node:crypto';
import { resolvePath } from '../utils/pathResolver.js';
import { parseArgs } from '../utils/argParser.js';
import { ValidationError, OperationError } from '../errors.js';

export async function decrypt(args, state) {
  const { input, output, password } = parseArgs(args);

  if (!input || !output || !password) {
    throw new ValidationError('Invalid input');
  }

  const inputPath = resolvePath(state.directory, input);
  const outputPath = resolvePath(state.directory, output);

  let fileBuffer;
  try {
    fileBuffer = await fs.promises.readFile(inputPath);
  } catch {
    throw new OperationError('Operation failed');
  }

  if (fileBuffer.length < 44) {
    throw new OperationError('Operation failed');
  }

  const salt = fileBuffer.subarray(0, 16);
  const iv = fileBuffer.subarray(16, 28);
  const authTag = fileBuffer.subarray(fileBuffer.length - 16);
  const ciphertext = fileBuffer.subarray(28, fileBuffer.length - 16);

  const key = scryptSync(password, salt, 32);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  try {
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    await fs.promises.writeFile(outputPath, decrypted);
    console.log(`Done! Decrypted file saved to ${outputPath}`);
  } catch {
    throw new OperationError('Operation failed');
  }
}