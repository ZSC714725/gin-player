# 🎬 Gin Player

一个基于 Gin 框架的现代化视频播放器集合，集成了多种主流流媒体播放技术，为开发者提供完整的 Web 视频播放解决方案。

## ✨ 特性

- 🎯 **多协议支持**：支持 HLS、HTTP-FLV、MPEG-TS、RTSP、LAS、WHEP 等多种流媒体协议
- 🚀 **低延迟播放**：专为实时流媒体优化，支持超低延迟播放
- 🎨 **现代化界面**：美观的响应式设计，支持键盘导航
- 🔧 **易于使用**：直观的用户界面，无需复杂配置
- 📱 **跨平台兼容**：支持桌面端和移动端浏览器
- 🛠️ **开发友好**：基于 Gin 框架，易于扩展和定制

## 🎥 支持的播放器

| 播放器 | 协议支持 | 特点 | 访问地址 |
|--------|----------|------|----------|
| **FLV.js** | HTTP-FLV | 基于 HTML5 的 FLV 播放器 | `/flvjs.html` |
| **HLS.js** | HLS | HTTP Live Streaming 播放器 | `/hlsjs.html` |
| **MPEG-TS** | MPEG2-TS/FLV | 基于 flv.js 的低延迟播放器 | `/mpegts.html` |
| **Jessibuca** | HTTP-FLV | 超低延迟视频播放器 | `/jessibuca.html` |
| **Jessibuca Pro** | HTTP-FLV/HLS/MP4 | 专业版低延迟播放器，支持AI检测 | `/jessibuca-pro/` |

| **LAS** | LAS | 轻量级自适应流媒体播放器 | `/las.html` |
| **RTSP** | RTSP over WebSocket | RTSP 协议播放器 | `/rtsp.html` |
| **WHEP** | WebRTC | WebRTC-HTTP Egress Protocol 播放器 | `/whep.html` |

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/your-username/gin-player.git
cd gin-player
```

### 2. 安装依赖
```bash
go mod tidy
```

### 3. 运行项目
```bash
go run main.go
```

### 4. 访问首页
打开浏览器访问：http://localhost:8080

## 🐳 Docker 运行

### 构建镜像
```bash
docker build -t gin-player:latest .
```

### 运行容器
```bash
docker run -it -p 8080:8080 gin-player:latest
```

## 📱 使用指南

### 首页导航
访问 http://localhost:8080/index.html 可以看到所有播放器的卡片界面：
- 支持键盘导航（方向键、回车键）
- 响应式设计，适配不同屏幕尺寸
- 点击任意卡片即可跳转到对应播放器

### WHEP 播放器
支持三种访问方式：

1. **从首页访问**：
   - 在首页点击 WHEP 卡片
   - 在弹出的对话框中输入 WHEP 服务器地址
   - 自动跳转到播放器页面并填充地址
   - 点击"开始播放"按钮开始播放

2. **直接访问**：`http://localhost:8080/whep.html`
   - 手动输入 WHEP 服务器地址
   - 点击"开始播放"按钮开始播放

3. **带参数访问**：`http://localhost:8080/whep?url=your-whep-url`
   - 自动填充 WHEP 服务器地址
   - 点击"开始播放"按钮即可开始播放

### Jessibuca Pro 播放器
Jessibuca Pro 是专业版低延迟播放器，提供以下高级功能：
- **多协议支持**：HTTP-FLV、HLS、MP4 等多种格式
- **AI 检测功能**：人脸检测、物体检测、遮挡检测等
- **录制功能**：支持 MP4 录制和截图
- **多画面布局**：支持 2x2、3x3、4x4、5x5、6x6、6x7 等多种布局
- **加密支持**：支持多种加密方式（M7S、SM4、XOR等）
- **弹幕功能**：支持实时弹幕显示
- **PTZ 控制**：支持云台控制功能

访问 `/jessibuca-pro/` 查看所有演示页面。

### 其他播放器
所有播放器都提供了直观的界面，支持：
- URL 输入和配置
- 播放控制（开始、停止、暂停等）
- 实时状态显示
- 错误处理和提示

## 🔧 技术架构

### 后端
- **框架**：Gin (Go)
- **模板引擎**：Go HTML Template
- **静态文件服务**：内置静态文件服务器

### 前端
- **播放器库**：
  - [flv.js](https://github.com/bilibili/flv.js) - HTTP-FLV 播放
  - [hls.js](https://github.com/video-dev/hls.js) - HLS 播放
  - [mpegts.js](https://github.com/xqq/mpegts.js) - MPEG-TS 播放
  - [jessibuca](https://github.com/langhuihui/jessibuca) - 低延迟播放
  - [jessibuca-pro](https://github.com/langhuihui/jessibuca-pro) - 专业版低延迟播放器，支持AI检测
  - [LAS](https://github.com/KwaiVideoTeam/las) - 自适应流媒体
- **WebRTC**：WHIP/WHEP 协议支持
- **样式**：现代化 CSS3 + 响应式设计

## 📋 各播放器访问地址

| 播放器 | 访问地址 | 说明 |
|--------|----------|------|
| 首页 | http://localhost:8080 | 播放器导航首页 |
| FLV.js | http://localhost:8080/flvjs.html | HTTP-FLV 播放器 |
| HLS.js | http://localhost:8080/hlsjs.html | HLS 播放器 |
| MPEG-TS | http://localhost:8080/mpegts.html | MPEG2-TS/FLV 播放器 |
| Jessibuca | http://localhost:8080/jessibuca.html | 低延迟播放器 |
| Jessibuca Pro | http://localhost:8080/jessibuca-pro/ | 专业版低延迟播放器 |

| LAS | http://localhost:8080/las.html | 自适应流媒体播放器 |
| RTSP | http://localhost:8080/rtsp.html | RTSP over WebSocket |
| WHEP | http://localhost:8080/whep.html | WebRTC 播放器 |
| WHEP (带参数) | http://localhost:8080/whep?url=your-whep-url | WebRTC 播放器 (自动填充地址) |

## 📄 LAS 协议配置示例

LAS 播放器支持多分辨率自适应播放，以下是 manifest.json 配置示例：

```json
{
    "version": "1.0.0",
    "adaptationSet": [
        {
            "duration": 1000,
            "id": 1,
            "representation": [
                {
                    "id": 1,
                    "codec": "avc1.64001e,mp4a.40.5",
                    "url": "https://las-tech.org.cn/kwai/las-test_ld500d.flv",
                    "backupUrl": [],
                    "host": "las-tech.org.cn",
                    "maxBitrate": 700,
                    "width": 640,
                    "height": 360,
                    "frameRate": 25,
                    "qualityType": "SMOOTH",
                    "qualityTypeName": "流畅",
                    "hidden": false,
                    "disabledFromAdaptive": false,
                    "defaultSelected": true
                },
                {
                    "id": 2,
                    "codec": "avc1.64001f,mp4a.40.5",
                    "url": "https://las-tech.org.cn/kwai/las-test_sd1000d.flv",
                    "backupUrl": [],
                    "host": "las-tech.org.cn",
                    "maxBitrate": 1300,
                    "width": 960,
                    "height": 540,
                    "frameRate": 25,
                    "qualityType": "STANDARD",
                    "qualityTypeName": "标清",
                    "hidden": false,
                    "disabledFromAdaptive": false,
                    "defaultSelected": false
                },
                {
                    "id": 3,
                    "codec": "avc1.64001f,mp4a.40.5",
                    "url": "https://las-tech.org.cn/kwai/las-test.flv",
                    "backupUrl": [],
                    "host": "las-tech.org.cn",
                    "maxBitrate": 2300,
                    "width": 1280,
                    "height": 720,
                    "frameRate": 30,
                    "qualityType": "HIGH",
                    "qualityTypeName": "高清",
                    "hidden": false,
                    "disabledFromAdaptive": false,
                    "defaultSelected": false
                }
            ]
        }
    ]
}
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

感谢以下开源项目的支持：
- [Gin](https://github.com/gin-gonic/gin) - Go Web 框架
- [flv.js](https://github.com/bilibili/flv.js) - HTTP-FLV 播放器
- [hls.js](https://github.com/video-dev/hls.js) - HLS 播放器
- [mpegts.js](https://github.com/xqq/mpegts.js) - MPEG-TS 播放器
- [jessibuca](https://github.com/langhuihui/jessibuca) - 低延迟播放器
- [jessibuca-pro](https://github.com/langhuihui/jessibuca-pro) - 专业版低延迟播放器
- [LAS](https://github.com/KwaiVideoTeam/las) - 自适应流媒体
- 以及其他所有贡献者