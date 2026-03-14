import readline from 'node:readline';
import { handleCommand } from './commandHandler.js';

export async function startRepl(state) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const showDir = () => console.log(`You are currently in ${state.directory}`);

  return new Promise((resolve) => {
    rl.on('close', resolve);

    const prompt = () => {
      rl.question('> ', async (input) => {
        const trimmed = input.trim();

        if (!trimmed) {
          prompt();
          return;
        }

        if (trimmed === '.exit') {
          rl.close();
          return;
        }

        try {
          await handleCommand(trimmed, state);
        } catch (err) {
          console.error(err.message);
        }

        showDir();
        prompt();
      });
    };

    console.log('Welcome to Data Processing CLI!');
    showDir();
    prompt();
  });
}