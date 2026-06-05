# 专业心理学框架 + 自适应出题机制 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将固定 40 题测试重构为大五因子支撑的专业框架 + 题库实时筛选的自适应出题系统。

**Architecture:** 单文件 index.html 应用。新增题库数据结构（带元数据标签）、Likert 评分引擎、自适应筛选引擎、效度检查模块。保留现有原型系统、结果页、分享功能、Canvas 背景。

**Tech Stack:** 纯 HTML/CSS/JavaScript，无外部依赖。

**Spec:** `docs/superpowers/specs/2026-06-05-professional-framework-adaptive-testing-design.md`

---

## 文件结构

所有改动集中在 `index.html` 一个文件内，按逻辑区域划分：

| 区域 | 行范围（约） | 职责 |
|------|------------|------|
| CSS `<style>` | 24-535 | 样式（需新增进度指示、效度提示样式） |
| HTML 结构 | 537-550 | 页面结构（需修改 progress 区域） |
| Canvas 背景 | 553-614 | 墨点雨动画（不改动） |
| 数据定义 | 616-1277 | 维度、题库、原型、评分配置（需重构题库） |
| 状态管理 | 1279-1305 | 全局状态、URL 参数（需扩展状态） |
| 导航逻辑 | 1307-1355 | 页面切换、开始/重置（需适配自适应流程） |
| 答题逻辑 | 1357-1408 | 渲染题目、处理答案（需重写为自适应） |
| 评分函数 | 1410-1542 | 计算得分、原型映射（需重写为Likert评分） |
| 结果渲染 | 1544-1935 | 结果页、分享、初始化（需适配新评分） |

---

## Task 1: 定义题库数据结构与子维度配置

**目标：** 建立新的题库数据结构，定义所有子维度元数据，为后续任务提供数据基础。

**Files:**
- Modify: `index.html:616-1277`（数据定义区域）

- [ ] **Step 1: 定义子维度配置常量**

在 `dimensions` 数组之后、`questions` 数组之前，添加子维度配置。每个子维度包含：所属维度、大五来源、含义、权重。

```javascript
// ── 子维度配置（大五因子映射） ──────────────────
const subfacets = {
  stress: [
    { id: 'anxiety', name: '焦虑倾向', source: '神经质 → 焦虑', weight: 0.3 },
    { id: 'resilience', name: '压力韧性', source: '神经质 → 压力敏感', weight: 0.3 },
    { id: 'action', name: '行动力', source: '尽责性 → 自律', weight: 0.2 },
    { id: 'avoidance', name: '回避倾向', source: '神经质 → 冲动性', weight: 0.2 }
  ],
  emotion: [
    { id: 'awareness', name: '情绪觉察', source: '开放性 → 感受性', weight: 0.3 },
    { id: 'suppression', name: '情绪抑制', source: '神经质 → 冲动性', weight: 0.3 },
    { id: 'release', name: '情绪释放', source: '开放性 → 幻想', weight: 0.2 },
    { id: 'stability', name: '情绪稳定性', source: '神经质 → 情绪性', weight: 0.2 }
  ],
  social: [
    { id: 'energy', name: '社交能量', source: '外向性 → 热情', weight: 0.3 },
    { id: 'trust', name: '信任倾向', source: '宜人性 → 信任', weight: 0.3 },
    { id: 'tolerance', name: '孤独耐受', source: '外向性 → 合群性', weight: 0.2 },
    { id: 'maintenance', name: '关系维护', source: '宜人性 → 顺从', weight: 0.2 }
  ],
  decision: [
    { id: 'logic', name: '逻辑依赖', source: '开放性 → 概念化', weight: 0.3 },
    { id: 'empathy', name: '共情驱动', source: '宜人性 → 利他', weight: 0.3 },
    { id: 'intuition', name: '直觉倾向', source: '开放性 → 幻想', weight: 0.2 },
    { id: 'indecision', name: '决策焦虑', source: '神经质 → 犹豫', weight: 0.2 }
  ]
};
```

- [ ] **Step 2: 验证子维度配置完整性**

打开浏览器确认无 JS 报错。在控制台执行：
```javascript
Object.keys(subfacets).forEach(d => {
  console.log(d, subfacets[d].length, 'subfacets');
  console.log('  total weight:', subfacets[d].reduce((s, f) => s + f.weight, 0));
});
```
 Expected: 每个维度 4 个子维度，总权重均为 1.0。

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: 添加子维度配置（大五因子映射）

定义 4 个维度 × 4 个子维度的元数据配置，
包含大五来源、含义、权重。
每个维度总权重为 1.0。

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: 重构题库数据结构

**目标：** 将现有的 `questions` 数组重构为带元数据标签的题库。先用占位题目填充，后续替换为真实内容。

**Files:**
- Modify: `index.html:645-1096`（替换整个 questions 数组）

- [ ] **Step 1: 定义新题库数据结构**

替换整个 `questions` 数组为新的 `questionPool`。每道题包含完整元数据。先为每个子维度写 1 道占位题（共 16 题 + 3 道效度检查 = 19 题占位），确保结构正确。

```javascript
// ── 题库（带元数据标签） ──────────────────────
// 评分由 getLikertScore() + applyPolarity() 计算，不使用 scoring 字段
// scoring 字段仅保留用于兼容性检查
const questionPool = [
  // ═══ 压力应对维度 ═══
  // 子维度：焦虑倾向
  {
    id: 'stress_01',
    dimension: 'stress',
    subfacet: 'anxiety',
    polarity: 'direct',
    leaning: 'escape',
    difficulty: 'easy',
    options: 5,
    text: '你的老板在凌晨三点发了一条消息："在吗？"你的第一反应是？',
    optionTexts: [
      '立刻回复，然后通宵完成任务',
      '回复"在的"，然后继续睡觉',
      '假装没看见，明天再说',
      '打开招聘软件看了一眼',
      '把老板拉黑，然后继续睡觉'
    ],
    scoring: null  //Likert 评分由 getLikertScore() 计算
  },
  // 子维度：压力韧性
  {
    id: 'stress_02',
    dimension: 'stress',
    subfacet: 'resilience',
    polarity: 'direct',
    leaning: 'fight',
    difficulty: 'easy',
    options: 5,
    text: '你被同事甩锅了，你？',
    optionTexts: [
      '当面指出问题，要求道歉',
      '私下找同事沟通',
      '算了，不计较',
      '在朋友圈发阴阳怪气的内容',
      '越级汇报'
    ],
    scoring: null
  },
  // 子维度：行动力
  {
    id: 'stress_03',
    dimension: 'stress',
    subfacet: 'action',
    polarity: 'direct',
    leaning: 'fight',
    difficulty: 'boundary',
    options: 5,
    text: '你的年度目标清单上大概有多少条？',
    optionTexts: [
      '四十七条。每一条都有详细的子任务和甘特图',
      '五条左右，大概知道方向就行',
      '年度目标？我一般只设置"本周目标"——活到周五',
      '没有目标。目标是资本主义的陷阱',
      '有目标，但从没完成过'
    ],
    scoring: null
  },
  // 子维度：回避倾向
  {
    id: 'stress_04',
    dimension: 'stress',
    subfacet: 'avoidance',
    polarity: 'reverse',
    leaning: 'escape',
    difficulty: 'boundary',
    options: 5,
    text: '你有一个重要的任务明天要交。现在是晚上十点，你的进度是？',
    optionTexts: [
      '已经完成了，还在检查细节',
      '大概完成了百分之八十',
      '还没开始，但列了详细计划',
      '刚开始，准备通宵',
      '完全没动，正在刷手机'
    ],
    scoring: null
  },
  // ═══ 情绪管理维度 ═══
  // 子维度：情绪觉察
  {
    id: 'emotion_01',
    dimension: 'emotion',
    subfacet: 'awareness',
    polarity: 'direct',
    leaning: 'vent',
    difficulty: 'easy',
    options: 5,
    text: '朋友当众开了一个让你很难堪的玩笑。饭桌上所有人都在笑。你——',
    optionTexts: [
      '完全不当回事，甚至还接了个梗',
      '假装不在意，回去之后越想越气',
      '当场怼回去，管他是不是朋友',
      '假装没听见，但整晚都没再说话',
      '散场后发了条朋友圈，仅他可见'
    ],
    scoring: null
  },
  // 子维度：情绪抑制
  {
    id: 'emotion_02',
    dimension: 'emotion',
    subfacet: 'suppression',
    polarity: 'reverse',
    leaning: 'suppress',
    difficulty: 'easy',
    options: 5,
    text: '你刚和伴侣吵完架，对方摔门进了卧室。客厅只剩你一个人。你——',
    optionTexts: [
      '坐在沙发上，把刚才的对话在脑子里过了二十遍',
      '打开电视，试图用别人的故事盖住自己的',
      '走到阳台抽了根烟，感觉好多了',
      '推门进去说"我们谈谈"',
      '开始收拾行李'
    ],
    scoring: null
  },
  // 子维度：情绪释放
  {
    id: 'emotion_03',
    dimension: 'emotion',
    subfacet: 'release',
    polarity: 'direct',
    leaning: 'vent',
    difficulty: 'boundary',
    options: 5,
    text: '你今天过得很糟糕。回到家关上门后，你——',
    optionTexts: [
      '躺在床上，什么都不想做',
      '打开音乐，把音量调到最大',
      '给朋友发了一大段消息吐槽',
      '打开备忘录，写了一篇三千字的日记',
      '点了一份外卖，用食物填补空虚'
    ],
    scoring: null
  },
  // 子维度：情绪稳定性
  {
    id: 'emotion_04',
    dimension: 'emotion',
    subfacet: 'stability',
    polarity: 'direct',
    leaning: 'suppress',
    difficulty: 'boundary',
    options: 5,
    text: '你在地铁上被人踩了一脚，对方没道歉。你的内心活动是？',
    optionTexts: [
      '算了，可能他也不是故意的',
      '有点不爽，但很快就忘了',
      '气死了，但忍住了',
      '一整天都在想这件事',
      '截图发朋友圈，配文"今天遇到一个没素质的人"'
    ],
    scoring: null
  },
  // ═══ 社交模式维度 ═══
  // 子维度：社交能量
  {
    id: 'social_01',
    dimension: 'social',
    subfacet: 'energy',
    polarity: 'direct',
    leaning: 'connect',
    difficulty: 'easy',
    options: 5,
    text: '周末，同事群有人提议聚餐。你看了看消息，然后——',
    optionTexts: [
      '立刻回复"去！"，已经开始想穿什么',
      '犹豫了五分钟，最后说"看情况"',
      '把消息标记已读，假装没看见',
      '开启免打扰，继续躺在沙发上',
      '回复"去"，然后开始焦虑穿什么'
    ],
    scoring: null
  },
  // 子维度：信任倾向
  {
    id: 'social_02',
    dimension: 'social',
    subfacet: 'trust',
    polarity: 'direct',
    leaning: 'connect',
    difficulty: 'easy',
    options: 5,
    text: '新来的同事主动找你聊天，你——',
    optionTexts: [
      '热情回应，午饭就一起去吃了',
      '礼貌回应，但保持距离',
      '觉得他可能有所图',
      '聊了几句就找借口离开了',
      '直接问他"你是不是有什么事？"'
    ],
    scoring: null
  },
  // 子维度：孤独耐受
  {
    id: 'social_03',
    dimension: 'social',
    subfacet: 'tolerance',
    polarity: 'reverse',
    leaning: 'isolate',
    difficulty: 'boundary',
    options: 5,
    text: '你已经连续三天没有和任何人说过话了。你——',
    optionTexts: [
      '终于！这才是理想的生活',
      '有点舒服，但开始觉得哪里不对',
      '没什么感觉',
      '开始有点慌了，想找人说话',
      '立刻约了朋友出来，不管对方有没有空'
    ],
    scoring: null
  },
  // 子维度：关系维护
  {
    id: 'social_04',
    dimension: 'social',
    subfacet: 'maintenance',
    polarity: 'direct',
    leaning: 'connect',
    difficulty: 'boundary',
    options: 5,
    text: '你很久没联系的老朋友突然发来消息："最近怎么样？"你——',
    optionTexts: [
      '秒回，然后约了周末见面',
      '过了一会儿回，聊了几句',
      '回了"还行"，然后就没下文了',
      '已读不回，假装没看见',
      '怀疑他是不是要借钱'
    ],
    scoring: null
  },
  // ═══ 决策方式维度 ═══
  // 子维度：逻辑依赖
  {
    id: 'decision_01',
    dimension: 'decision',
    subfacet: 'logic',
    polarity: 'reverse',
    leaning: 'rational',
    difficulty: 'easy',
    options: 5,
    text: '两个工作机会摆在面前：A 稳定但无聊，B 有风险但有趣。你做了个 Excel 对比表，然后——',
    optionTexts: [
      '删掉 Excel，选了 B，因为"人生苦短"',
      '发了条朋友圈投票，结果出乎意料',
      '纠结了三天，最后问了五个朋友的意见',
      '选了 A，虽然你知道 B 更有趣',
      '到现在还没选，两个都快过期了'
    ],
    scoring: null
  },
  // 子维度：共情驱动
  {
    id: 'decision_02',
    dimension: 'decision',
    subfacet: 'empathy',
    polarity: 'direct',
    leaning: 'emotional',
    difficulty: 'easy',
    options: 5,
    text: '朋友哭着跟你说她分手了，但你觉得她前男友其实没做错什么。你——',
    optionTexts: [
      '直接告诉她"我觉得你也有问题"',
      '先安慰她，等她情绪好了再说实话',
      '什么都没说，只是陪着她',
      '跟着一起骂前男友，虽然你觉得他挺冤的',
      '给她点了杯奶茶，然后转移话题'
    ],
    scoring: null
  },
  // 子维度：直觉倾向
  {
    id: 'decision_03',
    dimension: 'decision',
    subfacet: 'intuition',
    polarity: 'direct',
    leaning: 'emotional',
    difficulty: 'boundary',
    options: 5,
    text: '你要租一个房子，A 设施好但感觉不对，B 设施一般但你一进门就觉得"就是这里"。你——',
    optionTexts: [
      '选 B，跟着感觉走',
      '两个都不选，继续找',
      '选 A，设施好的实际价值更高',
      '让朋友来帮忙看看，听他们的意见',
      '纠结到合同截止日期过了也没选'
    ],
    scoring: null
  },
  // 子维度：决策焦虑
  {
    id: 'decision_04',
    dimension: 'decision',
    subfacet: 'indecision',
    polarity: 'reverse',
    leaning: 'rational',
    difficulty: 'boundary',
    options: 5,
    text: '你在超市选洗发水，面前有二十多个品牌。你——',
    optionTexts: [
      '随便拿一个，反正都差不多',
      '快速比较了三个，选了性价比最高的',
      '研究了成分表和用户评价，花了四十分钟',
      '最后什么都没买，回家用肥皂洗头',
      '拍了照片发群里让大家帮你选'
    ],
    scoring: null
  },
  // ═══ 效度检查题 ═══
  {
    id: 'validity_01',
    dimension: 'validity',
    subfacet: 'attention',
    polarity: 'direct',
    leaning: 'neutral',
    difficulty: 'easy',
    options: 5,
    text: '为了确认你认真在做，请选择"比较符合"这个选项。',
    optionTexts: [
      '完全不符合',
      '不太符合',
      '说不清',
      '比较符合',
      '完全符合'
    ],
    scoring: {},
    validityCheck: 3
  },
  {
    id: 'validity_02',
    dimension: 'validity',
    subfacet: 'attention',
    polarity: 'direct',
    leaning: 'neutral',
    difficulty: 'easy',
    options: 5,
    text: '以下这道题没有对错，请选择最左边的选项。',
    optionTexts: [
      '选这个',
      '随便选',
      '都可以',
      '无所谓',
      '不选'
    ],
    scoring: {},
    validityCheck: 0
  },
  {
    id: 'validity_03',
    dimension: 'validity',
    subfacet: 'attention',
    polarity: 'direct',
    leaning: 'neutral',
    difficulty: 'easy',
    options: 5,
    text: '这是一道检查题。请选择"说不清"。',
    optionTexts: [
      '完全不符合',
      '不太符合',
      '说不清',
      '比较符合',
      '完全符合'
    ],
    scoring: {},
    validityCheck: 2
  }
];
```

- [ ] **Step 2: 删除旧 questions 数组**

删除从 `const questions = [` 到对应闭合 `];` 的整个旧数组（约 645-1096 行），用上面的 `questionPool` 替换。

- [ ] **Step 3: 更新 scoringConfig**

替换 `scoringConfig` 为新的Likert评分配置：

```javascript
// ── 评分配置（Likert 量表） ────────────────────
const scoringConfig = {
  confidenceThreshold: 1.0,
  maxQuestions: 30,
  minQuestions: 21,
  validityCheckCount: 3,
  dimensions: {
    stress: { min: 0, max: 100 },
    emotion: { min: 0, max: 100 },
    social: { min: 0, max: 100 },
    decision: { min: 0, max: 100 }
  },
  composite: {
    socialAdapt: 0.3,
    mentalHealth: 0.3,
    emotionalStability: 0.2,
    socialHealth: 0.1,
    decisionHealth: 0.1
  }
};
```

- [ ] **Step 4: 验证数据结构**

打开浏览器确认无 JS 报错。在控制台执行：
```javascript
console.log('Pool size:', questionPool.length);
console.log('By dimension:', ['stress','emotion','social','decision','validity'].map(d =>
  d + ': ' + questionPool.filter(q => q.dimension === d).length
));
console.log('By difficulty:', ['easy','boundary','extreme'].map(d =>
  d + ': ' + questionPool.filter(q => q.difficulty === d).length
));
```
Expected: pool 总数 ≥ 19，每个维度有题目，难度分布合理。

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: 重构题库数据结构（带元数据标签）

- 新增 questionPool 替代旧 questions 数组
- 每题含 dimension/subfacet/polarity/leaning/difficulty 标签
- 选项和评分分离为 optionTexts + scoring 数组
- 新增 3 道效度检查题
- 更新 scoringConfig 为Likert评分配置
- 暂用占位题目，后续替换为真实内容

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: 构建Likert评分引擎

**目标：** 实现Likert量表评分、反向计分、置信度计算、维度指数标准化。

**Files:**
- Modify: `index.html:1410-1542`（评分函数区域）

- [ ] **Step 1: 实现Likert评分转换函数**

在评分函数区域添加Likert转换逻辑：

```javascript
// ── Likert 评分引擎 ───────────────────────────
function getLikertScore(optionIndex, question) {
  const n = question.options;
  if (n === 5) {
    // 5 选项：直接对应 1-5
    return optionIndex + 1;
  } else if (n === 6) {
    // 6 选项：极端 = 1/5，中间均匀分布
    const mapping = [1, 2, 2.67, 3.33, 4, 5];
    return mapping[optionIndex];
  } else if (n === 4) {
    // 4 选项：1-4 按比例换算到 1-5
    return (optionIndex) * (4 / 3) + 1;
  }
  return optionIndex + 1;
}

function applyPolarity(score, question) {
  if (question.polarity === 'reverse') {
    const max = question.options === 5 ? 5 : question.options === 6 ? 5 : 5;
    return (max + 1) - score;
  }
  return score;
}
```

- [ ] **Step 2: 实现置信度计算**

```javascript
// ── 置信度计算 ─────────────────────────────────
function calculateConfidence(dimensionAnswers) {
  if (dimensionAnswers.length < 2) return Infinity;
  const mean = dimensionAnswers.reduce((s, v) => s + v, 0) / dimensionAnswers.length;
  const variance = dimensionAnswers.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / dimensionAnswers.length;
  return Math.sqrt(variance);
}
```

- [ ] **Step 3: 实现维度指数标准化**

替换旧的 `calculateDimensionIndex`：

```javascript
function calculateDimensionIndex(answers) {
  if (answers.length === 0) return 50;
  const minPossible = answers.length * 1;
  const maxPossible = answers.length * 5;
  const rawScore = answers.reduce((s, v) => s + v, 0);
  return Math.round(((rawScore - minPossible) / (maxPossible - minPossible)) * 100);
}
```

- [ ] **Step 4: 在控制台验证评分逻辑**

```javascript
// 测试Likert转换
const testQ = { options: 5, polarity: 'direct' };
console.log('5-option scores:', [0,1,2,3,4].map(i => getLikertScore(i, testQ)));
// Expected: [1, 2, 3, 4, 5]

const testQ6 = { options: 6, polarity: 'direct' };
console.log('6-option scores:', [0,1,2,3,4,5].map(i => getLikertScore(i, testQ6)));
// Expected: [1, 2, 2.67, 3.33, 4, 5]

const testQRev = { options: 5, polarity: 'reverse' };
console.log('reverse scores:', [0,1,2,3,4].map(i => applyPolarity(getLikertScore(i, testQRev), testQRev)));
// Expected: [5, 4, 3, 2, 1]

// 测试置信度
console.log('confidence (一致):', calculateConfidence([4, 4, 4, 4]));
// Expected: 0
console.log('confidence (分散):', calculateConfidence([1, 3, 5]));
// Expected: ~1.63
```

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: 实现Likert评分引擎

- getLikertScore() 支持 4/5/6 选项映射
- applyPolarity() 反向计分
- calculateConfidence() 标准差置信度
- calculateDimensionIndex() 标准化到 0-100

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: 构建自适应筛选引擎

**目标：** 实现题库实时筛选、阶段管理、下一题选择逻辑。

**Files:**
- Modify: `index.html`（在评分函数区域之后添加）

- [ ] **Step 1: 定义自适应引擎状态**

```javascript
// ── 自适应引擎状态 ─────────────────────────────
let adaptiveState = {
  phase: 'explore',       // explore | discriminate | confirm | validity | done
  askedQuestions: [],      // 已问过的题 ID
  dimensionAnswers: {      // 每个维度的已答Likert分
    stress: [],
    emotion: [],
    social: [],
    decision: []
  },
  subfacetCoverage: {      // 每个子维度的覆盖情况
    stress: {},
    emotion: {},
    social: {},
    decision: {}
  },
  validityAnswers: [],     // 效度检查答案
  currentDimension: null,  // 当前正在测量的维度
  questionCount: 0         // 已问总题数
};
```

- [ ] **Step 2: 实现阶段判断函数**

```javascript
function determinePhase() {
  const state = adaptiveState;
  if (state.questionCount >= scoringConfig.maxQuestions - scoringConfig.validityCheckCount) {
    return 'validity';
  }
  if (state.questionCount < 8) {
    return 'explore';
  }
  // 检查所有维度置信度
  const allConfident = ['stress', 'emotion', 'social', 'decision'].every(d => {
    return calculateConfidence(state.dimensionAnswers[d]) < scoringConfig.confidenceThreshold
      || state.dimensionAnswers[d].length >= 5;
  });
  if (allConfident) {
    return state.questionCount < scoringConfig.minQuestions ? 'confirm' : 'validity';
  }
  if (state.questionCount >= scoringConfig.minQuestions - scoringConfig.validityCheckCount) {
    return 'confirm';
  }
  return 'discriminate';
}
```

- [ ] **Step 3: 实现维度选择函数**

```javascript
function selectNextDimension() {
  const state = adaptiveState;
  const dimensions = ['stress', 'emotion', 'social', 'decision'];

  // 按置信度排序，优先选置信度低的
  const scored = dimensions.map(d => ({
    dimension: d,
    confidence: calculateConfidence(state.dimensionAnswers[d]),
    count: state.dimensionAnswers[d].length
  }));

  // 探测阶段：轮询各维度
  if (state.phase === 'explore') {
    const leastAsked = scored.sort((a, b) => a.count - b.count)[0];
    return leastAsked.dimension;
  }

  // 区分阶段：选置信度最低的
  if (state.phase === 'discriminate') {
    const leastConfident = scored.sort((a, b) => a.confidence - b.confidence)[0];
    return leastConfident.dimension;
  }

  // 确认阶段：选覆盖度最低的
  if (state.phase === 'confirm') {
    const leastCovered = scored.sort((a, b) => a.count - b.count)[0];
    return leastCovered.dimension;
  }

  return scored[0].dimension;
}
```

- [ ] **Step 4: 实现题目筛选函数**

```javascript
function selectNextQuestion() {
  const state = adaptiveState;
  const phase = determinePhase();
  state.phase = phase;

  // 效度检查阶段
  if (phase === 'validity') {
    const validityQs = questionPool.filter(q =>
      q.dimension === 'validity' && !state.askedQuestions.includes(q.id)
    );
    return validityQs[0] || null;
  }

  const targetDimension = selectNextDimension();
  state.currentDimension = targetDimension;

  // 筛选候选题
  const candidates = questionPool.filter(q => {
    if (q.dimension === 'validity') return false;
    if (state.askedQuestions.includes(q.id)) return false;
    if (q.dimension !== targetDimension) return false;
    return true;
  });

  if (candidates.length === 0) {
    // 该维度题目用完了，换一个维度
    const otherDim = ['stress', 'emotion', 'social', 'decision']
      .find(d => d !== targetDimension);
    state.currentDimension = otherDim;
    return questionPool.find(q =>
      q.dimension === otherDim && !state.askedQuestions.includes(q.id)
    ) || null;
  }

  // 按阶段和优先级排序
  const scored = candidates.map(q => {
    let priority = 0;

    // 优先级 1：未覆盖的子维度
    const coverage = state.subfacetCoverage[targetDimension] || {};
    if (!coverage[q.subfacet]) {
      priority += 100;
    }

    // 优先级 2：难度匹配
    if (phase === 'explore' && q.difficulty === 'easy') priority += 50;
    if (phase === 'discriminate' && q.difficulty === 'boundary') priority += 50;
    if (phase === 'confirm' && q.difficulty === 'extreme') priority += 50;

    // 优先级 3：与当前倾向交叉验证
    const avgScore = state.dimensionAnswers[targetDimension].length > 0
      ? state.dimensionAnswers[targetDimension].reduce((s, v) => s + v, 0) / state.dimensionAnswers[targetDimension].length
      : 3;
    const currentLeaning = avgScore >= 3 ? 'fight' : 'escape';
    // 简化：不一致的题加分（防止偏差累积）
    if (q.leaning !== currentLeaning && q.leaning !== 'neutral') {
      priority += 20;
    }

    return { question: q, priority };
  });

  scored.sort((a, b) => b.priority - a.priority);
  return scored[0].question;
}
```

- [ ] **Step 5: 验证引擎逻辑**

在控制台测试：
```javascript
// 重置状态
adaptiveState = {
  phase: 'explore', askedQuestions: [], dimensionAnswers: { stress: [], emotion: [], social: [], decision: [] },
  subfacetCoverage: { stress: {}, emotion: {}, social: {}, decision: {} },
  validityAnswers: [], currentDimension: null, questionCount: 0
};

// 模拟选择下一题
const q1 = selectNextQuestion();
console.log('First question:', q1.id, q1.dimension, q1.subfacet, q1.difficulty);
// Expected: 某个 easy 难度的探测题

// 模拟答题
adaptiveState.askedQuestions.push(q1.id);
adaptiveState.dimensionAnswers[q1.dimension].push(4);
adaptiveState.subfacetCoverage[q1.dimension][q1.subfacet] = true;
adaptiveState.questionCount = 1;

const q2 = selectNextQuestion();
console.log('Second question:', q2.id, q2.dimension, q2.subfacet, q2.difficulty);
// Expected: 另一个维度的探测题（轮询）
```

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: 实现自适应筛选引擎

- adaptiveState 状态管理
- determinePhase() 阶段判断
- selectNextDimension() 维度选择
- selectNextQuestion() 题目筛选（优先级排序）
- 支持探索/区分/确认/效度四阶段

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: 重写答题流程（接入自适应引擎）

**目标：** 替换旧的固定答题流程，接入自适应引擎，实现动态出题。

**Files:**
- Modify: `index.html:1279-1408`（状态管理 + 答题逻辑）

- [ ] **Step 1: 重写全局状态**

替换旧的状态变量：

```javascript
// ── 状态 ──────────────────────────────────────
let currentQuestion = null;  // 当前题目对象（不再用索引）
let questionCount = 0;       // 已答题数
```

- [ ] **Step 2: 重写 startQuiz**

```javascript
function startQuiz() {
  // 重置自适应引擎
  adaptiveState = {
    phase: 'explore',
    askedQuestions: [],
    dimensionAnswers: { stress: [], emotion: [], social: [], decision: [] },
    subfacetCoverage: { stress: {}, emotion: {}, social: {}, decision: {} },
    validityAnswers: [],
    currentDimension: null,
    questionCount: 0
  };
  questionCount = 0;

  showScreen('question');
  currentQuestion = selectNextQuestion();
  renderQuestion();
}
```

- [ ] **Step 3: 重写 renderQuestion**

```javascript
function renderQuestion() {
  if (!currentQuestion) return;

  const q = currentQuestion;

  // 更新进度（不显示总题数）
  const progressNum = document.getElementById('progress-num');
  progressNum.textContent = '第 ' + (questionCount + 1) + ' 题';

  // 进度条：基于最大题数的估算百分比
  const estimatedProgress = Math.min((questionCount / scoringConfig.maxQuestions) * 100, 95);
  document.getElementById('progress-fill').style.width = estimatedProgress + '%';

  // 题目文本
  document.getElementById('question-text').textContent = q.text;

  // 渲染选项
  const choicesEl = document.getElementById('choices');
  choicesEl.innerHTML = '';

  q.optionTexts.forEach((text, idx) => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.innerHTML = `<span class="letter">〇</span>${text}`;
    btn.addEventListener('click', () => answer(idx));
    choicesEl.appendChild(btn);
  });
}
```

- [ ] **Step 4: 重写 answer 函数**

```javascript
function answer(optionIndex) {
  const q = currentQuestion;

  // 效度检查题处理
  if (q.dimension === 'validity') {
    adaptiveState.validityAnswers.push({
      questionId: q.id,
      expected: q.validityCheck,
      actual: optionIndex
    });
  } else {
    //Likert 评分
    const likertScore = applyPolarity(getLikertScore(optionIndex, q), q);

    // 更新维度答案
    adaptiveState.dimensionAnswers[q.dimension].push(likertScore);

    // 更新子维度覆盖
    if (!adaptiveState.subfacetCoverage[q.dimension]) {
      adaptiveState.subfacetCoverage[q.dimension] = {};
    }
    adaptiveState.subfacetCoverage[q.dimension][q.subfacet] = true;
  }

  // 记录已答
  adaptiveState.askedQuestions.push(q.id);
  adaptiveState.questionCount++;
  questionCount++;

  // 淡出过渡
  const screen = document.getElementById('screen-question');
  screen.style.opacity = '0';
  screen.style.transform = 'translateY(12px)';

  setTimeout(() => {
    // 判断是否结束
    const phase = determinePhase();
    if (phase === 'done' || phase === 'validity' && adaptiveState.askedQuestions.filter(id => id.startsWith('validity')).length >= scoringConfig.validityCheckCount) {
      showResult();
      return;
    }

    // 选下一题
    currentQuestion = selectNextQuestion();
    if (!currentQuestion) {
      showResult();
      return;
    }

    renderQuestion();
    screen.style.opacity = '1';
    screen.style.transform = 'translateY(0)';
  }, 300);
}
```

- [ ] **Step 5: 删除旧的 calculateScores 函数**

旧的 `calculateScores()` 不再需要（评分已在答题时实时累计），删除该函数。

- [ ] **Step 6: 更新 restartQuiz**

```javascript
function restartQuiz() {
  const url = new URL(window.location);
  url.searchParams.delete('r');
  history.replaceState(null, '', url);
  renderIntro();
  showScreen('intro');
}
```

- [ ] **Step 7: 验证流程**

打开浏览器，点击"开始鉴定"：
1. 确认第一题是探测阶段的 easy 题
2. 答完后确认切换到不同维度的题目
3. 确认进度条和"第 X 题"正确更新
4. 确认选项数量根据题目动态变化（5 或 6 个）
5. 答完所有题目后确认跳转到结果页

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat: 重写答题流程（接入自适应引擎）

- startQuiz() 初始化自适应状态
- renderQuestion() 动态渲染选项（支持 4/5/6 选项）
- answer() 实时Likert评分 + 置信度更新
- 进度显示改为"第 X 题"（不显示总数）
- 删除旧的 calculateScores()

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: 重写评分与结果系统

**目标：** 适配新的Likert评分，更新原型映射，处理效度检查结果。

**Files:**
- Modify: `index.html:1490-1542`（showResult + getArchetypeKey）

- [ ] **Step 1: 重写 showResult**

```javascript
function showResult() {
  const state = adaptiveState;

  // 计算各维度指数
  const dimensionIndices = {
    stress: calculateDimensionIndex(state.dimensionAnswers.stress),
    emotion: calculateDimensionIndex(state.dimensionAnswers.emotion),
    social: calculateDimensionIndex(state.dimensionAnswers.social),
    decision: calculateDimensionIndex(state.dimensionAnswers.decision)
  };

  // 计算综合指数
  const compositeScores = calculateCompositeScores(dimensionIndices);
  const overallScore = calculateOverallScore(compositeScores);

  // 确定原型（用维度指数判断方向）
  const archetypeKey = getArchetypeKey(dimensionIndices);
  const archetype = archetypes[archetypeKey];

  // 检查效度
  const validityFailed = checkValidity(state.validityAnswers);

  // 渲染结果页面
  renderResultPage(dimensionIndices, compositeScores, overallScore, archetype, validityFailed);

  // 更新 URL 参数
  setUrlParam('r', archetypeKey);
}
```

- [ ] **Step 2: 重写 getArchetypeKey**

```javascript
function getArchetypeKey(indices) {
  // 检查特殊原型（用原始分判断极端倾向）
  const rawExtreme = (dim) => {
    const answers = adaptiveState.dimensionAnswers[dim];
    if (answers.length === 0) return false;
    const avg = answers.reduce((s, v) => s + v, 0) / answers.length;
    return avg <= 1.5 || avg >= 4.5;
  };

  const rawAllLow = ['stress', 'emotion', 'social', 'decision'].every(d => {
    const answers = adaptiveState.dimensionAnswers[d];
    return answers.length > 0 && answers.reduce((s, v) => s + v, 0) / answers.length <= 1.5;
  });
  const rawAllHigh = ['stress', 'emotion', 'social', 'decision'].every(d => {
    const answers = adaptiveState.dimensionAnswers[d];
    return answers.length > 0 && answers.reduce((s, v) => s + v, 0) / answers.length >= 4.5;
  });

  if (rawAllLow) return 'special_1';
  if (rawAllHigh) return 'special_2';

  // 基础原型映射（用维度指数）
  const key = [
    indices.stress >= 50 ? '1' : '0',
    indices.emotion >= 50 ? '1' : '0',
    indices.social >= 50 ? '1' : '0',
    indices.decision >= 50 ? '1' : '0'
  ].join('');

  return key;
}
```

- [ ] **Step 3: 实现效度检查函数**

```javascript
function checkValidity(validityAnswers) {
  if (validityAnswers.length === 0) return false;
  const incorrect = validityAnswers.filter(a => a.actual !== a.expected);
  return incorrect.length >= 2;
}
```

- [ ] **Step 4: 更新 renderResultPage**

在结果页HTML中添加效度提示（如果需要）：

```javascript
function renderResultPage(dimensionIndices, compositeScores, overallScore, archetype, validityFailed) {
  const validityWarning = validityFailed ? `
    <div class="result-card" style="border-color: var(--vermilion);">
      <div class="result-section">
        <div class="result-label" style="color: var(--vermilion);">⚠ 作答质量提醒</div>
        <div class="result-text">本次作答可能存在随意填写的情况，结果仅供参考。建议重新认真作答一次。</div>
      </div>
    </div>
  ` : '';

  const resultHTML = `
    <div class="result-header">
      <div class="corner-seal">已鑒</div>
      <div class="result-type">${archetype.typeCode}</div>
      <div class="result-name">${archetype.name}</div>
      <div class="result-subtitle">${archetype.subtitle}</div>
    </div>

    ${validityWarning}

    <div class="result-card">
      <div class="result-section">
        <div class="result-label">灵魂肖像</div>
        <div class="result-text">${archetype.desc}</div>
      </div>
      <div class="result-section">
        <div class="result-label">人生指引</div>
        <div class="result-text">${archetype.guidance}</div>
      </div>
      <div class="result-section">
        <div class="result-label">哲思</div>
        <div class="result-text" style="font-style:italic">"${archetype.insight}"</div>
      </div>
    </div>

    <div class="result-card">
      <div class="result-section">
        <div class="result-label">维度分析</div>
        ${renderDimensionBars(dimensionIndices)}
      </div>
    </div>

    <div class="result-card">
      <div class="result-section">
        <div class="result-label">综合指数</div>
        ${renderCompositeScores(compositeScores, overallScore)}
      </div>
    </div>

    <button class="btn btn-restart" onclick="restartQuiz()">重新测试</button>

    <div class="share-section">
      <div class="share-title">─── 分享你的结果 ───</div>
      <div class="share-buttons">
        <button class="btn-share" onclick="copyShareLink()">复制链接</button>
        <button class="btn-share" onclick="generateShareImage()">保存图片</button>
      </div>
    </div>
  `;
  document.getElementById('screen-result').innerHTML = resultHTML;
  showScreen('result');
}
```

- [ ] **Step 5: 验证结果流程**

完成一次完整测试，确认：
1. 维度指数正确计算（0-100）
2. 原型正确映射
3. 效度检查题被正确识别
4. 结果页正常显示

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: 重写评分与结果系统

- showResult() 从 adaptiveState 实时评分
- getArchetypeKey() 基于维度指数 + 特殊原型
- checkValidity() 效度检查
- renderResultPage() 新增效度提示
- 适配Likert评分的维度指数计算

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: 更新 Intro 页面文案

**目标：** 更新介绍页，反映新的专业框架和自适应机制。

**Files:**
- Modify: `index.html:1313-1330`（renderIntro 函数）

- [ ] **Step 1: 更新 renderIntro**

```javascript
function renderIntro() {
  const introHTML = `
    <div class="intro-content">
      <div class="corner-seal">鑒定</div>
      <div class="symbol">🖋</div>
      <h1>精神状态鉴定中心</h1>
      <p class="dateline">本中心受理诸君精神之鉴定 · 基于人格心理学框架 · 定其原型</p>
      <p class="subtitle">
        本测试基于大五人格心理学框架设计。<br>
        题目数量因人而异，系统会根据你的回答动态调整。<br>
        做完之后你可能觉得自己被看穿了。<br>
        这很正常。这不是你疯了。是世界疯了。
      </p>
      <button class="btn" onclick="startQuiz()">开始鉴定</button>
    </div>
  `;
  document.getElementById('screen-intro').innerHTML = introHTML;
}
```

- [ ] **Step 2: 验证**

打开浏览器确认 intro 页面文案正确显示。

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: 更新 intro 页面文案

反映大五人格框架和自适应出题机制。

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: 适配分享图片生成

**目标：** 确保 generateShareImage() 在新评分系统下正常工作。

**Files:**
- Modify: `index.html:1621-1780`（generateShareImage 函数）

- [ ] **Step 1: 检查 generateShareImage 依赖**

当前 `generateShareImage()` 从 DOM 读取 `.result-name`、`.result-type`、`.result-subtitle`、`.result-text` 等元素。由于 `renderResultPage` 仍然渲染这些元素，理论上不需要修改。

验证方法：完成一次测试，点击"保存图片"，确认图片生成正常。

- [ ] **Step 2: 如需修改，更新数据读取逻辑**

如果 DOM 选择器不匹配，更新为从 `adaptiveState` 和 `archetypes` 直接读取数据，而不是从 DOM 读取。

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "fix: 适配分享图片生成到新评分系统

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: 端到端测试与修复

**目标：** 完整流程测试，修复所有发现的问题。

**Files:**
- Modify: `index.html`（按需修复）

- [ ] **Step 1: 完整流程测试**

打开浏览器执行以下测试场景：

1. **正常流程**：点击"开始鉴定" → 答完所有题目 → 查看结果 → 确认原型正确
2. **URL 分享**：完成测试后复制链接 → 新标签打开 → 确认直接展示结果
3. **重新测试**：点击"重新测试" → 确认回到 intro → 再次测试 → 确认结果可能不同
4. **效度检查**：故意乱答（全选第一个选项） → 确认结果页出现效度提醒
5. **极端回答**：全部选第一个选项（最抗争） → 确认可能触发特殊原型

- [ ] **Step 2: 修复发现的问题**

记录并修复测试中发现的所有问题。

- [ ] **Step 3: 最终 Commit**

```bash
git add index.html
git commit -m "fix: 修复端到端测试发现的问题

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 10: 替换占位题目为真实内容

**目标：** 将题库中的占位题目替换为完整的40道鲁迅风格情境题，严格对齐子维度结构。

**Files:**
- Modify: `index.html`（questionPool 数组）

**核心约束（每道题必须满足）：**
- 风格：鲁迅黑色幽默情境题，有具体场景、有画面感、有荒诞感，简体白话
- 选项：5 或 6 个，从"最符合"到"最不符合"的连续谱，选项之间有明显的倾向梯度
- 极性：direct（选项 1 = 最高分）或 reverse（选项 1 = 最低分），每个维度至少 1 道 reverse
- 难度：easy（日常场景，容易判断）/ boundary（边界情况，需要思考）/ extreme（极端场景，测极限）
- ID 格式：`{dimension}_{序号}`，如 `stress_01`

### 维度一：压力应对（抗争 vs 逃避）

**测量目标**：面对社会压力时，你是选择迎难而上还是躺平逃避。

#### 子维度 1.1：焦虑倾向（神经质 → 焦虑）

| 属性 | 要求 |
|------|------|
| 场景方向 | 工作deadline、突发状况、被要求表态、等待结果 |
| 测量什么 | 面对不确定性时的焦虑程度 |
| 选项梯度 | 从"完全淡定"到"彻底崩溃" |
| 题数 | 3 题（至少 1 题 reverse） |
| leaning | escape（焦虑高 = 逃避） |

**easy 题示例（已有）**：
> 「你的老板在凌晨三点发了一条消息："在吗？"你的第一反应是？」
> 1. 立刻回复，然后通宵完成任务  2. 回复"在的"，然后继续睡觉  3. 假装没看见，明天再说  4. 打开招聘软件看了一眼  5. 把老板拉黑，然后继续睡觉

**boundary 题方向**：更模糊的场景，如"你不确定老板对你的工作是否满意"、"面试后等通知的那几天"

**reverse 题方向**：选项顺序反转，如"你完全不焦虑，但身边人都觉得你应该焦虑"

#### 子维度 1.2：压力韧性（神经质 → 压力敏感）

| 属性 | 要求 |
|------|------|
| 场景方向 | 被批评、被甩锅、项目失败、被人针对 |
| 测量什么 | 能承受多大的压力而不崩溃 |
| 选项梯度 | 从"完全扛得住"到"当场崩溃" |
| 题数 | 3 题 |
| leaning | fight（韧性高 = 抗争） |

**easy 题示例（已有）**：
> 「你被同事甩锅了，你？」
> 1. 当面指出问题，要求道歉  2. 私下找同事沟通  3. 算了，不计较  4. 在朋友圈发阴阳怪气的内容  5. 越级汇报

**boundary 题方向**：更大的压力源，如"你的项目被全员否定"、"领导当众批评你的方案"

**extreme 题方向**：极端压力场景，如"连续加班一个月后被告知项目取消"、"被最信任的同事背叛"

#### 子维度 1.3：行动力（尽责性 → 自律）

| 属性 | 要求 |
|------|------|
| 场景方向 | 目标设定、计划执行、拖延 vs 主动 |
| 测量什么 | 压力下是否主动应对，还是等待/拖延 |
| 选项梯度 | 从"立刻行动"到"完全不动" |
| 题数 | 2 题 |
| leaning | fight（行动力高 = 抗争） |

**easy 题示例（已有）**：
> 「你的年度目标清单上大概有多少条？」
> 1. 四十七条。每一条都有详细的子任务和甘特图  2. 五条左右，大概知道方向就行  3. 年度目标？我一般只设置"本周目标"——活到周五  4. 没有目标。目标是资本主义的陷阱  5. 有目标，但从没完成过

**boundary 题方向**：需要持续投入的场景，如"你开始健身/学英语/读书，坚持了多久？"

#### 子维度 1.4：回避倾向（神经质 → 冲动性，reverse）

| 属性 | 要求 |
|------|------|
| 场景方向 | 面对不想做的事、需要拒绝的场合、冲突回避 |
| 测量什么 | 是否倾向于逃避责任和冲突 |
| 选项梯度 | 从"完全面对"到"彻底逃避" |
| 题数 | 2 题（至少 1 题 reverse） |
| leaning | escape（回避高 = 逃避） |
| **注意** | 此子维度的题目多为 reverse 极性，选项 1 = 最不回避 |

**reverse 题示例（已有）**：
> 「你有一个重要的任务明天要交。现在是晚上十点，你的进度是？」
> 1. 已经完成了，还在检查细节  2. 大概完成了百分之八十  3. 还没开始，但列了详细计划  4. 刚开始，准备通宵  5. 完全没动，正在刷手机
> （注意：此题为 reverse，选项 1 反而是最低分）

**boundary 题方向**：需要拒绝别人的场景，如"朋友找你帮忙但你不想帮"、"被邀请参加不想去的活动"

---

### 维度二：情绪管理（压抑 vs 宣泄）

**测量目标**：面对负面情绪时，你是选择默默承受还是爆发出来。

#### 子维度 2.1：情绪觉察（开放性 → 感受性）

| 属性 | 要求 |
|------|------|
| 场景方向 | 被冒犯、受委屈、内心波动的时刻 |
| 测量什么 | 能否意识到并承认自己的情绪 |
| 选项梯度 | 从"完全感知并表达"到"完全麻木/否认" |
| 题数 | 3 题 |
| leaning | vent（觉察高 = 宣泄） |

**easy 题示例（已有）**：
> 「朋友当众开了一个让你很难堪的玩笑。饭桌上所有人都在笑。你——」
> 1. 完全不当回事，甚至还接了个梗  2. 假装不在意，回去之后越想越气  3. 当场怼回去，管他是不是朋友  4. 假装没听见，但整晚都没再说话  5. 散场后发了条朋友圈，仅他可见

**boundary 题方向**：更微妙的情绪场景，如"你不确定自己是在生气还是在伤心"、"别人说你'太敏感了'"

**extreme 题方向**：强烈情绪冲击，如"发现被最好的朋友在背后说坏话"

#### 子维度 2.2：情绪抑制（神经质 → 冲动性，reverse）

| 属性 | 要求 |
|------|------|
| 场景方向 | 吵架后、受委屈后、需要冷静的时刻 |
| 测量什么 | 是否压抑情绪不表达 |
| 选项梯度 | 从"完全压抑"到"完全释放" |
| 题数 | 3 题（至少 1 题 reverse） |
| leaning | suppress（抑制高 = 压抑） |
| **注意** | 此子维度多为 reverse 极性 |

**reverse 题示例（已有）**：
> 「你刚和伴侣吵完架，对方摔门进了卧室。客厅只剩你一个人。你——」
> 1. 坐在沙发上，把刚才的对话在脑子里过了二十遍  2. 打开电视，试图用别人的故事盖住自己的  3. 走到阳台抽了根烟，感觉好多了  4. 推门进去说"我们谈谈"  5. 开始收拾行李
> （注意：此题为 reverse，选项 1 反而是最低分）

**boundary 题方向**：需要在人前保持冷静的场景，如"被领导骂了但不能表现出来"、"在同事面前被羞辱"

#### 子维度 2.3：情绪释放（开放性 → 幻想）

| 属性 | 要求 |
|------|------|
| 场景方向 | 回到家后、独处时、需要发泄的时刻 |
| 测量什么 | 是否通过外在方式宣泄情绪 |
| 选项梯度 | 从"完全释放"到"完全压抑" |
| 题数 | 2 题 |
| leaning | vent（释放高 = 宣泄） |

**boundary 题示例（已有）**：
> 「你今天过得很糟糕。回到家关上门后，你——」
> 1. 躺在床上，什么都不想做  2. 打开音乐，把音量调到最大  3. 给朋友发了一大段消息吐槽  4. 打开备忘录，写了一篇三千字的日记  5. 点了一份外卖，用食物填补空虚

**easy 题方向**：日常小挫折后的反应，如"被外卖小哥骂了"、"地铁上被人踩了一脚"

#### 子维度 2.4：情绪稳定性（神经质 → 情绪性）

| 属性 | 要求 |
|------|------|
| 场景方向 | 日常小事引发的情绪波动 |
| 测量什么 | 情绪波动幅度——是"一点就着"还是"波澜不惊" |
| 选项梯度 | 从"完全平静"到"情绪剧烈波动" |
| 题数 | 2 题（至少 1 题 reverse） |
| leaning | suppress（稳定性高 = 压抑） |

**boundary 题示例（已有）**：
> 「你在地铁上被人踩了一脚，对方没道歉。你的内心活动是？」
> 1. 算了，可能他也不是故意的  2. 有点不爽，但很快就忘了  3. 气死了，但忍住了  4. 一整天都在想这件事  5. 截图发朋友圈，配文"今天遇到一个没素质的人"

**extreme 题方向**：连续小事累积的情绪崩溃，如"丢了钥匙 + 迟到 + 被骂，你会怎样？"

---

### 维度三：社交模式（疏离 vs 连接）

**测量目标**：面对人际关系时，你是选择独处还是与人连接。

#### 子维度 3.1：社交能量（外向性 → 热情）

| 属性 | 要求 |
|------|------|
| 场景方向 | 聚会、团建、社交活动、与陌生人相处 |
| 测量什么 | 社交后感到充电还是耗电 |
| 选项梯度 | 从"完全享受"到"完全消耗" |
| 题数 | 3 题（至少 1 题 reverse） |
| leaning | connect（能量高 = 连接） |

**easy 题示例（已有）**：
> 「周末，同事群有人提议聚餐。你看了看消息，然后——」
> 1. 立刻回复"去！"，已经开始想穿什么  2. 犹豫了五分钟，最后说"看情况"  3. 把消息标记已读，假装没看见  4. 开启免打扰，继续躺在沙发上  5. 回复"去"，然后开始焦虑穿什么

**boundary 题方向**：更消耗的社交场景，如"连续三天都有社交活动"、"被拉进一个全是陌生人的群"

**reverse 题方向**：看起来应该享受但其实消耗的场景，如"朋友的婚礼你当伴郎/伴娘"

#### 子维度 3.2：信任倾向（宜人性 → 信任）

| 属性 | 要求 |
|------|------|
| 场景方向 | 新认识的人、需要敞开心扉的场合、被求助 |
| 测量什么 | 是否愿意向他人敞开心扉 |
| 选项梯度 | 从"完全信任"到"完全防备" |
| 题数 | 3 题 |
| leaning | connect（信任高 = 连接） |

**easy 题示例（已有）**：
> 「新来的同事主动找你聊天，你——」
> 1. 热情回应，午饭就一起去吃了  2. 礼貌回应，但保持距离  3. 觉得他可能有所图  4. 聊了几句就找借口离开了  5. 直接问他"你是不是有什么事？"

**boundary 题方向**：需要深层信任的场景，如"同事向你倾诉秘密"、"被请求借一大笔钱"

**extreme 题方向**：信任被考验的场景，如"发现朋友在背后议论你"

#### 子维度 3.3：孤独耐受（外向性 → 合群性，reverse）

| 属性 | 要求 |
|------|------|
| 场景方向 | 独处、被排除、没有社交的日子 |
| 测量什么 | 独处时的舒适度 |
| 选项梯度 | 从"完全享受独处"到"完全无法忍受" |
| 题数 | 2 题 |
| leaning | isolate（耐受高 = 疏离） |
| **注意** | 此子维度多为 reverse 极性 |

**reverse 题示例（已有）**：
> 「你已经连续三天没有和任何人说过话了。你——」
> 1. 终于！这才是理想的生活  2. 有点舒服，但开始觉得哪里不对  3. 没什么感觉  4. 开始有点慌了，想找人说话  5. 立刻约了朋友出来，不管对方有没有空
> （注意：此题为 reverse，选项 1 = 最不连接）

**boundary 题方向**：被迫独处的场景，如"被朋友放鸽子后一个人"、"搬新城市第一个周末"

#### 子维度 3.4：关系维护（宜人性 → 顺从）

| 属性 | 要求 |
|------|------|
| 场景方向 | 主动联系朋友、维系关系、回应他人 |
| 测量什么 | 是否主动维系关系 |
| 选项梯度 | 从"主动热情"到"完全被动" |
| 题数 | 2 题（至少 1 题 reverse） |
| leaning | connect（维护高 = 连接） |

**boundary 题示例（已有）**：
> 「你很久没联系的老朋友突然发来消息："最近怎么样？"你——」
> 1. 秒回，然后约了周末见面  2. 过了一会儿回，聊了几句  3. 回了"还行"，然后就没下文了  4. 已读不回，假装没看见  5. 怀疑他是不是要借钱

**easy 题方向**：日常关系维护，如"朋友生日你会怎么做"、"有人给你朋友圈点赞你会回吗"

---

### 维度四：决策方式（理性 vs 感性）

**测量目标**：面对选择时，你是依赖逻辑分析还是跟着感觉走。

#### 子维度 4.1：逻辑依赖（开放性 → 概念化，reverse）

| 属性 | 要求 |
|------|------|
| 场景方向 | 重大选择、需要权衡利弊的场合 |
| 测量什么 | 决策时是否依赖逻辑分析 |
| 选项梯度 | 从"完全跟着感觉"到"完全依赖逻辑" |
| 题数 | 3 题（至少 1 题 reverse） |
| leaning | rational（逻辑高 = 理性） |
| **注意** | 此子维度多为 reverse 极性 |

**reverse 题示例（已有）**：
> 「两个工作机会摆在面前：A 稳定但无聊，B 有风险但有趣。你做了个 Excel 对比表，然后——」
> 1. 删掉 Excel，选了 B，因为"人生苦短"  2. 发了条朋友圈投票，结果出乎意料  3. 纠结了三天，最后问了五个朋友的意见  4. 选了 A，虽然你知道 B 更有趣  5. 到现在还没选，两个都快过期了
> （注意：此题为 reverse，选项 1 = 最不理性）

**boundary 题方向**：逻辑和感觉冲突的场景，如"数据说选A但你觉得选B"、"理性告诉你放弃但感情上放不下"

**extreme 题方向**：纯理性 vs 纯感性的极端选择，如"伴侣和工作机会在不同城市"

#### 子维度 4.2：共情驱动（宜人性 → 利他）

| 属性 | 要求 |
|------|------|
| 场景方向 | 他人的情绪影响你的决定、需要共情的场合 |
| 测量什么 | 是否因他人感受而改变决定 |
| 选项梯度 | 从"完全被他人情绪左右"到"完全不受影响" |
| 题数 | 3 题 |
| leaning | emotional（共情感高 = 感性） |

**easy 题示例（已有）**：
> 「朋友哭着跟你说她分手了，但你觉得她前男友其实没做错什么。你——」
> 1. 直接告诉她"我觉得你也有问题"  2. 先安慰她，等她情绪好了再说实话  3. 什么都没说，只是陪着她  4. 跟着一起骂前男友，虽然你觉得他挺冤的  5. 给她点了杯奶茶，然后转移话题

**boundary 题方向**：需要在他人感受和正确判断之间选择的场景，如"同事的方案明显有问题但他在 presentation"

**extreme 题方向**：深度共情消耗的场景，如"朋友向你倾诉了非常沉重的事情"

#### 子维度 4.3：直觉倾向（开放性 → 幻想）

| 属性 | 要求 |
|------|------|
| 场景方向 | 凭感觉做决定、相信"缘分"、第六感 |
| 测量什么 | 是否相信"感觉对了" |
| 选项梯度 | 从"完全凭直觉"到"完全不信直觉" |
| 题数 | 2 题 |
| leaning | emotional（直觉高 = 感性） |

**boundary 题示例（已有）**：
> 「你要租一个房子，A 设施好但感觉不对，B 设施一般但你一进门就觉得"就是这里"。你——」
> 1. 选 B，跟着感觉走  2. 两个都不选，继续找  3. 选 A，设施好的实际价值更高  4. 让朋友来帮忙看看，听他们的意见  5. 纠结到合同截止日期过了也没选

**easy 题方向**：日常直觉场景，如"第一眼就喜欢/不喜欢一个人"、"某件事就是觉得不对劲"

#### 子维度 4.4：决策焦虑（神经质 → 犹豫，reverse）

| 属性 | 要求 |
|------|------|
| 场景方向 | 选择困难、反复纠结、后悔已做的决定 |
| 测量什么 | 是否反复纠结于选择 |
| 选项梯度 | 从"完全不纠结"到"完全无法决定" |
| 题数 | 2 题 |
| leaning | rational（焦虑低 = 理性） |
| **注意** | 此子维度多为 reverse 极性 |

**boundary 题示例（已有）**：
> 「你在超市选洗发水，面前有二十多个品牌。你——」
> 1. 随便拿一个，反正都差不多  2. 快速比较了三个，选了性价比最高的  3. 研究了成分表和用户评价，花了四十分钟  4. 最后什么都没买，回家用肥皂洗头  5. 拍了照片发群里让大家帮你选

**easy 题方向**：日常小选择的纠结，如"中午吃什么"、"买红色还是蓝色"

---

### 出题后的验证检查

完成所有题目编写后，执行以下验证：

```javascript
// 验证 1：每个子维度至少 2 题
Object.keys(subfacets).forEach(dim => {
  subfacets[dim].forEach(sf => {
    const count = questionPool.filter(q => q.dimension === dim && q.subfacet === sf.id).length;
    console.log(`${dim}/${sf.id}: ${count} questions`);
    if (count < 2) console.warn(`  ⚠ 题目不足！需要至少 2 题`);
  });
});

// 验证 2：难度分布
['easy', 'boundary', 'extreme'].forEach(d => {
  const count = questionPool.filter(q => q.difficulty === d && q.dimension !== 'validity').length;
  console.log(`${d}: ${count} questions`);
});

// 验证 3：每个维度至少 1 道 reverse
['stress', 'emotion', 'social', 'decision'].forEach(dim => {
  const revCount = questionPool.filter(q => q.dimension === dim && q.polarity === 'reverse').length;
  console.log(`${dim} reverse: ${revCount}`);
  if (revCount < 1) console.warn(`  ⚠ ${dim} 缺少 reverse 题！`);
});

// 验证 4：选项数量一致性
questionPool.filter(q => q.dimension !== 'validity').forEach(q => {
  if (q.optionTexts.length !== q.options) {
    console.warn(`  ⚠ ${q.id}: options=${q.options} but optionTexts.length=${q.optionTexts.length}`);
  }
});

// 验证 5：总题数
const total = questionPool.filter(q => q.dimension !== 'validity').length;
console.log(`Total questions: ${total}`);
if (total < 36) console.warn(`  ⚠ 题目不足 36 题！`);
```

- [ ] **Step 1: 编写压力应对维度题目（10 题）**

参照上方"维度一"的子维度指南，编写 10 题。每题严格填写 id、dimension、subfacet、polarity、leaning、difficulty、options、text、optionTexts、scoring(null)。

- [ ] **Step 2: 编写情绪管理维度题目（10 题）**

参照上方"维度二"的子维度指南。

- [ ] **Step 3: 编写社交模式维度题目（10 题）**

参照上方"维度三"的子维度指南。

- [ ] **Step 4: 编写决策方式维度题目（10 题）**

参照上方"维度四"的子维度指南。

- [ ] **Step 5: 运行验证脚本**

在浏览器控制台执行上方的验证脚本，确认所有检查通过。

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: 替换占位题目为完整40道情境题

- 压力应对 10 题（4 子维度，含 reverse）
- 情绪管理 10 题（4 子维度，含 reverse）
- 社交模式 10 题（4 子维度，含 reverse）
- 决策方式 10 题（4 子维度，含 reverse）
- 鲁迅黑色幽默风格，5/6 选项
- 覆盖 easy/boundary/extreme 三种难度
- 通过全部验证检查

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## 实施顺序

| Task | 内容 | 依赖 | 估计步数 |
|------|------|------|---------|
| 1 | 子维度配置 | 无 | 3 |
| 2 | 题库数据结构 | Task 1 | 5 |
| 3 |Likert评分引擎 | 无 | 5 |
| 4 | 自适应筛选引擎 | Task 2, 3 | 6 |
| 5 | 答题流程重写 | Task 4 | 8 |
| 6 | 评分与结果系统 | Task 3, 5 | 6 |
| 7 | Intro 文案更新 | 无 | 3 |
| 8 | 分享图片适配 | Task 6 | 3 |
| 9 | 端到端测试 | Task 5-8 | 3 |
| 10 | 真实题目内容 | Task 2 | 6 |

**注意：** Task 7 可与任何任务并行。Task 10 可在 Task 2 完成后立即开始，与其他任务并行。
