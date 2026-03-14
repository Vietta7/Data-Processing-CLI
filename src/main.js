import os from 'node:os';
import { startRepl } from './repl.js';

const state = {
  directory: os.homedir(),
};

const bye = () => console.log('\nThank you for using Data Processing CLI!');
process.on('exit', bye);
process.on('SIGINT', () => process.exit(0));

await startRepl(state);
process.exit(0);