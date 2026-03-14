import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createCipheriv, randomBytes, scryptSync } from 'node:crypto';
import { Transform } from 'node:stream';
import { resolvePath } from '../utils/pathResolver.js';
import { parseArgs } from '../utils/argParser.js';
import { ValidationError, OperationError } from '../errors.js';

export async function encrypt(args, state) {
  const { input, output, password } = parseArgs(args);

  if (!input || !output || !password) {
    throw new ValidationError('Invalid input');
  }

  const inputPath = resolvePath(state.directory, input);
  const outputPath = resolvePath(state.directory, output);

  const salt = randomBytes(16);
  const iv = randomBytes(12);

  const key = scryptSync(password, salt, 32);

  const cipher = createCipheriv('aes-256-gcm', key, iv);

  const outputStream = fs.createWriteStream(outputPath);
  outputStream.write(salt);
  outputStream.write(iv);

  try {
    await pipeline(
      fs.createReadStream(inputPath),
      cipher,
      outputStream,
    );

    const authTag = cipher.getAuthTag();
    await fs.promises.appendFile(outputPath, authTag);

    console.log(`Done! Encrypted file saved to ${outputPath}`);
  } catch {
    throw new OperationError('Operation failed');
  }
}