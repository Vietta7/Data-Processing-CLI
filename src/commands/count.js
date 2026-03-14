import fs from "node:fs";
import { resolvePath } from "../utils/pathResolver.js";
import { parseArgs } from "../utils/argParser.js";
import { ValidationError, OperationError } from "../errors.js";

export async function countCommand(args, state) {
  const { input } = parseArgs(args);

  if (!input) {
    throw new ValidationError("Invalid input");
  }

  const inputPath = resolvePath(state.directory, input);

  let lines = 0;
  let words = 0;
  let chars = 0;
  let inWord = false;

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(inputPath);

    stream.on("data", (chunk) => {
      const str = chunk.toString();
      chars += str.length;

      for (let i = 0; i < str.length; i++) {
        const ch = str[i];

        if (ch === "\n") {
          lines += 1;
        } else if (ch === "\r")
          if (/\s/.test(ch)) {
            if (inWord) inWord = false;
          } else {
            if (!inWord) {
              words += 1;
              inWord = true;
            }
          }
      }
    });

    stream.on("end", () => {
      console.log(`Lines: ${lines}`);
      console.log(`Words: ${words}`);
      console.log(`Characters: ${chars}`);
      resolve();
    });

    stream.on("error", () => {
      reject(new OperationError("Operation failed"));
    });
  });
}