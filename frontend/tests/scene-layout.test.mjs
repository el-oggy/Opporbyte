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
  assert.deepEqual(scene.cardPose(0, 1).rotation, scene.ORGANIZED_ROTATIONS[0]);
});

test("assembled workspace retains dimensional poses", () => {
  assert.ok(scene, "The scroll pose implementation is missing");
  assert.ok(
    scene.ORGANIZED_ROTATIONS,
    "The organized state needs a three-quarter pose",
  );
  assert.ok(
    scene.ORGANIZED_ROTATIONS.every((rotation) => Math.abs(rotation[1]) > 0.12),
  );
  assert.ok(new Set(scene.SCATTERED.map((position) => position[2])).size >= 3);
});

test("camera changes perspective through connection, returns exactly, and supports an inspection view", () => {
  assert.equal(typeof scene?.cameraPose, "function");
  const initial = scene.cameraPose(0, 0);
  assert.notDeepEqual(scene.cameraPose(0.45, 0).position, initial.position);
  assert.notDeepEqual(scene.cameraPose(0, 1).position, initial.position);
  scene.cameraPose(1, 1);
  assert.deepEqual(scene.cameraPose(0, 0), initial);
  assert.deepEqual(scene.cameraPose(-1, 0), initial);
  for (const progress of [0, 0.4, 0.8, 1]) {
    const camera = scene.cameraPose(progress, 0);
    assert.ok(camera.position.every(Number.isFinite));
    assert.ok(
      camera.position[2] >= 9.5,
      "Keep the scene inside a useful framing",
    );
  }
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

test("compact layout keeps its own useful pose through scroll and breakpoint changes", () => {
  for (let index = 0; index < scene.COMPACT_SCATTERED.length; index++) {
    const initial = scene.cardPose(index, 0, true);
    assert.deepEqual(initial.position, scene.COMPACT_SCATTERED[index]);
    for (const progress of [0.42, 0.8, 1])
      assert.deepEqual(scene.cardPose(index, progress, true), initial);
    // A desktop scroll position must not leak into an unpinned compact scene.
    scene.cardPose(index, 0.8, false);
    assert.deepEqual(scene.cardPose(index, 0.8, true), initial);
  }
});
