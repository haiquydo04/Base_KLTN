# Vercel 部署指南

## 目录

- [项目概述](#项目概述)
- [部署前准备](#部署前准备)
- [部署步骤](#部署步骤)
- [环境变量配置](#环境变量配置)
- [WebSocket / WebRTC 配置](#websocket--webrtc-配置)
- [路由配置](#路由配置)
- [常见问题排查](#常见问题排查)

---

## 项目概述

本项目是一个 React + Vite 前端应用，用于在线交友平台。

### 技术栈

- **前端框架**: React 18 + Vite 5
- **路由**: React Router v6
- **状态管理**: Zustand
- **实时通信**: Socket.IO Client
- **地图**: Leaflet + React-Leaflet
- **样式**: Tailwind CSS

### 页面路由

| 路由 | 页面 | 权限 |
|------|------|------|
| `/` | 首页/落地页 | 公开 |
| `/login` | 登录 | 公开 |
| `/register` | 注册 | 公开 |
| `/forgot-password` | 忘记密码 | 公开 |
| `/discover` | 发现/匹配 | 需登录 |
| `/messages` | 消息列表 | 需登录 |
| `/chat/:matchId` | 聊天页面 | 需登录 |
| `/profile` | 个人资料 | 需登录 |
| `/profile/edit` | 编辑资料 | 需登录 |
| `/video-chat` | 随机视频聊天 | 需登录 |
| `/safety` | 安全中心 | 需登录 |

---

## 部署前准备

### 1. 确保后端服务已部署

本前端应用需要后端 API 服务。请确保：

- 后端服务已部署到可访问的服务器或云平台
- 后端支持 HTTPS（WebSocket/WEBRTC 需要）
- 记录后端服务的 URL（例如：`https://api.your-domain.com`）

### 2. 本地测试生产构建

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 测试生产构建
npm run build

# 预览构建结果
npm run preview
```

### 3. 安装 Vercel CLI（可选）

```bash
npm install -g vercel
```

---

## 部署步骤

### 方式一：通过 Git 部署（推荐）

1. **推送代码到 Git 仓库**

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

2. **在 Vercel 导入项目**

- 访问 [vercel.com](https://vercel.com)
- 点击 "Import Project"
- 选择你的 Git 仓库
- 配置项目设置：

| 设置项 | 值 |
|--------|-----|
| Framework Preset | Vite |
| Root Directory | `./` 或 `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

3. **配置环境变量**（见下文）

4. **点击 Deploy**

### 方式二：通过 Vercel CLI 部署

```bash
# 登录 Vercel
vercel login

# 部署项目
cd frontend
vercel

# 按提示配置...
```

### 方式三：通过 vercel.json 自动化部署

项目根目录已包含 `vercel.json` 配置文件：

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install"
}
```

---

## 环境变量配置

### 必需的环境变量

在 Vercel Dashboard 中配置以下环境变量：

| 变量名 | 描述 | 示例值 |
|--------|------|--------|
| `VITE_API_URL` | 后端 API 地址 | `https://api.your-backend.com` |

### 配置步骤

1. 进入 Vercel Dashboard
2. 选择你的项目
3. 点击 Settings → Environment Variables
4. 添加变量：

```
Name: VITE_API_URL
Value: https://your-backend-domain.com
Environments: Production, Preview, Development
```

5. 重新部署（Redeploy）

### 本地开发环境变量

创建 `frontend/.env` 文件：

```env
# 开发环境 - 使用 Vite 代理（无需填写）
VITE_API_URL=

# 如果需要连接远程后端进行调试：
# VITE_API_URL=http://localhost:5000
```

---

## WebSocket / WebRTC 配置

### Socket.IO 配置

应用使用 Socket.IO 进行实时通信：

```javascript
// 连接地址逻辑
const getSocketUrl = () => {
  // 生产环境：使用环境变量指定的后端地址
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || `${protocol}//${host}`;
  }
  // 开发环境：使用本地后端
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};
```

### WebRTC 配置

WebRTC 使用 Google STUN 服务器：

```javascript
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});
```

### 注意事项

1. **HTTPS 要求**: WebSocket 和 WebRTC 必须通过 HTTPS 连接
2. **CORS 配置**: 确保后端允许来自前端的跨域请求
3. **WebSocket 代理**: `vercel.json` 中已配置 `/socket.io` 路由重写

---

## 路由配置

### HashRouter vs BrowserRouter

本项目使用 **HashRouter** 以优化 Vercel 部署：

- URL 格式: `https://example.com/#/messages`
- 无需服务器配置即可支持所有路由
- 避免 SPA 刷新 404 问题

### 路由变更说明

如果需要切换回 BrowserRouter：

1. 修改 `src/main.jsx`：
```jsx
import { BrowserRouter } from 'react-router-dom';

<BrowserRouter>
  <App />
</BrowserRouter>
```

2. 在 `vercel.json` 中添加配置：
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 常见问题排查

### 1. 页面刷新 404

**问题**: 刷新页面后显示 404

**解决**: 本项目使用 HashRouter，URL 应该包含 `#`，例如：
- 正确: `https://your-app.vercel.app/#/messages`
- 错误: `https://your-app.vercel.app/messages`

如果使用 BrowserRouter，需要在 `vercel.json` 中添加 rewrites 配置。

### 2. WebSocket 连接失败

**问题**: Socket.IO 无法连接

**检查项**:
1. 确认 `VITE_API_URL` 环境变量正确设置
2. 确认后端服务支持 HTTPS
3. 检查浏览器控制台错误信息
4. 确认后端 CORS 配置正确

**后端 CORS 配置示例**:
```javascript
const corsOptions = {
  origin: ['https://your-frontend.vercel.app'],
  credentials: true
};
app.use(cors(corsOptions));
```

### 3. API 请求失败

**问题**: API 请求返回 404 或网络错误

**解决**:
1. 确认 `VITE_API_URL` 指向正确的后端地址
2. 检查 API 路由是否正确
3. 查看浏览器 Network 面板定位问题

### 4. 地图不显示

**问题**: Leaflet 地图组件无法加载

**解决**:
1. 确认 Leaflet CSS 已正确引入
2. 检查地图容器的宽高设置
3. 确认地图服务（OSM/Tile）可访问

### 5. 生产构建失败

**问题**: `npm run build` 报错

**常见原因**:
- Node 版本不兼容
- 缺少环境变量
- 依赖安装不完整

**解决**:
```bash
# 清除缓存并重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 部署检查清单

部署前请确认以下项目：

- [ ] 后端 API 服务已部署并可访问
- [ ] `VITE_API_URL` 环境变量已配置
- [ ] 后端 CORS 已配置允许前端域名
- [ ] 后端支持 HTTPS（WebSocket/WRTC 需要）
- [ ] 本地生产构建测试通过
- [ ] 所有页面路由在 Vercel 上测试通过
- [ ] WebSocket 连接测试成功
- [ ] 消息发送/接收功能正常
- [ ] 视频聊天功能正常（如适用）

---

## 后端部署建议

由于前端需要后端服务，建议后端也部署到 Vercel 或其他云平台：

### 后端部署选项

1. **Vercel Serverless Functions**: 适合轻量级 API
2. **Railway**: 简单易用的 Node.js 部署
3. **Render**: 支持 WebSocket 的免费部署平台
4. **Fly.io**: 支持持久连接和 WebSocket
5. **DigitalOcean App Platform**: 简单部署

### 后端环境变量

后端也需要配置相应的环境变量：

```env
# 前端 URL（用于 CORS）
FRONTEND_URL=https://your-frontend.vercel.app

# 数据库连接
MONGODB_URI=mongodb+srv://...

# JWT 密钥
JWT_SECRET=your-secret-key

# 其他配置...
```

---

## 性能优化建议

### 生产构建优化

项目已配置以下优化：

1. **代码分割**: 按 vendor、socket、maps 分组
2. **Terser 压缩**: 移除 console 和 debugger
3. **Tree Shaking**: 自动移除未使用代码
4. **懒加载**: Leaflet 地图库按需加载

### 前端优化建议

1. **图片优化**: 使用 WebP 格式，添加懒加载
2. **字体优化**: 预加载关键字体
3. **缓存策略**: 配置适当的缓存头
4. **CDN**: 考虑使用 Vercel Edge Network

---

## 技术支持

如有问题，请检查：

1. Vercel Dashboard 的 Deployment 日志
2. 浏览器开发者工具 Console 和 Network
3. 后端服务日志
