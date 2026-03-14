import { ValidationError, OperationError } from "./errors.js";
import { goUp, changeDir, listDir } from "./navigation.js";
import { csvToJson } from "./commands/csvToJson.js";
import { jsonToCsv } from "./commands/jsonToCsv.js";
import { countCommand } from "./commands/count.js";
import { hashCommand } from './commands/hash.js';
import { hashCompare } from './commands/hashCompare.js';
import { encrypt } from './commands/encrypt.js';

export async function handleCommand(input, state) {
  const [command, ...args] = input.trim().split(/\s+/);

  switch (command) {
    case "up":
      await goUp(state);
      break;
    case "cd":
      await changeDir(state, args);
      break;
    case "ls":
      await listDir(state);
      break;
    case "csv-to-json":
      await csvToJson(args, state);
      break;
    case "json-to-csv":
      await jsonToCsv(args, state);
      break;
    case "count":
      await countCommand(args, state);
      break;
      case 'hash':
      await hashCommand(args, state);
      break;
    case 'hash-compare':
      await hashCompare(args, state);
      break;
    case 'encrypt':
      await encrypt(args, state);
      break;

    default:
      throw new ValidationError("Invalid input");
  }
}