import fs from 'node:fs/promises';
import path from 'node:path';
import { ValidationError, OperationError } from './errors.js';

export async function goUp(state) {
  const parent = path.dirname(state.directory);
  if (parent !== state.directory) {
    state.directory = parent;
  }
}

export async function changeDir(state, args) {
  if (!args[0]) throw new ValidationError('Invalid input');

  const target = path.isAbsolute(args[0])
    ? args[0]
    : path.resolve(state.directory, args[0]);

  try {
    const stat = await fs.stat(target);
    if (!stat.isDirectory()) throw new Error();
    state.directory = target;
  } catch {
    throw new OperationError('Operation failed');
  }
}

export async function listDir(state) {
  try {
    const entries = await fs.readdir(state.directory, { withFileTypes: true });

    const folders = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();

    const files = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .sort();

    for (const folder of folders) {
      console.log(`${folder.padEnd(30)} [folder]`);
    }
    for (const file of files) {
      console.log(`${file.padEnd(30)} [file]`);
    }
  } catch {
    throw new OperationError('Operation failed');
  }
}