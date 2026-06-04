# 可发现性与可分享性优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让精神状态鉴定中心网页更容易被搜索引擎发现、在社交平台分享时展示精美卡片、支持结果分享裂变、PWA 离线使用。

**Architecture:** 所有改动集中在单文件 `index.html`（meta 标签、CSS、HTML、JS）和三个新文件（`generate-og.js`、`manifest.json`、`sw.js`）。OG Image 和 PWA 图标通过 Node.js 脚本生成静态 PNG 文件。

**Tech Stack:** 原生 HTML/CSS/JS，Node.js + `canvas` 库（仅用于生成图片资源）

---

## File Structure

| 文件 | 操作 | 职责 |
|------|------|------|
| `index.html` `<head>` | 修改 | SEO meta、OG、Twitter Card、Favicon、manifest 引用、theme-color |
| `index.html` CSS | 修改 | 分享按钮样式 |
| `index.html` HTML | 修改 | 结果页分享按钮结构 |
| `index.html` JS | 修改 | URL 参数处理、分享函数、Service Worker 注册 |
| `generate-og.js` | 新建 | 生成 `og-image.png`、`icon-192.png`、`icon-512.png` |
| `manifest.json` | 新建 | PWA 清单 |
| `sw.js` | 新建 | Service Worker 离线缓存 |

---

### Task 1: SEO + Open Graph + Twitter Card Meta 标签

**Files:**
- Modify: `index.html:6` (在 `</title>` 之后)

- [ ] **Step 1: 在 `<title>` 之后添加 meta 标签**

在 `index.html` 第 6 行 `</title>` 之后、第 7 行 `<style>` 之前，插入以下内容：

```html
<meta name="description" content="40道题，20种人格原型。你可能是「清醒的疯子」，也可能是「体面的废物」——鲁迅式黑色幽默的灵魂鉴定，测完不敢发朋友圈算我输。">
<meta name="keywords" content="心理测试,人格测试,趣味测试,精神状态鉴定,MBTI,性格测试,鲁迅,黑色幽默,灵魂鉴定,SBTI,心理画像">
<meta name="author" content="lycbee">

<meta property="og:type" content="website">
<meta property="og:title" content="精神状态鉴定中心 — 你是什么品种的精神状态？">
<meta property="og:description" content="40道题测出你的人格原型。清醒的疯子？体面的废物？鲁迅式黑色幽默的灵魂鉴定。">
<meta property="og:image" content="https://lycbee.github.io/mental-state-assessment/og-image.png">
<meta property="og:url" content="https://lycbee.github.io/mental-state-assessment/">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="精神状态鉴定中心 — 你是什么品种的精神状态？">
<meta name="twitter:description" content="40道题，20种人格原型，鲁迅式黑色幽默的灵魂鉴定">
<meta name="twitter:image" content="https://lycbee.github.io/mental-state-assessment/og-image.png">
```

- [ ] **Step 2: 验证**

在浏览器中打开页面，查看源代码确认 meta 标签已正确插入。用浏览器开发者工具检查 `<head>` 区域。

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: 添加 SEO meta 标签、Open Graph 和 Twitter Card"
```

---

### Task 2: Favicon

**Files:**
- Modify: `index.html:6-7` (在 `<title>` 之后、`<style>` 之前)

- [ ] **Step 1: 添加 SVG favicon**

在 Task 1 添加的 meta 标签之后、`<style>` 之前，插入：

```html
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='8' fill='%23a8321f'/><text x='50' y='72' font-size='60' text-anchor='middle' fill='%23e9e2d0' font-family='serif'>鑒</text></svg>">
```

- [ ] **Step 2: 验证**

在浏览器中打开页面，检查浏览器标签页是否显示朱红底色的「鑒」字图标。

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: 添加 SVG favicon（朱红印章风格）"
```

---

### Task 3: OG Image 和 PWA 图标生成脚本

**Files:**
- Create: `generate-og.js`

- [ ] **Step 1: 创建 `package.json` 并安装依赖**

```bash
npm init -y
npm install canvas
```

- [ ] **Step 2: 创建 `generate-og.js`**

创建 `generate-og.js`，内容如下：

```js
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
```

- [ ] **Step 3: 运行脚本生成图片**

```bash
node generate-og.js
```

预期输出：
```
✓ og-image.png generated (1200×630)
✓ icon-192.png generated (192×192)
✓ icon-512.png generated (512×512)
All images generated.
```

- [ ] **Step 4: 验证**

用图片查看器打开 `og-image.png`，确认画面包含：
- 泛黄纸色背景
- 双线边框
- 中央大标题「精神状态鉴定中心」
- 副标题「你是什么品种的精神状态？」
- 右下角朱红印章

确认 `icon-192.png` 和 `icon-512.png` 是朱红底色 + 「鑒」字。

- [ ] **Step 5: 更新 `.gitignore`**

将 `node_modules/` 添加到 `.gitignore`：

```
.superpowers/
node_modules/
```

- [ ] **Step 6: Commit**

```bash
git add .gitignore generate-og.js og-image.png icon-192.png icon-512.png
git commit -m "feat: 添加 OG Image 和 PWA 图标生成脚本及生成的图片资源"
```

---

### Task 4: PWA Manifest

**Files:**
- Create: `manifest.json`
- Modify: `index.html` `<head>` (添加 manifest 引用和 theme-color)

- [ ] **Step 1: 创建 `manifest.json`**

在项目根目录创建 `manifest.json`：

```json
{
  "name": "精神状态鉴定中心",
  "short_name": "精神鉴定",
  "description": "40道题测出你的人格原型，鲁迅式黑色幽默的灵魂鉴定",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#e9e2d0",
  "theme_color": "#a8321f",
  "orientation": "portrait",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 2: 在 `<head>` 中添加 manifest 引用**

在 `index.html` 的 `<head>` 区域（favicon 之后、`<style>` 之前）添加：

```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#a8321f">
```

- [ ] **Step 3: 验证**

在 Chrome 中打开页面，打开 DevTools → Application → Manifest，确认 manifest 被正确加载，图标显示正常。

- [ ] **Step 4: Commit**

```bash
git add manifest.json index.html
git commit -m "feat: 添加 PWA manifest 和 theme-color"
```

---

### Task 5: 结果页分享 — URL 参数方案

**Files:**
- Modify: `index.html` JS 区域

- [ ] **Step 1: 添加 URL 参数解析函数**

在 `index.html` 的 JS 区域，`renderIntro()` 函数之前（约第 1219 行之前），添加：

```js
// ── URL 参数处理 ─────────────────────────────
function getUrlParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function setUrlParam(key, value) {
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  history.replaceState(null, '', url);
}
```

- [ ] **Step 2: 在 `showResult()` 末尾添加 URL 参数更新**

在 `showResult()` 函数的末尾（`renderResultPage(...)` 调用之后），添加：

```js
// 更新 URL 参数，便于分享
setUrlParam('r', archetypeKey);
```

- [ ] **Step 3: 在页面初始化时检测 URL 参数**

在文件末尾的 `renderIntro()` 调用之前（约第 1561 行），添加 URL 参数检测逻辑：

```js
// ── 初始化 ──────────────────────────────────────
const shareKey = getUrlParam('r');
if (shareKey && archetypes[shareKey]) {
  // 直接展示分享的结果，跳过答题
  const archetype = archetypes[shareKey];
  renderResultPage(
    { stress: 50, emotion: 50, social: 50, decision: 50 },
    { socialAdapt: 50, mentalHealth: 50, emotionalStability: 50, socialHealth: 50, decisionHealth: 50 },
    50,
    archetype
  );
} else {
  renderIntro();
}
```

注意：这段代码替换原来的 `renderIntro();` 调用。当通过分享链接访问时，维度分析数据不可用（因为没有实际答题），用 50 作为中性占位值。结果页只展示人格原型信息（名称、描述、指引），维度分析显示为中性。

- [ ] **Step 4: 验证**

1. 正常打开页面，确认 intro 页正常显示
2. 完成答题，确认 URL 变为 `?r=xxxx` 格式
3. 复制带参数的 URL，在新标签页打开，确认直接显示结果页
4. 测试无效参数（如 `?r=9999`），确认回退到 intro 页

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: 结果页 URL 参数方案，支持通过链接直接查看结果"
```

---

### Task 6: 结果页分享 — 分享按钮 UI 和 CSS

**Files:**
- Modify: `index.html` CSS（添加分享按钮样式）
- Modify: `index.html` JS（`renderResultPage` 函数中添加分享按钮 HTML）

- [ ] **Step 1: 添加分享按钮 CSS 样式**

在 `index.html` 的 `<style>` 块中，`.btn-restart` 相关样式之后（约第 308 行之后），添加：

```css
  /* --- Share --- */
  .share-section {
    width: 100%;
    text-align: center;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px dashed var(--hair);
  }

  .share-title {
    font-family: "Noto Serif SC", serif;
    font-size: 0.82rem;
    color: var(--sepia);
    letter-spacing: 0.15em;
    margin-bottom: 1rem;
  }

  .share-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn-share {
    background: transparent;
    border: 1.5px solid var(--vermilion);
    color: var(--vermilion);
    padding: 0.55rem 1.5rem;
    font-family: "Noto Serif SC", serif;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    cursor: pointer;
    transition: all 0.15s ease;
    border-radius: 2px;
    box-shadow: 2px 2px 0 var(--vermilion-dim);
  }

  .btn-share:hover {
    background: var(--vermilion);
    color: #f5ecd8;
    box-shadow: 1px 1px 0 var(--vermilion-dim);
    transform: translate(1px, 1px);
  }

  .share-toast {
    font-size: 0.78rem;
    color: var(--sepia);
    margin-top: 0.8rem;
    opacity: 0;
    transition: opacity 0.3s ease;
    letter-spacing: 0.1em;
  }

  .share-toast.show {
    opacity: 1;
  }
```

- [ ] **Step 2: 在响应式样式中添加分享按钮适配**

在 `@media (max-width: 480px)` 块的末尾（约第 443 行之前），添加：

```css
    .btn-share {
      padding: 0.5rem 1.2rem;
      font-size: 0.78rem;
    }
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: 添加分享按钮 CSS 样式（民国风）"
```

---

### Task 7: 结果页分享 — 分享按钮 HTML 和交互逻辑

**Files:**
- Modify: `index.html` JS（`renderResultPage` 函数 + 新增分享函数）

- [ ] **Step 1: 在 `renderResultPage` 中添加分享按钮 HTML**

修改 `renderResultPage` 函数，在 `restartQuiz` 按钮之后添加分享区域。找到这段代码：

```js
    <button class="btn btn-restart" onclick="restartQuiz()">重新测试</button>
  `;
```

替换为：

```js
    <button class="btn btn-restart" onclick="restartQuiz()">重新测试</button>

    <div class="share-section">
      <div class="share-title">─── 分享你的结果 ───</div>
      <div class="share-buttons">
        <button class="btn-share" onclick="copyShareLink()">复制链接</button>
        <button class="btn-share" onclick="generateShareImage()">保存图片</button>
      </div>
      <div class="share-toast" id="share-toast"></div>
    </div>
  `;
```

- [ ] **Step 2: 添加 `copyShareLink()` 函数**

在 JS 区域（`renderResultPage` 函数之后），添加：

```js
function copyShareLink() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    showToast('链接已复制，快去分享吧');
  }).catch(() => {
    // fallback: 选中文本
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast('链接已复制，快去分享吧');
  });
}

function showToast(msg) {
  const toast = document.getElementById('share-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}
```

- [ ] **Step 3: 添加 `generateShareImage()` 函数**

在 `showToast` 函数之后，添加：

```js
function generateShareImage() {
  const shareCanvas = document.createElement('canvas');
  const sw = 800, sh = 1000;
  shareCanvas.width = sw;
  shareCanvas.height = sh;
  const sctx = shareCanvas.getContext('2d');

  // 获取当前结果数据
  const nameEl = document.querySelector('.result-name');
  const typeEl = document.querySelector('.result-type');
  const subtitleEl = document.querySelector('.result-subtitle');
  const name = nameEl ? nameEl.textContent : '未知';
  const typeCode = typeEl ? typeEl.textContent : '';
  const subtitle = subtitleEl ? subtitleEl.textContent : '';

  // 背景
  sctx.fillStyle = '#e9e2d0';
  sctx.fillRect(0, 0, sw, sh);

  // 纸纹噪点
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * sw;
    const y = Math.random() * sh;
    sctx.fillStyle = `rgba(120,90,40,${Math.random() * 0.04})`;
    sctx.fillRect(x, y, 1, 1);
  }

  // 双线上框
  sctx.strokeStyle = '#1f1810';
  sctx.lineWidth = 2;
  sctx.beginPath();
  sctx.moveTo(50, 40);
  sctx.lineTo(sw - 50, 40);
  sctx.stroke();
  sctx.beginPath();
  sctx.moveTo(50, 46);
  sctx.lineTo(sw - 50, 46);
  sctx.stroke();

  // 双线下框
  sctx.beginPath();
  sctx.moveTo(50, sh - 40);
  sctx.lineTo(sw - 50, sh - 40);
  sctx.stroke();
  sctx.beginPath();
  sctx.moveTo(50, sh - 46);
  sctx.lineTo(sw - 50, sh - 46);
  sctx.stroke();

  // 标题
  sctx.fillStyle = '#1f1810';
  sctx.font = 'bold 36px "Noto Serif SC", serif';
  sctx.textAlign = 'center';
  sctx.fillText('精神状态鉴定中心', sw / 2, 100);

  // 分隔线
  sctx.strokeStyle = '#b3a684';
  sctx.lineWidth = 1;
  sctx.beginPath();
  sctx.moveTo(200, 130);
  sctx.lineTo(sw - 200, 130);
  sctx.stroke();

  // 类型码
  sctx.fillStyle = '#a8321f';
  sctx.font = '24px "Noto Serif SC", serif';
  sctx.fillText(typeCode, sw / 2, 200);

  // 人格名称（大字）
  sctx.fillStyle = '#1f1810';
  sctx.font = 'bold 64px "Noto Serif SC", serif';
  sctx.fillText(name, sw / 2, 300);

  // 副标题
  sctx.fillStyle = '#4a3f30';
  sctx.font = '28px "Noto Serif SC", serif';
  sctx.fillText(subtitle, sw / 2, 370);

  // 分隔线
  sctx.strokeStyle = '#b3a684';
  sctx.beginPath();
  sctx.moveTo(200, 420);
  sctx.lineTo(sw - 200, 420);
  sctx.stroke();

  // 说明文字
  sctx.fillStyle = '#4a3f30';
  sctx.font = '22px "Noto Serif SC", serif';
  sctx.fillText('长按识别二维码，测测你是什么品种的精神状态', sw / 2, sh - 120);

  // 右下角印章
  sctx.save();
  sctx.translate(sw - 110, sh - 110);
  sctx.rotate(7 * Math.PI / 180);
  sctx.strokeStyle = '#a8321f';
  sctx.lineWidth = 2.5;
  sctx.strokeRect(-28, -28, 56, 56);
  sctx.fillStyle = '#a8321f';
  sctx.font = 'bold 22px serif';
  sctx.textAlign = 'center';
  sctx.textBaseline = 'middle';
  sctx.fillText('鑒定', 0, 0);
  sctx.restore();

  // 下载
  const link = document.createElement('a');
  link.download = `精神鉴定-${name}.png`;
  link.href = shareCanvas.toDataURL('image/png');
  link.click();

  showToast('图片已保存');
}
```

- [ ] **Step 4: 验证**

1. 完成答题到达结果页，确认「分享你的结果」区域显示在「重新测试」按钮下方
2. 点击「复制链接」，确认 toast 提示「链接已复制」，粘贴确认 URL 带 `?r=` 参数
3. 点击「保存图片」，确认下载了一张包含人格名称和类型码的 PNG 图片
4. 在手机浏览器中测试，确认按钮可点击、布局正常

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: 结果页添加分享按钮（复制链接 + 保存图片）"
```

---

### Task 8: Service Worker 离线支持

**Files:**
- Create: `sw.js`
- Modify: `index.html` JS（末尾添加 SW 注册）

- [ ] **Step 1: 创建 `sw.js`**

在项目根目录创建 `sw.js`：

```js
const CACHE_NAME = 'sbti-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './og-image.png',
  './icon-192.png',
  './icon-512.png'
];

const FONT_CACHE = 'fonts-v1';

// Install: 缓存静态资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== FONT_CACHE)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: 分策略缓存
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Google Fonts: Stale While Revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          const fetchPromise = fetch(event.request).then(response => {
            cache.put(event.request, response.clone());
            return response;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // 同源静态资源: Network First
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
});
```

- [ ] **Step 2: 在 `index.html` 中注册 Service Worker**

在 `index.html` 的 JS 区域末尾，`renderIntro()` 调用（或 Task 5 中修改后的初始化代码）之后，添加：

```js
// ── Service Worker 注册 ──────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
```

- [ ] **Step 3: 验证**

1. 在 Chrome 中打开页面，DevTools → Application → Service Workers，确认 SW 已注册并激活
2. DevTools → Application → Cache Storage，确认缓存已创建，包含 `index.html`、`manifest.json` 等
3. 勾选 DevTools → Application → Service Workers → Offline，刷新页面，确认页面仍可正常加载和使用
4. 在手机上访问后，确认浏览器提示「添加到主屏幕」

- [ ] **Step 4: Commit**

```bash
git add sw.js index.html
git commit -m "feat: 添加 Service Worker 离线缓存支持"
```

---

### Task 9: 最终验证与文档更新

**Files:**
- Modify: `CLAUDE.md`（添加新特性说明）

- [ ] **Step 1: 全流程测试**

1. 正常打开页面 → intro 页正常
2. 完成 40 道题 → 结果页正常，URL 带 `?r=` 参数
3. 点击「复制链接」→ 链接已复制
4. 点击「保存图片」→ PNG 下载成功
5. 新标签页粘贴分享链接 → 直接显示结果
6. 检查浏览器标签页 → Favicon 显示
7. DevTools → Application → Manifest → 正常加载
8. DevTools → Application → Service Workers → 已注册
9. 勾选 Offline → 刷新页面 → 离线可用
10. 用社交平台分享调试工具检查 OG 标签：
    - Facebook: https://developers.facebook.com/tools/debug/
    - Twitter: https://cards-dev.twitter.com/validator

- [ ] **Step 2: 更新 CLAUDE.md**

在 `CLAUDE.md` 的 `## Project overview` 部分的特性列表中添加：

```
- 社交分享优化（Open Graph + Twitter Card + 结果页分享按钮）
- SEO 优化（meta description/keywords）
- PWA 支持（manifest + Service Worker 离线缓存）
- URL 参数分享（`?r=xxxx` 直接展示结果）
```

在 `## Architecture` 部分末尾添加：

```
- **分享**: 结果页有「复制链接」和「保存图片」按钮。URL 参数 `?r=xxxx` 可直接展示对应人格原型。
- **PWA**: `manifest.json` + `sw.js` 提供离线支持。Service Worker 使用 Network First 策略缓存同源资源，Stale While Revalidate 策略缓存 Google Fonts。
- **OG Image**: `generate-og.js` 脚本生成 `og-image.png`（1200×630）和 PWA 图标。修改后需重新运行 `node generate-og.js`。
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: 更新 CLAUDE.md 反映 SEO/分享/PWA 新特性"
```

- [ ] **Step 4: Push 到 GitHub**

```bash
git push origin master
```

推送后等待 GitHub Pages 更新（通常 1-2 分钟），然后验证线上版本的所有功能。

---

## Commit 序列总结

| # | Commit | 内容 |
|---|--------|------|
| 1 | `feat: 添加 SEO meta 标签、Open Graph 和 Twitter Card` | meta 标签 |
| 2 | `feat: 添加 SVG favicon（朱红印章风格）` | favicon |
| 3 | `feat: 添加 OG Image 和 PWA 图标生成脚本及生成的图片资源` | generate-og.js + 图片 |
| 4 | `feat: 添加 PWA manifest 和 theme-color` | manifest.json |
| 5 | `feat: 结果页 URL 参数方案，支持通过链接直接查看结果` | URL 参数 |
| 6 | `feat: 添加分享按钮 CSS 样式（民国风）` | CSS |
| 7 | `feat: 结果页添加分享按钮（复制链接 + 保存图片）` | 分享功能 |
| 8 | `feat: 添加 Service Worker 离线缓存支持` | sw.js |
| 9 | `docs: 更新 CLAUDE.md 反映 SEO/分享/PWA 新特性` | 文档 |
