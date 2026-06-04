# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Single-file personality quiz web app ("精神状态鉴定中心 — SBTI风格抽象人格测试"). Everything lives in `index.html` — HTML structure, CSS styles, and all JavaScript logic. No build step, no dependencies, no server required.

**当前版本特性：**
- 40道题目（每维度10题），4-6个选项
- 20个人格原型（鲁迅黑色幽默风格）
- 混合评分机制（选项-维度映射 + 语义分类）
- 民国报章 / 鲁迅文学风（纸 / 墨 / 朱红）
- 多维度评分系统（压力应对、情绪管理、社交模式、决策方式）

## Visual design

**任何 CSS/视觉/样式改动必须使用 `frontend-design` skill。** 本项目有刻意设计的民国报章 / 鲁迅文学风（泛黄纸色、宋体、朱红印章、双线分隔），通用 AI 默认样式会破坏调性。改动 `<style>` 块、布局、颜色、字体或 canvas 背景动画 → 用 skill。纯内容（题目、文案）改动不需要。视觉为民国风，但正文（题目、选项、原型描述、intro 简介）保持简体白话，仅标题/标签/印章等装饰位用文言点缀。

## How to run

Open `index.html` directly in a browser, or serve locally:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## GitHub Pages 部署

本项目通过 GitHub Pages 自动部署。推送到 `master` 分支会触发自动构建。

```bash
# 部署流程
git push origin master  # 自动触发 Pages 重建
```

- **线上地址**: https://lycbee.github.io/mental-state-assessment/
- **Pages 配置**: master 分支根目录，无 Actions workflow
- **构建状态**: 通过 GitHub API 查询 `GET /repos/{owner}/{repo}/pages`

## Architecture

Four personality dimensions, each a social coping strategy:

| Dimension   | Pole 0 (score < 0)   | Pole 1 (score >= 0)      |
|-------------|----------------------|--------------------------|
| stress      | 抗争 (Fight)         | 逃避 (Escape)            |
| emotion     | 压抑 (Suppress)      | 宣泄 (Vent)              |
| social      | 疏离 (Isolate)       | 连接 (Connect)           |
| decision    | 理性 (Rational)      | 感性 (Emotional)         |

- **40 questions** (10 per dimension), shuffled randomly each run. Each question has 4-6 options with hybrid scoring.
- **Scoring**: 每个选项有 `scoring` 对象，映射到多个维度。结束后计算每个维度的指数（0-100），生成 4-bit key，查表得到对应 archetype。
- **Archetype 数据**: 每个含 6 个字段：`name`（鲁迅黑色幽默命名）、`subtitle`、`typeCode`（4 字母）、`desc`（灵魂肖像）、`guidance`（人生指引）、`insight`（哲言）。全部存在 `archetypes` 对象中，key 为 4-bit 字符串或特殊key。
- **Screens**: 三个页面由 `showScreen(id)` 切换 — `intro`、`question`、`result`。过渡动画用 CSS opacity/transform 和 `.active` class。
- **Background**: Canvas 动画 — 墨点落字雨（`inkDrops` 粒子，随机汉字/墨点缓慢下落，墨色半透明），节流约 30fps。已移除旧的二进制雨、glitch 方块、扫描线、RGB 噪点。

## Skill usage

改动时按场景使用对应 skill，不要手动做 skill 擅长的事：

| 场景 | 使用 skill | 说明 |
|------|-----------|------|
| CSS/样式/视觉/布局/canvas 背景 | `frontend-design` | 民国报章 / 鲁迅文学风，AI 默认样式会毁调性 |
| 写完代码后 | `simplify` | 审查改动质量、可维护性，去冗余 |
| 提交代码 | `commit-commands:commit` 或 `commit-commands:commit-push-pr` | 按规范生成 commit message |
| 发 PR 前 / 审查改动 | `pr-review-toolkit:review-pr` | 多 agent 综合审查 |
| 涉及用户输入、数据处理的安全改动 | `security-review` | 防 XSS、注入等 |
| 学到新的项目约定/踩坑经验后 | `claude-md-management:revise-claude-md` | 把经验写回 CLAUDE.md |

### Skill 使用示例

- **修改按钮样式**：使用 `frontend-design` skill，因为涉及 CSS 变量和动画
- **添加新题目**：直接编辑 `questions` 数组，不需要 skill
- **修改评分逻辑**：编辑 `answer()` 和 `showResult()` 函数，完成后用 `simplify` 审查
- **提交代码前**：用 `commit-commands:commit` 生成规范的 commit message

## Gotchas

- **改 `dimensions` 数组时，必须同步更新 `showResult()` 中的 `allDimLabels` 和 `dimNames`**。两处硬编码了维度标签，不一致会导致结果页显示错误。
- **评分机制是混合模式**：选项有 `scoring` 对象映射到多个维度，不是简单的二选一。
- **特殊原型**：有4个特殊原型（key为`special_1`到`special_4`），需要极端分数才能触发。
- Google Fonts (`Noto Serif SC`) 通过 CSS `@import` 加载，离线环境回退到系统 serif 字体。
- Canvas 墨点落字雨用 `inkDrops` 粒子数组（约 36 个）+ 节流约 30fps 绘制，已无逐像素噪点，性能开销低。粒子数 / 速度 / 透明度在脚本顶部常量可调。

## 依赖说明

- **Google Fonts**：通过 CSS `@import` 加载 `Noto Serif SC` 字体，离线环境回退到系统 serif 字体
- **无外部 JavaScript 依赖**：所有逻辑原生实现

## 数据结构

- **questions**: 40道题目，每题包含 `id`, `dimension`, `text`, `options`（4-6个选项，每个有 `text` 和 `scoring`）
- **archetypes**: 20个人格原型，key为4位二进制字符串或特殊key
- **scoringConfig**: 评分配置，包含维度范围和综合指数权重
