import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { resolvePath } from '../utils/pathResolver.js';
import { parseArgs } from '../utils/argParser.js';
import { ValidationError, OperationError } from '../errors.js';

const SUPPORTED_ALGORITHMS = ['sha256', 'md5', 'sha512'];

export async function hashCommand(args, state) {
  const { input, algorithm = 'sha256', save } = parseArgs(args);

  if (!input) {
    throw new ValidationError('Invalid input');
  }

  if (!SUPPORTED_ALGORITHMS.includes(algorithm)) {
    throw new OperationError('Operation failed');
  }

  const inputPath = resolvePath(state.directory, input);
  const hash = createHash(algorithm);

  await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(inputPath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', resolve);
    stream.on('error', () => reject(new OperationError('Operation failed')));
  });

  const digest = hash.digest('hex');
  console.log(`${algorithm}: ${digest}`);

  if (save) {
    const ext = algorithm;
    const savePath = inputPath + '.' + ext;
    await fs.promises.writeFile(savePath, digest);
    console.log(`Hash saved to ${savePath}`);
  }
}