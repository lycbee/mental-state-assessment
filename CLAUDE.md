# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Single-file personality quiz web app ("精神状态鉴定中心 — SBTI风格抽象人格测试"). Everything lives in `index.html` — HTML structure, CSS styles, and all JavaScript logic. No build step, no dependencies, no server required.

## Visual design

**ALWAYS use the `frontend-design` skill** for any visual/CSS/styling work in this project. This project has an intentionally designed aesthetic (SBTI-style absurd/chaotic internet theme). Generic or AI-default styling will break the intended tone. The `frontend-design` skill understands the design context and produces appropriate visual output.

When making content changes that don't touch CSS/visuals, the skill is not needed. But any change to `<style>`, layout, colors, typography, or the canvas background animation MUST go through `frontend-design`.

## How to run

Open `index.html` directly in a browser, or serve locally:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Architecture

Four personality dimensions, each a binary axis:

| Dimension   | Pole 0 (score < 0)   | Pole 1 (score >= 0)      |
|-------------|----------------------|--------------------------|
| LifeForce   | 微死 (Slightly Dead) | 疯了 (Crazy)             |
| ActionMode  | 卷死 (Grind)         | 开摆 (Lie Flat)          |
| ValueCore   | 要钱 (Money)         | 开心 (Happy)             |
| SocialMode  | 已读不回 (Ghost)     | 随地大小演 (Perform)     |

- **20 questions** (5 per dimension), each with two absurd SBTI-style choices. Each choice shifts the dimension score by ±1.
- **Scoring**: Each answer shifts the dimension score by ±1. At the end, a 4-bit key (e.g. `"0101"`) is formed by checking `score >= 0` per dimension, producing one of **16 archetypes**.
- **Archetypes**: Use absurd English code names with Chinese labels, e.g. "DEAD (死者)", "GOD (摆烂之神)", "NPC (路人甲)". Each archetype has `name`, `subtitle`, `typeCode` (4-letter), `desc` (absurd portrait), `guidance` (sincere life advice), and `insight` (piercing quote).
- **Question order**: Shuffled randomly each run.
- **Background**: Canvas-based glitch/noise animation with binary rain (falling 1/0 characters), color-shifted rectangles, scanlines, and subtle static grain — chaotic SBTI aesthetic.
- **Screens**: Three screens managed by `showScreen(id)` — `intro`, `question`, `result`. Transitions use CSS opacity/transform and the `.active` class.
- All archetype data is in the `archetypes` object keyed by the 4-bit string. Archetypes use English code names (DEAD, ATM, SHIT, HHHH, GHOST, JOKER, NPC, LMAO, DEMON, BOSS, STAR, CLOWN, BEGGAR, DREAMER, BUDDHA, GOD) paired with self-deprecating Chinese labels.
