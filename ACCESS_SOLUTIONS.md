# 承泽查询系统 - 访问说明

## 🚨 重要说明

由于服务器运行在远程容器环境中，`web_publish` 功能无法正常工作（pod not found），导致无法生成公网访问链接。

---

## 🎯 解决方案

### 方案 1：使用本地服务器（推荐）

如果您希望在本地运行服务器，我可以帮您创建一个完整的本地项目包：

**文件结构：**
```
承泽查询系统/
├── index.html          # 主页面
├── server.cjs          # Node.js 服务器
├── assets/             # 静态资源
│   ├── index-BkK3D2tN.js
│   ├── index-pT7qmiQ8.css
│   └── ...
├── .env                # API 配置
└── README.md           # 使用说明
```

**使用方法：**
1. 下载项目包
2. 安装 Node.js
3. 运行 `node server.cjs`
4. 在浏览器访问 `http://localhost:10002`

---

### 方案 2：部署到云服务器

如果您有云服务器（如阿里云、腾讯云、AWS）：

1. **上传项目文件**
2. **安装 Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **启动服务器**
   ```bash
   cd /app/workspace/defi-shield/frontend
   node server.cjs
   ```

4. **配置防火墙**
   ```bash
   sudo ufw allow 10002
   ```

5. **访问方式**
   - 公网 IP：`http://<服务器IP>:10002`
   - 域名：`http://yourdomain.com:10002`

---

### 方案 3：使用内网穿透工具

如果您没有云服务器，可以使用内网穿透工具：

**推荐工具：**
1. **ngrok**（免费）
   ```bash
   # 安装 ngrok
   wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
   tar -xzf ngrok-v3-stable-linux-amd64.tgz
   ./ngrok http 10002
   ```

2. **frp**（开源）
   - 需要一台有公网 IP 的服务器

3. **LocalTunnel**
   ```bash
   npx localtunnel --port 10002
   ```

---

### 方案 4：静态文件部署

将项目部署到静态网站托管服务：

**推荐服务：**
1. **GitHub Pages**（免费）
   - 将 `dist/` 文件夹推送到 GitHub 仓库
   - 启用 GitHub Pages

2. **Vercel**（免费）
   - 连接 GitHub 仓库
   - 自动部署

3. **Netlify**（免费）
   - 拖拽 `dist/` 文件夹上传

---

## 📦 立即获取项目包

我可以帮您创建一个完整的项目包，包含：
- ✅ 所有静态文件
- ✅ Node.js 服务器
- ✅ API 配置
- ✅ 使用说明

**请告诉我您选择哪种方案，我来帮您准备项目包！**

---

## 🔍 当前服务器状态

| 项目 | 状态 |
|------|------|
| 服务器运行 | ✅ 正常（端口 10002） |
| API 配置 | ✅ 已配置 |
| API 测试 | ✅ 通过 |
| 公网访问 | ❌ 不可用（容器限制） |
| 本地访问 | ✅ 可用（localhost:10002） |

---

**请选择方案，我来帮您下一步！** 🚀