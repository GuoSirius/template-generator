# 部署指南

本文档提供三种完整的部署方式，按技术门槛从低到高排序。**推荐第一次部署的用户从方式一开始。**

---

## 目录

1. [前置条件](#1-前置条件)
2. [快速选择：哪种方式适合我？](#2-快速选择哪种方式适合我)
3. [方式一：GitHub Pages（最简单，推荐新手）](#3-方式一github-pages)
4. [方式二：Cloudflare Pages（国内访问快，全球 CDN）](#4-方式二cloudflare-pages)
5. [方式三：Docker 自托管（适合有服务器的用户）](#5-方式三docker-自托管)
6. [验证部署是否成功](#6-验证部署是否成功)
7. [常见问题 FAQ](#7-常见问题-faq)

---

## 1. 前置条件

### 需要安装的工具

| 工具 | 版本要求 | 安装方式 |
|---|---|---|
| **Git** | 任意版本 | [git-scm.com/download](https://git-scm.com/download) |
| **Node.js** | >= 18.x | [nodejs.org](https://nodejs.org/) 下载 LTS（推荐） |
| **pnpm** | >= 9.x | 安装 Node.js 后，终端执行：`npm i -g pnpm` |
| **GitHub 账号** | — | [github.com](https://github.com) 免费注册 |

### 验证工具是否安装成功

打开 **PowerShell**（Windows 按 `Win+X` → 选择"终端"），依次输入以下命令：

```powershell
node --version
```

> 期望输出类似 `v20.x.x`，只要是 `v18` 以上即可。

```powershell
pnpm --version
```

> 期望输出类似 `9.x.x`。

```powershell
git --version
```

> 期望输出类似 `git version 2.x.x`。

如果显示「不是内部或外部命令」，说明该工具没有安装或没有添加到系统 PATH。请**重启电脑**后再试。

---

## 2. 快速选择：哪种方式适合我？

| 场景 | 推荐方式 |
|---|---|
| 第一次部署，完全不懂技术 | **方式一：GitHub Pages** |
| 想让国内用户访问速度快 | **方式二：Cloudflare Pages** |
| 想同时部署到两个平台 | **方式二**（自动双平台部署） |
| 已有自己的服务器 | **方式三：Docker** |
| 想绑定自己的域名 | 任选方式均支持 |

---

## 3. 方式一：GitHub Pages

**零成本、5 分钟上线、自动 HTTPS、完全不需要懂技术。**

### 第一步：Fork 项目到你的 GitHub

1. 打开浏览器，访问本项目地址（问你的项目管理员或开发者要链接）
2. 登录 GitHub 账号
3. 点击页面右上角绿色 **Fork** 按钮

   > ![Fork 按钮示意](https://docs.github.com/assets/images/help/repository/fork-button.png)

4. 等待几秒，页面跳转到 `https://github.com/你的用户名/template-generator`，说明 Fork 成功

### 第二步：克隆代码到本地

在终端中执行（把 `<你的用户名>` 替换成你的 GitHub 用户名）：

```powershell
# 进入桌面（或其他你想放项目的目录）
cd ~/Desktop

# 克隆仓库
git clone https://github.com/你的用户名/template-generator.git

# 进入项目目录
cd template-generator
```

> 如果你没有设置过 GitHub 凭据，终端会要求输入用户名和密码。密码请在 [GitHub Settings → Personal Access Tokens](https://github.com/settings/tokens) 生成一个 token 填入（密码框直接输 GitHub 密码可能失败）。

### 第三步：安装依赖

```powershell
pnpm install
```

等待 1~3 分钟，看到新的命令行提示符（`PS D:\...>`）即为完成。

> 如果报错 `EACCES`，Windows 用户请**以管理员身份**打开 PowerShell 后重试。  
> 如果网络慢报错，尝试：
> ```powershell
> pnpm config set registry https://registry.npmmirror.com
> pnpm install
> ```

### 第四步：本地验证（强烈推荐）

```powershell
pnpm dev
```

终端会显示类似：

```
  Local:   http://localhost:5173/
```

打开浏览器访问该地址，如果能看到网页，说明一切正常。按 `Ctrl+C` 停止开发服务器。

### 第五步：开启 GitHub Pages

1. 在浏览器打开你的 GitHub 仓库页面（`https://github.com/你的用户名/template-generator`）
2. 点击顶部的 **Settings（设置）**
3. 左侧菜单找到 **Pages**
4. 在 **Build and deployment** 的 **Source** 下，选择 **GitHub Actions**
5. 点击 **Save**

### 第六步：推送代码，触发自动部署

```powershell
# 把代码提交到 GitHub
git add .
git commit -m "first deploy"
git push origin main
```

### 第七步：等待并访问你的网站

1. 回到 GitHub 仓库页面，点击顶部 **Actions** 标签
2. 可以看到一条正在运行的 workflow（黄色圆圈转圈）
3. 等待约 **1~2 分钟**，变为绿色勾选 ✅
4. 点击 **Settings → Pages**，页面顶部会显示你的网站地址，类似：

   ```
   Your site is live at https://你的用户名.github.io/template-generator/
   ```

> 如果是 Fork 的仓库，URL 格式可能是 `https://你的用户名.github.io/template-generator/`。实际地址以 Pages 设置页面顶部显示的为准。

---

## 4. 方式二：Cloudflare Pages

**全球 200+ CDN 节点、国内访问快、自动 HTTPS、支持自定义域名。**

### 重要说明：自动双平台部署

本项目的 CI/CD 已配置为：**push 到 main 分支后，自动同时部署到 GitHub Pages 和 Cloudflare Pages**。只需完成以下步骤，之后每次 `git push` 两个平台都会自动更新。

### 第一步：注册 Cloudflare 账号

1. 打开 [dash.cloudflare.com](https://dash.cloudflare.com/)
2. 点击 **Sign up**（注册），用邮箱完成验证

### 第二步：获取 Cloudflare Account ID

1. 登录后，点击左侧菜单 **Workers & Pages**
2. 在页面右侧，**Overview** 区域可以看到 **Account ID**（一串字母数字）
3. **复制这个 ID**，后面要用

### 第三步：创建 Cloudflare API Token

1. 点击右上角头像 → **My Profile**
2. 左侧选择 **API Tokens**
3. 点击 **Create Token**
4. 选择 **Edit Cloudflare Workers** 模板
5. 滑到页面最下方，点击 **Create**
6. **立即复制显示的 Token**（只显示这一次！）

### 第四步：配置 GitHub Secrets

1. 打开你的 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**，添加两条：

| Name | Value（粘贴的内容） |
|---|---|
| `CLOUDFLARE_API_TOKEN` | 第三步复制的 Token |
| `CLOUDFLARE_ACCOUNT_ID` | 第二步复制的 Account ID |

3. 两个都添加后，页面应显示 2 条记录

### 第五步：推送代码

```powershell
git add .
git commit -m "enable cloudflare deploy"
git push origin main
```

### 第六步：查看 Cloudflare 上的项目

1. 等 GitHub Actions 变绿后（约 2 分钟）
2. 打开 [dash.cloudflare.com](https://dash.cloudflare.com/) → **Workers & Pages**
3. 应该能看到名为 `template-generator` 的项目
4. 点击项目 → **Custom Domains** 可以看到分配给你的 `*.pages.dev` 域名，访问即可

### 方式二备选：不通过 GitHub Actions，直接连接 Cloudflare 到 GitHub

如果不想配置 GitHub Secrets，可以用这种方式（更简单但无法运行测试）：

1. Cloudflare Dashboard → **Workers & Pages** → **Create application**
2. 选择 **Pages** 标签 → 点击 **Connect to Git**
3. 授权 GitHub，选择本仓库
4. 配置构建设置：
   - **Production branch**: `main`
   - **Framework preset**: `None`
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
5. 点击 **Save and Deploy**

---

## 5. 方式三：Docker 自托管

**适合已有服务器的用户（如阿里云、腾讯云、轻量应用服务器等）。**

### 前置条件

安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)（Windows/Mac）或 Docker Engine（Linux）。

验证安装成功：

```powershell
docker --version
```

> 显示版本号即为成功。Windows 用户安装后需要**重启电脑**。

### 部署命令（一键）

```powershell
# 克隆代码（如果还没有）
git clone https://github.com/你的用户名/template-generator.git
cd template-generator

# 构建并启动（后台运行）
docker compose up -d
```

等待约 1 分钟，访问 **`http://服务器IP:8080`** 即可。

### 常用运维命令

```powershell
# 查看运行状态
docker compose ps

# 查看实时日志（排查问题用）
docker compose logs -f

# 停止服务
docker compose down

# 更新代码后重新构建
docker compose up -d --build
```

### 自定义端口

编辑项目中的 `docker-compose.yml`，找到 `ports` 行：

```yaml
services:
  web:
    ports:
      - "8080:80"    # 左边是你想用哪个端口访问
```

改完后执行 `docker compose up -d` 即可用新端口访问。

### 绑定域名 + HTTPS

已有 Nginx 或 Caddy 作为反向代理时，在配置文件中加入：

```nginx
server {
    listen 443 ssl;
    server_name 你的域名.com;

    ssl_certificate /etc/ssl/certs/你的证书.pem;
    ssl_certificate_key /etc/ssl/private/你的私钥.key;

    location / {
        proxy_pass http://127.0.0.1:8080;
        # SPA 路由支持（重要，否则刷新 404）
        try_files $uri $uri/ /index.html;
    }
}
```

然后在 DNS 服务商处添加 A 记录指向你的服务器 IP。

---

## 6. 验证部署是否成功

无论用哪种方式，验证方法都一样：

1. **浏览器访问你的网站地址**
2. **按 F12 打开开发者工具**，切换到 **Console** 标签
3. 如果 Console 显示**红色错误**（Error），说明有问题
4. 如果页面正常显示，没有红色错误，说明**部署成功！**

### 常见问题对应

| 页面显示内容 | 说明 |
|---|---|
| 空白页 / 白屏 | 可能是 JavaScript 加载失败，刷新试试（F5） |
| 404 页面 | 地址栏检查是否拼写有误 |
| 样式/图片丢失 | 刷新浏览器缓存：Ctrl+Shift+R |
| 正常显示了 | ✅ **部署成功！** |

---

## 7. 常见问题 FAQ

### Q1: `pnpm install` 报错 EACCES 或 Permission denied？

**Windows**：以管理员身份打开 PowerShell，然后重试。

**Mac/Linux**：不要用 `sudo pnpm install`，改用 [nvm](https://github.com/nvm-sh/nvm) 管理 Node 版本后重装。

---

### Q2: `pnpm dev` 启动后浏览器显示白屏？

按以下顺序排查：

1. 确认 Node.js 版本 >= 18：`node --version`
2. 确认依赖安装完整：删除 `node_modules` 后重新 `pnpm install`
3. 确认端口没被占用：杀掉占用 5173 端口的进程，或改 `vite.config.js` 中的端口

---

### Q3: GitHub Pages 部署后页面显示 404？

最常见原因：**Pages Source 设置错误**。

请确认：Settings → Pages → **Source 必须是 "GitHub Actions"**，不是 "Deploy from a branch"。

---

### Q4: Cloudflare 部署后一直显示 "Building"？

检查 GitHub Actions 日志中是否有错误：
1. GitHub 仓库 → **Actions** → 点击失败的 workflow → 查看错误信息
2. 最常见原因：Secrets 没配对，Token 过期，或 Account ID 填错

---

### Q5: 想绑定自定义域名，怎么做？

**GitHub Pages**：
1. Settings → Pages → **Custom domain** 输入你的域名
2. 去你的域名 DNS 管理页，添加一条 CNAME 记录指向 `<你的用户名>.github.io`

**Cloudflare Pages**：
1. Workers & Pages → 你的项目 → **Custom domains**
2. 点击添加，输入域名，Cloudflare 会**自动配置 DNS 和 HTTPS**

**Docker**：
参考上文「绑定域名 + HTTPS」章节配置 Nginx/Caddy。

---

### Q6: 如何让网站自动更新（每次 push 代码自动部署）？

三种方式都已经配置好了自动部署。你只需要：

```powershell
git add .
git commit -m "update content"
git push origin main
# 不用做任何额外操作，1-2 分钟后网站自动更新
```

---

### Q7: Docker 容器出问题了，怎么查看日志？

```powershell
# 查看最近 100 行日志
docker compose logs --tail=100

# 实时跟踪日志
docker compose logs -f
```

---

### Q8: 部署要花多少钱？

| 方式 | 费用 |
|---|---|
| GitHub Pages | **免费** |
| Cloudflare Pages | **免费**（每月 500 次构建，无限流量） |
| Docker 自托管 | 仅需服务器费用（最低约 30 元/月） |

---

### Q9: 域名备案问题？

- **GitHub Pages / Cloudflare Pages**：不需要备案（服务器在海外/使用 CDN）
- **国内服务器（Docker）**：按国家规定，需要 ICP 备案才能绑定域名访问

---

## 对比总结

| | GitHub Pages | Cloudflare Pages | Docker |
|---|---|---|---|
| **费用** | 免费 | 免费 | 服务器费用 |
| **国内访问速度** | 一般 | 快（CDN 节点多） | 取决于服务器 |
| **配置难度** | ⭐ 最简单 | ⭐⭐ 稍多一步 | ⭐⭐⭐ 需服务器知识 |
| **自动部署** | ✅ push 即部署 | ✅ push 即部署（双平台） | 需手动执行 |
| **HTTPS** | ✅ 自动 | ✅ 自动 | 需自行配置 |
| **自定义域名** | ✅ 支持 | ✅ 支持 | ✅ 支持 |
| **适合人群** | 新手、个人项目 | 生产环境、追求速度 | 有服务器的用户 |
