// Рисует PNG-иконки без внешних библиотек: растеризация фигур + zlib.
// Запуск: node tools/make-icons.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'icons');
mkdirSync(OUT, { recursive: true });

const crc = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return buf => { let c = 0xffffffff; for (const b of buf) c = t[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
})();
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
}
function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => c1.map((v, i) => lerp(v, c2[i], Math.max(0, Math.min(1, t))));
const grad = (stops, t) => {
  for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
  return stops[stops.length - 1][1];
};

// трапеция тигля (в долях 0..1)
const inTrap = (x, y, top, bot, xt0, xt1, xb0, xb1) => {
  if (y < top || y > bot) return false;
  const t = (y - top) / (bot - top);
  return x >= lerp(xt0, xb0, t) && x <= lerp(xt1, xb1, t);
};
const inDrop = (x, y, cx, cy, r) => {
  // капля: круг + конус вверх
  if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) return true;
  if (y < cy && y > cy - r * 2.2) { const t = (cy - y) / (r * 2.2); return Math.abs(x - cx) <= r * (1 - t) * 0.95; }
  return false;
};

// s — масштаб содержимого (для maskable меньше, чтобы влезть в безопасную зону)
function shade(x, y, s) {
  // фон
  const d = Math.hypot(x - 0.5, y - 0.62);
  let c = mix([44, 30, 22], [16, 18, 21], d / 0.62);
  // перенос координат содержимого
  const u = (x - 0.5) / s + 0.5, v = (y - 0.52) / s + 0.52;
  // свечение
  const g = Math.max(0, 1 - Math.hypot(u - 0.5, v - 0.58) / 0.42);
  c = mix(c, [255, 110, 30], g * g * 0.35);
  // тигель
  if (inTrap(u, v, 0.32, 0.78, 0.24, 0.76, 0.33, 0.67)) {
    c = grad([[0, [36, 39, 43]], [0.45, [92, 98, 106]], [1, [30, 33, 37]]], (u - 0.24) / 0.52);
    if (v < 0.35) c = [140, 148, 158];
    if (inTrap(u, v, 0.43, 0.74, 0.285, 0.715, 0.355, 0.645)) {
      c = grad([[0, [255, 236, 160]], [0.35, [255, 180, 70]], [1, [226, 80, 26]]], (v - 0.43) / 0.31);
      if (v < 0.448) c = [255, 250, 225];
    }
  }
  if (inDrop(u, v, 0.735, 0.235, 0.05)) c = grad([[0, [255, 226, 140]], [1, [255, 120, 30]]], (v - 0.13) / 0.16);
  return c;
}

function render(size, s = 1) {
  const buf = Buffer.alloc(size * size * 4);
  const SS = 4;
  for (let py = 0; py < size; py++) for (let px = 0; px < size; px++) {
    let r = 0, g = 0, b = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const c = shade((px + (sx + 0.5) / SS) / size, (py + (sy + 0.5) / SS) / size, s);
      r += c[0]; g += c[1]; b += c[2];
    }
    const i = (py * size + px) * 4, n = SS * SS;
    buf[i] = r / n; buf[i + 1] = g / n; buf[i + 2] = b / n; buf[i + 3] = 255;
  }
  return png(size, size, buf);
}

writeFileSync(join(OUT, 'icon-192.png'), render(192));
writeFileSync(join(OUT, 'icon-512.png'), render(512));
writeFileSync(join(OUT, 'icon-maskable-512.png'), render(512, 0.78));
writeFileSync(join(OUT, 'apple-touch-icon.png'), render(180));
console.log('icons ok →', OUT);
