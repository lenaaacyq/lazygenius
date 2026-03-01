# 飞书机器人配置指南

## 一、创建飞书应用

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 点击「开发者后台」→「创建企业自建应用」
3. 填写应用名称（如：AI知识闪卡）和应用描述
4. 上传应用图标

## 二、配置应用权限

在应用的「权限管理」页面，开通以下权限：

### 消息相关权限
- `im:message` - 获取与发送单聊、群组消息
- `im:message:receive_as_bot` - 接收群聊中@机器人消息
- `im:message.group_msg` - 获取群组消息
- `im:message.p2p_msg` - 获取用户发给机器人的单聊消息
- `im:resource` - 获取与上传图片或文件资源

### 通讯录权限（可选）
- `contact:user.base:readonly` - 获取用户基本信息

## 三、配置事件订阅

1. 在「事件订阅」页面，点击「添加事件订阅」
2. 配置请求网址：
   ```
   https://your-domain.com/lark/webhook
   ```
   > 注意：需要将 `your-domain.com` 替换为你的服务器地址
   > 本地开发可使用 ngrok 等工具进行内网穿透

3. 订阅以下事件：
   - `im.message.receive_v1` - 接收消息

## 四、获取应用凭证

1. 在「凭证与基础信息」页面，复制以下信息：
   - `App ID`
   - `App Secret`

2. 将这些信息配置到后端 `.env` 文件中：
   ```
   LARK_APP_ID=cli_xxxxxxxxxxxx
   LARK_APP_SECRET=xxxxxxxxxxxxxxxxxx
   ```

## 五、发布应用

1. 在「版本管理与发布」页面，点击「创建版本」
2. 填写版本号和更新说明
3. 提交审核
4. 审核通过后，发布应用

## 六、添加机器人到通讯录

1. 发布成功后，在飞书客户端搜索你的应用名称
2. 添加机器人到通讯录
3. 现在你可以向机器人发送消息了！

## 七、使用方式

### 发送文本链接
1. 在微信/浏览器中看到好文章
2. 复制链接或分享到飞书
3. 转发给机器人
4. 机器人自动处理并生成知识闪卡

### 发送图片
1. 截图小红书等内容
2. 在飞书中发送图片给机器人
3. 机器人自动进行 OCR 分析并生成闪卡

## 八、本地开发调试

### 示范卡片种子
运行一次即可清空本地数据库并插入 1 条示范卡片：
```bash
python3 backend/seed_demo_card.py
```

### 使用 ngrok 进行内网穿透

1. 安装 ngrok：
   ```bash
   brew install ngrok
   ```

2. 启动后端服务：
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

3. 启动 ngrok：
   ```bash
   ngrok http 8000
   ```

4. 将 ngrok 提供的 URL 填入飞书事件订阅配置

### 测试 Webhook

使用 curl 测试：
```bash
curl -X POST http://localhost:8000/lark/webhook \
  -H "Content-Type: application/json" \
  -d '{"challenge": "test_challenge"}'
```

应该返回：
```json
{"challenge": "test_challenge"}
```

## 九、常见问题

### Q: 收不到消息？
1. 检查权限配置是否正确
2. 检查事件订阅是否成功
3. 查看后端日志是否有错误

### Q: 图片下载失败？
1. 确认 `im:resource` 权限已开通
2. 检查 LARK_APP_ID 和 LARK_APP_SECRET 是否正确

### Q: AI 生成失败？
1. 检查 OPENAI_API_KEY 是否配置
2. 确认 API Key 余额充足
