import fs from "node:fs";
import { createHash } from "node:crypto";
import { resolvePath } from "../utils/pathResolver.js";
import { parseArgs } from "../utils/argParser.js";
import { ValidationError, OperationError } from "../errors.js";

const SUPPORTED_ALGORITHMS = ["sha256", "md5", "sha512"];

export async function hashCompare(args, state) {
  const { input, hash, algorithm = "sha256" } = parseArgs(args);

  if (!input || !hash) {
    throw new ValidationError("Invalid input");
  }

  if (!SUPPORTED_ALGORITHMS.includes(algorithm)) {
    throw new OperationError("Operation failed");
  }

  const inputPath = resolvePath(state.directory, input);
  const hashPath = resolvePath(state.directory, hash);
  const hashObj = createHash(algorithm);

  const computedHash = await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(inputPath);
    stream.on("data", (chunk) => hashObj.update(chunk));
    stream.on("end", () => resolve(hashObj.digest("hex")));
    stream.on("error", () => reject(new OperationError("Operation failed")));
  });

  let expectedHash;
  try {
    expectedHash = await fs.promises.readFile(hashPath, "utf8");
  } catch {
    throw new OperationError("Operation failed");
  }

  const match =
    computedHash.toLowerCase() === expectedHash.trim().toLowerCase();

  console.log(match ? "OK" : "MISMATCH");
}