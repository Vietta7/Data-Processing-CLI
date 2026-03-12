import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import { resolvePath } from '../utils/pathResolver.js';
import { parseArgs } from '../utils/argParser.js';
import { ValidationError, OperationError } from '../errors.js';

export async function csvToJson(args, state) {
  const { input, output } = parseArgs(args);

  if (!input || !output) throw new ValidationError('Invalid input');

  const inputPath = resolvePath(state.directory, input);
  const outputPath = resolvePath(state.directory, output);

  let headers = null;
  let isFirst = true;
  let buffer = '';

  const transform = new Transform({
    transform(chunk, _encoding, callback) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (!headers) {
          headers = trimmed.split(',');
          this.push('[');
          continue;
        }

        const values = trimmed.split(',');
        const obj = {};
        headers.forEach((h, i) => (obj[h] = values[i] ?? ''));

        const json = JSON.stringify(obj);
        this.push(isFirst ? `\n  ${json}` : `,\n  ${json}`);
        isFirst = false;
      }
      callback();
    },
    flush(callback) {
      if (buffer.trim() && headers) {
        const values = buffer.trim().split(',');
        const obj = {};
        headers.forEach((h, i) => (obj[h] = values[i] ?? ''));
        const json = JSON.stringify(obj);
        this.push(isFirst ? `\n  ${json}` : `,\n  ${json}`);
      }
      this.push('\n]');
      callback();
    },
  });

  try {
    const readable = fs.createReadStream(inputPath);
    const writable = fs.createWriteStream(outputPath);
    await pipeline(readable, transform, writable);
    console.log(`Done! Saved to ${outputPath}`);
  } catch {
    throw new OperationError('Operation failed');
  }
}