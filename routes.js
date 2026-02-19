import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import or define routes
const routes = {
  auth: [
    { path: "signin", controller: "signIn" },
    { path: "signup", controller: "signUp" },
    { path: "refreshToken", controller: "refreshToken" },
  ],
  client: [{ path: ":id", controller: "getClient" }],
  game: [{ path: ":id", controller: "getGame" }],
  user: [{ path: ":id", controller: "getUser" }],
  stores: [
    { path: "create", controller: "createStore" },
    { path: ":id", controller: "getStore" },
  ],
};

// Ensure router/ directory exists
const routerDir = join(__dirname, "..", "router");
await mkdir(routerDir, { recursive: true });

// Build router file content
let content = `
import express from "express";
const router = express.Router();
`;

// For each microservice
for (const [service, routesArr] of Object.entries(routes)) {
  routesArr.forEach(({ path, controller }) => {
    content += `
import { ${controller} } from "../controllers/${service}/${controller}.js";
router.use("/${service}/${path}", ${controller});
`;
  });
}

content += `
export default router;
`;

// Write to file
const outputPath = join(routerDir, "index.js");
await writeFile(outputPath, content);

console.log("router/index.js generated ✅");