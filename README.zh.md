# Color Highlights

[English](README.md) | 中文

在 DSH 的 **Markdown 文件预览**和**聊天消息**里渲染彩色高亮。

语法沿用 Obsidian 1.14 原生的「高亮颜色」：在开头 `==` 之后紧跟一个颜色 emoji，整段就按该颜色着色。颜色信息跟着文本走，所以同一份文档拿到只认识普通 `==…==` 的地方也不会破坏格式。

## 语法

```markdown
==普通高亮==           主题默认
==🔴红==               危险、必读
==🟠橙==               待跟进
==🟡黄==               要记住
==🟢绿==               已完成
==🔵蓝==               参考资料
==🟣紫==               灵感
```

高亮里可以出现单个 `=`（`==a = b==`），但不能跨行；行内代码与代码块里的 `==…==` 不会被处理。

可以拿 [examples/highlight-demo.md](examples/highlight-demo.md) 试：六色高亮、一段必须保持字面量的行内代码，以及一条来自 List Callouts 的批注行。

## 安装

```sh
npm install                       # Host 半依赖 @deepseek-ai/schemastery
# 在 DSH 的会话 / profile shell 里
plugin_manager install_bundle /path/to/dsh-color-highlights
```

`client.js` 是发布产物（内嵌 markdown-it），没有构建步骤。Host 半（`index.js`）唯一那个运行时依赖需要在本目录装好——profile 用的是目录链接，不会替你安装。`node_modules` 已 gitignore，`package-lock.json` 已提交。

## 渲染方式

| 表面 | 机制 |
|---|---|
| Markdown 预览 | 插件注册自己的文档渲染器（`ctx.documentPreviews`，`extension` 优先级），markdown-it 管线把 `==…==` 变成 `<mark class="ch-hl ch-hl-…">` |
| 聊天消息 | 常驻装饰器监听已渲染的会话 Markdown，把文本节点改写成 `<mark>` 片段 |

聊天装饰器在文本稳定 350ms 之前不动 React 的树，一旦 React 重新写入文本就立刻回滚——和作者的 List Callouts 插件切分标记字符用的是同一套策略。它还会给**其它插件渲染器**产出的文档预览（带 `data-lc-document` 的元素，例如 List Callouts 的预览）加上高亮，所以不需要抢占那个渲染器。

## 设置

**侧边栏 → 插件 → Color Highlights → 配置区** 每个表面一个开关：

- **在 Markdown 预览中渲染** —— 关掉后注销本插件的 `.md` 渲染器，标签页回落到内置渲染器（或其它已注册渲染器）；
- **在聊天消息中渲染** —— 关掉后会立即清掉已画出的高亮，并停止装饰新消息。

两个开关都是 Host `Config` 里的 `.volatile()` 字段：有 schema 校验、写入当前 profile 的配置层、改完即时生效。页面上还展示了六种支持的颜色。

## 配置项

在 profile 的 `cordis.patch.yml` 里覆盖同名行：

```yaml
- id: color-highlights
  config:
    chatHighlights: true
    markdownHighlights: true
```

## 与 List Callouts 共存

两个插件都在 `extension` 优先级注册 `.md` 渲染器，所以预览工具栏的下拉里两个都在，默认用先注册的那个。高亮不依赖抢到这个位置：聊天装饰器同样会给其它插件渲染器产出的文档预览（`data-lc-document`）加高亮，因此 `==🔴…==` 和 `- ! 批注` 可以出现在同一份文档里。

## 限制

- 聊天侧是渲染后的 DOM 后处理：代码片段/代码块里的内容不处理，消息稳定后的最初约 350ms 仍显示原始 `==…==`。
- 只有上面六个 emoji 会选颜色，其它开头的 emoji 会原样保留为文本；不带 emoji 的 `==…==` 用主题默认底色。
- 没有编辑器内的实时预览——DSH 的 Markdown 预览是只读的。
- 颜色按主题做色调叠加，暗色主题用更高的 alpha。

## 致谢

`==🔴…==` 这套约定来自 Obsidian 1.14 的原生高亮颜色；「颜色由 emoji 承担」的点子可追溯到 [Octarine](https://octarine.app) 与社区插件 [Colorful Highlights](https://github.com/Moyf/colorful-highlights)（作者 Moy）。本实现是独立写的：只为 DSH 读取同一套约定，不与上述项目共享代码。

## 许可

MIT，见 `LICENSE`。内置第三方代码：[markdown-it](https://github.com/markdown-it/markdown-it) 14.1.0，MIT，嵌在 `client.js` 里。
