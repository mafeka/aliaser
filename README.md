# Aliaser

One-click email aliases, your domain.

Aliaser is a browser extension that generates unique per-site email addresses using configurable templates. Own a mail domain? Aliaser auto-detects email fields and fills them with addresses like:

```
spam-amazon.de-20260601@your-domain.com
newsletter-github.com-00042@your-domain.com
```

## Features

- **Auto-detection** — finds email fields on any page, including dynamically loaded ones
- **Template engine** — Handlebars-style placeholders: `{{domain}}`, `{{date:yyyyMMdd}}`, `{{counter}}`, `{{random:8}}`, `{{mailDomain}}`
- **Presets** — save multiple templates and switch between them
- **Context menu** — right-click any input to generate an address
- **Keyboard shortcut** — `Alt+M` to trigger from the focused field
- **Live preview** — see generated addresses as you edit templates in settings
- **Cross-browser** — Chrome and Firefox (Manifest V3)

## Template Examples

```
spam-{{domain}}-{{date:yyyyMMdd}}@{{mailDomain}}
newsletter-{{domain}}-{{counter}}@{{mailDomain}}
{{domain}}-{{random:12}}@{{mailDomain}}
```

## Install

Download the latest release from [GitHub Releases](https://github.com/mafeka/aliaser/releases):

- **Chrome:** `aliaser-<version>-chrome.zip` — unzip and load via `chrome://extensions` (Developer mode → Load unpacked)
- **Firefox:** `aliaser-<version>-firefox.xpi` — open the file in Firefox or drag it into a Firefox window

## Development

Requires [Task](https://taskfile.dev) as the task runner.

```bash
npm install
task dev             # Vite dev server
task build           # Chrome build → dist/chrome/
task build:firefox   # Firefox build → dist/firefox/
task build:all       # Build both browsers
task package         # Build + create .zip and .xpi in dist/
task test:run        # Run all tests
task check           # Typecheck + tests
task release -- X.Y.Z  # Bump version, commit, tag, push
```

## Loading for Development

**Chrome:** Go to `chrome://extensions`, enable Developer mode, click "Load unpacked", select `dist/chrome/`.

**Firefox:** Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", select any file in `dist/firefox/`.

## Disclaimer

This project is 100% coded by agentic AI coders. All code, tests, and documentation were generated through AI-assisted development.

## License

ISC
