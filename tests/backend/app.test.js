import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";

const root = process.cwd();

const startServer = async () => {
  const child = spawn(process.execPath, ["server/server.js"], {
    cwd: root,
    env: { ...process.env, PORT: "5099", JWT_SECRET: "test-only-secret", DATABASE_URL: "" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timed out waiting for test server to start")), 3000);
    child.on("error", reject);
    child.stdout.on("data", (chunk) => {
      if (String(chunk).includes("running on port 5099")) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.on("exit", (code, signal) => {
      clearTimeout(timer);
      reject(new Error(`Test server exited before readiness (code=${code}, signal=${signal})`));
    });
    child.stderr.on("data", (chunk) => { if (String(chunk).includes("EADDRINUSE")) { clearTimeout(timer); reject(new Error(String(chunk))); } });
  });
  return child;
};

test("health and API 404 endpoints are available", async (t) => {
  const child = await startServer();
  t.after(() => child.kill("SIGTERM"));
  const health = await fetch("http://127.0.0.1:5099/api/health");
  assert.equal(health.status, 200);
  assert.equal((await health.json()).status, "ok");
  const missing = await fetch("http://127.0.0.1:5099/api/not-real");
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).success, false);
});
