# 承泽查询系统 - GitHub Pages 部署指南

## 📋 部署步骤

### 第一步：注册 GitHub 账号

1. **访问 GitHub 官网**
   - 打开浏览器，访问：https://github.com
   - 点击 "Sign up"（注册）

2. **填写注册信息**
   - 用户名：选择一个用户名（如：chengze-query）
   - 邮箱：您的邮箱地址
   - 密码：设置密码

3. **验证邮箱**
   - 查收验证邮件
   - 点击验证链接

---

### 第二步：创建仓库

1. **登录 GitHub**
   - 访问 https://github.com
   - 点击 "Sign in"
   - 输入用户名和密码

2. **创建新仓库**
   - 点击右上角 "+" 图标
   - 选择 "New repository"

3. **填写仓库信息**
   - 仓库名称：`chengze-query` 或 `defi-shield`
   - 描述：`承泽查询系统 - DeFi 安全分析平台`
   - 选择 "Public"（公开）
   - ✅ 勾选 "Add a README file"
   - 点击 "Create repository"

---

### 第三步：上传项目文件

#### 方法 1：使用 GitHub 网页界面（推荐新手）

1. **进入仓库页面**
   - 访问您刚创建的仓库

2. **上传文件**
   - 点击 "Add file" → "Upload files"
   - 将 `dist/` 文件夹中的所有文件拖拽到上传区域
   - 文件包括：
     - `index.html`
     - `favicon.svg`
     - `icons.svg`
     - `assets/` 文件夹（包含 JS 和 CSS 文件）

3. **提交更改**
   - 在页面底部填写提交信息：`Initial commit - 承泽查询系统`
   - 点击 "Commit changes"

#### 方法 2：使用 Git 命令（推荐有经验用户）

```bash
# 1. 克隆仓库
git clone https://github.com/您的用户名/chengze-query.git
cd chengze-query

# 2. 复制项目文件
cp -r /app/workspace/defi-shield/frontend/dist/* .

# 3. 添加文件
git add .

# 4. 提交更改
git commit -m "Initial commit - 承泽查询系统"

# 5. 推送到 GitHub
git push origin main
```

---

### 第四步：启用 GitHub Pages

1. **进入仓库设置**
   - 在仓库页面点击 "Settings"（设置）

2. **找到 Pages 设置**
   - 左侧菜单找到 "Pages"

3. **配置 Pages**
   - Source：选择 "Deploy from a branch"
   - Branch：选择 "main"
   - 文件夹：选择 "/ (root)"
   - 点击 "Save"

4. **等待部署**
   - GitHub 会自动部署您的网站
   - 通常需要 1-5 分钟

---

### 第五步：访问网站

1. **获取访问链接**
   - 在 Pages 设置页面，您会看到：
   - "Your site is live at https://您的用户名.github.io/chengze-query/"

2. **在 Chrome 浏览器访问**
   - 打开 Chrome 浏览器
   - 输入链接：`https://您的用户名.github.io/chengze-query/`
   - 按回车键访问

---

## 🔧 项目文件结构

上传到 GitHub 的文件应该如下：

```
chengze-query/
├── index.html          # 主页面
├── favicon.svg         # 网站图标
├── icons.svg           # 图标文件
└── assets/
    ├── index-BkK3D2tN.js    # JavaScript 文件
    └── index-pT7qmiQ8.css   # CSS 样式文件
```

---

## ✅ 验证部署

部署完成后，您可以：

1. **访问网站**
   - 在 Chrome 浏览器输入链接
   - 应该看到承泽查询系统首页

2. **测试功能**
   - 输入合约地址（如 USDT：0x55d398326f99059fF775485246999027B3197955）
   - 点击"分析"按钮
   - 查看合约信息、持仓分布、流动性数据

---

## 🚨 常见问题

### Q1：上传文件后网站打不开？
**A：** 检查文件结构是否正确，确保 `index.html` 在根目录。

### Q2：GitHub Pages 部署需要多长时间？
**A：** 通常 1-5 分钟，有时可能需要更长时间。

### Q3：可以自定义域名吗？
**A：** 可以，在 Pages 设置中配置自定义域名。

### Q4：网站有访问限制吗？
**A：** GitHub Pages 是免费的，没有访问限制。

---

## 📞 需要帮助？

如果在部署过程中遇到问题，请告诉我：
- 您卡在哪一步？
- 遇到什么错误信息？
- 我来帮您解决！

---

**祝您部署顺利！** 🎉