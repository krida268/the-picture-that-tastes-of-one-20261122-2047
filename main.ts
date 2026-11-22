// Ramen panas — satu gambar makanan, digambar piksel demi piksel.
// Tanpa network, tanpa jam dinding, tanpa angka acak: dua run selalu
// menghasilkan berkas yang sama persis.
import * as fs from "node:fs";
import * as zlib from "node:zlib";

const W = 1024;
const H = 1024;
const OUT = "/output/entry.png";

type RGB = [number, number, number];

const px = new Uint8ClampedArray(W * H * 4);

function put(x: number, y: number, c: RGB, a: number): void {
  const ix = Math.round(x);
  const iy = Math.round(y);
  if (ix < 0 || iy < 0 || ix >= W || iy >= H) return;
  const o = (iy * W + ix) * 4;
  const inv = 1 - a;
  px[o] = Math.round(c[0] * a + px[o] * inv);
  px[o + 1] = Math.round(c[1] * a + px[o + 1] * inv);
  px[o + 2] = Math.round(c[2] * a + px[o + 2] * inv);
  px[o + 3] = 255;
}

function disc(cx: number, cy: number, r: number, c: RGB, a = 1): void {
  const x0 = Math.max(0, Math.floor(cx - r));
  const x1 = Math.min(W - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r));
  const y1 = Math.min(H - 1, Math.ceil(cy + r));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = (x + 0.5 - cx) / r;
      const dy = (y + 0.5 - cy) / r;
      if (dx * dx + dy * dy <= 1) put(x, y, c, a);
    }
  }
}

function ellipse(cx: number, cy: number, rx: number, ry: number, c: RGB, a = 1): void {
  const x0 = Math.max(0, Math.floor(cx - rx));
  const x1 = Math.min(W - 1, Math.ceil(cx + rx));
  const y0 = Math.max(0, Math.floor(cy - ry));
  const y1 = Math.min(H - 1, Math.ceil(cy + ry));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) put(x, y, c, a);
    }
  }
}

function ring(cx: number, cy: number, rx: number, ry: number, thick: number, c: RGB, a = 1): void {
  const x0 = Math.max(0, Math.floor(cx - rx - thick));
  const x1 = Math.min(W - 1, Math.ceil(cx + rx + thick));
  const y0 = Math.max(0, Math.floor(cy - ry - thick));
  const y1 = Math.min(H - 1, Math.ceil(cy + ry + thick));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      const d = Math.sqrt(dx * dx + dy * dy);
      const t = thick / Math.max(rx, ry);
      if (d <= 1 + t / 2 && d >= 1 - t / 2) put(x, y, c, a);
    }
  }
}

function stroke(
  x1: number, y1: number, x2: number, y2: number,
  width: number, c: RGB, a = 1,
): void {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.max(1, Math.ceil(len * 2));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    disc(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, width / 2, c, a);
  }
}

function curve(
  x1: number, y1: number, cx: number, cy: number, x2: number, y2: number,
  width: number, c: RGB, a = 1,
): void {
  const steps = 90;
  let px0 = x1;
  let py0 = y1;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const x = mt * mt * x1 + 2 * mt * t * cx + t * t * x2;
    const y = mt * mt * y1 + 2 * mt * t * cy + t * t * y2;
    stroke(px0, py0, x, y, width, c, a);
    px0 = x;
    py0 = y;
  }
}

// ---------- latar: dinding krem hangat + meja kayu ----------
for (let y = 0; y < H; y++) {
  const t = y / H;
  const r = Math.round(250 - 22 * t);
  const g = Math.round(232 - 30 * t);
  const b = Math.round(205 - 42 * t);
  for (let x = 0; x < W; x++) put(x, y, [r, g, b], 1);
}
// cahaya lembut di belakang mangkuk
for (let i = 6; i >= 1; i--) {
  ellipse(512, 560, 300 + i * 42, 250 + i * 34, [255, 244, 214], 0.05);
}
// meja kayu
for (let y = 690; y < H; y++) {
  const t = (y - 690) / (H - 690);
  const r = Math.round(176 - 26 * t);
  const g = Math.round(122 - 18 * t);
  const b = Math.round(69 - 10 * t);
  for (let x = 0; x < W; x++) put(x, y, [r, g, b], 1);
}
for (const yy of [760, 852, 944]) {
  for (let x = 0; x < W; x++) put(x, yy, [120, 78, 38], 0.5);
}
// bayangan mangkuk di meja
ellipse(512, 856, 310, 34, [90, 52, 22], 0.28);

// ---------- mangkuk ----------
ellipse(512, 600, 362, 232, [158, 43, 30], 1);          // badan mangkuk merah tua
ellipse(512, 690, 330, 150, [120, 28, 20], 0.55);       // bayangan bawah badan
ring(512, 640, 330, 118, 16, [232, 190, 120], 0.9);     // pita emas di badan
ellipse(512, 560, 362, 128, [253, 246, 227], 1);        // bibir mangkuk krem
ellipse(512, 562, 318, 104, [233, 164, 61], 1);         // kuah emas
ellipse(430, 540, 150, 46, [244, 190, 90], 0.8);        // kilau kuah
ellipse(620, 590, 120, 34, [214, 138, 44], 0.7);        // kuah lebih gelap

// ---------- mie: gelombang kuning di atas kuah ----------
const noodle: RGB = [246, 214, 122];
const noodleDark: RGB = [203, 143, 46];
for (let k = 0; k < 9; k++) {
  const yy = 512 + k * 13;
  const wob = 26 + (k % 3) * 10;
  curve(250, yy, 380, yy - wob, 520, yy + 8, 11, noodle, 0.95);
  curve(520, yy + 8, 640, yy + wob * 0.6, 760, yy - 6, 11, noodle, 0.95);
  curve(260, yy + 6, 400, yy + wob * 0.5, 540, yy, 4, noodleDark, 0.5);
}

// ---------- chashu: dua iris daging ----------
function chashu(cx: number, cy: number, r: number): void {
  disc(cx, cy, r, [226, 138, 110], 1);
  disc(cx, cy, r - 9, [240, 170, 138], 1);
  ring(cx, cy, r - 20, r - 20, 7, [184, 92, 64], 0.8);
  disc(cx - r * 0.3, cy - r * 0.3, r * 0.18, [250, 205, 180], 0.7);
}
chashu(566, 524, 52);
chashu(486, 606, 46);

// ---------- telur: dua belahan ----------
function egg(cx: number, cy: number): void {
  ellipse(cx, cy, 56, 40, [255, 248, 236], 1);
  disc(cx, cy, 25, [245, 158, 11], 1);
  disc(cx, cy, 16, [250, 176, 40], 1);
  ellipse(cx - 8, cy - 9, 9, 6, [255, 226, 150], 0.9);
}
egg(418, 548);
egg(636, 596);

// ---------- narutomaki: lingkaran putih berpusar merah muda ----------
disc(664, 540, 27, [255, 250, 244], 1);
ring(664, 540, 20, 20, 5, [232, 122, 144], 0.95);
ring(664, 540, 11, 11, 4, [232, 122, 144], 0.95);
disc(664, 540, 4, [232, 122, 144], 0.95);

// ---------- daun bawang: cincin hijau ----------
const onions: Array<[number, number]> = [
  [330, 540], [372, 596], [452, 500], [540, 560], [600, 640],
  [700, 590], [730, 540], [300, 590], [560, 636], [470, 648],
];
for (const [ox, oy] of onions) {
  disc(ox, oy, 13, [62, 142, 65], 1);
  disc(ox, oy, 7, [168, 217, 122], 1);
  disc(ox, oy, 3, [62, 142, 65], 1);
}

// ---------- taburan: wijen + cabai ----------
const sesame: Array<[number, number]> = [
  [350, 520], [392, 560], [500, 520], [610, 520], [690, 610],
  [430, 620], [540, 600], [700, 560], [330, 570], [580, 660],
];
for (const [sx, sy] of sesame) disc(sx, sy, 3, [255, 244, 220], 0.9);
for (const [cx2, cy2] of [[390, 530], [640, 620], [470, 570]] as const) {
  disc(cx2, cy2, 6, [200, 40, 28], 1);
  disc(cx2, cy2, 3, [230, 80, 50], 1);
}

// ---------- kilau kuah + mie terangkat di ujung sumpit ----------
// lengkung kilau di tepi kuah supaya kuah terlihat basah dan panas
ring(512, 562, 290, 88, 10, [255, 226, 150], 0.55);
ellipse(360, 520, 90, 22, [255, 236, 170], 0.5);
// seberkas mie terangkat menempel di ujung sumpit
curve(660, 470, 690, 430, 730, 448, 10, noodle, 1);
curve(668, 478, 700, 442, 738, 458, 10, noodle, 1);
curve(676, 486, 706, 452, 742, 466, 8, noodleDark, 0.7);
disc(700, 452, 4, [255, 244, 220], 0.9);

// ---------- sumpit di atas mangkuk ----------
stroke(648, 452, 946, 336, 15, [122, 74, 33], 1);
stroke(648, 478, 946, 362, 15, [122, 74, 33], 1);
stroke(648, 449, 946, 333, 5, [169, 113, 61], 0.9);
stroke(648, 475, 946, 359, 5, [169, 113, 61], 0.9);

// ---------- uap: tiga alur putih melengkung ----------
function steam(x0: number, top: number, bottom: number, phase: number): void {
  const steps = 60;
  let px0 = x0;
  let py0 = bottom;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const y = bottom - (bottom - top) * t;
    const x = x0 + Math.sin(t * 5.2 + phase) * 22 * (0.4 + t);
    const a = 0.34 * (1 - t * 0.75);
    stroke(px0, py0, x, y, 15 - 7 * t, [255, 255, 255], a);
    px0 = x;
    py0 = y;
  }
}
steam(430, 150, 470, 0.4);
steam(512, 110, 460, 2.1);
steam(596, 160, 470, 3.6);

// ---------- kilau di badan mangkuk ----------
ellipse(330, 700, 60, 90, [255, 220, 180], 0.16);

// ---------- encoder PNG (ditulis sendiri: deflate + CRC32) ----------
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, "ascii"), data])), 8 + data.length);
  return out;
}

const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 3)] = 0;
  for (let x = 0; x < W; x++) {
    const s = (y * W + x) * 4;
    const d = y * (1 + W * 3) + 1 + x * 3;
    raw[d] = px[s];
    raw[d + 1] = px[s + 1];
    raw[d + 2] = px[s + 2];
  }
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // color type RGB
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

fs.mkdirSync("/output", { recursive: true });
fs.writeFileSync(OUT, png);
console.log(`wrote ${OUT} (${png.length} bytes, ${W}x${H})`);
