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
const packagePath = `/workspace/package.json`;
await writeFile(packagePath, JSON.stringify(packageJson, null, 2));
console.log(`package.json generated at ${packagePath}`);

console.log("Generating app.yaml (Flex)...");

// If id is "express", use "default", otherwise use id
const serviceName = id === "express" ? "default" : id;

const appYamlContent =
  "runtime: nodejs\n" +
  "env: flex\n" +
  `service: ${serviceName}\n` +
  "\n" +
  "runtime_config:\n" +
  '    operating_system: "ubuntu24"\n' +
  '    runtime_version: "24"\n' +
  "manual_scaling:\n" +
  "   instances: 1\n" +
  "resources:\n" +
  "   cpu: 1\n" +
  "   memory_gb: 0.5\n" +
  "   disk_size_gb: 10\n";

await writeFile("/workspace/app.yaml", appYamlContent);

console.log(
  `app.yaml generated for App Engine Flex with service: ${serviceName}`
);
