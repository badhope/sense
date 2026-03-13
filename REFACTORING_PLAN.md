# Pathogen Inc. 文字互动游戏重构计划

## 文档版本信息

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-13 | CodeCritic | 初始版本 |

---

## 目录

1. [执行摘要](#1-执行摘要)
2. [项目范围](#2-项目范围)
3. [技术架构](#3-技术架构)
4. [内容结构](#4-内容结构)
5. [实施时间表](#5-实施时间表)
6. [质量保证框架](#6-质量保证框架)
7. [附录](#7-附录)

---

## 1. 执行摘要

### 1.1 项目背景

Pathogen Inc. 当前是一款图形化的策略模拟网页游戏，类似《瘟疫公司》。项目包含完整的前端 UI 系统、世界地图可视化、病原体进化系统等核心功能。

### 1.2 重构目标

将现有图形化游戏改造为**专业级文字互动游戏**，核心转变包括：

- **视觉呈现**：从图形界面 → 文字描述 + ASCII 艺术 + 简约 UI
- **交互方式**：从点击按钮 → 文字选择 + 命令行式输入
- **叙事深度**：从简单提示 → 分支剧情 + 深度叙事 + 角色互动
- **系统架构**：从单体结构 → 模块化 + 数据驱动 + 可扩展

### 1.3 商业价值

- **降低开发成本**：无需美术资源，减少 70% 开发时间
- **提升可访问性**：支持屏幕阅读器，符合无障碍标准
- **增强叙事性**：深度剧情提升用户沉浸感和留存率
- **快速迭代**：内容更新无需重新编译，支持热加载

### 1.4 关键成果

1. 完整的文字互动游戏引擎
2. 可扩展的叙事框架系统
3. 模块化架构，支持多平台部署
4. 专业的测试和质量保证体系

---

## 2. 项目范围

### 2.1 核心游戏机制定义

#### 2.1.1 保留的核心机制

| 机制 | 描述 | 重构方式 |
|------|------|----------|
| 病原体选择 | 5 种病原体类型，各有独特属性 | 文字描述 + 属性面板 |
| 进化系统 | 传播途径、症状、能力强化 | 树状升级菜单 + 文字描述 |
| 全球感染 | 25 个国家，人口统计 | 文字报告 + 数据表格 |
| 回合制推进 | 时间流逝，感染扩散 | 文字日志 + 进度报告 |
| 人类应对 | 疫苗研发、封锁措施 | 新闻播报 + 事件系统 |

#### 2.1.2 新增的核心机制

| 机制 | 描述 | 优先级 |
|------|------|--------|
| 分支叙事系统 | 玩家选择影响剧情走向 | P0 |
| 角色互动系统 | 与科学家、政客、医生对话 | P0 |
| 道德抉择系统 | 影响游戏结局的伦理选择 | P1 |
| 多结局系统 | 根据游戏进程解锁不同结局 | P1 |
| 成就系统 | 记录玩家里程碑 | P2 |
| 日记系统 | 病原体视角的内心独白 | P2 |

#### 2.1.3 游戏循环设计

```
┌─────────────────────────────────────────────────────────┐
│                    游戏主循环                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  │ 回合开始 │───>│ 事件触发 │───>│ 玩家选择 │         │
│  └──────────┘    └──────────┘    └──────────┘         │
│       ^                               │                 │
│       │                               ▼                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  │ 状态更新 │<───│ 结果计算 │<───│ 剧情推进 │         │
│  └──────────┘    └──────────┘    └──────────┘         │
│       │                                               │
│       ▼                                               │
│  ┌──────────────────────────────────────────┐         │
│  │          检查胜利/失败条件               │         │
│  └──────────────────────────────────────────┘         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.2 现有功能重构清单

#### 2.2.1 需要重构的模块

| 模块 | 当前状态 | 重构目标 | 复杂度 |
|------|----------|----------|--------|
| `game.js` | 游戏核心逻辑 | 文字游戏引擎 | 高 |
| `pathogen.js` | 病原体数据 | 病原体状态机 | 中 |
| `country.js` | 国家数据 | 国家事件系统 | 中 |
| `ui.js` | 图形界面 | 文字终端界面 | 高 |
| `story.js` | 简单剧情 | 分支叙事引擎 | 高 |
| `save.js` | 存档系统 | 序列化/反序列化 | 低 |
| `sound.js` | 音效播放 | 可选音频支持 | 低 |

#### 2.2.2 需要移除的模块

| 模块 | 移除原因 | 替代方案 |
|------|----------|----------|
| 世界地图可视化 | 与文字游戏定位不符 | ASCII 地图 + 文字描述 |
| CSS 动画效果 | 过度依赖视觉 | 文字过渡效果 |
| Font Awesome 图标 | 外部依赖 | Unicode 字符 + Emoji |
| 响应式布局 | 移动端优化 | 自适应文字排版 |

### 2.3 明确排除在范围外的内容

| 排除项 | 理由 | 未来可能性 |
|--------|------|------------|
| 多人在线模式 | 超出项目范围，增加复杂度 | 第二阶段考虑 |
| 图形化重制 | 违背文字游戏核心理念 | 不考虑 |
| VR/AR 支持 | 技术不成熟，成本高 | 不考虑 |
| 移动端原生应用 | Web 版本优先 | 第三阶段考虑 |
| AI 生成剧情 | 质量不可控 | 技术成熟后考虑 |

### 2.4 目标平台规格

#### 2.4.1 浏览器兼容性

| 浏览器 | 最低版本 | 推荐版本 | 支持级别 |
|--------|----------|----------|----------|
| Chrome | 80 | 最新 | 完全支持 |
| Firefox | 75 | 最新 | 完全支持 |
| Safari | 13 | 最新 | 完全支持 |
| Edge | 80 | 最新 | 完全支持 |
| IE 11 | - | - | **不支持** |

#### 2.4.2 设备兼容性

| 设备类型 | 屏幕尺寸 | 支持级别 | 备注 |
|----------|----------|----------|------|
| 桌面电脑 | ≥1024px | 完全支持 | 最佳体验 |
| 平板电脑 | 768-1023px | 完全支持 | 自适应布局 |
| 手机 | <768px | 完全支持 | 简化 UI |
| 屏幕阅读器 | - | 完全支持 | WCAG 2.1 AA |

#### 2.4.3 性能要求

| 指标 | 目标值 | 最低要求 |
|------|--------|----------|
| 首屏加载时间 | <1s | <3s |
| 交互响应时间 | <100ms | <300ms |
| 内存占用 | <50MB | <100MB |
| 包体积 | <500KB | <1MB |

---

## 3. 技术架构

### 3.1 模块化系统设计

#### 3.1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      表现层 (Presentation Layer)            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ TextRenderer│  │ InputHandler│  │ SoundManager│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      业务逻辑层 (Business Logic)            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ GameEngine  │  │ StoryEngine │  │ ChoiceSystem│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ PathogenSys │  │ CountrySys  │  │ EventSystem │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据访问层 (Data Access Layer)         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ SaveManager │  │ DataManager │  │ ConfigLoader│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据存储层 (Storage Layer)             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ LocalStorage│  │ JSON Files  │  │ Session Cache       │ │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

#### 3.1.2 模块职责划分

| 模块 | 职责 | 依赖关系 |
|------|------|----------|
| **TextRenderer** | 渲染文字内容、格式化输出、ANSI 颜色 | 无 |
| **InputHandler** | 处理用户输入、命令解析、验证 | TextRenderer |
| **GameEngine** | 游戏主循环、状态管理、规则执行 | 所有系统模块 |
| **StoryEngine** | 叙事流程、分支管理、剧情触发 | DataManager |
| **ChoiceSystem** | 选择项生成、后果计算、道德评判 | StoryEngine, GameEngine |
| **PathogenSystem** | 病原体状态、进化树、能力计算 | GameEngine |
| **CountrySystem** | 国家状态、感染传播、人类应对 | GameEngine, EventSystem |
| **EventSystem** | 随机事件、新闻生成、剧情推进 | StoryEngine |
| **SaveManager** | 存档/读档、序列化、版本管理 | 所有模块 |
| **DataManager** | 数据加载、缓存管理、资源配置 | ConfigLoader |
| **ConfigLoader** | 配置文件解析、环境变量、常量定义 | 无 |

### 3.2 叙事数据结构规范

#### 3.2.1 剧情节点数据结构

```javascript
{
  "id": "string",                    // 唯一标识符
  "type": "enum",                    // 节点类型：start/event/choice/ending
  "title": "string",                 // 节点标题
  "content": "string",               // 主要文本内容（支持 Markdown）
  "requirements": {                  // 前置条件
    "minTurn": "number",             // 最小回合数
    "maxTurn": "number",             // 最大回合数
    "infectedRate": "number",        // 感染率阈值
    "hasSymptom": "string[]",        // 需要的症状
    "notHasSymptom": "string[]",     // 不能有的症状
    "countries": "string[]",         // 特定国家
    "previousChoices": "string[]"    // 之前的选择
  },
  "choices": [                       // 玩家选择项
    {
      "id": "string",
      "text": "string",              // 显示文本
      "description": "string",       // 详细描述（可选）
      "requirements": {},            // 选择前置条件
      "consequences": {              // 后果
        "dnaChange": "number",       // DNA 点数变化
        "infectBonus": "number",     // 感染加成
        "lethalityChange": "number", // 致命性变化
        "cureProgress": "number",    // 疫苗进度影响
        "panicLevel": "number",      // 恐慌等级
        "nextNode": "string",        // 下一节点 ID
        "unlockNodes": "string[]",   // 解锁的节点
        "lockNodes": "string[]",     // 锁定的节点
        "triggerEvents": "string[]"  // 触发的事件
      }
    }
  ],
  "effects": {                       // 节点效果
    "global": {},                    // 全局效果
    "temporary": []                  // 临时效果
  },
  "metadata": {                      // 元数据
    "author": "string",              // 作者
    "version": "string",             // 版本
    "tags": ["string"],              // 标签
    "weight": "number"               // 权重（用于随机选择）
  }
}
```

#### 3.2.2 分支剧情可视化表示

```
开始节点 (START)
    │
    ├─> 事件节点 A (疫情爆发)
    │       │
    │       ├─> 选择节点 A1 (低调传播) ──> 剧情线 A
    │       │       │
    │       │       └─> 结局节点 A1-1 (缓慢胜利)
    │       │
    │       └─> 选择节点 A2 (快速变异) ──> 剧情线 B
    │               │
    │               ├─> 结局节点 B-1 (迅速胜利)
    │               └─> 结局节点 B-2 (被疫苗击败)
    │
    └─> 事件节点 B (被发现)
            │
            ├─> 选择节点 B1 (隐藏踪迹) ──> 剧情线 C
            │       │
            │       └─> 结局节点 C-1 (潜伏胜利)
            │
            └─> 选择节点 B2 (正面交锋) ──> 剧情线 D
                    │
                    ├─> 结局节点 D-1 (征服世界)
                    └─> 结局节点 D-2 (人类胜利)
```

#### 3.2.3 角色互动数据结构

```javascript
{
  "id": "scientist_001",
  "name": "Dr. Sarah Chen",
  "role": "首席病毒学家",
  "organization": "WHO",
  "location": "日内瓦",
  "personality": ["理性", "执着", "理想主义"],
  "relationships": {
    "player": "敌对",  // 友好/中立/敌对
    "who": "忠诚",
    "governments": "合作"
  },
  "dialogues": [
    {
      "id": "dialogue_001",
      "trigger": "cure_research_started",
      "context": "疫苗研发开始",
      "lines": [
        {
          "speaker": "Sarah Chen",
          "text": "我们必须加快研发速度。按照这个感染率，三个月内就会全球蔓延。",
          "emotion": "担忧",
          "action": "查看数据板"
        },
        {
          "speaker": "assistant",
          "text": "但是博士，这种病毒的变异速度太快了...",
          "emotion": "恐惧"
        }
      ],
      "choices": [
        {
          "text": "加速变异（消耗 DNA）",
          "effect": { "mutationRate": +0.2, "dna": -5 },
          "nextDialogue": "dialogue_002"
        },
        {
          "text": "保持现状",
          "effect": {},
          "nextDialogue": "dialogue_003"
        }
      ]
    }
  ]
}
```

### 3.3 状态管理方法

#### 3.3.1 全局游戏状态

```javascript
class GameState {
  constructor() {
    // 核心状态
    this.turn = 0;
    this.startTime = null;
    this.lastSaveTime = null;
    this.gameSpeed = 1;
    this.isPaused = false;
    
    // 病原体状态
    this.pathogen = {
      type: 'bacteria',
      dna: 0,
      transmissions: {},
      symptoms: {},
      abilities: {},
      spreadMultiplier: 1,
      lethality: 0,
      mutationRate: 0.01
    };
    
    // 世界状态
    this.countries = [];
    this.globalInfected = 0;
    this.globalDead = 0;
    this.totalPopulation = 0;
    
    // 人类应对
    this.cureProgress = 0;
    this.cureRate = 0.001;
    this.globalPanic = 0;
    this.travelRestrictions = 0;
    this.economicImpact = 0;
    
    // 叙事状态
    this.currentStoryNode = 'start';
    this.visitedNodes = [];
    this.choices = [];
    this.achievements = [];
    
    // 事件日志
    this.eventLog = [];
    this.newsFeed = [];
  }
}
```

#### 3.3.2 状态变更模式（Redux 风格）

```javascript
// Action 类型定义
const ActionTypes = {
  NEXT_TURN: 'NEXT_TURN',
  UPGRADE_TRANSMISSION: 'UPGRADE_TRANSMISSION',
  UPGRADE_SYMPTOM: 'UPGRADE_SYMPTOM',
  UPGRADE_ABILITY: 'UPGRADE_ABILITY',
  UPDATE_COUNTRIES: 'UPDATE_COUNTRIES',
  UPDATE_CURE_PROGRESS: 'UPDATE_CURE_PROGRESS',
  TRIGGER_EVENT: 'TRIGGER_EVENT',
  MAKE_CHOICE: 'MAKE_CHOICE',
  LOAD_GAME: 'LOAD_GAME'
};

// Reducer 示例
function gameReducer(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.NEXT_TURN:
      return {
        ...state,
        turn: state.turn + 1,
        pathogen: {
          ...state.pathogen,
          dna: state.pathogen.dna + calculateDNA(state)
        },
        countries: updateCountries(state),
        cureProgress: updateCureProgress(state)
      };
    
    case ActionTypes.UPGRADE_TRANSMISSION:
      return {
        ...state,
        pathogen: {
          ...state.pathogen,
          transmissions: {
            ...state.pathogen.transmissions,
            [action.transmission]: action.level
          },
          dna: state.pathogen.dna - getCost(action.transmission, action.level)
        }
      };
    
    // ... 其他 action
    default:
      return state;
  }
}
```

#### 3.3.3 状态持久化策略

```javascript
class SaveManager {
  constructor() {
    this.VERSION = '2.0.0';
    this.STORAGE_KEY = 'pathogen_inc_save_v2';
    this.MAX_SAVES = 3;
  }

  saveGame(gameState) {
    const saveData = {
      version: this.VERSION,
      timestamp: Date.now(),
      turn: gameState.turn,
      playTime: this.calculatePlayTime(gameState),
      data: this.serialize(gameState),
      checksum: this.generateChecksum(gameState)
    };

    try {
      const saves = this.getAllSaves();
      saves.unshift(saveData);
      
      if (saves.length > this.MAX_SAVES) {
        saves.pop();
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saves));
      
      return {
        success: true,
        message: '游戏已保存',
        saveIndex: saves.length - 1
      };
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        return {
          success: false,
          message: '存储空间不足，请删除旧存档'
        };
      }
      throw error;
    }
  }

  loadGame(index = 0) {
    try {
      const saves = this.getAllSaves();
      if (!saves[index]) {
        return { success: false, message: '存档不存在' };
      }

      const saveData = saves[index];
      
      // 验证版本兼容性
      if (!this.isVersionCompatible(saveData.version)) {
        return {
          success: false,
          message: '存档版本不兼容',
          requiresMigration: true
        };
      }

      // 验证数据完整性
      if (!this.verifyChecksum(saveData)) {
        return {
          success: false,
          message: '存档已损坏'
        };
      }

      const gameState = this.deserialize(saveData.data);
      
      return {
        success: true,
        data: gameState,
        metadata: {
          version: saveData.version,
          timestamp: saveData.timestamp,
          turn: saveData.turn,
          playTime: saveData.playTime
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `读取存档失败：${error.message}`
      };
    }
  }

  serialize(gameState) {
    // 只保存必要数据，移除循环引用
    return JSON.stringify(gameState, (key, value) => {
      if (typeof value === 'function') return undefined;
      if (key.startsWith('_')) return undefined;
      return value;
    });
  }

  deserialize(dataString) {
    const data = JSON.parse(dataString);
    // 数据迁移逻辑
    if (this.needsMigration(data)) {
      return this.migrateData(data);
    }
    return data;
  }
}
```

### 3.4 与现有系统集成点

#### 3.4.1 可复用的代码

| 现有模块 | 可复用部分 | 重构工作量 |
|----------|------------|------------|
| `pathogen.js` | 数据结构、计算公式 | 30% |
| `country.js` | 国家数据、统计方法 | 20% |
| `save.js` | 存档逻辑、版本管理 | 50% |
| `story.js` | 剧情文本内容 | 70%（需扩展） |

#### 3.4.2 需要重写的代码

| 现有模块 | 重写原因 | 预估工作量 |
|----------|----------|------------|
| `game.js` | 游戏循环逻辑完全不同 | 100% |
| `ui.js` | 图形界面 → 文字界面 | 100% |
| HTML/CSS | 视觉设计彻底改变 | 100% |

#### 3.4.3 第三方依赖管理

```json
{
  "name": "pathogen-inc-text",
  "version": "2.0.0",
  "type": "module",
  "dependencies": {
    "marked": "^9.0.0",        // Markdown 解析
    "ansi-to-html": "^0.7.2"   // ANSI 颜色支持
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "vitest": "^1.6.0",
    "eslint": "^8.57.0"
  }
}
```

### 3.5 技术约束与性能要求

#### 3.5.1 技术约束

| 约束 | 描述 | 影响 |
|------|------|------|
| 无后端服务器 | 纯前端应用 | 所有数据存储在客户端 |
| 无数据库 | 仅使用 LocalStorage | 数据量限制 5-10MB |
| 无外部 API | 离线可用 | 无法实现社交功能 |
| 单线程 | JavaScript 主线程 | 避免阻塞操作 |

#### 3.5.2 性能 KPI

| 指标 | 目标 | 测量方法 |
|------|------|----------|
| FCP (First Contentful Paint) | < 0.8s | Lighthouse |
| TTI (Time to Interactive) | < 1.5s | Lighthouse |
| 存档写入时间 | < 50ms | Performance API |
| 读档加载时间 | < 200ms | Performance API |
| 内存泄漏 | < 1MB/小时 | Chrome DevTools |

#### 3.5.3 代码质量标准

| 指标 | 要求 | 工具 |
|------|------|------|
| ESLint 错误 | 0 | ESLint |
| ESLint 警告 | < 10 | ESLint |
| 测试覆盖率 | > 80% | Vitest |
| 循环复杂度 | < 10 | ESLint complexity |
| 函数长度 | < 50 行 | 代码审查 |
| 文件长度 | < 500 行 | 代码审查 |

---

## 4. 内容结构

### 4.1 叙事框架设计

#### 4.1.1 三幕式叙事结构

```
第一幕：爆发（Turn 1-50）
├── 起始节点：病原体诞生
├── 初始选择：感染首个国家
├── 早期事件：媒体关注、边境检查
└── 转折点：首个死亡病例

第二幕：蔓延（Turn 51-150）
├── 中期事件：疫苗研发、全球恐慌
├── 角色引入：科学家团队、政治领袖
├── 道德抉择：是否暴露存在
├── 转折点：疫苗突破/病毒变异
└── 危机：封锁措施、经济崩溃

第三幕：结局（Turn 151+）
├── 最终对抗：疫苗完成度 vs 感染速度
├── 最终选择：全面爆发/永久潜伏
├── 多结局系统（6 种结局）
└── 尾声：后疫情时代
```

#### 4.1.2 叙事节奏控制

| 阶段 | 回合范围 | 叙事重点 | 事件密度 |
|------|----------|----------|----------|
| 教学期 | 1-10 | 基础机制介绍 | 低（1 事件/5 回合） |
| 发展期 | 11-50 | 世界观建立 | 中（1 事件/3 回合） |
| 紧张期 | 51-100 | 冲突升级 | 高（1 事件/2 回合） |
| 危机期 | 101-150 | 生死攸关 | 极高（1 事件/1 回合） |
| 结局期 | 151+ | 最终对决 | 动态调整 |

#### 4.1.3 分支路径复杂度控制

```
总节点数：~300 个
├── 主线节点：100 个（33%）
├── 分支节点：150 个（50%）
├── 结局节点：30 个（10%）
└── 事件节点：20 个（7%）

平均分支因子：2.5
最大深度：12 层
可达成结局：6 个
```

### 4.2 角色互动系统设计

#### 4.2.1 角色分类

| 角色类型 | 数量 | 功能 | 示例 |
|----------|------|------|------|
| 科学家 | 5 | 疫苗研发、剧情推进 | Dr. Sarah Chen |
| 政治领袖 | 8 | 政策决策、国际关系 | 美国总统、中国主席 |
| 媒体人物 | 3 | 舆论导向、恐慌传播 | CNN 主播 |
| 普通民众 | 10 | 民间视角、情感共鸣 | 医生、教师、司机 |
| WHO 官员 | 2 | 协调全球应对 | 总干事 |

#### 4.2.2 角色关系网络

```
                    玩家（病原体）
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    科学家团队        政治领袖        普通民众
        │                │                │
        ├─ Dr. Chen      ├─ 美国总统      ├─ 医生张某
        ├─ Dr. Kumar     ├─ 中国主席      ├─ 教师 Maria
        └─ Dr. Petrov    └─ 欧盟主席      └─ 司机 Ahmed
              │                │
              └───────┬────────┘
                      │
                  WHO 组织
                      │
                  全球合作
```

#### 4.2.3 对话树架构

```javascript
// 对话树节点结构
{
  "id": "conversation_001",
  "participants": ["player", "scientist_chen"],
  "setting": "WHO 紧急会议室",
  "mood": "紧张",
  "nodes": [
    {
      "id": "node_1",
      "speaker": "scientist_chen",
      "text": "各位，我们面临的是前所未有的威胁。",
      "expression": "严肃",
      "next": ["node_2", "node_2b"]  // 分支
    },
    {
      "id": "node_2",
      "speaker": "player",
      "text": "[内心独白] 当然前所未有，我可是精心设计了十年。",
      "type": "internal_monologue",
      "next": "node_3"
    },
    {
      "id": "node_2b",
      "speaker": "player",
      "text": "[选择] 保持沉默，继续观察",
      "type": "choice",
      "choices": [
        {
          "text": "加速变异",
          "effect": { "mutation": +0.1 },
          "next": "node_4"
        },
        {
          "text": "隐藏踪迹",
          "effect": { "detection": -0.2 },
          "next": "node_5"
        }
      ]
    }
  ]
}
```

### 4.3 文字推进机制

#### 4.3.1 文本显示效果

| 效果 | 实现方式 | 使用场景 |
|------|----------|----------|
| 打字机效果 | 逐字显示，50ms/字 | 重要剧情 |
| 渐入效果 | CSS opacity 过渡 | 普通文本 |
| 高亮效果 | ANSI 颜色/粗体 | 关键信息 |
| 闪烁效果 | CSS animation | 警告/危险 |
| 滚动效果 | 自动滚动到底部 | 长文本日志 |

#### 4.3.2 信息密度控制

```
单屏信息量标准：
├── 主线文本：100-300 字
├── 选择项：2-5 个
├── 状态面板：精简显示关键数据
└── 事件日志：最近 5 条

阅读时间估算：
├── 快速阅读：200 字/分钟
├── 正常阅读：150 字/分钟
└── 深度阅读：100 字/分钟

目标：单次交互 30-60 秒
```

#### 4.3.3  pacing 节奏指南

| 游戏阶段 | 文本长度 | 选择频率 | 事件间隔 |
|----------|----------|----------|----------|
| 教学期 | 短（<100 字） | 高（每回合） | 低 |
| 发展期 | 中（100-300 字） | 中（每 3 回合） | 中 |
| 紧张期 | 长（300-500 字） | 低（每 5 回合） | 高 |
| 危机期 | 动态调整 | 关键抉择 | 极高 |

### 4.4 内容创作标准

#### 4.4.1 写作风格指南

**语气和风格**：
- **整体基调**：黑暗、紧张、科幻惊悚
- **叙事视角**：第二人称（你）+ 病原体内心独白
- **语言风格**：简洁、直接、充满张力

**禁止事项**：
- ❌ 过度技术术语（保持可读性）
- ❌ 冗长描述（保持节奏）
- ❌ 说教式内容（保持沉浸感）
- ❌ 矛盾信息（保持逻辑一致）

**推荐事项**：
- ✅ 感官描写（视觉、听觉、嗅觉）
- ✅ 情感共鸣（恐惧、希望、绝望）
- ✅ 悬念设置（ cliffhanger）
- ✅ 道德困境（艰难抉择）

#### 4.4.2 文本模板

```markdown
## 事件标题

[场景描述] 简短的环境描写，营造氛围

[对话/独白] 角色发言或内心活动

**关键信息** 需要玩家注意的内容

---
**选项**：
1. [选择 A] - 简短描述后果
2. [选择 B] - 简短描述后果
3. [选择 C] - 简短描述后果
```

#### 4.4.3 本地化支持

```javascript
// i18n 结构
const translations = {
  'zh-CN': {
    'game.title': '病原体公司',
    'game.start': '开始游戏',
    // ...
  },
  'en-US': {
    'game.title': 'Pathogen Inc.',
    'game.start': 'Start Game',
    // ...
  }
};

// 使用方式
function t(key, params = {}) {
  const lang = navigator.language || 'zh-CN';
  return translations[lang]?.[key] || translations['zh-CN'][key];
}
```

---

## 5. 实施时间表

### 5.1 阶段划分

#### 阶段一：基础架构（Week 1-3）

**时间**：2026-03-13 ~ 2026-04-02（3 周）

**目标**：完成核心引擎和基础系统

**里程碑**：
- [x] M1.1: 项目启动，完成技术选型（Day 1）
- [ ] M1.2: 完成 TextRenderer 和 InputHandler（Day 5）
- [ ] M1.3: 完成 GameState 和 SaveManager（Day 10）
- [ ] M1.4: 完成 GameEngine 核心循环（Day 15）

**交付物**：
- 可运行的文字游戏框架
- 基础存档/读档功能
- 简单的游戏循环演示

**资源分配**：
- 主程：1 人 × 3 周
- 文案：0.5 人 × 2 周（基础剧情）

**风险**：
- **技术风险**：文字渲染性能问题
  - 缓解：提前进行性能测试
- **人员风险**：关键开发人员 unavailable
  - 缓解：文档化所有决策，知识共享

---

#### 阶段二：核心系统（Week 4-7）

**时间**：2026-04-03 ~ 2026-04-30（4 周）

**目标**：实现所有核心游戏系统

**里程碑**：
- [ ] M2.1: StoryEngine 和分支叙事系统（Day 20）
- [ ] M2.2: PathogenSystem 和进化树（Day 25）
- [ ] M2.3: CountrySystem 和感染模型（Day 30）
- [ ] M2.4: EventSystem 和随机事件（Day 35）

**交付物**：
- 完整的分支叙事系统
- 可玩的进化系统
- 动态的国家感染模型
- 随机事件生成器

**资源分配**：
- 主程：1 人 × 4 周
- 文案：1 人 × 3 周（主线剧情）
- 测试：0.5 人 × 2 周

**依赖关系**：
- 阶段一完成 → 阶段二启动
- 剧情大纲确定 → 文案开始写作

**风险**：
- **范围蔓延**：功能需求不断增加
  - 缓解：严格执行变更控制流程
- **质量风险**：剧情质量不稳定
  - 缓解：建立审查机制，定期 review

---

#### 阶段三：内容填充（Week 8-12）

**时间**：2026-05-01 ~ 2026-06-04（5 周）

**目标**：完成所有剧情内容和角色系统

**里程碑**：
- [ ] M3.1: 完成第一幕剧情（Day 45）
- [ ] M3.2: 完成第二幕剧情（Day 55）
- [ ] M3.3: 完成第三幕和所有结局（Day 65）
- [ ] M3.4: 完成角色对话系统（Day 70）

**交付物**：
- 300+ 剧情节点
- 6 个完整结局
- 28 个角色对话树
- 100+ 随机事件

**资源分配**：
- 主程：0.5 人 × 3 周（技术支持）
- 文案：2 人 × 5 周（全职写作）
- 测试：1 人 × 3 周

**依赖关系**：
- 核心系统完成 → 内容开始填充
- 剧情大纲审查通过 → 详细写作

**风险**：
- **内容风险**：写作进度滞后
  - 缓解：并行写作，模块化内容
- **一致性风险**：剧情逻辑矛盾
  - 缓解：建立剧情数据库，自动检查

---

#### 阶段四：优化与测试（Week 13-15）

**时间**：2026-06-05 ~ 2026-06-25（3 周）

**目标**：性能优化、Bug 修复、用户体验提升

**里程碑**：
- [ ] M4.1: 性能优化完成（Day 75）
- [ ] M4.2: Bug 修复率 > 95%（Day 85）
- [ ] M4.3: 用户体验测试通过（Day 90）
- [ ] M4.4: 发布候选版本（Day 95）

**交付物**：
- 性能优化报告
- 测试报告和 Bug 清单
- 用户反馈汇总
- 发布候选版本

**资源分配**：
- 主程：1 人 × 3 周
- 测试：2 人 × 3 周
- 文案：0.5 人 × 1 周（最后调整）

**风险**：
- **质量风险**：关键 Bug 未修复
  - 缓解：优先级排序，必要时延期
- **时间风险**：测试发现重大问题
  - 缓解：预留 buffer time

---

#### 阶段五：发布与运营（Week 16+）

**时间**：2026-06-26 开始

**目标**：正式发布、用户反馈收集、持续迭代

**里程碑**：
- [ ] M5.1: GitHub Pages 部署（Day 100）
- [ ] M5.2: 正式发布 v2.0（Day 105）
- [ ] M5.3: 收集用户反馈（Day 120）
- [ ] M5.4: 第一次内容更新（Day 150）

**交付物**：
- 线上版本
- 用户手册
- 反馈收集系统
- 更新路线图

---

### 5.2 甘特图概览

```
任务                    │ Mar    │ Apr    │ May    │ Jun    │ Jul
                        │ 2  3  4 │ 1  2  3 │ 1  2  3 │ 1  2  3 │ 1
────────────────────────┼─────────────────────────────────────────
阶段一：基础架构        │ ███████ │         │         │         │
  - 技术选型            │ ███     │         │         │         │
  - 核心引擎            │    ████ │         │         │         │
  - 存档系统            │       ██│         │         │         │
────────────────────────┼─────────────────────────────────────────
阶段二：核心系统        │         │ ███████ │         │         │
  - 叙事引擎            │         │ ███     │         │         │
  - 病原体系统          │         │    ███  │         │         │
  - 国家系统            │         │       █ │         │         │
  - 事件系统            │         │        █│█        │         │
────────────────────────┼─────────────────────────────────────────
阶段三：内容填充        │         │         │ ███████ │ █       │
  - 第一幕              │         │         │ ██      │         │
  - 第二幕              │         │         │   ███   │         │
  - 第三幕              │         │         │      ██ │ █       │
  - 角色对话            │         │         │        █│██       │
────────────────────────┼─────────────────────────────────────────
阶段四：优化测试        │         │         │         │ ███████ │
  - 性能优化            │         │         │         │ ██      │
  - Bug 修复            │         │         │         │   ███   │
  - UX 测试             │         │         │         │      ██ │
────────────────────────┼─────────────────────────────────────────
阶段五：发布            │         │         │         │      ███│██
  - 部署                │         │         │         │        █│
  - 发布                │         │         │         │         │██
  - 运营                │         │         │         │         │ █
```

### 5.3 关键路径分析

```
关键路径（总工期：95 天）：

阶段一（21 天）
    │
    ▼
阶段二（28 天）← 关键：StoryEngine 完成
    │
    ▼
阶段三（35 天）← 关键：剧情写作进度
    │
    ▼
阶段四（21 天）← 关键：Bug 修复率
    │
    ▼
发布

缓冲时间：10 天（分布在各个阶段）
```

### 5.4 资源分配计划

#### 5.4.1 人力资源

| 角色 | 人数 | 投入阶段 | 总工时 |
|------|------|----------|--------|
| 主程 | 1 | 阶段 1-5 | 480 小时 |
| 文案 | 2 | 阶段 2-4 | 520 小时 |
| 测试 | 1 | 阶段 2-5 | 280 小时 |
| 美术（可选） | 0.5 | 阶段 4-5 | 80 小时 |
| **总计** | **4.5** | - | **1360 小时** |

#### 5.4.2 工具资源

| 工具 | 用途 | 成本 |
|------|------|------|
| VS Code | 开发环境 | 免费 |
| Git/GitHub | 版本控制 | 免费 |
| Vite | 构建工具 | 免费 |
| Vitest | 测试框架 | 免费 |
| Notion | 项目管理 | 免费 |
| Figma | UI 设计 | 免费 |
| Twine | 剧情编排 | 免费 |

#### 5.4.3 预算估算

| 项目 | 金额（CNY） | 备注 |
|------|-------------|------|
| 人力成本 | 272,000 | 按 200 元/小时计算 |
| 软件许可 | 0 | 全部使用开源工具 |
| 服务器 | 0 | GitHub Pages 免费 |
| 域名 | 100/年 | 可选 |
| 应急储备 | 27,200 | 10% 缓冲 |
| **总计** | **299,300** | - |

### 5.5 风险评估与缓解策略

#### 5.5.1 风险矩阵

| 风险 | 概率 | 影响 | 风险值 | 优先级 |
|------|------|------|--------|--------|
| 技术难度超预期 | 中 | 高 | 高 | P1 |
| 内容创作延期 | 高 | 中 | 高 | P1 |
| 人员流失 | 低 | 高 | 中 | P2 |
| 范围蔓延 | 中 | 中 | 中 | P2 |
| 质量问题 | 中 | 高 | 高 | P1 |
| 预算超支 | 低 | 中 | 低 | P3 |

#### 5.5.2 详细风险应对

**风险 1：技术难度超预期**
- **触发条件**：关键功能实现时间 > 预估 150%
- **应对措施**：
  1. 提前进行技术预研（Spike）
  2. 寻找开源替代方案
  3. 简化功能需求
  4. 延长开发时间

**风险 2：内容创作延期**
- **触发条件**：剧情节点完成率 < 80%（按周检查）
- **应对措施**：
  1. 增加文案人员
  2. 简化剧情分支
  3. 使用模板化内容
  4. 延期发布

**风险 3：质量问题**
- **触发条件**：测试 Bug 数 > 50 个
- **应对措施**：
  1. 增加测试时间
  2. 引入自动化测试
  3. 代码审查加强
  4. 分阶段发布

---

## 6. 质量保证框架

### 6.1 叙事一致性测试方法

#### 6.1.1 自动化检查工具

```javascript
class NarrativeValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  validateNode(node) {
    // 检查必需字段
    this.checkRequiredFields(node);
    
    // 检查引用完整性
    this.checkReferences(node);
    
    // 检查逻辑一致性
    this.checkLogicConsistency(node);
    
    // 检查数值平衡
    this.checkNumericalBalance(node);
  }

  checkRequiredFields(node) {
    const required = ['id', 'type', 'content'];
    required.forEach(field => {
      if (!node[field]) {
        this.errors.push(`节点 ${node.id || 'UNKNOWN'} 缺少必需字段：${field}`);
      }
    });
  }

  checkReferences(node) {
    // 检查 nextNode 是否存在
    if (node.choices) {
      node.choices.forEach(choice => {
        if (choice.consequences?.nextNode) {
          if (!this.nodeExists(choice.consequences.nextNode)) {
            this.errors.push(`节点 ${node.id}: 引用了不存在的节点 ${choice.consequences.nextNode}`);
          }
        }
      });
    }
  }

  checkLogicConsistency(node) {
    // 检查前置条件是否可能满足
    if (node.requirements) {
      const { minTurn, maxTurn } = node.requirements;
      if (minTurn > maxTurn) {
        this.errors.push(`节点 ${node.id}: minTurn (${minTurn}) > maxTurn (${maxTurn})`);
      }
    }
  }

  checkNumericalBalance(node) {
    // 检查数值是否平衡
    if (node.choices) {
      node.choices.forEach(choice => {
        const { dnaChange } = choice.consequences || {};
        if (dnaChange && Math.abs(dnaChange) > 20) {
          this.warnings.push(`节点 ${node.id}: DNA 变化 ${dnaChange} 可能过大`);
        }
      });
    }
  }

  generateReport() {
    return {
      errors: this.errors,
      warnings: this.warnings,
      isValid: this.errors.length === 0
    };
  }
}
```

#### 6.1.2 剧情流程图验证

```
验证规则：
1. 所有节点必须可达（从 start 节点开始 BFS）
2. 所有分支必须收敛（最终到达 ending 节点）
3. 无死循环（检测循环依赖）
4. 无孤立节点（所有节点至少有一个入边）

算法：
- 使用图论算法验证
- 自动生成剧情树可视化
- 标记问题节点
```

#### 6.1.3 内容审查清单

| 检查项 | 方法 | 频率 |
|--------|------|------|
| 剧情逻辑一致性 | 人工审查 + 自动检查 | 每周 |
| 角色性格一致性 | 人工审查 | 每章节 |
| 时间线一致性 | 时间轴工具 | 每章节 |
| 数值平衡性 | 模拟测试 | 每周 |
| 文化敏感性 | 人工审查 | 发布前 |

### 6.2 玩家选择验证流程

#### 6.2.1 选择影响追踪

```javascript
class ChoiceTracker {
  constructor() {
    this.choiceHistory = [];
    this.consequences = [];
  }

  recordChoice(nodeId, choiceId, choiceData) {
    this.choiceHistory.push({
      timestamp: Date.now(),
      turn: game.turn,
      nodeId,
      choiceId,
      data: choiceData
    });

    // 计算即时后果
    const immediateEffects = this.calculateImmediateEffects(choiceData);
    this.consequences.push({
      type: 'immediate',
      effects: immediateEffects
    });

    // 预测长期后果
    const longTermEffects = this.predictLongTermEffects(choiceId);
    if (longTermEffects.length > 0) {
      this.consequences.push({
        type: 'long_term',
        effects: longTermEffects,
        triggerCondition: longTermEffects[0].trigger
      });
    }
  }

  validateChoiceImpact() {
    // 验证每个选择都有意义
    const meaninglessChoices = this.choiceHistory.filter(choice => {
      return !this.hasSignificantImpact(choice);
    });

    if (meaninglessChoices.length > 0) {
      console.warn('发现无意义的选择:', meaninglessChoices);
      return false;
    }
    return true;
  }

  hasSignificantImpact(choice) {
    // 检查是否影响剧情走向
    // 检查是否改变游戏状态
    // 检查是否解锁新内容
    return true; // 简化
  }
}
```

#### 6.2.2 选择平衡性测试

| 测试类型 | 方法 | 标准 |
|----------|------|------|
| A/B 测试 | 对比不同选择路径的胜率 | 胜率差异 < 20% |
| 蒙特卡洛模拟 | 随机选择 10000 次 | 所有结局可达 |
| 专家审查 | 资深玩家试玩 | 无明显最优解 |
| 数据分析 | 收集玩家选择统计 | 选择分布均匀 |

### 6.3 性能基准测试标准

#### 6.3.1 性能测试套件

```javascript
class PerformanceBenchmark {
  constructor() {
    this.metrics = {};
  }

  async runAll() {
    await this.testLoadTime();
    await this.testSaveLoad();
    await this.testRenderPerformance();
    await this.testMemoryUsage();
    return this.generateReport();
  }

  async testLoadTime() {
    const start = performance.now();
    await this.initializeGame();
    const end = performance.now();
    
    this.metrics.loadTime = end - start;
    this.pass('loadTime', this.metrics.loadTime < 1500);
  }

  async testSaveLoad() {
    const gameState = this.createTestState();
    
    // 测试保存
    const saveStart = performance.now();
    await SaveManager.saveGame(gameState);
    const saveEnd = performance.now();
    this.metrics.saveTime = saveEnd - saveStart;
    
    // 测试加载
    const loadStart = performance.now();
    const result = await SaveManager.loadGame();
    const loadEnd = performance.now();
    this.metrics.loadTime = loadEnd - loadStart;
    
    this.pass('saveTime', this.metrics.saveTime < 50);
    this.pass('loadTime', this.metrics.loadTime < 200);
  }

  async testRenderPerformance() {
    const texts = [];
    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      TextRenderer.render(`测试文本 ${i}`);
      const end = performance.now();
      texts.push(end - start);
    }
    
    this.metrics.avgRenderTime = texts.reduce((a, b) => a + b, 0) / texts.length;
    this.metrics.p95RenderTime = this.percentile(texts, 95);
    
    this.pass('avgRenderTime', this.metrics.avgRenderTime < 10);
    this.pass('p95RenderTime', this.metrics.p95RenderTime < 50);
  }

  async testMemoryUsage() {
    if (performance.memory) {
      const used = performance.memory.usedJSHeapSize;
      const total = performance.memory.totalJSHeapSize;
      this.metrics.memoryUsage = used / 1024 / 1024; // MB
      this.metrics.memoryLimit = total / 1024 / 1024;
      
      this.pass('memoryUsage', this.metrics.memoryUsage < 50);
    }
  }

  generateReport() {
    return {
      metrics: this.metrics,
      passRate: this.calculatePassRate(),
      recommendations: this.generateRecommendations()
    };
  }
}
```

#### 6.3.2 性能 KPI 达标标准

| 指标 | 优秀 | 良好 | 及格 | 不及格 |
|------|------|------|------|--------|
| 加载时间 | <800ms | <1.5s | <3s | >3s |
| 存档时间 | <30ms | <50ms | <100ms | >100ms |
| 读档时间 | <100ms | <200ms | <500ms | >500ms |
| 渲染时间 | <5ms | <10ms | <50ms | >50ms |
| 内存占用 | <30MB | <50MB | <100MB | >100MB |

### 6.4 用户体验评估指标

#### 6.4.1 可用性测试指标

| 指标 | 测量方法 | 目标值 |
|------|----------|--------|
| 任务完成率 | 用户测试 | >90% |
| 错误率 | 日志分析 | <5% |
| 学习曲线 | 新手教程完成率 | >80% |
| 满意度 | SUS 问卷 | >75 分 |
| NPS | 推荐意愿 | >50 |

#### 6.4.2 参与度指标

| 指标 | 测量方法 | 目标值 |
|------|----------|--------|
| 平均游戏时长 | 数据分析 | >30 分钟 |
| 留存率（次日） | 数据分析 | >60% |
| 留存率（7 日） | 数据分析 | >30% |
| 结局解锁率 | 数据分析 | >50% |
| 重复游玩率 | 数据分析 | >20% |

#### 6.4.3 用户反馈收集流程

```
收集渠道：
1. 游戏内反馈表单
2. GitHub Issues
3. 社交媒体
4. 用户访谈
5. 可用性测试

处理流程：
收集 → 分类 → 优先级排序 → 分配 → 解决 → 验证 → 关闭

反馈分类：
- Bug 报告
- 功能建议
- 内容问题
- 性能问题
- 用户体验
```

### 6.5 迭代和反馈收集流程

#### 6.5.1 敏捷开发流程

```
Sprint 周期：2 周

Sprint 规划（Day 1）
    │
    ▼
每日站会（15 分钟）
    │
    ▼
开发 + 测试（Day 2-12）
    │
    ▼
Sprint 评审（Day 13）
    │
    ▼
Sprint 回顾（Day 14）
    │
    ▼
下一个 Sprint
```

#### 6.5.2 持续集成/持续部署（CI/CD）

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm run build
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### 6.5.3 版本发布流程

```
版本号规范：SemVer (MAJOR.MINOR.PATCH)

发布流程：
1. 创建 release branch
2. 冻结功能，只接受 Bug 修复
3. 进行回归测试
4. 更新版本号
5. 更新 CHANGELOG
6. 创建 Git Tag
7. 部署到生产环境
8. 发布说明

发布频率：
- 大版本：每季度
- 小版本：每月
- 热修复：按需
```

---

## 7. 附录

### 附录 A：术语表

| 术语 | 定义 |
|------|------|
| 节点（Node） | 剧情树中的一个点，代表一个场景或选择 |
| 分支因子（Branching Factor） | 每个节点的平均选择数量 |
| 剧情树（Story Tree） | 所有剧情节点组成的树状结构 |
| 状态机（State Machine） | 管理游戏状态变化的系统 |
| 序列化（Serialization） | 将对象转换为可存储格式的过程 |

### 附录 B：参考文档

1. **互动叙事设计**
   - 《Interactive Storytelling for Video Games》- Josiah Lebowitz
   - 《The Art of Game Design》- Jesse Schell

2. **技术架构**
   - 《Clean Architecture》- Robert C. Martin
   - 《Design Patterns》- Gang of Four

3. **文字游戏设计**
   - 《Writing for Video Games》- David A. Hillman
   - Interactive Fiction Community (ifdb.org)

### 附录 C：检查清单

#### 发布前检查清单

- [ ] 所有单元测试通过
- [ ] 集成测试通过
- [ ] 性能测试达标
- [ ] 所有剧情节点验证通过
- [ ] 无 ESLint 错误
- [ ] 测试覆盖率 > 80%
- [ ] 用户文档完成
- [ ] 发布说明完成
- [ ] GitHub Pages 部署成功
- [ ] 浏览器兼容性测试通过

#### 代码审查清单

- [ ] 代码符合风格指南
- [ ] 函数长度 < 50 行
- [ ] 无重复代码（DRY）
- [ ] 变量命名清晰
- [ ] 错误处理完善
- [ ] 注释适当（不过度）
- [ ] 无安全漏洞
- [ ] 无性能问题

### 附录 D：技术决策记录（ADR）

#### ADR-001：选择 Vite 作为构建工具

**日期**：2026-03-13  
**状态**：已接受  
**上下文**：需要快速开发和热重载  
**决策**：使用 Vite 而非 Webpack  
**后果**：
- ✅ 开发服务器启动快（<1s）
- ✅ 配置简单
- ❌ 生态不如 Webpack 成熟

#### ADR-002：使用 LocalStorage 而非 IndexedDB

**日期**：2026-03-13  
**状态**：已接受  
**上下文**：存档数据量小（<1MB）  
**决策**：使用 LocalStorage  
**后果**：
- ✅ API 简单
- ✅ 同步操作，代码简单
- ❌ 容量限制 5MB
- ❌ 阻塞主线程

### 附录 E：数据迁移策略

```javascript
// 版本迁移脚本
const migrations = [
  {
    from: '1.0.0',
    to: '2.0.0',
    migrate: (oldData) => {
      return {
        ...oldData,
        version: '2.0.0',
        // 添加新字段
        choices: [],
        achievements: [],
        // 转换旧字段
        pathogen: transformPathogen(oldData.pathogen)
      };
    }
  }
];

function migrateData(data) {
  const currentVersion = data.version || '1.0.0';
  const migration = migrations.find(m => m.from === currentVersion);
  
  if (!migration) {
    throw new Error(`无法迁移版本 ${currentVersion}`);
  }
  
  return migration.migrate(data);
}
```

---

## 文档审批

| 角色 | 姓名 | 签字 | 日期 |
|------|------|------|------|
| 项目经理 | | | |
| 技术负责人 | | | |
| 文案负责人 | | | |
| 测试负责人 | | | |

---

**文档结束**

---

## 下一步行动

1. **立即行动**：
   - [ ] 召