const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
// import { createCanvas } from 'canvas';
// import fs from 'fs';
// import path from 'path';

const sizes = [16, 48, 128];
const outDir = path.join(__dirname, 'public', 'icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

sizes.forEach((size) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background — YouTube red rounded square
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  const r = size * 0.2;
  ctx.roundRect(0, 0, size, size, r);
  ctx.fill();

  // Play triangle — white, centered
  const cx = size / 2;
  const cy = size / 2;
  const ts = size * 0.3;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx - ts * 0.5, cy - ts * 0.65);
  ctx.lineTo(cx + ts * 0.75, cy);
  ctx.lineTo(cx - ts * 0.5, cy + ts * 0.65);
  ctx.closePath();
  ctx.fill();

  fs.writeFileSync(path.join(outDir, `icon${size}.png`), canvas.toBuffer('image/png'));
  console.log(`✓ icon${size}.png`);
});