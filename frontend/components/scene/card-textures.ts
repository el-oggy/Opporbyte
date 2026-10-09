import * as THREE from "three";

const INK = "#202420";
const MUTED = "#6c7067";

function rounded(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  fill: string,
) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
}
function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color = INK,
  weight = 500,
) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Inter, sans-serif`;
  ctx.fillText(text, x, y);
}
function pill(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fill: string,
  width: number,
) {
  rounded(ctx, x, y, width, 52, 26, fill);
  label(ctx, text, x + 22, y + 35, 24);
}

export function createCardTexture(index: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  rounded(ctx, 0, 0, 1024, 512, 38, index === 4 ? "#B9F0EC" : "#FFFDF8");
  if (index < 2) {
    const orange = index === 0;
    rounded(ctx, 48, 42, 100, 100, 25, orange ? "#f4d6c7" : "#d4ece6");
    label(
      ctx,
      orange ? "a." : "+",
      72,
      115,
      68,
      orange ? "#ba481c" : "#37685c",
      600,
    );
    label(ctx, orange ? "Aster Studio" : "Bloom Health", 174, 80, 29, INK, 600);
    label(ctx, "FICTIONAL COMPANY", 174, 120, 20, MUTED);
    label(
      ctx,
      orange ? "Product Designer" : "Care Coordinator",
      48,
      230,
      50,
      INK,
      600,
    );
    label(
      ctx,
      orange
        ? "Design that makes a difference."
        : "A more human kind of healthcare.",
      48,
      287,
      28,
      MUTED,
      400,
    );
    pill(
      ctx,
      orange ? "Design" : "Healthcare",
      48,
      335,
      "#f0ebdf",
      orange ? 145 : 205,
    );
    pill(
      ctx,
      orange ? "Remote" : "Hybrid",
      orange ? 215 : 275,
      335,
      "#f0ebdf",
      165,
    );
    ctx.fillStyle = "#e9e5d9";
    ctx.fillRect(48, 420, 928, 2);
    label(ctx, "DEMO OPPORTUNITY", 48, 470, 22, MUTED);
    label(ctx, "↗", 917, 475, 45, INK);
  } else if (index === 2) {
    rounded(ctx, 45, 43, 74, 86, 8, "#F4E7D2");
    label(ctx, "CV", 56, 96, 31, "#9c5730", 600);
    label(ctx, "Your next chapter", 149, 89, 35, INK, 600);
    label(ctx, "RESUME · DEMONSTRATION", 149, 125, 19, MUTED);
    label(ctx, "Experience, with purpose.", 48, 216, 32, INK, 500);
    [760, 660, 820, 540].forEach((width, i) =>
      rounded(
        ctx,
        48,
        256 + i * 34,
        width,
        12,
        6,
        i === 0 ? "#d8d2c5" : "#e7e1d6",
      ),
    );
    rounded(ctx, 48, 418, 290, 49, 24, "#def1e6");
    label(ctx, "✓ Ready to prepare", 67, 451, 23, "#37654e");
  } else if (index === 3) {
    rounded(ctx, 48, 46, 71, 71, 22, "#F4E7D2");
    label(ctx, "↗", 64, 94, 39, INK);
    label(ctx, "A little progress, every day.", 145, 92, 29, INK, 600);
    label(ctx, "APPLICATION TRACKER · DEMO", 48, 176, 22, MUTED);
    label(ctx, "Software Engineer", 48, 258, 44, INK, 600);
    label(ctx, "Forma Systems · Fictional company", 48, 309, 25, MUTED);
    pill(ctx, "Interview", 48, 359, "#def1e6", 205);
    label(ctx, "Next conversation", 288, 395, 27, INK);
    label(ctx, "ALL IN ONE PLACE", 48, 472, 21, MUTED);
  } else {
    label(ctx, "✳", 63, 278, 108, "#2c6861", 600);
    label(ctx, "A promising fit", 220, 213, 51, INK, 600);
    label(ctx, "94%", 220, 332, 94, INK, 600);
    label(ctx, "DEMO MATCH", 483, 326, 24, "#3e6b63");
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function studioTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, "#fffdf8");
  gradient.addColorStop(0.6, "#ddd1bb");
  gradient.addColorStop(1, "#9b8971");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 256);
  rounded(ctx, 30, 20, 100, 150, 20, "#ffffff");
  rounded(ctx, 300, 30, 50, 140, 10, "#fff8e9");
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
