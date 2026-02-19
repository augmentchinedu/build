import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variable
const name = process.env.NAME || 'name';

const packageJson = {
  name: name,
  version: "1.0.0",
  type: "module",
  main: "index.js",
  scripts: {
    start: "node index.js",
  },
  dependencies: {},
  devDependencies: {}
};

// Write package.json
const outputPath = `${__dirname}/package.json`;
await writeFile(outputPath, JSON.stringify(packageJson, null, 2), 'utf-8');

console.log(`package.json generated for project: ${name} at ${outputPath}`);
