# WORDS · 万词记忆系统

一个**完全离线可用**的背单词 PWA：约 1 万词条，采用主动回忆 + 间隔重复（SRS）驱动，支持网页端安装为 App，也可打包成桌面版。

## 功能

- **主动回忆**：英译汉 / 汉译英 / 拼写 / 听写 多题型混合，自动学习模式按初识→复习节奏推进。
- **间隔重复（自适应）**：采用 SM-2 风格算法，按个人正确率与作答耗时动态调整每个词的复习间隔（记忆因子 EF），而非固定间隔表。
- **单词搜索**：按英文或中文释义查词，查看音标、核心义项、例句与词形变化。
- **学习提醒**：可设置每日提醒时间，到点未打卡时通过浏览器通知提醒。
- **词库分阶**：按小学 / 中考 / 高考 / 四级 / 六级 / 考研 / 托福 / 雅思 / GRE / 专四 / 专八 / 专有名词分类，每类再拆成若干 List（共 156 个），并标注难度。
- **回忆模式**：四个难度档，按单词自身难度区间严格区分。
- **Potential（PTT）**：对数总量制的记忆潜力评分，右侧状态栏实时显示。
- **统计 / 设置**：掌握度预测、每日签到、连续天数、高频错误词、数据导入导出与重置。
- **云同步**：可选接入 Supabase，实现多设备进度同步（见下）。
- **离线可用**：Service Worker 缓存全部资源，联网仅用于在线发音与云同步。

## 目录结构

```
.
├── index.html              # 应用外壳（样式 + 逻辑 + 界面）
├── words.json              # 词库数据（10,905 词条 + 12 类 / 156 个 List）
├── sw.js                   # Service Worker（离线缓存）
├── manifest.webmanifest    # PWA 清单
├── icon-180/192/512.png     # 应用图标（桌面版图标亦由此生成）
├── desktop/                # Electron 桌面版（main.js / package.json）
└── .github/workflows/      # 桌面版构建 CI
```

> 词库与代码分离：[index.html](file:///workspace/index.html) 启动时 `fetch('words.json')` 加载数据，因此**必须通过 http(s) 访问**（直接双击 `file://` 打开会因浏览器安全策略无法加载词库）。桌面版通过自定义 `app://` 协议承载，可正常加载。

## 本地运行

应用需要以 HTTP 方式访问（Service Worker、云同步均依赖 http/https）：

```bash
python3 -m http.server 8080
# 打开 http://localhost:8080/
```

## 部署

仓库为纯静态站点，任意静态托管（GitHub Pages、Vercel、Netlify 等）直接指向根目录即可。

## 云端同步（可选）

默认纯本地存储。开启多设备同步的步骤：

1. 在 [supabase.com](https://supabase.com) 新建项目；
2. 打开 **SQL Editor**，执行设置页「云端账号」面板中的建表语句（建 `public.words_progress` 表 + RLS 策略）；
3. 到 **Project Settings → API** 复制 **Project URL** 与 **anon public key**，填入 [index.html](file:///workspace/index.html) 顶部 `SB` 配置对象；
4. 应用内登录后，进度自动在多设备间合并同步。

> 合并策略：逐词取进度更高的一条、每日/总计取较大值、历史去重合并；不会用整份存档互相覆盖。

## 桌面版

`desktop/` 为 Electron 封装，图标与页面均取自仓库根目录。本地调试：

```bash
cd desktop && npm install && npm start
```

打标签（`v*`）或手动触发 `.github/workflows/desktop.yml` 可构建 Windows / macOS / Linux 安装包。

## 数据存储

学习进度保存在浏览器 `localStorage`：

- 主档 `words_v7`
- 备份 `words_v7_bak`（每次写入前滚动备份，主档损坏时可回滚）

设置页提供**导出 / 导入**，建议定期备份。

## License

[MIT](file:///workspace/LICENSE) © illudew
