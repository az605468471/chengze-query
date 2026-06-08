#!/bin/bash
# 承泽查询系统 - GitHub Pages 部署准备脚本
# 此脚本会准备所有需要上传到 GitHub 的文件

echo "========================================"
echo "承泽查询系统 - GitHub Pages 部署准备"
echo "========================================"
echo ""

# 检查 dist 目录
DIST_DIR="/app/workspace/defi-shield/frontend/dist"
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ 错误：dist 目录不存在"
    echo "请先运行 npm run build"
    exit 1
fi

# 创建临时部署目录
DEPLOY_DIR="/tmp/chengze-query-deploy"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

echo "📁 复制项目文件..."
cp -r "$DIST_DIR"/* "$DEPLOY_DIR/"

echo "📄 创建 README.md..."
cat > "$DEPLOY_DIR/README.md" << 'EOF'
# 承泽查询系统

DeFi 安全分析平台 - 一键分析 DeFi 项目安全性

## 功能特性

- 🔐 合约信息查询
- 👥 持仓分布分析
- 💧 流动性数据查询
- 📋 风险评分系统

## 使用方法

1. 打开网站：https://您的用户名.github.io/chengze-query/
2. 输入合约地址（如 USDT：0x55d398326f99059fF775485246999027B3197955）
3. 点击"分析"按钮
4. 查看合约信息、持仓分布、流动性数据

## API 配置

项目已配置 BSCScan API Key（SNJCU6W7JKDMHMNF5DY9EHTYKHPD31QEBW）

## 技术栈

- React 18
- Vite
- Axios
- Etherscan V2 API

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 部署到 GitHub Pages

1. 上传 `dist/` 文件夹中的所有文件到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 `main` 分支作为源
4. 访问 https://您的用户名.github.io/chengze-query/

## 许可证

MIT License

---

**承泽查询系统** - 让 DeFi 安全分析更简单！
EOF

echo "📋 创建 .gitignore..."
cat > "$DEPLOY_DIR/.gitignore" << 'EOF'
node_modules/
.env
*.log
.DS_Store
EOF

echo "✅ 部署准备完成！"
echo ""
echo "📁 部署目录：$DEPLOY_DIR"
echo ""
echo "📋 需要上传的文件："
ls -la "$DEPLOY_DIR"
echo ""
echo "🚀 下一步："
echo "1. 登录 GitHub"
echo "2. 创建新仓库：chengze-query"
echo "3. 上传 $DEPLOY_DIR 中的所有文件"
echo "4. 启用 GitHub Pages"
echo "5. 访问 https://您的用户名.github.io/chengze-query/"
echo ""
echo "========================================"