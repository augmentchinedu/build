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

// 3️⃣ Create Dockerfile for any environment
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

const dockerfilePath = `/workspace/Dockerfile`;
await writeFile(dockerfilePath, dockerfileContent);
console.log(`Dockerfile generated at ${dockerfilePath}`);

console.log("Generating app.yaml (Flex)...");

// If id is "express", use "default", otherwise use id
const serviceName = id === "express" ? "default" : id;

const appYamlContent =
  "runtime: custom\n" +
  "env: flex\n" +
  `service: ${serviceName}\n` +
  "\n" +
  "automatic_scaling:\n" +
  "  min_num_instances: 1\n" +
  "  max_num_instances: 3\n";

await writeFile("/workspace/app.yaml", appYamlContent);

console.log(
  `app.yaml generated for App Engine Flex with service: ${serviceName}`
);
