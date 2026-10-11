import assert from "node:assert/strict";
import { test } from "node:test";
import { corePose, opportunityPose } from "./poses.ts";
test("convergence reverses without accumulating transforms", () => {
  const stages = [0, 0.25, 0.5, 0.8, 1];
  const forward = stages.map((p) =>
    Array.from({ length: 6 }, (_, i) => opportunityPose(i, p)),
  );
  const reverse = [...stages]
    .reverse()
    .map((p) => Array.from({ length: 6 }, (_, i) => opportunityPose(i, p)))
    .reverse();
  assert.deepEqual(forward, reverse);
  assert.notDeepEqual(forward[0], forward[4]);
});
test("organized board retains depth and perspective", () => {
  const jobs = [0, 1, 2, 3, 4, 5].map((i) => opportunityPose(i, 1));
  assert.ok(jobs.every((p) => p.rotation[1] < -0.1));
  assert.ok(new Set(jobs.map((p) => p.position[2])).size > 2);
  assert.ok(corePose(1).scale < corePose(0).scale);
});
test("mobile remains independent of scrolling and clamp is finite", () => {
  for (let i = 0; i < 6; i++)
    assert.deepEqual(opportunityPose(i, 0, true), opportunityPose(i, 1, true));
  assert.deepEqual(opportunityPose(0, -5), opportunityPose(0, 0));
  assert.deepEqual(opportunityPose(0, 5), opportunityPose(0, 1));
});
