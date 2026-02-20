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
const id = process.env.SERVICE_NAME;
console.log(id)
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
