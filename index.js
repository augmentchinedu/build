import "./routes.js";
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Detect workspace: use /workspace if on GAE or Cloud Build, else cwd
const workspaceDir = process.env.GAE_ENV || fs.existsSync("/workspace") ? "/workspace" : process.cwd();

// Ensure workspace directory exists
await mkdir(workspaceDir, { recursive: true });

// Environment variable: ID of the client
const id = process.env.ID;
if (!id) {
  throw new Error("ID environment variable is required");
}

console.log(`Fetching client config for: ${id}`);

// Fetch client config from API
const response = await fetch(`https://dummy-rt2a.onrender.com/api/clients/${id}`);
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

// Paths for generated files
const packagePath = join(workspaceDir, "package.json");
const dockerfilePath = join(workspaceDir, "Dockerfile");
const appYamlPath = join(workspaceDir, "app.yaml");

// Write package.json
await writeFile(packagePath, JSON.stringify(packageJson, null, 2));
console.log(`package.json generated at ${packagePath}`);

// Dockerfile content
const dockerfileContent = `
FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production
ENV NAME=${client.name}

CMD ["node", "index.js"]
`.trim();

// Write Dockerfile
await writeFile(dockerfilePath, dockerfileContent);
console.log(`Dockerfile generated at ${dockerfilePath}`);

// Determine service name
const serviceName = id === "express" ? "default" : id;

// app.yaml content
const appYamlContent =
  "runtime: custom\n" +
  "env: flex\n" +
  `service: ${serviceName}\n` +
  "\n" +
  "automatic_scaling:\n" +
  "  min_num_instances: 1\n" +
  "  max_num_instances: 3\n";

// Write app.yaml
await writeFile(appYamlPath, appYamlContent);
console.log(`app.yaml generated for App Engine Flex with service: ${serviceName}`);