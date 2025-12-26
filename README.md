# JSON Tools
https://json.mikukko.com

一个简洁的在线 JSON 工具，支持格式化、压缩、转义等常用操作。

![页面截图](docs/images/page.png)

## 功能

- **格式化** - 将 JSON 格式化为易读的缩进格式
- **压缩** - 将 JSON 压缩为单行
- **转义** - 将 JSON 转义为字符串格式
- **反转义** - 将转义的字符串还原为 JSON
- **压缩转义** - 压缩并转义 JSON
- **移至输入** - 将输出内容移至输入框继续处理

## 技术栈

- React 19
- TypeScript
- Vite
- Monaco Editor
- Tailwind CSS

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## Docker 部署

### 使用预构建镜像

提供两种架构的镜像：

| 架构 | 镜像标签 | 适用场景 |
|------|---------|---------|
| x86_64 | `mikukko/json-tools:latest` | 大多数云服务器、Intel/AMD 设备 |
| ARM64 | `mikukko/json-tools:arm64` | 树莓派、Apple Silicon、ARM 服务器 |

```bash
# x86_64 架构
docker run -d -p 8080:80 mikukko/json-tools:latest

# ARM64 架构
docker run -d -p 8080:80 mikukko/json-tools:arm64
```

访问 http://localhost:8080

### 自行构建镜像

```bash
# 构建镜像
docker build -t json-tools .

# 运行容器
docker run -d -p 8080:80 json-tools
```

### 跨平台构建（M系列Mac构建x86镜像）

```bash
# 创建buildx构建器
docker buildx create --use

# 构建并推送
docker buildx build --platform linux/amd64 -t your-username/json-tools:latest --push .
```

## License

MIT
