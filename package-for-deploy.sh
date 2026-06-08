#!/bin/bash
# 承泽查询系统 - 打包部署文件
# 此脚本会创建一个完整的部署包

echo "========================================"
echo "承泽查询系统 - 打包部署文件"
echo "========================================"
echo ""

# 检查 dist 目录
DIST_DIR="/app/workspace/defi-shield/frontend/dist"
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ 错误：dist 目录不存在"
    echo "请先运行 npm run build"
    exit 1
fi

# 创建打包目录
PACKAGE_DIR="/tmp/chengze-query-package"
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

echo "📁 复制项目文件..."
cp -r "$DIST_DIR"/* "$PACKAGE_DIR/"

echo "📄 创建 README.md..."
cat > "$PACKAGE_DIR/README.md" << 'EOF'
# 承泽查询系统

DeFi 安全分析平台 - 一键分析 DeFi 项目安全性

## 🚀 快速开始

### 方法 1：直接访问（推荐）

1. 打开 Chrome 浏览器
2. 访问：https://您的用户名.github.io/chengze-query/
3. 输入合约地址，点击"分析"

### 方法 2：本地运行

1. 安装 Node.js（https://nodejs.org/）
2. 下载项目文件
3. 运行 `node server.cjs`
4. 访问 http://localhost:10002

## 📦 项目文件

- `index.html` - 主页面
- `favicon.svg` - 网站图标
- `icons.svg` - 图标文件
- `assets/` - 静态资源
  - `index-BkK3D2tN.js` - JavaScript 文件
  - `index-pT7qmiQ8.css` - CSS 样式

## 🔧 功能特性

- 🔐 **合约信息查询** - 查看合约名称、编译器、验证状态
- 👥 **持仓分布分析** - 分析代币持有者分布
- 💧 **流动性数据查询** - 查看流动性池和交易量
- 📋 **风险评分系统** - 自动评估项目风险

## 📝 使用示例

### 查询 USDT 合约

1. 输入合约地址：`0x55d398326f99059fF775485246999027B3197955`
2. 点击"分析"按钮
3. 查看结果：
   - 合约信息：BEP20USDT
   - 验证状态：✅ 已验证
   - 风险评分：根据分析结果

## 🔑 API 配置

项目已配置 BSCScan API Key：
- API Key：`SNJCU6W7JKDMHMNF5DY9EHTYKHPD31QEBW`
- API 版本：Etherscan V2 API
- 链 ID：56（BSC）

## 🌐 部署到 GitHub Pages

### 步骤 1：注册 GitHub 账号

1. 访问 https://github.com
2. 点击 "Sign up"
3. 填写注册信息

### 步骤 2：创建仓库

1. 登录 GitHub
2. 点击右上角 "+" → "New repository"
3. 仓库名称：`chengze-query`
4. 选择 "Public"
5. 点击 "Create repository"

### 步骤 3：上传文件

1. 进入仓库页面
2. 点击 "Add file" → "Upload files"
3. 将 `dist/` 文件夹中的所有文件拖拽上传
4. 填写提交信息：`Initial commit`
5. 点击 "Commit changes"

### 步骤 4：启用 GitHub Pages

1. 进入仓库设置
2. 左侧菜单找到 "Pages"
3. Source：选择 "Deploy from a branch"
4. Branch：选择 "main"
5. 文件夹：选择 "/ (root)"
6. 点击 "Save"

### 步骤 5：访问网站

- 等待 1-5 分钟
- 访问：https://您的用户名.github.io/chengze-query/

## 🚨 常见问题

### Q：上传文件后网站打不开？
A：检查文件结构，确保 `index.html` 在根目录。

### Q：GitHub Pages 部署需要多长时间？
A：通常 1-5 分钟，有时可能需要更长时间。

### Q：可以自定义域名吗？
A：可以，在 Pages 设置中配置。

### Q：网站有访问限制吗？
A：GitHub Pages 免费，没有访问限制。

## 📞 技术支持

如有问题，请提供：
1. 您卡在哪一步？
2. 遇到什么错误信息？
3. 我来帮您解决！

---

**承泽查询系统** - 让 DeFi 安全分析更简单！ 🚀
EOF

echo "📋 创建部署说明..."
cat > "$PACKAGE_DIR/DEPLOY_INSTRUCTIONS.txt" << 'EOF'
========================================
承泽查询系统 - 部署说明
========================================

1. 打开 Chrome 浏览器
2. 访问 https://github.com
3. 注册 GitHub 账号
4. 创建新仓库：chengze-query
5. 上传项目文件
6. 启用 GitHub Pages
7. 访问 https://您的用户名.github.io/chengze-query/

详细步骤请查看 README.md 文件

========================================
EOF

echo "✅ 打包完成！"
echo ""
echo "📁 打包目录：$PACKAGE_DIR"
echo ""
echo "📋 文件清单："
ls -la "$PACKAGE_DIR"
echo ""
echo "📦 创建压缩包..."
cd /tmp && tar -czf chengze-query-package.tar.gz chengze-query-package/
echo "✅ 压缩包已创建：/tmp/chengze-query-package.tar.gz"
echo ""
echo "🚀 下一步："
echo "1. 上传 $PACKAGE_DIR 中的所有文件到 GitHub"
echo "2. 或下载压缩包后解压上传"
echo "3. 按照 README.md 中的步骤操作"
echo ""
echo "========================================"