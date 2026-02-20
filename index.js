import "./routes.js";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const id = process.env.ID;

if (!id) {
  throw new Error("ID environment variable is required");
}

console.log(`Fetching client config for: ${id}`);

// Fetch client config from API
const response = await fetch(
  `https://dummy-rt2a.onrender.com/api/clients/${id}`
);

if (!response.ok) {
  throw new Error(`Failed to fetch client data: ${response.status}`);
}

const client = await response.json();

const dependencies = client.dependencies || {};
const devDependencies = client.devDependencies || {};

// Build package.json dynamically
const packageJson = {
  name: id,
  version: "1.0.0",
  type: "module",
  private: true,
  main: "index.js",
  scripts: {
    start: "node index.js",
    build: client.buildScript || "vite build",
  },
  dependencies,
  devDependencies,
};

// Write package.json
const packagePath = `./package.json`;
await writeFile(packagePath, JSON.stringify(packageJson, null, 2));
console.log(`package.json generated at ${packagePath}`);


// Write client.name to a file for Docker ENV
const namePath = `./CLIENT_NAME`;
await writeFile(namePath, client.name, "utf-8");
console.log(`client.name saved to ${namePath}`);
