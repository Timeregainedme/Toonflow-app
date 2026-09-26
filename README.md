<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=Toonflow&fontSize=90&fontColor=ffffff&animation=fadeIn&fontAlignY=50" alt="Toonflow" width="100%" />

<div align="center">

<p align="center">
  <img src="./docs/logo.png" alt="Toonflow Logo" width="120" height="120" />
</p>

<a href="https://git.io/typing-svg">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://readme-typing-svg.demolab.com?font=Fira+Code&size=40&duration=3000&pause=1000&color=FFFFFF&center=true&vCenter=true&width=600&lines=Toonflow;AI%E7%9F%AD%E5%89%A7%E5%B7%A5%E5%8E%82;%E8%AE%A9%E7%81%B5%E6%84%9F%E6%88%90%E4%B8%BA%E7%9C%8B%E5%BE%97%E8%A7%81%E7%9A%84%E6%95%85%E4%BA%8B" />
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=40&duration=3000&pause=1000&color=000000&center=true&vCenter=true&width=600&lines=Toonflow;AI%E7%9F%AD%E5%89%A7%E5%B7%A5%E5%8E%82;%E8%AE%A9%E7%81%B5%E6%84%9F%E6%88%90%E4%B8%BA%E7%9C%8B%E5%BE%97%E8%A7%81%E7%9A%84%E6%95%85%E4%BA%8B" alt="Toonflow · AI 短剧工厂 · 让灵感成为看得见的故事" width="600" />
  </picture>
</a>

<p align="center">
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License Badge" />
  </a>
</p>
<p align="center">
  <img src="https://ziadoua.github.io/m3-Markdown-Badges/badges/TypeScript/typescript2.svg" alt="TypeScript" height="28" />&nbsp;
  <img src="https://img.shields.io/badge/Bun-1.3.14-14151A?style=for-the-badge&logo=bun&logoColor=white" alt="Bun 1.3.14" />&nbsp;
  <img src="https://img.shields.io/badge/Vue-3-42B883?style=for-the-badge&logo=vuedotjs&logoColor=white" alt="Vue 3" />&nbsp;
  <img src="https://img.shields.io/badge/Desktop-Electrobun-8257E5?style=for-the-badge" alt="Electrobun" />
</p>

**AI 短剧漫剧视频创作平台（个人二次开发版本）**

> 🚀 **一站式短剧创作**：集成剧本创作、资产管理、图像与视频生成，在无限画布中组织完整的创作流程。

</div>

---

## 📦 关于本仓库

这是基于开源项目 [Toonflow（HBAI-Ltd/Toonflow-app）](https://github.com/HBAI-Ltd/Toonflow-app) 二次开发的**个人使用版本**，遵循原项目的 [MIT 许可证](./LICENSE)。

与上游项目相比，本仓库额外新增：

- **PIX 中转站供应商适配**（`packages/providers/src/media/pix.ts`）：接入 PIX 网关的 MiniMax H3 视频生成与 GT Image 2.5 图片生成。
- **文件版本历史**：工作区文件覆盖保存前自动留存历史版本，可在文件树、画布菜单里查看并恢复。
- **生成用量看板**：按项目统计生成次数、成功率与供应商花费。
- **角色一致性**：项目内的角色档案管理，图片/视频生成节点可选角色自动注入参考图。

不需要的功能、外部服务链接、原项目的社区与商业相关内容已从本 README 中移除；核心功能说明、部署方式沿用原项目文档并按本仓库实际情况调整。

---

## 1. 🌟 亮点

Toonflow 是面向短剧、漫剧与短视频制作的 AI 创作平台，把剧本、资产与视频片段整合进同一张无限画布。

| 能力 | 说明 |
| --- | --- |
| 🏠 **本地部署** | 项目与素材保存在自己的设备或服务器，支持桌面、Docker 与服务器部署。 |
| 🖼️ **无限画布** | 在同一画布中组织剧本、角色、场景与视频片段。 |
| 🔌 **MCP** | 通过 MCP 连接外部工具与服务。 |
| 🧩 **插件市场** | 通过[插件市场](https://api.toonflow.net/console/plugIn)扩展节点、工具与创作能力。 |
| 🤖 **开放 Agent** | 开放提示词、工具和 A2A，支持自定义 Agent 行为及外部协作。 |
| 🔧 **自由接入模型** | 配置第三方 API，也可接入本地 ComfyUI 和 LLM。 |
| 🕐 **文件版本历史** | 项目文件覆盖保存前自动留存历史版本，可随时查看、恢复。 |
| 💰 **用量看板** | 按项目统计生成次数与供应商花费，量产成本一目了然。 |
| 🎭 **角色一致性** | 集中管理角色参考图，生成节点一键复用，减少重复上传与走样。 |

---

## 2. 📸 截图

<div align="center">

<a href="./docs/screenshots/projectHome.png"><img src="./docs/screenshots/projectHome.png" alt="Toonflow 项目首页与灵感创作" width="80%" /></a><br /><sub>项目首页与灵感创作</sub>

<a href="./docs/screenshots/quickStart.png"><img src="./docs/screenshots/quickStart.png" alt="Toonflow 首次启动与快速配置" width="80%" /></a><br /><sub>首次启动与快速配置</sub>

<a href="./docs/screenshots/canvasDark.png"><img src="./docs/screenshots/canvasDark.png" alt="Toonflow 深色主题画布与 AI 助手" width="80%" /></a><br /><sub>创作画布 · 深色主题</sub>

<a href="./docs/screenshots/canvasLight.png"><img src="./docs/screenshots/canvasLight.png" alt="Toonflow 浅色主题画布与 AI 助手" width="80%" /></a><br /><sub>创作画布 · 浅色主题</sub>

<a href="./docs/screenshots/assetCanvas.png"><img src="./docs/screenshots/assetCanvas.png" alt="Toonflow 角色、场景与道具资产画布" width="80%" /></a><br /><sub>角色、场景与道具资产</sub>

<a href="./docs/screenshots/directorStudio.png"><img src="./docs/screenshots/directorStudio.png" alt="Toonflow 3D 导演台与镜头预演" width="80%" /></a><br /><sub>3D 导演台与镜头预演</sub>

<a href="./docs/screenshots/characterImageGeneration.png"><img src="./docs/screenshots/characterImageGeneration.png" alt="Toonflow 角色三视图图片生成" width="80%" /></a><br /><sub>角色三视图与图片生成</sub>

<a href="./docs/screenshots/videoGeneration.png"><img src="./docs/screenshots/videoGeneration.png" alt="Toonflow 多参考素材视频生成" width="80%" /></a><br /><sub>多参考素材视频生成</sub>

<a href="./docs/screenshots/nodeMenu.png"><img src="./docs/screenshots/nodeMenu.png" alt="Toonflow 节点菜单与分组操作" width="80%" /></a><br /><sub>节点菜单与分组操作</sub>

<a href="./docs/screenshots/pluginMarket.png"><img src="./docs/screenshots/pluginMarket.png" alt="Toonflow 插件市场" width="80%" /></a><br /><sub>插件市场</sub>

</div>

---

## 3. 🚀 下载并安装

> 以下 `git clone` 均指向**本仓库**，而非上游 Toonflow 项目；本仓库不额外发布桌面安装包，Windows / macOS 客户端仍需使用上游项目的 [Release 页面](https://github.com/HBAI-Ltd/Toonflow-app/releases)，不含本仓库新增的功能。日常使用建议走 3.2 / 3.3 从源码构建。

### 3.1 桌面客户端（上游预编译包，不含本仓库改动）

| 操作系统 | GitHub                                                       |
| -------- | ------------------------------------------------------------ |
| Windows  | [Release](https://github.com/HBAI-Ltd/Toonflow-app/releases) |
| macOS    | [Release](https://github.com/HBAI-Ltd/Toonflow-app/releases) |

Windows 安装器会自动检测并安装 WebView2；如果安装后打开闪退，请前往 [WebView2 下载页面](https://developer.microsoft.com/microsoft-edge/webview2/) 手动安装运行时。

macOS（Apple Silicon）将 Toonflow 拖入“应用程序”后直接打开即可，无需预先执行终端命令。若遇到系统安全提示，请按以下顺序处理。

<details>
<summary><strong>macOS 无法安装或打开时的处理方法</strong></summary>

**1. 在“隐私与安全性”中允许 Toonflow**

如果提示“无法验证开发者”或“Apple 无法检查 App 是否包含恶意软件”，先尝试打开 Toonflow，再前往“系统设置 → 隐私与安全性”，找到 Toonflow 被阻止的提示，点击“仍要打开”，并按提示确认。详见 [Apple 官方说明](https://support.apple.com/zh-cn/102445)。

**2. 仍因系统隔离限制无法打开时，再尝试移除隔离属性**

确认应用来自官方发布页，并已放入“应用程序”后，在终端执行以下命令，再重新打开。应用名称或安装位置不同时，请调整路径。

```bash
sudo xattr -rd com.apple.quarantine /Applications/toonflow.app
```

**3. 最后手段：临时允许任何来源的 App**

前两种方法均无效且确认应用来源可信时，可尝试在终端执行：

```bash
sudo spctl --master-disable
```

随后打开“系统设置 → 隐私与安全性”，在“安全性”中的“允许从以下位置下载的 App”选择“任何来源”（如果系统提供该选项），并按提示确认。不同 macOS 版本的选项与命令支持可能不同。

此操作会放宽所有 App 的安全限制。完成后建议将允许来源恢复为“App Store 和被认可的开发者”。

</details>

---

### 3.2 Docker 安装（推荐，含本仓库全部改动）

先安装 Git、[Docker Engine](https://docs.docker.com/engine/install/) 和 Docker Compose；Windows / macOS 可使用 Docker Desktop。仓库提供 [Dockerfile](./Dockerfile)、[Compose 配置](./compose.yaml) 和 [构建排除规则](./.dockerignore)，基于 Bun 1.3.14 构建，镜像内包含 FFmpeg。

<details>
<summary><strong>展开 Docker 安装步骤</strong></summary>

克隆源码后，在仓库根目录执行：

```sh
git clone https://github.com/Timeregainedme/Toonflow-app.git
cd Toonflow-app
docker compose up -d --build
```

首次构建会安装依赖并编译内置节点、工具、Web 与 Server。启动后访问 `http://127.0.0.1:3000`；远程主机可按下方“访问与数据说明”通过 SSH 隧道访问。首次启动会初始化内置插件，并提供 `myProject` 工作目录。

配置、插件和项目文件保存在 Docker 命名卷 `toonflowData` 中，挂载至容器的 `/app/data/`。卷的实际名称带有 Compose 项目前缀；停止或重建容器会保留数据，**请勿使用 `docker compose down -v`，该命令会删除数据卷**。

```sh
docker compose logs -f toonflow  # 查看日志
docker compose stop             # 停止服务
docker compose start            # 再次启动
docker compose down             # 删除容器，保留数据卷
```

需要增加项目目录时，可在页面的“选择服务器工作目录”弹窗中点击“新建文件夹”。弹窗也支持文件和文件夹的重命名、删除。也可在服务运行期间通过命令行创建：

```sh
docker compose exec toonflow mkdir -p /app/data/workspaces/newProject
```

备份时先停止服务，复制完成后再启动：

```sh
docker compose stop
docker compose cp toonflow:/app/data ./toonflowBackup
docker compose start
```

</details>

---

### 3.3 服务器安装

适用于直接在 Linux 服务器上运行 Web 与 Server。以下以 Ubuntu / Debian 为例，使用项目指定的 [Bun 1.3.14](https://bun.sh/docs/installation)。

<details>
<summary><strong>展开服务器安装步骤</strong></summary>

安装运行环境：

```sh
sudo apt-get update
sudo apt-get install -y git curl unzip ffmpeg
curl -fsSL https://bun.com/install | bash -s "bun-v1.3.14"
export PATH="$HOME/.bun/bin:$PATH"
bun --version
```

克隆源码并启动：

```sh
git clone https://github.com/Timeregainedme/Toonflow-app.git
cd Toonflow-app
bun install --frozen-lockfile

# 构建内置节点、工具、Web 与 Server
bun run build:server
mkdir -p data/workspaces/myProject
bun run start:server
```

看到“服务启动成功”后，可在服务器本机访问 `http://127.0.0.1:3000`。上述命令以前台方式运行，按 `Ctrl+C` 停止；需要开机自启和进程托管时，可参考 [Bun 的 systemd 部署指南](https://bun.sh/guides/ecosystem/systemd)，将工作目录设为仓库目录，启动命令设为 Bun 的绝对路径加 `run start:server`，使用有权读写该目录的用户运行。

</details>

---

### 3.4 访问与数据说明

- 当前服务使用固定端口 `3000`，业务页面与 API 没有独立登录鉴权。服务器安装时，请通过防火墙或安全组限制 `3000` 端口的访问来源；公网访问需配置带认证的反向代理。
- 个人远程使用可在自己的电脑上执行 `ssh -N -L 3000:127.0.0.1:3000 用户名@服务器地址`，保持连接后打开 `http://127.0.0.1:3000`，无需将服务器的 `3000` 端口向公网开放。
- 直接安装时，配置、插件与工作区默认保存在仓库的 `data/`；Docker 安装则保存在数据卷内的 `/app/data/`。迁移或备份时请完整保留。进入页面后选择服务器工作区内的 `myProject`，更多项目可在对应的 `workspaces/` 下创建子目录。
- 两种安装方式均包含系统 FFmpeg。模型服务的 API Key 仍需在页面内配置。

---

## 4. 🎬 效果示例

https://github.com/user-attachments/assets/2d9fddac-dfdf-4640-b030-b09d7f7287e9

> 该案例来自上游 Toonflow 项目的记录，用于展示基础生成能力，与本仓库新增功能无关。

### 案例信息

| 项目           | 原仓库记录                                          |
| -------------- | --------------------------------------------------- |
| 制作周期与成片 | 约 2 小时，成片约 2 分钟。                          |
| 视频模型       | Seedance 2.0                                        |
| 图片模型       | GPT Image 2                                         |
| 语言模型       | Claude Opus 4.6                                     |
| 模型调用费用   | 约 ¥130，其中语言约 ¥10、视频约 ¥120、图片不足 ¥1。 |

费用为该案例的记录，仅供参考，实际成本取决于模型服务、生成次数与参数。演示视频为压缩后的 480p 版本。

---

## 5. 📜 开源许可

本仓库基于 [Toonflow（HBAI-Ltd/Toonflow-app）](https://github.com/HBAI-Ltd/Toonflow-app) 二次开发，沿用其 [MIT 许可证](./LICENSE)。第三方依赖和素材遵循各自的许可与版权声明。

> **不追溯条款（沿用自上游项目）**：v1.0.8 发布前基于 AGPL-3.0 使用的用户，继续按 AGPL-3.0 执行，v1.0.8 ~ v1.1.8 继续按 Apache-2.0 与附加协议执行，不受本协议变更约束。

Copyright © 2026 北京爱阿科技有限公司（原项目版权方，随 MIT 许可证保留）

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=90&section=footer" alt="Toonflow 页脚" width="100%" />
