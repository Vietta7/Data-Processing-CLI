import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import { resolvePath } from '../utils/pathResolver.js';
import { parseArgs } from '../utils/argParser.js';
import { ValidationError, OperationError } from '../errors.js';

export async function jsonToCsv(args, state) {
  const { input, output } = parseArgs(args);

  if (!input || !output) {
    throw new ValidationError('Invalid input');
  }

  const inputPath = resolvePath(state.directory, input);
  const outputPath = resolvePath(state.directory, output);

  let jsonBuffer = '';

  const collectJson = new Transform({
    transform(chunk, _encoding, callback) {
      jsonBuffer += chunk.toString();
      callback();
    },
    flush(callback) {
      try {
        const data = JSON.parse(jsonBuffer);

        if (!Array.isArray(data)) {
          throw new Error('Not an array');
        }

        if (data.length === 0) {
          this.push('\n');
          callback();
          return;
        }

        const headers = Object.keys(data[0]);
        this.push(headers.join(',') + '\n');

        for (const item of data) {
          const row = headers
            .map((h) => {
              const value = item[h] ?? '';
              const str = String(value);
              if (str.includes(',') || str.includes('"')) {
                return `"${str.replace(/"/g, '""')}"`;
              }
              return str;
            })
            .join(',');
          this.push(row + '\n');
        }

        callback();
      } catch {
        callback(new OperationError('Operation failed'));
      }
    },
  });

  try {
    await pipeline(
      fs.createReadStream(inputPath),
      collectJson,
      fs.createWriteStream(outputPath),
    );
    console.log(`Done! Saved to ${outputPath}`);
  } catch (err) {
    if (err instanceof OperationError) {
      throw err;
    }
    throw new OperationError('Operation failed');
  }
}