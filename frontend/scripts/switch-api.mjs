import fs from "node:fs/promises";
import path from "node:path";

const target = process.argv[2];
const root = process.cwd();
const sourceMap = {
  local: path.join(root, ".env.local.desktop"),
  phone: path.join(root, ".env.local.phone"),
};

const source = sourceMap[target];
if (!source) {
  throw new Error("Usage: npm run use:local or npm run use:phone");
}

const dest = path.join(root, ".env.local");
await fs.copyFile(source, dest);
