# readNeo

你的微信读书数据面板 -- 连接微信读书 Skill API，可视化书架、阅读统计、笔记划线，一键导出到 Notion 和 Flomo。

## 小程序版本 - NoteMover 🔥

<img width="7200" height="5400" alt="IMG_1180" src="https://github.com/user-attachments/assets/1a04686c-8143-4655-a9e2-b9004b589d38" />
<img width="430" height="430" alt="download" src="https://github.com/user-attachments/assets/600ed168-1997-4a02-a2d4-a24759eba0f4" />


## 功能

- **书架管理** -- 同步微信读书书架，浏览全部藏书与阅读进度
- **阅读统计** -- 可视化阅读时长、天数、趋势图表，洞察阅读习惯
- **笔记与划线** -- 按书分类浏览高亮和笔记，支持复制与跳转原文
- **书城搜索** -- 搜索微信读书书城，按类型筛选电子书、网文、听书
- **个性化推荐** -- 基于阅读偏好获取微信读书的书籍推荐
- **书评点评** -- 查看热门书评与个人想法
- **数据导出** -- 导出为 Markdown ZIP，同步到 Flomo 或 Notion

## 快速开始

1. 打开微信读书 App
2. 进入「我」→「设置」→「微信读书 Skill」
3. 滚到底部复制生成的 API Key
4. 打开 readNeo，粘贴 API Key 即可使用

## 技术栈

- [Next.js 16](https://nextjs.org) -- React 全栈框架
- [Tailwind CSS v4](https://tailwindcss.com) -- 原子化 CSS
- [shadcn/ui](https://ui.shadcn.com) -- 组件库
- [Recharts](https://recharts.org) -- 数据可视化
- [SWR](https://swr.vercel.app) -- 数据请求
- [Zustand](https://zustand.docs.pmnd.rs) -- 状态管理

## 隐私

所有数据仅存储在浏览器本地（localStorage），不会上传至任何服务器。API 请求通过服务端代理转发以确保安全性。

## 开发

```bash
pnpm install
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看。

## 许可

MIT
