import "./routes.js";
import { writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const id = process.env.SERVICE_NAME;
if (!id) throw new Error("ID environment variable is required");

console.log(`Fetching client config for: ${id}`);
const response = await fetch(
  `https://storage.googleapis.com/great-unknown.appspot.com/cdn/services.json`
);

if (!response.ok)
  throw new Error(`Failed to fetch client data: ${response.status}`);

// First get raw string
const allClientsRaw = await response.text();

let allClients;
try {
  // First parse converts outer quotes to a JSON string
  const firstParse = JSON.parse(allClientsRaw);
  // If firstParse is still a string, parse again
  allClients =
    typeof firstParse === "string" ? JSON.parse(firstParse) : firstParse;
} catch (err) {
  console.error("Failed to parse services.json:", allClientsRaw);
  throw err;
}

// Now allClients is an array of objects
const client = Array.isArray(allClients)
  ? allClients.find((svc) => svc.id === id)
  : allClients[id];

if (!client) throw new Error(`Service with id "${id}" not found`);

console.log(`Found service: ${client.id}`);

const dependencies = client.dependencies || {};

const packageJsonPath = join(__dirname, "..", "package.json");
const packageJsonRaw = await readFile(packageJsonPath, "utf-8");
const packageJson = JSON.parse(packageJsonRaw);

// Merge dependencies, always include hono
packageJson.dependencies = {
  ...packageJson.dependencies,
  hono: "^4.12.4",
  "@hono/node-server": "^1.19.10",
  ...dependencies,
};

await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log("Updated package.json with client dependencies");
