import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const configPath = path.join(root, "dist", "server", "wrangler.json");
const wranglerPath = path.join(
  root,
  "node_modules",
  "wrangler",
  "bin",
  "wrangler.js",
);
const placeholderDatabaseId = "00000000-0000-4000-8000-000000000000";

let config;
try {
  config = JSON.parse(await readFile(configPath, "utf8"));
} catch (error) {
  if (error.code === "ENOENT") {
    throw new Error("Build first with `pnpm run build` before deploying.", {
      cause: error,
    });
  }
  throw error;
}

const database = config.d1_databases?.find(({ binding }) => binding === "DB");
if (
  !database ||
  !database.database_id ||
  database.database_id === placeholderDatabaseId
) {
  throw new Error(
    "Set WEDDING_D1_DATABASE_ID to the production D1 database ID and rebuild before deploying.",
  );
}

for (const args of [
  [
    "d1",
    "migrations",
    "apply",
    database.database_name,
    "--remote",
    "--config",
    configPath,
  ],
  ["deploy", "--config", configPath],
]) {
  const result = spawnSync(process.execPath, [wranglerPath, ...args], {
    cwd: root,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
