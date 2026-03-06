## LazyGenius

把一条链接变成一张“可滑动复习”的知识卡。

### 功能概览

- 生成能力：支持网页链接（GitHub、Archive）、长文本与图片上传生成结构化知识卡。
- 复习流：右滑保留、左滑归档；支持按策略拉取下一张卡（new/review/random/hybrid）。
- 详情页：可查看原文节选与原文链接，方便回到来源。
- 移动端体验：页面可上下滚动以完整展示卡片与“查看详情”，并兼容 iOS safe-area。
- 长度控制：模型提示词与后端裁剪共同保证标题/要点/金句不会超长导致前端展示异常。

### 项目结构

- `backend/`：FastAPI + SQLite（默认），提供卡片生成、获取与复习接口
- `frontend/`：Vite + React，移动端优先的卡片 UI

### 本地启动

#### 1) 后端

1. 复制并填写环境变量：
   - 从 [backend/.env.example](file:///Users/bytedance/Documents/lazygenius/backend/.env.example) 复制到 `backend/.env`
2. 安装依赖并启动：

```bash
cd backend
python -m venv ../.venv
source ../.venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

验证：
- `http://localhost:8001/docs`

#### 2) 前端

1. 复制并填写环境变量：
   - 从 [frontend/.env.example](file:///Users/bytedance/Documents/lazygenius/frontend/.env.example) 复制到 `frontend/.env.local`
   - `VITE_API_BASE` 指向后端，例如 `http://localhost:8001`
2. 启动：

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

验证：
- 电脑访问：`http://localhost:5173`
- 手机访问：用电脑的局域网 IP，例如 `http://10.x.x.x:5173`（手机与电脑同一 Wi‑Fi）

### 常用接口

- `GET /cards/next?strategy=random|new|review|hybrid`：获取下一张卡
- `POST /cards/generate`：从 URL 或文本生成卡片
- `POST /cards/{id}/review`：`keep`/`archive`

说明：`/docs` 与 `/openapi.json` 默认开放；`/admin` 前缀接口需要 `x-admin-key`（由后端 `ADMIN_KEY` 控制）。

### 部署（Render + Vercel）

- Render：后端更新后，优先确认 `https://<render后端域名>/docs` 可打开
- Vercel：前端环境变量 `VITE_API_BASE` 指向 Render 后端域名，然后触发一次 Redeploy

### 相关文档

- 飞书机器人接入：[LARK_SETUP_GUIDE.md](file:///Users/bytedance/Documents/lazygenius/LARK_SETUP_GUIDE.md)
- 排障复盘：[TROUBLESHOOTING.md](file:///Users/bytedance/Documents/lazygenius/TROUBLESHOOTING.md)
