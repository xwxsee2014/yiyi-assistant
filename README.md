# YiYi AI Assistant

YiYi AI Assistant 是一个基于 Electron 的桌面应用程序，可以连接到开源的 MCP (Model Control Protocol) 服务器，利用大型语言模型能力来处理用户的各种请求。应用程序会将用户输入的需求通过 AI agent 逐步处理，并显示处理过程和最终结果。

## 功能特点

- 连接到开源的 MCP 服务器（支持 WebSocket 和 HTTP/HTTPS 协议）
- 灵活选择要使用的语言模型
- AI agent 逐步处理用户需求
- 显示处理过程中的中间步骤
- 简洁直观的用户界面

## 安装步骤

1. 确保已经安装了 [Node.js](https://nodejs.org/) (推荐版本 14.x 或更高)

2. 克隆本仓库或下载源代码：

```bash
git clone https://github.com/yourusername/yiyi-assistant.git
cd yiyi-assistant
```

3. 安装依赖：

```bash
npm install
```

## 运行应用程序

### 开发模式

开发模式会打开 DevTools，方便调试：

```bash
npm run dev
```

### 普通运行

不带开发者工具的正常运行：

```bash
npm start
```

### 构建可执行文件

构建独立的可执行文件（Windows/macOS/Linux）：

```bash
npm run build
```

构建完成后，可执行文件将位于 `dist` 目录中。

## 使用说明

1. 启动应用后，你需要首先配置 MCP 服务器连接：
   - 服务器 URL（例如 `ws://localhost:8765` 或 `https://api.example.com`）
   - API Key（如果服务器需要的话）
   - 模型名称（例如 `gpt-3.5-turbo` 或 `llama2`）

2. 点击 "Connect" 按钮连接到 MCP 服务器。

3. 连接成功后，在输入框中输入你的请求或问题，然后按 "Send" 或按 Enter 键发送。

4. AI agent 将逐步处理你的请求，界面上会显示每个处理步骤和最终回答。

## 可连接的 MCP 服务器

该应用程序支持各种符合 MCP 协议的开源服务器，例如：

- [LocalAI](https://github.com/go-skynet/LocalAI)
- [llama.cpp 服务器](https://github.com/ggerganov/llama.cpp)
- 任何符合 OpenAI API 格式的自托管服务器

## 注意事项

- 大型语言模型服务器可能需要较大的系统资源，特别是在本地运行时
- 确保你已获得所使用模型的适当授权或许可
- 处理敏感信息时请注意数据隐私和安全性

## 开发指南

项目结构：

- `main.js` - Electron 主进程
- `preload.js` - 预加载脚本，处理安全的 IPC 通信
- `renderer/` - 包含渲染进程的 HTML、CSS 和 JavaScript
- `src/` - 后端逻辑，包含 AI agent 和 MCP 客户端

如需贡献代码，请提交 Pull Request。

## 许可证

此项目使用 MIT 许可证 - 详见 LICENSE 文件。
