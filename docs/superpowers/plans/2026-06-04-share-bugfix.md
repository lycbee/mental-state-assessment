# 分享功能 Bug 修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复分享链接打开后「重新测试」显示空白的 bug，以及改进分享图片内容和二维码。

**Architecture:** 所有改动在 `index.html` 单文件中。修复 `restartQuiz()` 函数和 `generateShareImage()` 函数。

**Tech Stack:** 原生 JS，Canvas API，QR Code API (api.qrserver.com)

---

### Task 1: 修复「重新测试」空白页 Bug

**Files:**
- Modify: `index.html` — `restartQuiz()` 函数（约第 1341 行）

- [ ] **Step 1: 修改 `restartQuiz()` 函数**

找到当前的 `restartQuiz()` 函数：

```js
function restartQuiz() {
  showScreen('intro');
}
```

替换为：

```js
function restartQuiz() {
  // 清除 URL 中的分享参数
  const url = new URL(window.location);
  url.searchParams.delete('r');
  history.replaceState(null, '', url);

  // 重置状态
  currentQuestion = 0;
  scores = { stress: 0, emotion: 0, social: 0, decision: 0 };
  answers = [];

  // 重新生成 intro 页面并切换
  renderIntro();
  showScreen('intro');
}
```

- [ ] **Step 2: 验证**

1. 正常打开页面 → intro 正常 → 答完题 → 结果页正常 → 点「重新测试」→ intro 正常
2. 通过 `?r=0101` 打开 → 结果页正常 → 点「重新测试」→ intro 正常（不再是空白）
3. 确认点「重新测试」后 URL 中的 `?r=` 参数被清除

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "fix: 修复分享链接打开后重新测试显示空白页的 bug"
```

---

### Task 2: 改进分享图片内容和二维码

**Files:**
- Modify: `index.html` — `generateShareImage()` 函数（约第 1609 行）

- [ ] **Step 1: 修改 `generateShareImage()` 函数**

找到当前的 `generateShareImage()` 函数，将整个函数替换为：

```js
function generateShareImage() {
  const shareCanvas = document.createElement('canvas');
  const sw = 800, sh = 1200;
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

  // 读取灵魂肖像（截取前100字）和哲思
  const resultTexts = document.querySelectorAll('.result-text');
  const soulPortrait = resultTexts.length > 0 ? resultTexts[0].textContent.substring(0, 100) + '…' : '';
  const insight = resultTexts.length > 2 ? resultTexts[2].textContent : '';

  // 背景
  sctx.fillStyle = '#e9e2d0';
  sctx.fillRect(0, 0, sw, sh);

  // 纸纹噪点
  for (let i = 0; i < 6000; i++) {
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
  sctx.fillText(typeCode, sw / 2, 180);

  // 人格名称（大字）
  sctx.fillStyle = '#1f1810';
  sctx.font = 'bold 56px "Noto Serif SC", serif';
  sctx.fillText(name, sw / 2, 260);

  // 副标题
  sctx.fillStyle = '#4a3f30';
  sctx.font = '24px "Noto Serif SC", serif';
  sctx.fillText(subtitle, sw / 2, 320);

  // 分隔线
  sctx.strokeStyle = '#b3a684';
  sctx.beginPath();
  sctx.moveTo(200, 360);
  sctx.lineTo(sw - 200, 360);
  sctx.stroke();

  // 灵魂肖像标签
  sctx.fillStyle = '#a8321f';
  sctx.font = 'bold 20px "Noto Serif SC", serif';
  sctx.textAlign = 'left';
  sctx.fillText('灵魂肖像', 80, 410);

  // 灵魂肖像内容（自动换行）
  sctx.fillStyle = '#1f1810';
  sctx.font = '18px "Noto Serif SC", serif';
  const maxLineWidth = sw - 160;
  const lines = wrapText(sctx, soulPortrait, maxLineWidth);
  lines.forEach((line, i) => {
    sctx.fillText(line, 80, 445 + i * 28);
  });

  // 哲思标签
  const insightY = 445 + lines.length * 28 + 20;
  sctx.fillStyle = '#a8321f';
  sctx.font = 'bold 20px "Noto Serif SC", serif';
  sctx.textAlign = 'left';
  sctx.fillText('哲思', 80, insightY);

  // 哲思内容
  sctx.fillStyle = '#4a3f30';
  sctx.font = 'italic 18px "Noto Serif SC", serif';
  const insightLines = wrapText(sctx, `"${insight}"`, maxLineWidth);
  insightLines.forEach((line, i) => {
    sctx.fillText(line, 80, insightY + 35 + i * 28);
  });

  // 底部分隔线
  const bottomSepY = sh - 200;
  sctx.strokeStyle = '#b3a684';
  sctx.beginPath();
  sctx.moveTo(200, bottomSepY);
  sctx.lineTo(sw - 200, bottomSepY);
  sctx.stroke();

  // 二维码（使用 API 生成）
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.href)}`;
  const qrImg = new Image();
  qrImg.crossOrigin = 'anonymous';
  qrImg.onload = function() {
    const qrSize = 120;
    const qrX = sw / 2 - qrSize / 2;
    const qrY = bottomSepY + 20;
    sctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // 网址文字
    sctx.fillStyle = '#4a3f30';
    sctx.font = '16px "Noto Serif SC", serif';
    sctx.textAlign = 'center';
    sctx.fillText('扫码测测你是什么品种的精神状态', sw / 2, qrY + qrSize + 25);

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
  };
  qrImg.onerror = function() {
    // 二维码加载失败时，直接下载不含二维码的图片
    const link = document.createElement('a');
    link.download = `精神鉴定-${name}.png`;
    link.href = shareCanvas.toDataURL('image/png');
    link.click();
    showToast('图片已保存');
  };
  qrImg.src = qrUrl;
}

// Canvas 文字自动换行辅助函数
function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let currentLine = '';
  for (let i = 0; i < text.length; i++) {
    const testLine = currentLine + text[i];
    if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = text[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
```

- [ ] **Step 2: 验证**

1. 完成答题到达结果页
2. 点击「保存图片」
3. 确认下载的图片包含：
   - 标题、类型码、人格名称、副标题
   - 「灵魂肖像」标签 + 内容摘要（约100字）
   - 「哲思」标签 + 内容
   - 二维码（居中）
   - 「扫码测测你是什么品种的精神状态」文字
   - 右下角印章
4. 确认图片尺寸为 800×1200

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: 改进分享图片内容（灵魂肖像+哲思）并添加二维码"
```
