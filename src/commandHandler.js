import { ValidationError } from './errors.js';

export async function handleCommand(input, state) {
  const [command, ...args] = input.trim().split(/\s+/);

  switch (command) {
    default:
      throw new ValidationError('Invalid input');
  }
}