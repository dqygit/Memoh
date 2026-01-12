# CLI 工具

Memoh 提供了功能强大的命令行工具，让你可以轻松管理和配置你的 AI 助手。

## 安装

CLI 工具已包含在主项目中，无需单独安装。

## 快速开始

### 登录

```bash
pnpm cli auth login
```

或者使用参数：

```bash
pnpm cli auth login -u admin -p password
```

### 查看当前用户

```bash
pnpm cli auth whoami
```

### Agent 交互模式

```bash
pnpm cli
```

或者：

```bash
pnpm cli agent interactive
```

## 主要命令

### 认证

- `auth login` - 登录
- `auth logout` - 登出
- `auth whoami` - 查看当前用户
- `auth config` - 配置 API URL

### Agent

- `agent chat <message>` - 发送消息
- `agent interactive` - 进入交互模式

### 模型管理

- `model list` - 列出所有模型
- `model create` - 创建新模型
- `model get <id>` - 获取模型详情
- `model delete <id>` - 删除模型
- `model defaults` - 查看默认模型

### 记忆管理

- `memory search <query>` - 搜索记忆
- `memory add <content>` - 添加记忆
- `memory messages` - 查看消息历史

### 定时任务

- `schedule list` - 列出所有定时任务
- `schedule create` - 创建定时任务
- `schedule toggle <id>` - 启用/禁用任务


