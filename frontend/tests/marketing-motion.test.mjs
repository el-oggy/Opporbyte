import test from "node:test";
import assert from "node:assert/strict";
import { damp, sceneProgress } from "../components/marketing/motion.ts";

test("scroll damping advances and reverses without overshoot", () => {
  let value = 0;
  for (let frame = 0; frame < 90; frame++) {
    const next = damp(value, 1, 1 / 60);
    assert.ok(next >= value && next <= 1);
    value = next;
  }
  assert.ok(value > 0.999);
  const reversed = damp(value, 0, 1 / 60);
  assert.ok(reversed < value && reversed > 0);
});

test("scroll damping is consistent at 30, 60 and 120 fps", () => {
  const samples = [30, 60, 120].map((fps) => {
    let value = 0;
    for (let frame = 0; frame < fps / 2; frame++)
      value = damp(value, 1, 1 / fps);
    return value;
  });
  assert.ok(Math.max(...samples) - Math.min(...samples) < 1e-12);
});

test("section progress clamps at its boundaries and reverses continuously", () => {
  assert.equal(sceneProgress(1000, 960), 0);
  assert.equal(sceneProgress(-100, 960), 1);
  assert.ok(sceneProgress(500, 960) < sceneProgress(300, 960));
  assert.ok(
    Math.abs(sceneProgress(400, 960) - sceneProgress(399, 960)) < 0.002,
  );
});
