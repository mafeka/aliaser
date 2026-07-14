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

## Development

```bash
npm install
npm run dev          # Vite dev server
npm run build        # Chrome build → dist/
npm run build:firefox # Firefox build → dist-firefox/
npm run test:run     # Run all tests
```

## Loading the Extension

**Chrome:** Go to `chrome://extensions`, enable Developer mode, click "Load unpacked", select the `dist/` directory.

**Firefox:** Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", select any file in `dist-firefox/`.

## License

ISC
