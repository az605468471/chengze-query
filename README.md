# 承泽查询系统 - DeFi 安全分析平台

## 🚀 快速开始

### 1. 启动服务
```bash
cd /app/workspace/defi-shield/frontend
node server.cjs
```

### 2. 访问地址
- 本地访问: http://localhost:10002
- 公网访问: 需要部署到服务器或使用内网穿透工具

## 🔧 功能特性

### ✅ 已完成
- 🎨 现代化 UI 设计
- 🔍 合约地址搜索
- 📊 风险评分计算
- 💰 持仓分布展示
- 📈 流动性数据展示
- 🔗 Web3 钱包连接 (MetaMask)
- 🔑 BSCScan API 集成

### 📋 技术栈
- **前端**: React + Tailwind CSS + Vite
- **后端**: Node.js + Express
- **API**: Etherscan V2 API + DexScreener API
- **Web3**: ethers.js

## 🛠️ 开发指南

### 安装依赖
```bash
cd /app/workspace/defi-shield/frontend
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 📝 API 配置

### BSCScan API Key
已配置在 `.env` 文件中：
```env
VITE_BSCSCAN_API_KEY=SNJCU6W7JKDMHMNF5DY9EHTYKHPD31QEBW
```

## 🔍 使用方法

### 1. 浏览器访问
1. 打开 Chrome/Firefox/Safari
2. 访问 http://localhost:10002
3. 输入合约地址（如 USDT: `0x55d398326f99059fF775485246999027B3197955`）
4. 点击"分析"按钮

### 2. DAPP 访问
1. 安装 MetaMask 浏览器插件
2. 访问 http://localhost:10002
3. 点击"连接钱包"按钮
4. 在 MetaMask 中确认连接

## 📂 项目结构

```
defi-shield/
├── frontend/                # 前端项目
│   ├── src/                 # 源代码
│   │   ├── components/      # React 组件
│   │   ├── utils/           # 工具函数
│   │   ├── assets/          # 静态资源
│   │   ├── App.jsx          # 主应用组件
│   │   └── main.jsx         # 入口文件
│   ├── dist/                # 构建产物
│   ├── server.cjs           # 后端服务器
│   ├── package.json         # 依赖配置
│   └── vite.config.js       # Vite 配置
├── contracts/               # 智能合约
├── .env                     # 环境变量
└── README.md                # 项目说明
```

## 🐛 常见问题

### Q1: 服务器启动失败
**原因**: 端口 10002 被占用
**解决**:
```bash
# 查找占用端口的进程
netstat -tlnp | grep 10002

# 杀死进程
kill -9 <PID>

# 重新启动服务
cd /app/workspace/defi-shield/frontend
node server.cjs
```

### Q2: API 查询失败
**原因**: API Key 无效或过期
**解决**: 检查 `.env` 文件中的 API Key 是否正确

### Q3: 钱包连接失败
**原因**: MetaMask 未安装或未登录
**解决**: 
1. 安装 MetaMask 浏览器插件
2. 创建或导入钱包
3. 确保网络切换到 BSC 主网

## 📊 API 测试

### 测试 BSCScan API
```bash
curl "https://api.etherscan.io/v2/api?chainid=56&module=contract&action=getsourcecode&address=0x55d398326f99059fF775485246999027B3197955&apikey=SNJCU6W7JKDMHMNF5DY9EHTYKHPD31QEBW"
```

### 测试本地服务器
```bash
curl http://localhost:10002/
```

## 📝 更新日志

### v1.0.0 (2024-06-07)
- ✅ 初始版本发布
- ✅ 合约信息查询
- ✅ 持仓分布展示
- ✅ 流动性数据展示
- ✅ 风险评分计算
- ✅ Web3 钱包连接
- ✅ BSCScan API 集成

## 📞 联系方式

如有问题，请联系项目管理员。

---

**承泽查询系统** - DeFi 安全分析平台