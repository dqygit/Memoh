# API Tests

这个目录包含了使用 Elysia Eden Client 编写的 API 测试。

## 测试文件

- `setup.ts` - 测试设置文件，配置测试服务器和 eden client
- `memory.test.ts` - Memory API 测试
- `memory-message.test.ts` - Memory Message API 测试
- `model.test.ts` - Model API 测试
- `settings.test.ts` - Settings API 测试

## 运行测试

从项目根目录运行：

```bash
pnpm test
```

或者只运行 API 包的测试：

```bash
cd packages/api
pnpm test
```

## 测试说明

测试使用 vitest 作为测试框架，并使用 Elysia Eden Client (treaty) 来测试 API 端点。

测试服务器会在测试开始前启动（端口 7003），测试结束后自动关闭。

## 注意事项

- 确保数据库已配置并运行（某些测试可能需要数据库连接）
- 测试使用独立的测试端口（7003）以避免与开发服务器冲突
- 某些测试可能需要先创建数据才能测试查询功能

