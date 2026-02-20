import { writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const id = process.env.SERVICE_NAME;
if (!id) throw new Error("ID environment variable is required");

console.log(`Fetching client config for: ${id}`);
const response = await fetch(
  `https://dummy-rt2a.onrender.com/api/clients/${id}`
);
if (!response.ok)
  throw new Error(`Failed to fetch client data: ${response.status}`);

const client = await response.json();
const dependencies = client.dependencies || {};

const packageJsonPath = join(__dirname, "..", "package.json");
const packageJsonRaw = await readFile(packageJsonPath, "utf-8");
const packageJson = JSON.parse(packageJsonRaw);

packageJson.dependencies = {
  ...packageJson.dependencies,
  ...dependencies,
};

await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log("Updated package.json with client dependencies");
