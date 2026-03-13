# Pathogen Inc. - 文字互动版

> 一款基于文字的策略模拟游戏，扮演致命病原体感染全人类

## 🎮 游戏介绍

Pathogen Inc. 是一款文字互动策略游戏，玩家扮演致命的病原体，通过进化传播途径、症状和能力来感染全球，同时避免人类研发出疫苗。

### 游戏特色

- **5 种病原体类型**：细菌、病毒、寄生虫、真菌、朊病毒，各有独特属性
- **深度进化系统**：5 种传播途径、6 种症状、5 种能力
- **全球感染模型**：30 个真实国家，各有不同的防控能力
- **动态事件系统**：随机事件影响游戏进程
- **多结局系统**：根据游戏表现解锁不同结局

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

浏览器会自动打开 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录

### 预览生产版本

```bash
npm run preview
```

## 📖 游戏命令

### 基础命令

- `start` - 开始新游戏
- `load` - 读取存档
- `help` - 显示帮助
- `status` - 查看当前状态
- `save` - 保存游戏
- `pause` - 暂停/继续游戏

### 升级命令

- `upgrade` - 查看升级选项
- `upgrade air` - 升级空气传播
- `upgrade water` - 升级水源传播
- `upgrade blood` - 升级血液传播
- `upgrade contact` - 升级接触传播
- `upgrade animal` - 升级动物传播
- `upgrade cough` - 获得咳嗽症状
- `upgrade fever` - 获得发烧症状
- `upgrade mutation` - 获得快速变异能力

## 🎯 游戏目标

1. **主要目标**：感染全世界 70 亿人口
2. **次要目标**：在人类研发出疫苗之前完成感染
3. **挑战模式**：尝试用不同病原体类型达成成就

## 📁 项目结构

```
sense/
├── src/                      # 源代码目录
│   ├── core/                 # 核心引擎
│   │   ├── GameState.js      # 游戏状态管理
│   │   ├── GameEngine.js     # 游戏主引擎
│   │   └── SaveManager.js    # 存档管理
│   ├── systems/              # 游戏系统
│   │   ├── PathogenSystem.js # 病原体系统
│   │   └── CountrySystem.js  # 国家系统
│   ├── ui/                   # 用户界面
│   │   ├── TextRenderer.js   # 文字渲染器
│   │   └── InputHandler.js   # 输入处理器
│   └── main.js               # 主入口
├── assets/                   # 资源文件
│   ├── audio/                # 音频资源
│   ├── fonts/                # 字体文件
│   └── images/               # 图片资源
├── config/                   # 配置文件
│   └── environments/         # 环境配置
├── tests/                    # 测试文件
│   ├── unit/                 # 单元测试
│   ├── integration/          # 集成测试
│   └── performance/          # 性能测试
├── doc/                      # 文档目录
│   ├── api/                  # API 文档
│   ├── design/               # 设计文档
│   └── guides/               # 开发指南
├── css/                      # 样式文件
├── public/                   # 公共资源
├── index.html                # 主页面
├── package.json              # 项目配置
└── vite.config.js            # Vite 配置
```

## 🛠️ 开发指南

### 代码规范

项目使用 ESLint 进行代码质量检查：

```bash
npm run lint        # 检查代码
npm run lint:fix    # 自动修复问题
```

### 运行测试

```bash
npm test            # 运行所有测试
npm run test:watch  # 监视模式
npm run test:coverage  # 生成覆盖率报告
```

### 添加新功能

1. 在 `src/systems/` 创建新系统模块
2. 在 `src/core/` 更新游戏引擎
3. 在 `src/ui/` 添加用户界面
4. 在 `tests/unit/` 添加单元测试

## 📊 游戏数据

### 病原体类型

| 类型 | 传播倍率 | 致命倍率 | 疫苗抗性 | 初始 DNA |
|------|----------|----------|----------|----------|
| 细菌 | 1.2x | 1.0x | 1.1x | 2 |
| 病毒 | 1.1x | 1.2x | 1.3x | 2 |
| 寄生虫 | 0.9x | 1.3x | 1.2x | 2 |
| 真菌 | 1.3x | 1.0x | 1.1x | 2 |
| 朊病毒 | 0.8x | 1.5x | 2.0x | 2 |

### 传播途径

- **空气传播**：通过呼吸道快速传播
- **水源传播**：通过水污染扩散
- **血液传播**：通过蚊虫叮咬传播
- **接触传播**：通过身体接触传播
- **动物传播**：通过动物宿主传播

### 症状等级

1. 咳嗽（轻微）
2. 发烧（中等）
3. 呕吐（增加传播）
4. 出血（高致命）
5. 免疫抑制（加速死亡）
6. 器官衰竭（全球恐慌）

## 🐛 已知问题

查看 [GitHub Issues](https://github.com/your-username/pathogen-inc-text/issues) 获取已知问题列表和进度。

## 📝 更新日志

### v2.0.0 (2026-03-13)

- ✨ 完全重构成文字互动游戏
- ✨ 新的模块化架构
- ✨ 改进的存档系统
- ✨ 完整的单元测试覆盖
- 🐛 修复已知 bug

### v1.2.0 (之前版本)

- 图形化界面版本
- 基础游戏功能

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎贡献代码、报告 bug 或提出建议！

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📧 联系方式

- 项目地址：https://github.com/your-username/pathogen-inc-text
- 问题反馈：https://github.com/your-username/pathogen-inc-text/issues

---

**感谢游玩 Pathogen Inc.！** 🦠🌍
