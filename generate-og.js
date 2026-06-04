const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// ── 颜色常量 ──────────────────────────────
const PAPER = '#e9e2d0';
const INK = '#1f1810';
const VERMILION = '#a8321f';
const SEPIA = '#8a6b3a';

// ── 生成 OG Image (1200×630) ──────────────
function generateOgImage() {
  const w = 1200, h = 630;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  // 背景：泛黄纸色
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);

  // 纸纹噪点
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const alpha = Math.random() * 0.04;
    ctx.fillStyle = `rgba(120,90,40,${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }

  // 双线上框
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 50);
  ctx.lineTo(w - 60, 50);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(60, 56);
  ctx.lineTo(w - 60, 56);
  ctx.stroke();

  // 双线下框
  ctx.beginPath();
  ctx.moveTo(60, h - 50);
  ctx.lineTo(w - 60, h - 50);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(60, h - 56);
  ctx.lineTo(w - 60, h - 56);
  ctx.stroke();

  // 左上角墨迹装饰
  ctx.fillStyle = `rgba(31,24,16,0.08)`;
  ctx.beginPath();
  ctx.arc(100, 90, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(115, 105, 18, 0, Math.PI * 2);
  ctx.fill();

  // 主标题
  ctx.fillStyle = INK;
  ctx.font = 'bold 72px "Noto Serif SC", "Source Han Serif SC", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('精神状态鉴定中心', w / 2, h / 2 - 40);

  // 副标题
  ctx.fillStyle = SEPIA;
  ctx.font = '36px "Noto Serif SC", "Source Han Serif SC", serif';
  ctx.fillText('你是什么品种的精神状态？', w / 2, h / 2 + 40);

  // 右下角朱红印章
  ctx.save();
  ctx.translate(w - 130, h - 120);
  ctx.rotate(7 * Math.PI / 180);
  ctx.strokeStyle = VERMILION;
  ctx.lineWidth = 3;
  ctx.strokeRect(-35, -35, 70, 70);
  ctx.fillStyle = VERMILION;
  ctx.font = 'bold 28px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('鑒定', 0, 0);
  ctx.restore();

  // 保存
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'og-image.png'), buf);
  console.log('✓ og-image.png generated (1200×630)');
}

// ── 生成 PWA 图标 ─────────────────────────
function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 朱红底色 + 圆角
  const r = size * 0.15;
  ctx.fillStyle = VERMILION;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // 「鑒」字
  ctx.fillStyle = PAPER;
  ctx.font = `bold ${size * 0.55}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('鑒', size / 2, size / 2);

  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, filename), buf);
  console.log(`✓ ${filename} generated (${size}×${size})`);
}

// ── 执行 ──────────────────────────────────
generateOgImage();
generateIcon(192, 'icon-192.png');
generateIcon(512, 'icon-512.png');
console.log('All images generated.');
