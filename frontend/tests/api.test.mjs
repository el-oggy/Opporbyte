import { test } from "node:test";
import assert from "node:assert/strict";
import { request, login, ApiError } from "../components/workspace/api.ts";

test("protected requests use same-origin cookies without local token storage", async () => {
  const original = globalThis.fetch;
  let captured;
  globalThis.fetch = async (url, options) => { captured = { url, options }; return new Response(JSON.stringify({ ok: true }), { status: 200 }); };
  try { await request("/profiles/software"); assert.equal(captured.url, "/api/v1/profiles/software"); assert.equal(captured.options.credentials, "include"); assert.equal(captured.options.cache, "no-store"); assert.equal(captured.options.headers.has("Authorization"), false); }
  finally { globalThis.fetch = original; }
});
test("login preserves the existing JSON credential contract", async () => {
  const original = globalThis.fetch; let captured;
  globalThis.fetch = async (url, options) => { captured = { url, options }; return new Response(JSON.stringify({ user: { email: "fixture@example.test" } }), { status: 200 }); };
  try { await login("fixture@example.test", "test-only-value"); assert.equal(captured.url, "/api/v1/auth/login"); assert.equal(captured.options.method, "POST"); assert.deepEqual(JSON.parse(captured.options.body), { email: "fixture@example.test", password: "test-only-value" }); }
  finally { globalThis.fetch = original; }
});
test("expired sessions and unavailable service are explicit errors", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response(JSON.stringify({ detail: "Session expired" }), { status: 401 });
    await assert.rejects(request("/auth/me"), error => error instanceof ApiError && error.status === 401);
    globalThis.fetch = async () => { throw new TypeError("offline"); };
    await assert.rejects(request("/auth/me"), error => error instanceof ApiError && error.status === 0);
  } finally { globalThis.fetch = original; }
});
