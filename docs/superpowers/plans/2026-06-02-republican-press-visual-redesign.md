# 民国报章风视觉重设计 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `index.html` 的视觉从「深紫赛博故障风」整体替换为「浓郁民国报章 / 鲁迅文学风」，正文文案不变。

**Architecture:** 单文件应用，所有改动都在 `index.html` 内。改 `<style>` 块（CSS 令牌 + 三屏组件样式 + 响应式）、`<script>` 内的 canvas 动画（二进制雨→墨点落字雨）、以及三个 render 函数的少量装饰性 HTML。评分逻辑、题目/原型数据、页面切换逻辑全部不动。

**Tech Stack:** 原生 HTML/CSS/JS，无构建步骤。字体 `Noto Serif SC`（Google Fonts `@import`，离线回退 serif）。Canvas 2D。

**关键约束（来自 CLAUDE.md）：**
- 所有 CSS/视觉改动**必须用 `frontend-design` skill** 驱动。本计划提供的 CSS 是已被用户确认的 mockup 基线，执行时由 frontend-design 落地/打磨。
- **不要改 `dimensions` 数组，也不要动 `renderDimensionBars()`（1635-1641）里硬编码的维度标签**——本次不改维度，误动会导致结果页错乱。
- 正文（题目、选项、原型描述、intro 简介）保持现有简体白话，仅标题/标签/印章等装饰位用文言点缀。
- 无测试框架：本项目是静态单文件，验证方式为「本地起服务 + 浏览器目视 + 控制台无报错」，不写单元测试。

**视觉源真相：** 用户已确认的三屏设计稿 `.superpowers/brainstorm/*/content/republican-design.html`（被 `.gitignore` 忽略，仅作参考）。

**验证命令（每个任务通用）：**
```bash
python3 -m http.server 8000   # 然后浏览器开 http://localhost:8000
```
检查：对应页面呈现民国风、正文未变文言、控制台无 JS 报错。

---
### Task 1: 重写 CSS 令牌 + body/canvas 基底

**Files:**
- Modify: `index.html:12-56`（`:root` 变量、`body`、`canvas#bg-canvas`）

- [ ] **Step 1: 替换 `:root` 变量块（12-32）为民国调色板**

```css
  :root {
    --paper: #e9e2d0;
    --paper-dark: #ddd2ba;
    --ink: #1f1810;
    --ink-soft: #4a3f30;
    --sepia: #8a6b3a;
    --vermilion: #a8321f;
    --vermilion-dim: #7a2415;
    --line: #2b2620;
    --hair: #b3a684;   /* 细分隔线/边框 */
  }
```
删除所有旧的 --bg/--surface/--purple/--blue/--gold/--pink/--green/--gradient/--glitch-offset 等赛博变量。

- [ ] **Step 2: 替换 `body`（34-47）为纸面背景**

```css
  body {
    font-family: "Noto Serif SC", "Source Han Serif SC", Georgia, serif;
    background: var(--paper);
    color: var(--ink);
    min-height: 100vh;
    overflow-x: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image:
      radial-gradient(ellipse at 18% 12%, rgba(138,107,58,0.10) 0%, transparent 45%),
      radial-gradient(ellipse at 85% 88%, rgba(120,90,40,0.12) 0%, transparent 50%),
      radial-gradient(rgba(120,90,40,0.06) 1px, transparent 1px);
    background-size: auto, auto, 4px 4px;
  }
```

- [ ] **Step 3: 调整 `canvas#bg-canvas`（49-56）透明度**

把 `opacity: 0.6;` 改为 `opacity: 0.5;`（墨点落字雨在纸面上需更淡，避免抢正文）。其余属性不变。

- [ ] **Step 4: 验证基底**

Run: `python3 -m http.server 8000`，浏览器开 http://localhost:8000
Expected: 背景变成泛黄纸色带细点纹理，无紫色渐变残留。控制台无报错。（canvas 仍是旧二进制雨，下个任务再改。）

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "style: 重写 CSS 令牌与纸面背景为民国调色板"
```

---

### Task 2: 改造 canvas 背景 — 二进制雨 → 墨点落字雨

**Files:**
- Modify: `index.html:569-690`（canvas 脚本块：变量、粒子初始化、绘制函数、animate）

- [ ] **Step 1: 替换颜色与粒子声明（573-610）**

把 `glitchBlocks`、`binaryRain`、`colors` 三个声明及两个初始化循环，整体替换为墨点落字雨：

```js
const inkDrops = [];
const inkChars = '人生在世孤独沉默呐喊彷徨抗争逃避压抑宣泄疏离连接铁屋〇墨';

// 墨色落字/落点
for (let i = 0; i < 36; i++) {
  inkDrops.push({
    x: Math.random() * w,
    y: Math.random() * h,
    char: Math.random() > 0.45 ? inkChars[Math.floor(Math.random() * inkChars.length)] : '·',
    speed: Math.random() * 0.35 + 0.08,
    opacity: Math.random() * 0.10 + 0.03,
    size: Math.random() * 14 + 10,
    drift: (Math.random() - 0.5) * 0.15
  });
}
```

- [ ] **Step 2: 替换绘制函数（612-665）**

删除 `drawGlitchBlock`、`drawBinaryRain`、`drawNoise`、`drawScanLines` 四个函数，替换为单个 `drawInkDrop`：

```js
function drawInkDrop(d) {
  d.y += d.speed;
  d.x += d.drift;
  if (d.y > h + 24) {
    d.y = -24;
    d.x = Math.random() * w;
    d.char = Math.random() > 0.45 ? inkChars[Math.floor(Math.random() * inkChars.length)] : '·';
    d.opacity = Math.random() * 0.10 + 0.03;
  }
  ctx.font = `${d.size}px "Noto Serif SC", serif`;
  ctx.fillStyle = `rgba(31,24,16,${d.opacity})`;  // 墨色
  ctx.fillText(d.char, d.x, d.y);
}
```

- [ ] **Step 3: 替换 animate（682-690）**

```js
const animate = throttle(function() {
  ctx.clearRect(0, 0, w, h);
  inkDrops.forEach(d => drawInkDrop(d));
  requestAnimationFrame(animate);
}, 33); // ~30fps，纸面慢节奏，省性能
animate();
```
保留 `throttle`（668-679）和 `resize`（577-582）不动。同时把第 569 行注释 `// ── Background Canvas — Glitch Noise ─` 改为 `// ── Background Canvas — Ink Rain ─`。

- [ ] **Step 4: 验证 canvas**

Run: 刷新 http://localhost:8000
Expected: 背景是缓慢飘落的淡墨汉字/墨点，无霓虹色方块、无扫描线、无 RGB 噪点。控制台无报错（`drawNoise` 等旧引用已全部删除）。

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "style: canvas 背景改为墨点落字雨，移除赛博 glitch"
```

---
### Task 3: intro 封面样式（symbol / h1 / subtitle / btn）

**Files:**
- Modify: `index.html:86-167`（`.symbol`/`@keyframes skullWobble`/`h1`/`@keyframes titleGlitch`/`.subtitle`/`.btn`/`.btn:hover`/`@keyframes btnShake`）
- Modify: `index.html:1377-1392`（`renderIntro()` 内的 symbol 与装饰句）

- [ ] **Step 1: 替换 `.symbol` 与抖动动画（86-102）**

```css
  .symbol {
    font-size: 3rem;
    margin-bottom: 1rem;
    filter: sepia(0.7) grayscale(0.3) brightness(0.7);
    cursor: default;
  }
```
删除 `@keyframes skullWobble`（95-102）。

- [ ] **Step 2: 替换 `h1` 与 glitch 动画（104-122）为宋体双线标题**

```css
  h1 {
    font-family: "Noto Serif SC", serif;
    font-size: 1.85rem;
    font-weight: 900;
    letter-spacing: 0.18em;
    margin-bottom: 0.4rem;
    text-align: center;
    color: #160f08;
    border-top: 3px double var(--line);
    border-bottom: 3px double var(--line);
    padding: 0.5rem 0;
  }
```
删除 `@keyframes titleGlitch`（117-122）。

- [ ] **Step 3: 替换 `.subtitle`（124-135）**

```css
  .subtitle {
    font-family: "Noto Serif SC", serif;
    font-size: 0.9rem;
    color: var(--ink-soft);
    text-align: center;
    line-height: 2;
    max-width: 480px;
    margin: 1.2rem auto 2.5rem;
    border-top: 1px solid var(--hair);
    border-bottom: 1px solid var(--hair);
    padding: 0.9rem 0;
  }
```

- [ ] **Step 4: 替换 `.btn`/`.btn:hover`/`:active`/`btnShake`（137-167）为朱红硬投影按钮**

```css
  .btn {
    background: var(--vermilion);
    border: none;
    color: #f5ecd8;
    padding: 0.85rem 2.6rem;
    font-family: "Noto Serif SC", serif;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.25em;
    cursor: pointer;
    transition: all 0.15s ease;
    border-radius: 2px;
    box-shadow: 3px 3px 0 var(--vermilion-dim);
  }
  .btn:hover {
    background: var(--vermilion-dim);
    box-shadow: 1px 1px 0 var(--vermilion-dim);
    transform: translate(2px, 2px);
  }
  .btn:active { transform: translate(3px, 3px); box-shadow: none; }
```
删除 `@keyframes btnShake`（163-167）。

- [ ] **Step 5: 改 `renderIntro()`（1377-1392）加印章与旧报装饰句**

把模板字符串替换为（symbol 改笔、加印章和 dateline，**简介四行正文一字不动**）：

```js
  const introHTML = `
    <div class="intro-content">
      <div class="corner-seal">鑒定</div>
      <div class="symbol">🖋</div>
      <h1>精神状态鉴定中心</h1>
      <p class="dateline">本中心受理诸君精神之鉴定 · 凡四十问 · 定其原型</p>
      <p class="subtitle">
        本测试没有任何科学依据。<br>
        本测试的题目可能让你觉得"这什么鬼"。<br>
        但做完之后你可能觉得自己被看穿了。<br>
        这很正常。这不是你疯了。是世界疯了。
      </p>
      <button class="btn" onclick="startQuiz()">开始鉴定</button>
    </div>
  `;
```

- [ ] **Step 6: 在 `.subtitle` 规则后追加 `.intro-content`/`.corner-seal`/`.dateline`**

```css
  .intro-content { position: relative; display: flex; flex-direction: column; align-items: center; }
  .corner-seal {
    position: absolute; top: -0.5rem; right: 0;
    width: 50px; height: 50px;
    border: 2.5px solid var(--vermilion); color: var(--vermilion);
    border-radius: 4px; font-weight: 900; font-size: 1.1rem;
    display: flex; align-items: center; justify-content: center;
    writing-mode: vertical-rl; letter-spacing: 0.1em;
    transform: rotate(7deg); opacity: 0.82;
  }
  .dateline {
    font-size: 0.78rem; color: var(--sepia); letter-spacing: 0.05em;
    text-align: center; margin-top: 0.3rem;
  }
```

- [ ] **Step 7: 验证 intro**

Run: 刷新 http://localhost:8000
Expected: 封面为纸面 + 宋体双线标题 + 朱红「鑒定」印章 + 朱红硬投影按钮。简介四行文案与原来完全一致。控制台无报错。

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "style: intro 封面改为民国宋体标题+朱红印章按钮"
```

---
### Task 4: question 答题页样式（进度条 / 题目 / 选项）

**Files:**
- Modify: `index.html:169-276`（`.progress-wrap`/`.progress-bar`/`.progress-fill`/`progressPulse`/`.progress-num`/`.question-text`/`::before`/`cursorBlink`/`.choices`/`.choice`/`.choice .letter` 等）
- Modify: `index.html:1408-1426`（`renderQuestion()`：进度文案 + 选项 letter 标签）

- [ ] **Step 1: 替换进度条样式（174-199）为纸色+朱红**

```css
  .progress-bar {
    width: 100%;
    height: 6px;
    background: #cdbf9e;
    border: 1px solid var(--hair);
    position: relative;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: var(--vermilion);
    transition: width 0.4s ease;
  }
  .progress-num {
    text-align: right;
    font-family: "Noto Serif SC", serif;
    font-size: 0.78rem;
    color: var(--sepia);
    margin-top: 0.5rem;
    letter-spacing: 0.12em;
  }
```
删除 `@keyframes progressPulse`（188-191）。

- [ ] **Step 2: 替换 `.question-text` 与光标动画（205-229）**

```css
  .question-text {
    font-family: "Noto Serif SC", serif;
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1.8;
    text-align: left;
    margin-bottom: 2rem;
    min-height: 3em;
    color: #160f08;
    position: relative;
  }
  .question-text::before {
    content: "問　";
    color: var(--vermilion);
    font-weight: 900;
  }
```
删除 `@keyframes cursorBlink`（226-229）。注意 `::before` 不再用绝对定位，直接作为「問」前缀内联显示。

- [ ] **Step 3: 替换 `.choice`/`:hover`/`:active`（238-261）为纸面圈号选项**

```css
  .choice {
    background: rgba(255,252,244,0.4);
    border: 1px solid var(--hair);
    padding: 0.95rem 1.2rem;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
    font-family: "Noto Serif SC", serif;
    font-size: 0.9rem;
    color: var(--ink);
    letter-spacing: 0.02em;
    line-height: 1.7;
    position: relative;
    border-radius: 2px;
  }
  .choice:hover {
    border-color: var(--vermilion);
    background: #fffdf7;
    transform: translateX(4px);
  }
  .choice:active { transform: scale(0.98); }
```

- [ ] **Step 4: 替换 `.choice .letter` 与 nth-child（262-276）为朱红圈号**

```css
  .choice .letter {
    display: inline-block;
    font-family: "Noto Serif SC", serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--vermilion);
    margin-right: 0.5rem;
  }
```
删除 `.choice:nth-child(2) .letter`（273-276）整条规则（旧的双色 letter 不再需要）。

- [ ] **Step 5: 改 `renderQuestion()` 的进度文案与选项标记（1414, 1423）**

第 1414 行进度文案改为「第 N 問 / 共 40 問」：

```js
  document.getElementById('progress-num').textContent = '第 ' + (currentQuestion + 1) + ' 問 / 共 ' + questions.length + ' 問';
```

第 1423 行选项 letter 由「选项 A」改为朱红圈号「〇」（**选项正文 `choice.text` 不动**）：

```js
    btn.innerHTML = `<span class="letter">〇</span>${choice.text}`;
```

- [ ] **Step 6: 验证 question**

Run: 刷新 http://localhost:8000 → 点「开始鉴定」进入答题
Expected: 题目前有朱红「問」字，选项前是朱红「〇」圈号，hover 右移变白底，进度条朱红填充、文案「第 N 問 / 共 40 問」。题目和选项正文与原来一致（简体白话）。控制台无报错。

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "style: 答题页改为民国纸面圈号选项与朱红进度条"
```

---
### Task 5: result 结果页样式（原型名 / 卡片 / 维度条 / 综合指数 / 引言）

**Files:**
- Modify: `index.html:278-476`（result 相关全部 CSS：`.result-type`/`.result-name`/`nameGlitch`/`.result-subtitle`/`.result-card`/`.result-section`/`.result-label`/`.result-text`/`.btn-restart`/进度条容器/`.dim-progress-*`/`shimmer`/`.progress-label`/`.progress-value`/`.result-header`/`.overall-score`/`.score-*`/`.composite-*`）
- Modify: `index.html:1591-1632`（`renderResultPage()`：加「已鑒」印章，**不改维度标签**）

> ⚠️ **不要碰 `renderDimensionBars()`（1635-1658）里的维度名/极性标签**，那里硬编码了「抗争/逃避」等，本次不改维度。只改它输出 HTML 所用的 CSS class 外观。

- [ ] **Step 1: 替换原型标题区（278-315）**

替换 `.result-type`/`.result-name`/`@keyframes nameGlitch`/`.result-subtitle`：

```css
  .result-type {
    font-family: "Noto Serif SC", serif;
    font-size: 0.78rem;
    letter-spacing: 0.3em;
    color: var(--vermilion);
    margin-bottom: 0.5rem;
    text-align: center;
  }
  .result-name {
    font-family: "Noto Serif SC", serif;
    font-size: 1.9rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    margin-bottom: 0.4rem;
    text-align: center;
    color: #160f08;
  }
  .result-subtitle {
    font-family: "Noto Serif SC", serif;
    font-size: 0.85rem;
    color: var(--ink-soft);
    text-align: center;
    margin-bottom: 1.5rem;
    border-bottom: 3px double var(--line);
    padding-bottom: 1rem;
  }
```
删除 `@keyframes nameGlitch`（300-305）。

- [ ] **Step 2: 替换卡片与区块（317-347）**

替换 `.result-card`/`.result-section`/`.result-label`/`.result-text`：

```css
  .result-card {
    background: rgba(255,252,244,0.5);
    border: 1px solid var(--hair);
    padding: 1.75rem;
    width: 100%;
    margin-bottom: 1.5rem;
    border-radius: 2px;
    box-shadow: inset 0 0 30px rgba(90,60,20,0.06);
  }
  .result-section { margin-bottom: 1.75rem; }
  .result-section:last-child { margin-bottom: 0; }
  .result-label {
    font-family: "Noto Serif SC", serif;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: var(--vermilion);
    margin-bottom: 0.6rem;
    border-left: 3px solid var(--vermilion);
    padding-left: 0.8rem;
  }
  .result-text {
    font-family: "Noto Serif SC", "Source Han Serif SC", Georgia, serif;
    font-size: 0.95rem;
    line-height: 2;
    color: var(--ink);
  }
```

- [ ] **Step 3: 替换 `.btn-restart`（349-363）**

```css
  .btn-restart {
    margin-top: 1.5rem;
    font-size: 0.85rem;
    padding: 0.6rem 2rem;
    letter-spacing: 0.2em;
    background: transparent;
    color: var(--vermilion);
    border: 1.5px solid var(--vermilion);
    box-shadow: 2px 2px 0 var(--vermilion-dim);
  }
  .btn-restart:hover {
    background: var(--vermilion);
    color: #f5ecd8;
    box-shadow: 1px 1px 0 var(--vermilion-dim);
    transform: translate(1px, 1px);
  }
```

- [ ] **Step 4: 替换维度进度条（365-415）为纸色+赭朱渐变**

替换 `.progress-bar-container`/`.dim-progress-bar`/`.dim-progress-fill`/`.dim-progress-fill::after`/`shimmer`/`.progress-label`/`.progress-value`：

```css
  .progress-bar-container { width: 100%; margin: 1rem 0; }
  .dim-progress-bar {
    width: 100%;
    height: 9px;
    background: #cdbf9e;
    border: 1px solid var(--hair);
    border-radius: 2px;
    overflow: hidden;
  }
  .dim-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--sepia), var(--vermilion));
    transition: width 0.5s ease;
  }
  .progress-label {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: var(--ink-soft);
  }
  .progress-value { color: var(--vermilion); font-weight: 700; }
```
删除 `.dim-progress-fill::after`（388-397）和 `@keyframes shimmer`（399-402）——纸面风不要流光。

- [ ] **Step 5: 替换综合评分区（417-476）**

替换 `.result-header`/`.overall-score`/`.score-number`/`.score-label`/`.score-description`/`.composite-scores`/`.composite-item`/`.composite-label`/`.composite-value`：

```css
  .result-header { text-align: center; margin-bottom: 2rem; position: relative; }
  .overall-score {
    text-align: center;
    padding: 1.5rem;
    background: rgba(168,50,31,0.06);
    border: 1px solid var(--hair);
    border-radius: 2px;
    margin-bottom: 1.5rem;
  }
  .score-number {
    font-family: "Noto Serif SC", serif;
    font-size: 3.5rem;
    font-weight: 900;
    color: var(--vermilion);
    line-height: 1;
  }
  .score-label { font-size: 1.3rem; color: #160f08; margin: 0.5rem 0; font-weight: 700; }
  .score-description { font-size: 0.9rem; color: var(--ink-soft); }
  .composite-scores {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-top: 1rem;
  }
  .composite-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    background: rgba(255,252,244,0.5);
    border-radius: 2px;
    border-left: 3px solid var(--sepia);
  }
  .composite-label { color: var(--ink-soft); font-size: 0.85rem; }
  .composite-value { color: var(--vermilion); font-weight: 700; }
```

- [ ] **Step 6: 在 `renderResultPage()`（1591-1597）加「已鑒」印章**

把 `result-header` 块（1593-1597）改为带印章（typeCode/name/subtitle 引用不变）：

```js
    <div class="result-header">
      <div class="corner-seal">已鑒</div>
      <div class="result-type">${archetype.typeCode}</div>
      <div class="result-name">${archetype.name}</div>
      <div class="result-subtitle">${archetype.subtitle}</div>
    </div>
```
（`.corner-seal` 样式在 Task 3 Step 6 已定义，`.result-header` 已在 Step 5 设为 `position: relative`，印章会定位到右上角。）

- [ ] **Step 7: 验证 result**

Run: 刷新 http://localhost:8000 → 快速答完 40 题到结果页（或临时把 `questions.length` 心算，正常走完即可）
Expected: 结果页为纸面卡片、宋体原型名、朱红「已鑒」印章、双线分隔、纸色赭朱渐变维度条（无流光）、朱红综合评分。维度名「压力应对/情绪管理/社交模式/决策方式」与极性标签「抗争/逃避」等显示正确（未被误改）。控制台无报错。

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "style: 结果页改为民国纸面卡片与朱红印章"
```

---
### Task 6: 响应式微调 + 全流程验收

**Files:**
- Modify: `index.html:478-541`（`@media (max-width:768px)` 与 `@media (max-width:480px)`）

- [ ] **Step 1: 清理 768px 媒体查询里的失效引用（479-505）**

`@media (max-width: 768px)` 里 `h1`、`.question-text`、`.result-name`、`.choice` 的字号覆盖仍有效，保留。检查是否有引用已删除元素——`progress-bar-container` 仍存在，保留。无需删除，仅确认无报错。

- [ ] **Step 2: 清理 480px 媒体查询（507-541）**

`@media (max-width: 480px)` 里第 521 行 `.question-text::before { display: none; }` 现在会隐藏「問」字前缀——民国风希望保留「問」。删除这一行：

```css
    .question-text::before { display: none; }   /* ← 删除此行 */
```
其余字号覆盖（h1/result-name/choice/symbol/composite-scores/score-number）保留。

- [ ] **Step 3: 全流程验收（intro → question → result）**

Run: `python3 -m http.server 8000`，浏览器开 http://localhost:8000，完整走一遍：开始鉴定 → 答完 40 题 → 看结果 → 重新测试。

Expected（对照验收标准）：
1. 三屏全部呈现浓郁民国旧报风（纸/墨/朱红），与定稿一致。
2. 正文（题目、选项、原型 desc/guidance/insight、intro 简介）保持简体白话，未变文言。
3. canvas 背景为墨点/落字雨，无赛博 glitch 残留。
4. 全局无紫/蓝/霓虹色（可在控制台搜 computed style 或目视）。
5. 浏览器直接打开可运行，控制台无 JS 报错。

- [ ] **Step 4: 移动端响应式检查**

Run: 浏览器开发者工具切换到 375px 宽（iPhone SE）和 768px 宽
Expected: 三屏不破版，「問」字前缀保留，综合指数在窄屏变单列，标题/原型名字号缩小不溢出。

- [ ] **Step 5: 离线字体回退检查**

Run: 开发者工具 Network 面板勾选 offline，刷新
Expected: 页面回退到系统 serif 字体，布局不崩，仍可正常完成测试。

- [ ] **Step 6: 用 simplify skill 审查改动**

按 CLAUDE.md 约定，写完代码后用 `code-simplifier` / `simplify` skill 审查本次 CSS/JS 改动的冗余与可维护性（如残留的未使用变量、重复规则）。

- [ ] **Step 7: 最终 Commit**

```bash
git add index.html
git commit -m "style: 响应式微调，保留問字前缀，完成民国风重设计"
```

---

## 实施后清理

- [ ] 停止视觉伴侣服务器：`bash <skill>/scripts/stop-server.sh <session_dir>`
- [ ] 更新 `CLAUDE.md` 的「当前版本特性」与「Visual design」段，把「深紫色现代感设计风格」改为「民国报章/鲁迅文学风（纸/墨/朱红）」。按 CLAUDE.md 约定，这一步用 `claude-md-management:revise-claude-md` skill。

## Self-Review 记录

- **Spec 覆盖**：配色（T1）、字体（T1-T5 各组件）、朱红印章（T3/T5）、双线分隔（T3/T5）、纸张质感（T1/T5）、圈号选项（T4）、纸色指数条（T5）、按钮硬投影（T3/T5）、canvas 墨点雨（T2）、三屏布局（T3/T4/T5）、正文不变（T3/T4/T5 均显式标注）、响应式（T6）、离线回退（T1 字体栈 + T6 验证）——全部有对应任务。✅
- **占位符**：无 TBD/TODO，每个改动都给出完整 CSS/JS 代码。✅
- **类型/命名一致**：`--vermilion`/`--sepia`/`--hair`/`--ink` 等变量在 T1 定义，后续任务一致引用；`.corner-seal` 在 T3 Step 6 定义，T5 Step 6 复用；`inkDrops`/`drawInkDrop` 命名一致。✅
- **风险点已标注**：T5 显式警告不要动 `renderDimensionBars()` 的维度标签（CLAUDE.md gotcha）。✅
