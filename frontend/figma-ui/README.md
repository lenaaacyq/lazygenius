# 🚀 LazyGenius - 智能知识卡片学习应用

> 移动端优先的知识管理应用，通过 Tinder 式滑动交互快速整理学习内容

## ✨ 项目特色

- 🎨 **深色科技风** - 紫黑渐变 + 高斯模糊 + 记忆宫殿网格
- 📱 **移动端优先** - 完美适配各种手机屏幕
- 👆 **Tinder式交互** - 左滑归档，右滑保留
- ⚡ **流畅动画** - 基于 Motion (Framer Motion)
- 🎯 **三种模式** - 混合/新卡/复习模式切换

## 📦 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.3.1 | UI 框架 |
| Vite | 6.3.5 | 构建工具 |
| Tailwind CSS | 4.1.12 | 样式方案 |
| Motion | 12.23.24 | 动画库 |
| Lucide React | 0.487.0 | 图标库 |

## 🗂️ 统一命名规则

```
LazyGenius/
├── src/
│   ├── main.jsx          ✅ 入口文件
│   ├── Flashcard.jsx     ✅ 页面主组件
│   ├── Flashcard.css     ✅ 全局样式
│   ├── components/       ✅ 组件库目录
│   └── data/             ✅ 数据文件
```

详细结构请查看 → [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

## 🚀 快速开始

### 1️⃣ 安装依赖

```bash
npm install
```

或使用其他包管理器：

```bash
pnpm install  # 推荐，更快
yarn install
```

### 2️⃣ 启动开发服务器

```bash
npm run dev
```

访问：http://localhost:5173

### 3️⃣ 构建生产版本

```bash
npm run build
```

构建产物在 `/dist` 目录

### 4️⃣ 预览构建产物

```bash
npm run preview
```

## 🎮 使用说明

### 基础操作

1. **切换模式** - 点击顶部标签（混合/新卡/复习）
2. **添加卡片** - 点击紫色「添加新链接」按钮
3. **滑动卡片**
   - ← **左滑** = 归档（不感兴趣）
   - → **右滑** = 保留（想学习）
4. **查看详情** - 点击卡片进入详情页

### 卡片结构

每张卡片包含：

- 📝 **标题** - 核心主题
- 🔍 **要点** - 3-4个关键知识点（骨架拆解）
- 💡 **金句** - 可记忆的精华语句

## 📱 手机访问

### 方式1：局域网访问

启动开发服务器后，在同一 WiFi 下：

```bash
npm run dev
# 终端会显示：
# ➜ Local:   http://localhost:5173/
# ➜ Network: http://192.168.x.x:5173/  👈 用这个地址
```

### 方式2：部署后访问

部署到 Vercel/Netlify 后，手机浏览器直接访问域名

## 🎨 自定义修改

### 修改主题颜色

编辑 `/src/Flashcard.css`：

```css
:root {
  --primary: #030213;       /* 主背景色 */
  --purple-500: #a855f7;    /* 紫色强调色 */
  --indigo-600: #4f46e5;    /* 蓝紫色 */
}
```

### 修改卡片数据

编辑 `/src/data/mockCards.js`：

```javascript
export const mockCards = [
  {
    id: "1",
    title: "你的标题",
    keyPoints: ["要点1", "要点2", "要点3"],
    quote: "金句内容",
    excerpt: "原文摘录...",
    sourceUrl: "https://example.com",
    status: "new",
    createdAt: new Date(),
  },
  // 添加更多卡片...
];
```

### 修改品牌名称

在 `/src/components/Header.jsx` 中修改：

```jsx
<h1 className="text-2xl font-bold tracking-tight text-white">
  LazyGenius  {/* 改成你的应用名 */}
</h1>
```

## 🌐 部署指南

### Vercel（推荐）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 部署
vercel
```

### Netlify

```bash
# 1. 构建
npm run build

# 2. 拖拽 dist/ 目录到 Netlify
```

### GitHub Pages

修改 `vite.config.ts`：

```javascript
export default defineConfig({
  base: '/your-repo-name/',  // 添加这一行
  // ...
})
```

然后构建并推送到 `gh-pages` 分支

## 📂 核心文件说明

| 文件 | 说明 |
|------|------|
| `/src/main.jsx` | React 入口，渲染根组件 |
| `/src/Flashcard.jsx` | 主组件，包含所有业务逻辑 |
| `/src/Flashcard.css` | 全局样式（Fonts + Tailwind + Theme） |
| `/src/components/CardView.jsx` | 卡片视图，支持拖拽滑动 |
| `/src/components/Header.jsx` | 顶部导航（Logo + 模式切换） |
| `/src/data/mockCards.js` | 模拟数据 |

## 🐛 常见问题

### Q: 为什么链接生成卡片是假数据？

A: 当前使用 Mock 数据模拟，真实场景需要接入后端 API 进行链接解析。

### Q: 如何持久化数据？

A: 当前数据仅在内存中，刷新会丢失。可以：
1. 使用 LocalStorage（简单方案）
2. 接入 Supabase/Firebase（推荐）
3. 自建后端 API

### Q: 为什么在桌面浏览器上卡片宽度固定？

A: 这是移动端优先设计，卡片最大宽度 `max-w-md` (448px)。桌面访问建议使用浏览器开发者工具切换到移动视图。

### Q: 如何修改为 TypeScript？

A: 将所有 `.jsx` 文件改为 `.tsx`，并添加类型定义。项目已配置 TypeScript 支持。

## 🔧 开发工具推荐

- **VS Code** - 代码编辑器
- **Tailwind CSS IntelliSense** - VS Code 插件，Tailwind 自动补全
- **ES7+ React/Redux/React-Native snippets** - React 代码片段
- **Chrome DevTools** - 移动端调试（Device Mode）

## 📖 学习资源

- [React 官方文档](https://react.dev)
- [Tailwind CSS v4 文档](https://tailwindcss.com/docs)
- [Motion 文档](https://motion.dev)
- [Vite 文档](https://vitejs.dev)

## 📄 License

MIT License - 自由使用和修改

---

**开发团队**: LazyGenius Team  
**版本**: v1.0.0  
**最后更新**: 2026-03-01

如有问题，请提交 Issue 或 PR 💪
