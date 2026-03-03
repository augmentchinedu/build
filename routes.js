import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import or define routes
const routes = {
  auth: [
    { path: "signin", controller: "signIn", method: "post" },
    { path: "signup", controller: "signUp", method: "post" },
    { path: "refreshToken", controller: "refreshToken", method: "post" },
  ],
  client: [{ path: ":id", controller: "getClient", method: "get" }],
  games: [{ path: ":id", controller: "getGame", method: "get" }],
  users: [{ path: ":id", controller: "getUser", method: "get" }],
  stores: [
    { path: "create", controller: "createStore", method: "post" },
    { path: ":id", controller: "getStore", method: "get" },
  ],
};

// Ensure router/ directory exists
const routerDir = join(__dirname, "..", "router");
await mkdir(routerDir, { recursive: true });

// Build router file content
let content = `
import { Hono } from "hono";
const router = new Hono();
`;

// For each microservice
for (const [service, routesArr] of Object.entries(routes)) {
  routesArr.forEach(({ path, controller, method }) => {
    content += `
import { ${controller} } from "../controllers/${service}/${controller}.js";
router.${method}("/${service}/${path}", ${controller});
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
