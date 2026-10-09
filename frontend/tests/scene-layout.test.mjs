import test from "node:test";
import assert from "node:assert/strict";

// These checks protect reversible scroll transforms, rather than snapshotting UI markup.
const scene = await import("../lib/scene-layout.ts").catch(() => null);

test("scroll pose API is available", () => {
  assert.equal(
    typeof scene?.cardPose,
    "function",
    "The scroll pose implementation is missing",
  );
});
test("scattered cards reach the organized grid", () => {
  assert.ok(scene, "The scroll pose implementation is missing");
  assert.deepEqual(scene.cardPose(0, 0).position, scene.SCATTERED[0]);
  assert.deepEqual(scene.cardPose(0, 1).position, scene.ORGANIZED[0]);
  assert.deepEqual(scene.cardPose(0, 1).rotation, [0, 0, 0]);
});
test("scrolling backward returns exactly to the initial pose", () => {
  assert.ok(scene, "The scroll pose implementation is missing");
  const before = scene.cardPose(1, 0.2);
  scene.cardPose(1, 0.9);
  assert.deepEqual(scene.cardPose(1, 0.2), before);
});
test("progress clamps without overshooting or producing NaN", () => {
  assert.ok(scene, "The scroll pose implementation is missing");
  assert.deepEqual(scene.cardPose(2, -1), scene.cardPose(2, 0));
  assert.deepEqual(scene.cardPose(2, 2), scene.cardPose(2, 1));
  for (let i = 0; i < 5; i++)
    for (const p of [0, 0.25, 0.5, 0.75, 1]) {
      assert.ok(scene.cardPose(i, p).position.every(Number.isFinite));
    }
});
