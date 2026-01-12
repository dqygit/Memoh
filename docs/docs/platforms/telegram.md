# Telegram Bot 集成

Memoh 支持通过 Telegram Bot 进行交互。

## 快速开始

### 1. 获取 Bot Token

1. 在 Telegram 搜索 `@BotFather`
2. 发送 `/newbot`
3. 按提示输入 bot 名称和用户名
4. 复制获得的 token

### 2. 启动 Telegram Service

```bash
pnpm telegram:start
```

Telegram Service 将在 `http://localhost:7101` 启动。

### 3. 配置 Platform

使用 CLI 工具创建 platform：

```bash
pnpm cli platform create
```

根据提示配置：
- name: `telegram`
- endpoint: `http://localhost:7101`
- config: `{ "botToken": "<your-telegram-bot-token>" }`

## Bot 命令

- `/start` - 欢迎消息和命令列表
- `/login <username> <password>` - 登录到你的账户
- `/logout` - 登出
- `/whoami` - 显示当前用户信息
- `/chat <message>` - 与 AI 对话
- `/help` - 显示帮助信息

## 使用示例

```
你: /start

Bot: 👋 Welcome to Memoh Bot!

你: /login admin password

Bot: ✅ Login successful!

你: /chat 你好，介绍一下你自己

Bot: 🤖 你好！我是 Memoh AI 助手...
```


