# GitHub 上传文件详细指南

## 🎯 您的情况
您已经注册了 GitHub 并创建了仓库，但找不到上传按钮。

## ✅ 解决方案：使用 GitHub Desktop（最简单）

### 第 1 步：下载 GitHub Desktop
1. 打开 Chrome 浏览器
2. 访问：https://desktop.github.com
3. 点击 "Download for Windows" 或 "Download for Mac"
4. 安装 GitHub Desktop

### 第 2 步：克隆仓库
1. 打开 GitHub Desktop
2. 点击 "File" → "Clone repository"
3. 选择您创建的仓库（chengze-query）
4. 选择本地保存位置
5. 点击 "Clone"

### 第 3 步：复制文件
1. 打开文件管理器
2. 找到我提供的 `dist/` 文件夹
3. 将以下文件复制到克隆的仓库文件夹：
   - `index.html`
   - `favicon.svg`
   - `icons.svg`
   - `assets/` 文件夹

### 第 4 步：提交并推送
1. 回到 GitHub Desktop
2. 会看到变更文件列表
3. 填写提交信息："Initial commit"
4. 点击 "Commit to main"
5. 点击 "Push origin"

### 第 5 步：启用 GitHub Pages
1. 打开浏览器，访问您的 GitHub 仓库页面
2. 点击 "Settings"
3. 左侧菜单找 "Pages"
4. Source：选择 "Deploy from a branch"
5. Branch：选择 "main"
6. 文件夹：选择 "/ (root)"
7. 点击 "Save"

### 第 6 步：访问网站
1. 等待 1-5 分钟
2. 访问：`https://您的用户名.github.io/chengze-query/`

---

## 🔧 如果不想用 GitHub Desktop

### 方法 2：使用命令行（Git）

```bash
# 1. 安装 Git
# 下载：https://git-scm.com

# 2. 克隆仓库
git clone https://github.com/您的用户名/chengze-query.git

# 3. 复制文件到仓库文件夹
# 将 dist/ 中的文件复制到 chengze-query/ 文件夹

# 4. 进入仓库文件夹
cd chengze-query

# 5. 添加文件
git add .

# 6. 提交
git commit -m "Initial commit"

# 7. 推送
git push origin main
```

### 方法 3：使用 GitHub API（需要 Token）

```bash
# 需要创建 Personal Access Token
# 1. 访问：https://github.com/settings/tokens
# 2. 生成新 Token
# 3. 使用 API 上传文件
```

---

## 📦 我需要准备的文件

请告诉我您的 GitHub 用户名，我帮您准备：

1. **完整的项目压缩包**（包含所有需要上传的文件）
2. **详细的上传步骤**（图文说明）
3. **常见问题解答**

---

## ❓ 请告诉我

1. **您的 GitHub 用户名是什么？**
2. **您使用的是 Windows 还是 Mac？**
3. **您想用哪种方式上传？**
   - GitHub Desktop（推荐，最简单）
   - 命令行（需要安装 Git）
   - 其他方式

**告诉我这些信息，我立即帮您准备！** 🚀