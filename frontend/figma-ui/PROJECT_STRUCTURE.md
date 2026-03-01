# LazyGenius - 知识卡片学习应用

## 📁 项目结构（统一命名规范）

```
LazyGenius/
├── index.html                    # HTML 入口文件
├── package.json                  # 项目依赖配置
├── vite.config.ts                # Vite 构建配置
├── postcss.config.mjs            # PostCSS 配置
│
├── src/
│   ├── main.jsx                  # ✨ React 应用入口文件
│   ├── Flashcard.jsx             # ✨ 页面主组件（核心业务逻辑）
│   ├── Flashcard.css             # ✨ 全局样式文件（合并所有样式）
│   │
│   ├── components/               # ✨ 组件库目录
│   │   ├── Header.jsx           # 顶部导航（Logo + 模式切换）
│   │   ├── BrandLogo.jsx        # 品牌Logo（旋转边框 + 发光效果）
│   │   ├── AddLinkButton.jsx    # 添加链接按钮（主要CTA）
│   │   ├── CardView.jsx         # 卡片视图（支持拖拽滑动）
│   │   ├── CardDetail.jsx       # 卡片详情页
│   │   ├── BottomActions.jsx    # 底部操作按钮（保留/归档）
│   │   ├── InputPanel.jsx       # 输入面板（底部弹出）
│   │   ├── LoadingState.jsx     # 加载动画状态
│   │   └── SwipeHint.jsx        # 滑动提示组件
│   │
│   └── data/
│       └── mockCards.js          # 模拟数据（卡片 + 鼓励语）
│
└── dist/                         # 构建输出目录（npm run build 后生成）
```

## 🎯 命名规则说明

### ✅ 新的统一命名规范

| 类型 | 路径 | 说明 |
|------|------|------|
| **入口文件** | `/src/main.jsx` | React 应用启动入口 |
| **主组件** | `/src/Flashcard.jsx` | 页面核心组件（App逻辑） |
| **全局样式** | `/src/Flashcard.css` | 合并所有CSS（Fonts + Tailwind + Theme） |
| **组件库** | `/src/components/*.jsx` | 所有业务组件 |
| **数据文件** | `/src/data/*.js` | Mock数据/配置 |

### ❌ 旧的目录结构（已废弃）

- ~~`/src/app/App.tsx`~~ → 已迁移到 `/src/Flashcard.jsx`
- ~~`/src/app/pages/Home.tsx`~~ → 逻辑已合并到 `Flashcard.jsx`
- ~~`/src/app/components/*.tsx`~~ → 已迁移到 `/src/components/*.jsx`
- ~~`/src/styles/index.css`~~ → 已合并到 `/src/Flashcard.css`

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
# 或
pnpm install
# 或
yarn install
```

### 2. 启动开发服务器

```bash
npm run dev
```

浏览器访问：`http://localhost:5173`

### 3. 构建生产版本

```bash
npm run build
```

构建产物输出到 `/dist` 目录

### 4. 预览构建产物

```bash
npm run preview
```

## 📦 技术栈

- **框架**: React 18.3.1
- **构建工具**: Vite 6.3.5
- **样式方案**: Tailwind CSS v4
- **动画库**: Motion (Framer Motion 继任者)
- **图标库**: Lucide React
- **UI组件**: Radix UI + 自定义组件
- **通知提示**: Sonner

## 🎨 核心特性

### 1. 深色科技风格
- 紫黑色主题（`#030213` + Purple/Indigo渐变）
- 记忆宫殿网格背景
- 高斯模糊 + 微光效果

### 2. 三种学习模式
- 🔀 **混合模式**：显示所有卡片
- ✨ **新卡模式**：只显示新卡片
- 📚 **复习模式**：只显示已保留卡片

### 3. Tinder式交互
- ← **左滑归档**：不感兴趣的卡片
- → **右滑保留**：想要学习的卡片
- 流畅的动画反馈（紫绿渐变高光/暗淡效果）

### 4. 卡片结构
- **标题**：核心主题
- **骨架拆解要点**：3-4个关键知识点
- **金句**：可记忆的精华语句

### 5. 首次引导
- 滑动操作提示（仅首次显示）
- 存储在 LocalStorage

## 📱 响应式设计

- 移动端优先（Mobile First）
- 最大宽度 `max-w-md`（448px）
- 适配各种手机屏幕尺寸
- 支持桌面浏览器访问

## 🎭 组件说明

### Header.jsx
顶部导航栏，包含：
- 品牌Logo（旋转边框动画）
- 应用名称（LazyGenius）
- 模式切换器（混合/新卡/复习）

### CardView.jsx
核心卡片组件，支持：
- 拖拽滑动（Drag & Drop）
- 视觉反馈（高光/暗淡）
- 卡片点击进入详情

### InputPanel.jsx
底部弹出输入面板：
- 链接输入框
- 生成卡片按钮
- 弹簧动画效果

### LoadingState.jsx
卡片生成加载动画：
- 4个阶段（标题→要点→金句→组装）
- 粒子效果
- 进度条 + 鼓励语

## 🔧 自定义配置

### 修改主题颜色
编辑 `/src/Flashcard.css` 中的 CSS 变量：

```css
:root {
  --primary: #030213;  /* 主色 */
  --purple-500: #a855f7;  /* 紫色强调色 */
  /* ... 更多颜色变量 */
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
    // ...
  }
];
```

## 📄 文件依赖关系

```
index.html
  └─ src/main.jsx
      ├─ src/Flashcard.jsx (主组件)
      │   ├─ src/Flashcard.css (全局样式)
      │   ├─ src/components/Header.jsx
      │   ├─ src/components/CardView.jsx
      │   ├─ src/components/InputPanel.jsx
      │   ├─ src/components/LoadingState.jsx
      │   ├─ src/components/CardDetail.jsx
      │   └─ src/data/mockCards.js
      └─ sonner (Toast通知库)
```

## 🌐 部署建议

### Vercel / Netlify
```bash
npm run build
# 将 dist/ 目录部署到静态托管平台
```

### GitHub Pages
```bash
npm run build
# 配置 base: '/repo-name/' 在 vite.config.ts
```

## 🐛 已知问题

- 当前使用 Mock 数据，未连接真实 API
- 链接解析功能需要后端支持
- LocalStorage 存储有限，建议接入数据库

## 📝 开发计划

- [ ] 接入真实链接解析 API
- [ ] 实现用户认证系统
- [ ] 添加数据同步功能
- [ ] 支持自定义标签分类
- [ ] 导出学习统计报告

---

**开发团队**: LazyGenius Team  
**最后更新**: 2026-03-01  
**版本**: v1.0.0
