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

// Build package.json dynamically for Node.js 20
const packageJson = {
  name: id,
  version: "1.0.0",
  type: "module",
  private: true,
  main: "index.js",
  engines: {
    node: "20.x" // <-- Match supported App Engine Flex runtime
  },
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

// Determine service name
const serviceName = id === "express" ? "default" : id;

// Build app.yaml content for Node.js Flex
const appYamlContent =
  "runtime: nodejs\n" +       // <-- runtime is generic "nodejs"
  "env: flex\n" +
  `service: ${serviceName}\n\n` +
  "automaticScaling:\n" +
  "  minTotalInstances: 1\n" +
  "  maxTotalInstances: 3\n" +
  "  coolDownPeriod: 120s\n" +
  "  cpuUtilization:\n" +
  "    targetUtilization: 0.6\n\n" +
  "resources:\n" +
  "  cpu: 1\n" +
  "  memoryGb: 1\n" +
  "  diskGb: 10\n\n" +
  "beta_settings:\n" +
  "  vm_runtime: nodejs20\n"; // <-- choose supported runtime here

// Write app.yaml
await writeFile("/workspace/app.yaml", appYamlContent);

console.log(`app.yaml generated for App Engine Flex with service: ${serviceName}`);