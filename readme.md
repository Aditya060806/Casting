<div align="center">

<img src="https://raw.githubusercontent.com/Aditya060806/Harvest/main/docs/assets/casting.svg?raw=true" alt="Casting" width="140" />

# Casting

### Generate React components, hooks, and contexts in seconds — zero config, fully typed, auto-formatted.

[![npm version](https://img.shields.io/npm/v/casting-cli.svg?color=%230b7285&label=casting-cli)](https://www.npmjs.com/package/casting-cli)
[![npm downloads](https://img.shields.io/npm/dm/casting-cli.svg?color=%232f9e44)](https://www.npmjs.com/package/casting-cli)
[![CI](https://github.com/Aditya060806/Harvest/actions/workflows/ci.yml/badge.svg)](https://github.com/Aditya060806/Harvest/actions/workflows/ci.yml)
[![Node](https://img.shields.io/node/v/casting-cli.svg?color=%23339af0)](https://nodejs.org)
[![License: MIT](https://img.shields.io/npm/l/casting-cli.svg?color=%23845ef7)](https://github.com/Aditya060806/Harvest/blob/main/LICENSE)

```bash
npx casting-cli component Box
```

</div>

---

Casting is a fast, **zero-config** command-line tool that scaffolds the boilerplate you write every day. It reads your project once, figures out your stack (TypeScript, styling, test runner, framework), and generates files that already match your conventions — then runs them through your Prettier config so they look hand-written.

> Built by **Aditya Pandey**.

## Table of Contents

- [Highlights](#highlights)
- [How It Compares](#how-it-compares)
- [Efficiency](#efficiency)
- [How It Works](#how-it-works)
- [Quick Start](#quick-start)
- [Requirements](#requirements)
- [Config File](#config-file)
- [Commands](#commands)
- [Generate Components](#generate-components)
- [Generate Hooks](#generate-hooks)
- [Generate Contexts](#generate-contexts)
- [Interactive Mode](#interactive-mode)
- [Dry-Run Preview](#dry-run-preview)
- [Options](#options)
- [Custom Component Types](#custom-component-types)
- [Custom Templates](#custom-templates)
- [Template Keywords](#template-keywords)
- [Barrel / Index Files](#barrel--index-files)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

## Highlights

| | Feature | What it means |
|---|---------|---------------|
| 🪄 | **Zero-config auto-detect** | Reads `package.json` + `tsconfig.json` to infer TypeScript, styled-components, CSS modules/preprocessor, test library, and framework. |
| ⚡ | **One-command scaffolding** | `casting c Box` creates the folder, component, style, test, and barrel file at once. |
| 🧩 | **Three generators** | Components, custom **hooks**, and **contexts** (Provider + typed consumer hook). |
| 🎨 | **Format on generate** | Output is piped through your project's Prettier config automatically. |
| 🔍 | **Dry-run diff preview** | See a colored, line-by-line preview before anything touches disk. |
| 🎛️ | **Interactive mode** | Run `casting` bare for an arrow-key menu. |
| 🧠 | **Typed config** | `casting.json` ships a JSON schema for editor autocomplete + validation. |
| 🧵 | **Next.js aware** | Adds the `'use client'` directive to contexts automatically. |

## How It Compares

Casting focuses on doing the common React scaffolding tasks **out of the box**, without asking you to write template files first.

| Capability | **Casting** | generate-react-cli | Plop | Hygen | Hand-written |
|---|:---:|:---:|:---:|:---:|:---:|
| Works with **zero setup** | ✅ | ⚠️ config prompts | ❌ write templates | ❌ write templates | — |
| **Auto-detects** TS / styling / test lib | ✅ | ⚠️ manual answers | ❌ | ❌ | ❌ |
| Component generator | ✅ | ✅ | ✅¹ | ✅¹ | ✍️ |
| **Hook** generator | ✅ | ❌ | ✅¹ | ✅¹ | ✍️ |
| **Context** (Provider + hook) | ✅ | ❌ | ✅¹ | ✅¹ | ✍️ |
| Interactive menu | ✅ | ❌ | ✅ | ⚠️ | — |
| **Format on generate** (Prettier) | ✅ | ❌ | ❌ | ❌ | ✍️ |
| Dry-run **diff preview** | ✅ | ⚠️ paths only | ❌ | ❌ | — |
| Multiple names per command | ✅ | ✅ | ⚠️ | ⚠️ | ✍️ |
| Custom templates | ✅ | ✅ | ✅ | ✅ | — |
| Built-in **barrel/index** file | ✅ | ⚠️ template | ❌ | ❌ | ✍️ |
| Config **JSON schema** | ✅ | ❌ | ❌ | ❌ | — |

<sub>✅ built-in · ⚠️ partial / needs config · ❌ not supported · ✍️ do it yourself · ¹ generic scaffolders can do this only after you author template files.</sub>

## Efficiency

A typical **TypeScript component with a stylesheet, test, and barrel file** is 4 files and ~40 lines of boilerplate. Here's the difference (illustrative, based on a component of this size):

**Time to first working component**

```text
Hand-written   ████████████████████████████████████████  ~90s
Plop/Hygen*    ████████████████                          ~35s   (* after templates exist)
Casting        ██                                        ~4s
```

**What you type vs. what you get**

```text
You type:   casting c Box            (15 characters)
You get:    Box.tsx  Box.module.css  Box.test.tsx  index.ts
            ~45 lines, formatted, consistently named  ── ≈300:1 leverage
```

**Files produced per single command**

| Command | Files generated |
|---|:---:|
| `casting c Box` | 1 |
| `casting c Box --withStyle --withTest` | 3 |
| `casting c Box` *(style + test + index in config)* | 4 |
| `casting c Box Card Modal` | 3 × per-name |
| `casting ctx Theme` | 2 (context + test) |

> These figures are illustrative estimates to show the shape of the savings, not audited benchmarks. Your mileage depends on file count and machine speed. The point stands: **one short command replaces dozens of manual keystrokes and naming decisions.**

## How It Works

```mermaid
flowchart LR
    A[casting c Box] --> B{casting.json exists?}
    B -- no --> C[Auto-detect project<br/>TS · styling · test lib · framework]
    C --> D[Write casting.json]
    B -- yes --> E[Load config]
    D --> E
    E --> F[Pick templates<br/>built-in or custom]
    F --> G[Replace TemplateName keywords]
    G --> H{dry-run?}
    H -- yes --> I[Show colored diff preview]
    H -- no --> J[Format with Prettier]
    J --> K[Write files + summary]
```

## Quick Start

```bash
# 1. Create config by auto-detecting your stack (one step, no questions)
npx casting-cli init --auto

# 2. Generate
npx casting-cli component Box
npx casting-cli hook useToggle
npx casting-cli context Theme

# ...or just run it and pick from a menu
npx casting-cli
```

Prefer a global install? The executable is `casting`:

```bash
npm i -g casting-cli
casting component Button
```

## Requirements

- Node.js **22** or higher
- npm **10** or higher

## Config File

On first run Casting **auto-detects** your project and pre-fills every answer, so setup is usually a single keypress. Create the config explicitly with:

```bash
casting init          # interactive, with detected defaults
casting init --auto   # non-interactive, uses detected values
```

Example `casting.json`:

```json
{
  "$schema": "https://raw.githubusercontent.com/Aditya060806/Harvest/main/schema/casting.schema.json",
  "usesTypeScript": true,
  "usesCssModule": true,
  "cssPreprocessor": "scss",
  "testLibrary": "Testing Library",
  "component": {
    "default": {
      "path": "src/components",
      "withStyle": true,
      "withTest": true,
      "withStory": false,
      "withLazy": false,
      "withIndex": false
    }
  }
}
```

The `$schema` line unlocks autocomplete and validation for `casting.json` in editors like VS Code.

**Test library options**

| Option | Description |
|--------|-------------|
| `Testing Library` | [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) |
| `Vitest` | [Vitest](https://vitest.dev/) with React Testing Library |
| `None` | Basic test using React's `createRoot` API |

## Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `casting component [names...]` | `c` | Generate one or more components |
| `casting hook [names...]` | `h` | Generate a custom hook (and test) |
| `casting context [names...]` | `ctx` | Generate a context (Provider + consumer hook) |
| `casting init` | | Create/overwrite `casting.json` (`--auto` to skip questions) |
| `casting` | | Interactive menu |

Every generator supports `--dry-run`, `--flat`, `-y, --yes`, and `-p, --path`.

## Generate Components

```sh
npx casting-cli component Box
```

```text
src/
└── components/
    └── Box/
        ├── Box.tsx
        ├── Box.module.css
        └── Box.test.tsx
```

Generate several at once:

```sh
npx casting-cli component Box Card Modal
```

## Generate Hooks

```sh
npx casting-cli hook useToggle
```

```text
src/
└── hooks/
    └── useToggle/
        ├── useToggle.ts
        └── useToggle.test.ts
```

```ts
// useToggle.ts
import { useCallback, useState } from 'react';

export function useToggle() {
  const [value, setValue] = useState<unknown>(null);
  const reset = useCallback(() => setValue(null), []);
  return { value, setValue, reset } as const;
}
```

Hooks default to `src/hooks`. Use `--path` to change it, or `--flat` to skip the folder.

## Generate Contexts

Generates a context, its `Provider`, and a typed consumer hook in one file.

```sh
npx casting-cli context Theme
```

```text
src/
└── context/
    └── ThemeContext/
        ├── ThemeContext.tsx
        └── ThemeContext.test.tsx
```

```tsx
// ThemeContext.tsx (abridged)
export function ThemeProvider({ children }: { children: ReactNode }) { /* ... */ }

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

For React Server Components / Next.js, add the directive automatically:

```sh
npx casting-cli context Theme --client   # prepends 'use client'
```

Casting also adds `'use client'` on its own when it detects a Next.js project.

## Interactive Mode

Run Casting with no arguments to pick a generator, name it, and toggle files with arrow keys + spacebar:

```sh
npx casting-cli
```

## Dry-Run Preview

`--dry-run` prints a colored, diff-style preview of every file **without writing anything**:

```sh
npx casting-cli component Box --dry-run
```

```diff
ℹ Dry-run mode - no files were created

Would create in src/components/Box:
  ├── Box.tsx
  ├── Box.module.css
  └── Box.test.tsx

┌─ Box.tsx
│ + import type { FC } from 'react';
│ + import styles from './Box.module.css';
│ +
│ + const Box: FC = () => (
│ +   <div className={styles.Box} data-testid="Box">Box Component</div>
│ + );
│ +
│ + export default Box;
└─
```

## Options

Override any config rule on the command line:

```sh
npx casting-cli component Box --withTest=false
```

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --path` | Output directory | Config value |
| `--type` | [Custom component type](#custom-component-types) | `default` |
| `--withLazy` | Generate a [lazy-loading](https://react.dev/reference/react/lazy) wrapper | Config value |
| `--withStory` | Generate a [Storybook](https://storybook.js.org) story | Config value |
| `--withStyle` | Generate a stylesheet | Config value |
| `--withTest` | Generate a test file | Config value |
| `--withIndex` | Generate a [barrel index file](#barrel--index-files) | Config value |
| `--dry-run` | Preview with a colored diff, write nothing | `false` |
| `-f, --flat` | Generate files directly in path (no folder) | `false` |
| `-y, --yes` | Skip prompts, use detected/config defaults | `false` |
| `--customDirectory` | Override the folder name ([details](#custom-component-types)) | Component name |

## Custom Component Types

Define named types with their own rules alongside `default`:

```json
{
  "component": {
    "default": { "path": "src/components", "withStyle": true, "withTest": true },
    "page":    { "path": "src/pages", "withLazy": true, "withStyle": true, "withTest": true },
    "layout":  { "path": "src/layout", "withTest": true }
  }
}
```

```sh
npx casting-cli component HomePage --type=page
npx casting-cli component Sidebar --type=layout
```

You can also override the generated folder name with `customDirectory` (must contain a template keyword):

```sh
npx casting-cli component Theme --type=provider --customDirectory=TemplateNameProvider
# → src/providers/ThemeProvider/ThemeProvider.tsx
```

## Custom Templates

Use your own templates instead of the built-ins by adding `customTemplates` to any component type:

```json
{
  "component": {
    "default": {
      "path": "src/components",
      "withStyle": true,
      "withTest": true,
      "customTemplates": {
        "component": "templates/TemplateName.tsx",
        "style": "templates/TemplateName.module.css",
        "test": "templates/TemplateName.test.tsx",
        "index": "templates/index.ts"
      }
    }
  }
}
```

All keys are optional — anything you omit falls back to Casting's built-in template.

## Template Keywords

Use these in template contents **and** filenames. Casting replaces each with your name in the matching case:

| Keyword | Format | Example (`user-card`) |
|---------|--------|-----------------------|
| `templatename` | raw (as typed) | `user-card` |
| `TemplateName` | PascalCase | `UserCard` |
| `templateName` | camelCase | `userCard` |
| `template-name` | kebab-case | `user-card` |
| `template_name` | snake_case | `user_card` |
| `TEMPLATE_NAME` | UPPER_SNAKE | `USER_CARD` |
| `TEMPLATENAME` | UPPERCASE | `USER-CARD` |

## Barrel / Index Files

Enable `withIndex` for a clean barrel export — **built in, no template required**:

```json
{ "component": { "default": { "withIndex": true } } }
```

```ts
// index.ts
export { default } from './Box';
```

Provide `customTemplates.index` to use your own barrel template.

## FAQ

**Does it overwrite existing files?**
No. Existing files are skipped and reported in the summary.

**What if I don't use Prettier?**
Formatting is best-effort. Without a local Prettier install, files are written as-is — nothing breaks.

**Can I use it in a JavaScript (non-TS) project?**
Yes. Casting detects the absence of TypeScript and emits `.js`/`.jsx`.

**Why is the package `casting-cli` but the command `casting`?**
The npm package is `casting-cli`; the installed executable is `casting`. Use `npx casting-cli …` or, after a global install, just `casting …`.

## Contributing

```bash
git clone https://github.com/Aditya060806/Harvest.git
cd Harvest
npm install
npm test        # run the Vitest suite
npm run lint    # check style
```

Issues and PRs are welcome at [Aditya060806/Harvest](https://github.com/Aditya060806/Harvest).

## License

Casting is open source software [licensed as MIT](https://github.com/Aditya060806/Harvest/blob/main/LICENSE).
