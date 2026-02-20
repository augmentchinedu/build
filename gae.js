const id = process.env.ID;

const serviceName = id === "express" ? "default" : id;

const appYamlContent =
  "runtime: custom\n" +
  "env: flex\n" +
  `service: ${serviceName}\n` +
  "\n" +
  "automatic_scaling:\n" +
  "  min_num_instances: 1\n" +
  "  max_num_instances: 3\n";

await writeFile("./app.yaml", appYamlContent);

console.log(
  `app.yaml generated for App Engine Flex with service: ${serviceName}`
);
