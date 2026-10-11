import test from "node:test";
import assert from "node:assert/strict";
import { workspaceDestination } from "../lib/navigation.ts";

test("sign-in preserves a local protected deep link", () => {
  assert.equal(workspaceDestination("/app/jobs/role-123?review=1#skills"), "/app/jobs/role-123?review=1#skills");
});
test("sign-in rejects external, ambiguous and public destinations", () => {
  for (const value of [null, "https://example.com/app", "//example.com/app", "/\\example.com/app", "/app/../../login", "/preview", "/application", "javascript:alert(1)", "/app\n"]) assert.equal(workspaceDestination(value), "/app");
});
