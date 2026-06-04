# 精神状态鉴定中心 — 可发现性与可分享性优化设计

**日期:** 2026-06-04
**目标:** 让网页更容易被搜索引擎发现、在社交平台分享时展示精美卡片、支持结果分享裂变、PWA 离线使用。

## 背景

项目已部署在 GitHub Pages (`https://lycbee.github.io/mental-state-assessment/`)，但 `<head>` 中只有基础的 charset、viewport 和 title，缺少 SEO meta 标签、社交分享元数据、Favicon、PWA 支持。需要技术层面的全面优化。

---

## 1. SEO + 社交分享 Meta 标签

在 `<head>` 中 `<title>` 之后添加：

```html
<!-- SEO -->
<meta name="description" content="40道题，20种人格原型。你可能是「清醒的疯子」，也可能是「体面的废物」——鲁迅式黑色幽默的灵魂鉴定，测完不敢发朋友圈算我输。">
<meta name="keywords" content="心理测试,人格测试,趣味测试,精神状态鉴定,MBTI,性格测试,鲁迅,黑色幽默,灵魂鉴定,SBTI,心理画像">
<meta name="author" content="lycbee">

<!-- Open Graph (微信/微博/Facebook) -->
<meta property="og:type" content="website">
<meta property="og:title" content="精神状态鉴定中心 — 你是什么品种的精神状态？">
<meta property="og:description" content="40道题测出你的人格原型。清醒的疯子？体面的废物？鲁迅式黑色幽默的灵魂鉴定。">
<meta property="og:image" content="https://lycbee.github.io/mental-state-assessment/og-image.png">
<meta property="og:url" content="https://lycbee.github.io/mental-state-assessment/">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="精神状态鉴定中心 — 你是什么品种的精神状态？">
<meta name="twitter:description" content="40道题，20种人格原型，鲁迅式黑色幽默的灵魂鉴定">
<meta name="twitter:image" content="https://lycbee.github.io/mental-state-assessment/og-image.png">
```

**改动位置:** `index.html` 第 6 行 `</title>` 之后

---

## 2. Favicon

SVG favicon，朱红底色 + 「鑒」字，内联 data URI，无需额外文件：

```html
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='8' fill='%23a8321f'/><text x='50' y='72' font-size='60' text-anchor='middle' fill='%23e9e2d0' font-family='serif'>鑒</text></svg>">
```

**改动位置:** `index.html` `<head>` 区域

---

## 3. OG Image 生成

**方案:** Node.js 脚本 + `canvas` 库生成 1200×630 的 `og-image.png`

**画面设计:**
- 泛黄纸色背景 (`#e9e2d0`)
- 中央横排大标题「精神状态鉴定中心」宋体加粗
- 副标题「你是什么品种的精神状态？」
- 右下角朱红印章装饰
- 左上角墨迹点缀

**文件:** `generate-og.js`（新文件）

**执行流程:**
1. `npm install canvas` (一次性)
2. `node generate-og.js` 生成 `og-image.png`
3. 提交 `og-image.png` 到仓库，GitHub Pages 直接 serve

**备选:** 如果不想维护 Node 依赖，可以用 GitHub Actions 在 push 时自动生成。

---

## 4. 结果页社交分享

### 4.1 URL 参数方案

- 结果页 URL 带参数: `index.html?r=0101`（4位二进制对应人格类型 key）
- `showResult()` 完成后，用 `history.replaceState` 更新 URL（不刷新页面）
- 页面初始化时检测 URL 参数：如果有 `r` 参数且在 `archetypes` 中存在，直接展示对应结果，跳过答题

### 4.2 分享按钮 UI

在结果页底部（「再来一次」按钮下方）添加：

```
┌─────────────────────────────┐
│      [ 再来一次 ]            │
│                             │
│  ─── 分享你的结果 ───        │
│                             │
│  [ 复制链接 ]  [ 保存图片 ]  │
└─────────────────────────────┘
```

- **复制链接:** 带 `?r=xxxx` 参数的完整 URL，复制到剪贴板，显示「已复制」提示
- **保存图片:** Canvas 绘制结果卡片（人格名称、类型码、一句话描述），导出为 PNG 下载

### 4.3 分享图设计

Canvas 绘制，尺寸 800×1000：
- 泛黄纸色背景
- 顶部标题「精神状态鉴定中心」
- 中央人格名称（大字）
- 类型码（如 `FSEC`）
- 一句话描述
- 底部二维码或链接

### 4.4 改动范围

- `index.html` HTML: 添加分享按钮结构
- `index.html` CSS: 分享按钮民国风样式
- `index.html` JS:
  - `showResult()` 末尾: 更新 URL 参数
  - 新函数 `parseUrlParam()`: 页面初始化时读取 `?r=` 参数
  - 新函数 `copyShareLink()`: 复制链接到剪贴板
  - 新函数 `generateShareImage()`: Canvas 绘制分享图并下载

---

## 5. PWA 离线支持

### 5.1 manifest.json

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

**文件:** `manifest.json`（新文件）

### 5.2 PWA 图标

与 OG Image 共用生成脚本，额外生成 192×192 和 512×512 的 PWA 图标：
- 朱红底色 (`#a8321f`)
- 中央「鑒」字泛黄色
- 圆角矩形

**文件:** `icon-192.png`, `icon-512.png`（生成的静态文件）

### 5.3 Service Worker

**文件:** `sw.js`（新文件）

**缓存策略:**
- `index.html`: Network First（优先网络，离线时用缓存）
- Google Fonts CSS: Stale While Revalidate（先用缓存，后台更新）
- 字体文件: Cache First（字体不常变，优先缓存）
- OG Image / PWA 图标: Cache First

**注册逻辑:** 在 `index.html` 的 `<script>` 末尾添加 Service Worker 注册代码。

### 5.4 HTML 引用

在 `<head>` 中添加:
```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#a8321f">
```

---

## 改动文件清单

| # | 文件 | 操作 | 风险 |
|---|------|------|------|
| 1 | `index.html` `<head>` | 修改 — 添加 meta 标签、favicon、manifest 引用 | 极低 |
| 2 | `index.html` CSS | 修改 — 添加分享按钮样式 | 低 |
| 3 | `index.html` HTML | 修改 — 结果页添加分享按钮结构 | 低 |
| 4 | `index.html` JS | 修改 — URL 参数处理、分享函数、SW 注册 | 中 |
| 5 | `generate-og.js` | 新建 — OG Image 和 PWA 图标生成脚本 | 低 |
| 6 | `og-image.png` | 生成 — 社交分享预览图 | 低 |
| 7 | `icon-192.png`, `icon-512.png` | 生成 — PWA 图标 | 低 |
| 8 | `manifest.json` | 新建 — PWA 清单 | 低 |
| 9 | `sw.js` | 新建 — Service Worker 离线缓存 | 中 |

## 不改动的部分

- 题目数据、评分逻辑、人格原型数据 — 完全不动
- Canvas 背景动画（墨点落字雨）— 完全不动
- 民国报章视觉风格 — 完全不动，新增元素遵循现有风格
- 三个页面切换逻辑 — 仅在 result 页添加分享功能
