# Color Highlights

[English](README.md) | [中文](README.zh.md)

Colored highlights for DSH, in **Markdown file previews** and in **Chat messages**.

The syntax follows Obsidian 1.14's native *highlight colors*: put a color emoji
right after the opening `==`, and the run is painted in that color. Because the
color travels inside the text, the same document still reads fine anywhere that
only understands plain `==…==`.

## Syntax

```markdown
==plain highlight==      theme default
==🔴red==                danger, must read
==🟠orange==             follow up
==🟡yellow==             remember
==🟢green==              done
==🔵blue==               reference
==🟣purple==             idea
```

A lone `=` may appear inside a run (`==a = b==`), but a run cannot span lines.
Anything inside inline code or fenced code is left alone.

## Install

```sh
npm install                       # the Host half imports @deepseek-ai/schemastery
# inside a DSH session / profile shell
plugin_manager install_bundle /path/to/dsh-color-highlights
```

`client.js` is the shipped artifact: it embeds markdown-it and needs no build
step. The Host half (`index.js`) needs its one runtime dependency installed in
this directory, because the profile links the directory instead of copying it.
`node_modules` is git-ignored; `package-lock.json` is committed.

## How it renders

| Surface | Mechanism |
|---|---|
| Markdown preview | The plugin registers its own document renderer (`ctx.documentPreviews`, `extension` priority) whose markdown-it pipeline turns `==…==` into `<mark class="ch-hl ch-hl-…">` |
| Chat | A resident decorator watches rendered conversation Markdown and rewrites text nodes into `<mark>` runs |

The Chat decorator never touches React's tree until the row's text has been stable
for 350ms, and it reverts the rewrite the moment React writes the text again — the
same strategy the author's List Callouts plugin uses for its marker split. It also
decorates document previews produced by **other plugin renderers** (any element
with `data-lc-document`, e.g. the List Callouts preview), so highlights keep
working there without taking that renderer over.

## Settings

**Sidebar → Plugins → Color Highlights → configuration** has one switch per
surface:

- **Render in Markdown previews** — off retires this plugin's `.md` renderer, so
  the tab falls back to the shipped renderer (or another registered one);
- **Render in Chat messages** — off clears the highlights already drawn in the
  conversation and stops decorating new rows.

Both switches are `.volatile()` fields of the plugin's Host `Config`, so they are
schema-validated, persist in the profile's configuration layer, and take effect
without a reload. The page also shows the six supported colors.

## Configuration

Override the same row in the profile's `cordis.patch.yml`:

```yaml
- id: color-highlights
  config:
    chatHighlights: true
    markdownHighlights: true
```

## Coexisting with List Callouts

Both plugins register a `.md` renderer at the `extension` priority band, so the
preview's viewer dropdown lists both and the first registered one opens by
default. Highlights do not depend on winning that slot: the Chat decorator also
decorates document previews rendered by other plugin renderers (`data-lc-document`),
so `==🔴…==` and `- ! callouts` can appear in the same document.

## Limitations

- Chat decoration is a post-render DOM pass: content inside code spans/blocks is
  skipped, and a row shows plain `==…==` for the first ~350ms after it settles.
- Only the six emoji above select a color; any other leading emoji stays literal
  text. Plain `==…==` uses the theme default tint.
- There is no editor-side live preview — DSH's Markdown preview is read-only.
- Colors are theme-tinted; the dark theme uses stronger alphas over the same hue.

## Credits

The `==🔴…==` convention comes from Obsidian 1.14's native highlight colors; the
emoji-carries-the-color idea traces back to [Octarine](https://octarine.app) and
the community plugin [Colorful Highlights](https://github.com/Moyf/colorful-highlights)
by Moy. This implementation is independent: it reads the same convention for DSH
and shares no code with either project.

## License

MIT — see `LICENSE`. Vendored third-party code: [markdown-it](https://github.com/markdown-it/markdown-it)
14.1.0, MIT, embedded in `client.js`.
