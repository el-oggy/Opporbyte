import * as THREE from "./vendor/three.module.js";
import { createCardTexture, studioTexture } from "./assets/card-textures.mjs";

const portrait = new URLSearchParams(location.search).get("format") === "vertical";
const exporting = new URLSearchParams(location.search).has("export");
document.body.classList.toggle("export", exporting);
const W = portrait ? 1080 : 1920, H = portrait ? 1920 : 1080, DURATION = 35;
const canvas = document.querySelector("#film"), ctx = canvas.getContext("2d");
canvas.width = W; canvas.height = H;
await Promise.all([document.fonts.load("500 80px 'Space Grotesk'"), document.fonts.load("400 30px Inter")]);
await document.fonts.ready;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 0.94;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); scene.background = new THREE.Color("#F4E7D2");
scene.environment = studioTexture();
scene.add(new THREE.AmbientLight("#fffdf8", 0.45));
scene.add(new THREE.HemisphereLight("#fffdf8", "#a48d70", 0.85));
const key = new THREE.DirectionalLight("#fff6e6", 2.6);
key.position.set(-4, 8, 6); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -12; key.shadow.camera.right = 12;
key.shadow.camera.top = 10; key.shadow.camera.bottom = -10; key.shadow.normalBias = 0.04;
scene.add(key);
const fill = new THREE.DirectionalLight("#fffdf8", 0.75); fill.position.set(5, 2, 4); scene.add(fill);
const rim = new THREE.DirectionalLight("#c5f1e8", 1.35); rim.position.set(3, 5, -5); scene.add(rim);
const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 80);
const world = new THREE.Group(); scene.add(world);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.ShadowMaterial({ color: "#705537", opacity: 0.1 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -4.1; ground.receiveShadow = true; scene.add(ground);

const clamp = n => Math.max(0, Math.min(1, n));
const ease = n => { const p = clamp(n); return p * p * (3 - 2 * p); };
const at = (t, a, b) => ease((t - a) / (b - a));
const lerp = (a, b, p) => a + (b - a) * p;
const vector = (a, b, p) => a.map((x, i) => lerp(x, b[i], p));
function poseSample(t, poses) {
  const next = poses.findIndex(item => item[0] > t);
  if (next === 0) return poses[0][1];
  if (next < 0) return poses[poses.length - 1][1];
  const [ta, a] = poses[next - 1], [tb, b] = poses[next];
  const p = ease((t - ta) / (tb - ta));
  return { p: vector(a.p, b.p, p), r: vector(a.r, b.r, p), s: lerp(a.s, b.s, p) };
}
function applyPose(object, pose) { object.position.set(...pose.p); object.rotation.set(...pose.r); object.scale.setScalar(pose.s); }
const pose = (p, r = [-0.08, -0.22, 0], s = 1) => ({ p, r, s });
function bodyGeometry(width, height, depth = 0.2, radius = 0.14) {
  const x = -width / 2, y = -height / 2, shape = new THREE.Shape();
  shape.moveTo(x + radius, y); shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height); shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius); shape.quadraticCurveTo(x, y, x + radius, y);
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.045, bevelThickness: 0.045, bevelSegments: 4, curveSegments: 12 });
  g.translate(0, 0, -depth / 2); return g;
}
const creamMaterial = new THREE.MeshPhysicalMaterial({ color: "#d7c7aa", roughness: 0.35, metalness: 0.09, clearcoat: 0.6 });
function panel(texture, width, height, color = creamMaterial) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(bodyGeometry(width, height), color); body.castShadow = true; body.receiveShadow = true; group.add(body);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(width - 0.12, height - 0.12), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
  face.position.z = 0.15; group.add(face); world.add(group); return group;
}
const cards = Array.from({ length: 5 }, (_, i) => panel(createCardTexture(i), i === 2 ? 2.03 : i === 4 ? 2.18 : 2.65, i === 2 ? 2.55 : i === 4 ? 1.03 : 1.42));
const resumeBacks = [];
for (let i = 0; i < 3; i++) {
  const mesh = new THREE.Mesh(bodyGeometry(1.93, 2.45, 0.035), new THREE.MeshStandardMaterial({ color: i % 2 ? "#fffdf8" : "#ded0b7", roughness: 0.7 }));
  mesh.castShadow = true; cards[2].add(mesh); resumeBacks.push(mesh);
}

const shape = new THREE.Shape(); shape.absellipse(0, 0, 1.36, 1.59, 0, Math.PI * 2, false, 0);
const hole = new THREE.Path(); hole.absellipse(0, 0, 0.85, 1.08, 0, Math.PI * 2, true, 0); shape.holes.push(hole);
const coreGeometry = new THREE.ExtrudeGeometry(shape, { depth: 0.68, bevelEnabled: true, bevelSize: 0.16, bevelThickness: 0.17, bevelSegments: 8, curveSegments: 64 });
coreGeometry.translate(0, 0, -0.34);
const core = new THREE.Group(); world.add(core);
const orange = new THREE.Mesh(coreGeometry, new THREE.MeshPhysicalMaterial({ color: "#FF6B2B", roughness: 0.23, metalness: 0.08, clearcoat: 1, clearcoatRoughness: 0.2 }));
orange.castShadow = true; orange.receiveShadow = true; core.add(orange);
const dark = new THREE.Mesh(new THREE.TorusGeometry(0.81, 0.12, 20, 96), new THREE.MeshPhysicalMaterial({ color: "#292e28", roughness: 0.32, metalness: 0.38 }));
dark.position.z = -0.23; dark.scale.set(1, 1.26, 2.3); core.add(dark);
const seam = new THREE.Mesh(new THREE.TorusGeometry(0.81, 0.038, 12, 96), new THREE.MeshStandardMaterial({ color: "#B9F0EC", roughness: 0.32, metalness: 0.25 }));
seam.position.z = -0.39; seam.scale.y = 1.26; core.add(seam);
for (let i = 0; i < 24; i++) {
  const a = i / 24 * Math.PI * 2;
  const rib = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.13, 0.32), dark.material);
  rib.position.set(Math.cos(a) * 0.835, Math.sin(a) * 1.06, -0.21); rib.rotation.z = a - Math.PI / 2; core.add(rib);
}
const mark = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.15, 4, 12), dark.material);
mark.position.set(1.03, 1.21, 0.38); mark.rotation.z = -0.7; core.add(mark);

const orbit = new THREE.Group(); world.add(orbit);
for (let i = 0; i < 2; i++) {
  const pts = Array.from({ length: 100 }, (_, j) => { const a = j / 99 * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * (4.4 - i * 0.25), Math.sin(a) * 2.2, Math.sin(a + i) * 1.3 - 0.9); });
  const curve = new THREE.CatmullRomCurve3(pts);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 100, 0.013 - i * 0.004, 8, true), new THREE.MeshStandardMaterial({ color: i ? "#baa787" : "#78afa6", transparent: true, opacity: 0.5 }));
  orbit.add(mesh);
}
const nodes = Array.from({ length: 5 }, (_, i) => {
  const node = new THREE.Mesh(new THREE.SphereGeometry(i % 2 ? 0.07 : 0.105, 16, 12), new THREE.MeshPhysicalMaterial({ color: i % 2 ? "#FF6B2B" : "#B9F0EC", roughness: 0.22, clearcoat: 1 }));
  orbit.add(node); return node;
});

const load = async name => { const t = await new THREE.TextureLoader().loadAsync("assets/" + name); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const screens = await Promise.all(["discover-all.png", "discover-design.png", "discover-saved.png"].map(load));
const browserPanel = panel(screens[0], 7.2, 5.4);
const browserFace = browserPanel.children[1];
const workspace = new THREE.Group(); world.add(workspace);
const tray = new THREE.Mesh(bodyGeometry(9.2, 5.8, 0.28, 0.22), new THREE.MeshPhysicalMaterial({ color: "#fff9ee", roughness: 0.48, clearcoat: 0.3 }));
tray.castShadow = true; tray.receiveShadow = true; workspace.add(tray);
function textTexture(title, detail, width = 1024, height = 160) {
  const c = document.createElement("canvas"); c.width = width; c.height = height;
  const x = c.getContext("2d"); x.fillStyle = "#fff9ee"; x.fillRect(0, 0, width, height);
  x.fillStyle = "#202420"; x.font = "500 57px 'Space Grotesk'"; x.fillText(title, 36, 77);
  x.fillStyle = "#68695e"; x.font = "400 28px Inter"; x.fillText(detail, 36, 127);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const header = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 0.97), new THREE.MeshBasicMaterial({ map: textTexture("opporbyte.", "Discover  /  Resume  /  Applications"), toneMapped: false }));
header.position.set(-0.45, 2.22, 0.19); workspace.add(header);
const statusGroups = ["Saved", "Preparing", "Interview"].map((title, i) => {
  const group = new THREE.Group(); world.add(group);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(2.65, 0.5), new THREE.MeshBasicMaterial({ map: textTexture(title, "Demonstration", 640, 160), toneMapped: false }));
  label.position.y = 1.0; group.add(label);
  const card = panel(createCardTexture(i === 2 ? 3 : i), 2.65, 1.42); world.remove(card); group.add(card);
  return group;
});

const scattered = portrait
  ? [[-2.35, 1.1, -0.3], [2.4, 1.6, -1.3], [-2.1, -1.1, 1.2], [2.1, -1.2, 0.5], [0.8, 2.9, -0.7]]
  : [[-4.2, 1.3, 0.4], [4.2, 1.55, -1.2], [-3.7, -1.35, 1.4], [4.05, -1.1, 0.55], [2.8, 0.3, 1.1]];
const initialRotations = [[0.13, 0.46, -0.16], [-0.12, -0.4, 0.13], [0.12, 0.45, -0.14], [-0.08, -0.36, 0.1], [0.13, -0.34, -0.08]];
function cardMotion(i, t) {
  const from = pose(scattered[i], initialRotations[i], portrait ? 0.88 : 1);
  const gathered = pose([(i % 2 ? 1 : -1) * (portrait ? 2.4 : 3.25), (i - 2) * 0.72, -0.4], initialRotations[i], 0.8);
  const away = pose([(i % 2 ? 1 : -1) * 7, -1.4, -4], initialRotations[i], 0.5);
  const resume = i === 2 ? pose([portrait ? 0 : -2.3, portrait ? -0.25 : -0.3, 1.65], [-0.1, -0.26, -0.04], portrait ? 1.2 : 1.36)
    : i === 0 ? pose([portrait ? 2.7 : 1.15, -0.75, -0.3], [-0.05, -0.28, 0.08], portrait ? 0.65 : 0.95) : away;
  const organized = i === 2 ? pose([2.75, -0.15, 0.5], [-0.06, -0.25, 0], 0.72)
    : i === 4 ? pose([2.55, 1.6, 0.6], [-0.06, -0.25, 0], 0.85) : away;
  return poseSample(t, [[0, from], [5.2, from], [8.5, gathered], [10.5, gathered], [12.2, away], [15.5, away], [17, resume], [20.2, resume], [22, away], [25.6, away], [27.6, organized], [30.5, organized], [32.5, away]]);
}

function drawText(text, x, y, size, alpha = 1, color = "#202420", family = "Space Grotesk", align = "left") {
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.font = "500 " + size + "px '" + family + "'";
  ctx.textAlign = align; ctx.textBaseline = "alphabetic"; ctx.fillText(text, x, y); ctx.restore();
}
function headline(lines, t, start, end, { x, y, size, align = "left" }) {
  const a = at(t, start, start + 0.5) * (1 - at(t, end - 0.6, end));
  if (a <= 0) return;
  lines.forEach((line, i) => {
    const reveal = at(t, start + i * 0.16, start + 0.65 + i * 0.16);
    drawText(line, x, y + i * size * 1.08 + (1 - reveal) * 35, size, a * reveal, i === lines.length - 1 ? "#bd4918" : "#202420", "Space Grotesk", align);
  });
}
const captions = [
  [0.3, 5.5, ["Your next role.", "Too many tabs."]],
  [6.0, 10.7, ["Meet Opporbyte."]],
  [11.1, 15.9, ["Find your fit."]],
  [16.2, 20.9, ["Put your story", "forward."]],
  [21.2, 25.9, ["Every next step,", "in view."]],
  [26.2, 31.0, ["Your job hunt.", "Finally in one place."]],
];
const narration = [
  [0.1, 5.9, "Job sites. Resume tools. Spreadsheets."],
  [6, 10.9, "Bring your job search into one clear workspace."],
  [11, 15.9, "Your field. Your skills. Your direction."],
  [16, 20.9, "Put your experience in focus."],
  [21, 25.9, "Applications, follow-ups and next steps."],
  [26, 30.9, "Less switching. More progress."],
  [31, 35, "Welcome to Opporbyte. Let's find what's next."],
];

function render(t) {
  t = Math.max(0, Math.min(DURATION, t));
  const assembly = at(t, 25.6, 27.6), ending = at(t, 30.5, 32.8);
  const arc = Math.sin(t / DURATION * Math.PI);
  const cameraPath = poseSample(t, [
    [0, pose([-2.8, 1.3, 11.8])], [4.8, pose([-0.9, 0.8, 13.5])],
    [8.5, pose([2.6, 1.1, 12.5])], [12, pose([0.8, 0.6, 12.7])],
    [16, pose([0.4, 0.8, 13.3])], [19, pose([-1.6, 0.7, 12.6])],
    [23, pose([1.3, 1.4, 13.5])], [28, pose([2.3, 1.6, 15])],
    [32, pose([0.5, 0.7, 13.4])], [35, pose([0.35, 0.7, 12.5])],
  ]);
  camera.position.set(portrait ? Math.sin(t * 0.13) * 0.35 : cameraPath.p[0], portrait ? 0.65 + arc * 0.45 : cameraPath.p[1], portrait ? 18.3 + assembly * 1.6 - ending * 1.1 : cameraPath.p[2]);
  camera.lookAt(0, portrait ? -0.45 : -0.6, 0);
  world.position.y = (portrait ? -1.5 : -0.9) - assembly * (1-ending) * 0.8;
  world.rotation.y = Math.sin(t * 0.12) * 0.035 * (1 - ending);
  const beginning = pose([0.1, 0, -0.3], [-0.18, -0.65, -0.24], portrait ? 0.96 : 1.12);
  const brand = pose([0, 0, 1.2], [-0.07, 0.1, -0.04], portrait ? 1.04 : 1.16);
  const recess = pose([-5.5, -1.4, -5], [-0.12, -0.8, -0.1], 0.5);
  const organized = pose([-3.75, 2.32, 0.3], [-0.05, -0.35, 0], 0.25);
  const final = pose([portrait ? 0 : -2.45, portrait ? 1.6 : -0.2, 1.2], [-0.08, -0.33, -0.11], portrait ? 1.22 : 1.45);
  applyPose(core, poseSample(t, [[0, beginning], [5.2, beginning], [8.0, brand], [10.5, brand], [12.2, recess], [25.6, recess], [27.6, organized], [30.5, organized], [33, final], [35, final]]));
  if (t < 30.5) core.rotation.y += Math.sin(t * 0.35) * 0.08;
  cards.forEach((card, i) => {
    applyPose(card, cardMotion(i, t));
    if (t < 6) { card.position.y += Math.sin(t * 0.65 + i) * 0.12; card.rotation.y += Math.sin(t * 0.35 + i) * 0.09; }
    card.visible = (t < 12.2 || t >= 15.5 && t < 21.5 && [0,2].includes(i) || t >= 25.6 && t < 32.5 && [2,4].includes(i)) && (!portrait || [0,2,3].includes(i));
  });
  core.visible = t < 12.2 || t >= 25.6;
  resumeBacks.forEach((mesh, i) => { const fan = Math.sin(at(t, 16, 18) * Math.PI / 2) * (1 - at(t, 20, 21)); mesh.position.set(0.09 * (i + 1) * fan, -0.05 * (i + 1), -0.18 - i * 0.04); mesh.rotation.z = -0.035 * (i + 1) * fan; });
  orbit.visible = t < 12.8; orbit.rotation.set(0.22, -0.13 + t * 0.017, -0.24);
  orbit.scale.setScalar(portrait ? 0.75 : 1);
  orbit.children.slice(0, 2).forEach((line, i) => { line.material.opacity = (0.12 + at(t, 5.2, 8.0) * 0.42) * (1 - at(t, 10.3, 12.8)) * (i ? 0.5 : 1); });
  nodes.forEach((node, i) => { const a = i / 5 * Math.PI * 2 + t * 0.3; node.position.set(Math.cos(a) * 4.4, Math.sin(a) * 2.2, Math.sin(a) * 1.3 - 0.9); });
  const screenFocus = pose([portrait ? 0 : 1.5, portrait ? -0.3 : -0.15, 0.6], [-0.06, -0.16, 0.01], portrait ? 0.76 : 1.13);
  const screenOrganized = pose([-1.72, -0.3, 0.32], [-0.06, -0.23, 0], 0.57);
  applyPose(browserPanel, poseSample(t, [[0, pose([3, -0.3, -6], [0, -0.9, 0], 0.01)], [10.5, pose([3, -0.3, -4], [0, -0.8, 0], 0.1)], [12.1, screenFocus], [15.8, screenFocus], [17, pose([4.9, -0.3, -4], [0, -0.7, 0], 0.32)], [25.6, pose([4.9, -0.3, -4], [0, -0.7, 0], 0.32)], [27.6, screenOrganized], [30.5, screenOrganized], [32.5, pose([7, 0, -6], [0, -0.9, 0], 0.1)]]));
  browserPanel.visible = t > 10.5 && t < 32.5;
  browserFace.material.map = screens[t < 13.1 ? 0 : t < 14.5 ? 1 : 2];
  workspace.visible = t > 25.6 && t < 32.5;
  applyPose(workspace, poseSample(t, [[0, pose([0, 0.1, -3], [-0.06, -0.23, 0], 0.7)], [25.6, pose([0, 0.1, -3], [-0.06, -0.23, 0], 0.7)], [27.6, pose([0, 0.1, -0.3], [-0.06, -0.23, 0], 1)], [30.5, pose([0, 0.1, -0.3], [-0.06, -0.23, 0], 1)], [32.5, pose([0, 0.1, -5], [-0.06, -0.23, 0], 0.7)]]));
  statusGroups.forEach((group, i) => {
    group.visible = t > 20.6 && t < 32;
    const track = portrait ? pose([0, 1.15 - i * 1.78, i * 0.3], [-0.06, -0.15, 0], 1.12) : pose([-3.2 + i * 3.2, -0.35 + Math.sin(i) * 0.15, i * 0.4], [-0.08, -0.27, 0], 1);
    const fitted = pose([1.2 + i * 1.05, -2, 0.5 + i * 0.06], [-0.06, -0.23, 0], 0.36);
    applyPose(group, poseSample(t, [[0, pose([-6 + i * 3, -2, -5], [0, -0.7, 0], 0.4)], [20.6 + i * 0.12, pose([-6 + i * 3, -2, -5], [0, -0.7, 0], 0.4)], [22.2 + i * 0.12, track], [25.6, track], [27.6, fitted], [30.5, fitted], [32, pose([7, -2, -5], [0, -0.8, 0], 0.2)]]));
  });
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(renderer.domElement, 0, 0);
  // Film typography belongs to the frame: no DOM slide headings or chapter UI.
  const edge = portrait ? 140 : 100;
  drawText("opporbyte.", edge, portrait ? 152 : 91, portrait ? 42 : 35, 1);
  if (portrait) {
    captions.forEach(([a, b, lines]) => headline(lines, t, a, b, { x: W / 2, y: 405, size: lines.length > 1 ? 77 : 86, align: "center" }));
    headline(["Your next chapter", "starts here."], t, 31.3, 36.2, { x: W / 2, y: 1340, size: 74, align: "center" });
  } else {
    captions.forEach(([a, b, lines], i) => {
      const layout = i === 2 ? { x: 130, y: 280, size: 80 } : i === 3 ? { x: 1190, y: 390, size: 78 } : { x: W / 2, y: 215, size: i === 5 ? 82 : 88, align: "center" };
      headline(lines, t, a, b, layout);
    });
    headline(["Your next chapter", "starts here."], t, 31.3, 36.2, { x: 990, y: 465, size: 87 });
  }
  const current = narration.find(([a, b]) => t >= a && t < b);
  if (current) {
    const y = portrait ? H - 205 : H - 113, size = portrait ? 26 : 25;
    drawText(current[2], W / 2, y, size, at(t, current[0], current[0] + 0.25), "#53584f", "Inter", "center");
  }
  drawText("Product preview", edge, H - (portrait ? 103 : 62), portrait ? 22 : 18, 1, "#53584f", "Inter");
  drawText("Fictional examples", edge, H - (portrait ? 69 : 34), portrait ? 18 : 15, 1, "#687063", "Inter");
}

render(0);
window.__motion = { ready: true, duration: DURATION, width: W, height: H, render, snapshot: () => canvas.toDataURL("image/png") };
if (!exporting) {
  let playing = false, time = 0, previous = performance.now();
  const button = document.querySelector("#play"), seek = document.querySelector("#seek");
  button.onclick = () => { if (time >= DURATION) time = 0; playing = !playing; button.textContent = playing ? "Pause" : "Play"; previous = performance.now(); };
  seek.oninput = () => { time = Number(seek.value); render(time); };
  function loop(now) {
    if (playing) { time = Math.min(DURATION, time + (now - previous) / 1000); render(time); seek.value = time; document.querySelector("#time").textContent = "0:" + Math.floor(time).toString().padStart(2, "0"); if (time === DURATION) { playing = false; button.textContent = "Replay"; } }
    previous = now; requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
