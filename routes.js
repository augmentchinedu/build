import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  health: [{ path: "", controller: "getHealth", method: "get" }],
};

const routerDir = join(__dirname, "..", "router");
await mkdir(routerDir, { recursive: true });

let content = `
import { Hono } from "hono";
const router = new Hono();
`;

// Generate API routes
for (const [service, routesArr] of Object.entries(routes)) {
  routesArr.forEach(({ path, controller, method }) => {
    const routePath =
      service === "health"
        ? "api/v1/health"
        : `api/v1/${service}${path ? `/${path}` : ""}`;

    content += `
import { ${controller} } from "../controllers/${service}/${controller}.js";
router.${method}("${routePath}", ${controller});
`;
  });
}

// ✅ Add SPA catch-all AFTER all routes
content += `
import { sendFile } from "../controllers/index.js";

// Catch-all route for files (must be last)
router.get("*", sendFile);
`;

// Export
content += `
export default router;
`;

const outputPath = join(routerDir, "index.js");
await writeFile(outputPath, content);

console.log("router/index.js generated with SPA catch-all ✅");
