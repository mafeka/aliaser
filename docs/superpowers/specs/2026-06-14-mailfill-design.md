# Mailfill - Browser Extension Design Spec

A cross-browser extension that generates unique, per-site email addresses using configurable Handlebars-style templates.

## Problem

When registering on websites, using a unique email address per site helps with spam tracking, breach detection, and organization. Manually constructing these addresses (prefix + domain + suffix + mail domain) is tedious and error-prone.

## Core Concept

The user owns a mail domain (e.g., `kakrow.me`) and wants addresses like:

```
spam-amazon.de-20260601@kakrow.me
newsletter-github.com-00042@kakrow.me
```

Mailfill auto-detects email fields on web pages and generates these addresses from configurable templates.

## Template System

### Syntax

Handlebars-style placeholders:

```
{{domain}}                  -> amazon.de
{{date:yyyyMMdd}}           -> 20260614
{{date:yyyy-MM-dd_HHmm}}   -> 2026-06-14_1523
{{random:8}}                -> a7f3b2x9
{{counter}}                 -> 42
{{mailDomain}}              -> kakrow.me
```

Literal text outside placeholders is preserved as-is.

### Template Examples

```
spam-{{domain}}-{{date:yyyyMMdd}}@{{mailDomain}}
newsletter-{{domain}}-{{counter}}@{{mailDomain}}
{{domain}}-{{random:12}}@{{mailDomain}}
```

### Placeholder Handlers

Each placeholder maps to a pure function:

```typescript
interface TemplateContext {
  domain: string;
  counter: number;
}

interface PlaceholderHandler {
  resolve(arg: string | undefined, ctx: TemplateContext): string;
}
```

Handlers:
- `domain` - registrable domain of current page
- `date` - current datetime, formatted via `date-fns/format` (arg = format string, default `yyyyMMdd`)
- `random` - alphanumeric random string (arg = length, default `8`)
- `counter` - global auto-incrementing integer
- `mailDomain` - user's configured mail domain

### Validation

Templates are validated on save. Invalid placeholder names show an error. A live preview renders the template with a sample domain.

## Domain Extraction

Uses `tldts` library (~15KB) to correctly strip subdomains while respecting the Public Suffix List:

- `www.amazon.de` -> `amazon.de`
- `login.store.amazon.co.uk` -> `amazon.co.uk`

Fallback to raw hostname for unparseable URLs (localhost, IPs).

## User Interaction

### Three Trigger Methods

All three converge on the same generation pipeline:

**1. Overlay Icon (primary)**
- Content script detects email input fields on the page
- Small icon rendered inside the field (right edge)
- Click opens an inline popup anchored to the field:
  - Pre-filled generated address (default template + detected domain)
  - Editable text field for tweaking
  - Dropdown to select a different preset
  - "Fill" button to insert
- Only the focused/interacted field is filled (not all email fields on page)

**2. Right-Click Context Menu (quick path)**
- Right-click any input field -> "Mailfill -> Generate address"
- Sub-items for each configured preset
- Inserts immediately, no edit step

**3. Keyboard Shortcut (optional)**
- Configurable, disabled by default
- When focused on an input field, triggers the same inline popup as the overlay icon

### Toolbar Popup

The browser toolbar icon opens a settings shortcut, not a generator:
- Shows current default template
- Link to full options page
- Toggle for keyboard shortcut

### Field Detection

```typescript
const EMAIL_SELECTORS = [
  'input[type="email"]',
  'input[name*="email" i]',
  'input[autocomplete="email"]',
  'input[placeholder*="email" i]',
  'input[id*="email" i]',
];
```

- Runs on page load + `MutationObserver` for SPAs/dynamic content
- Debounced mutation callbacks
- Tracks overlaid fields to avoid duplicates

### Overlay & Popup Rendering

- Shadow DOM isolation to prevent CSS conflicts with host page
- SVG icon, inline (no external assets)
- Value injection dispatches `input` and `change` events for framework compatibility (React, Vue, Angular)

## Configuration

### Data Model

```typescript
interface Config {
  mailDomain: string;
  defaultTemplate: string;
  presets: Preset[];
  counter: number;
  shortcutEnabled: boolean;
}

interface Preset {
  name: string;
  template: string;
}
```

### Defaults

```typescript
const DEFAULT_CONFIG: Config = {
  mailDomain: '',
  defaultTemplate: '{{domain}}-{{date:yyyyMMdd}}@{{mailDomain}}',
  presets: [],
  counter: 1,
  shortcutEnabled: false,
};
```

### Storage

- `chrome.storage.sync` for all data (settings, presets, counter)
- Syncs across devices via browser account
- Counter increment is serialized through the background service worker to avoid race conditions across tabs (best-effort uniqueness — `chrome.storage` has no true transactions)

### First-Run

If `mailDomain` is empty, clicking the overlay icon opens the options page instead of generating an address.

## Architecture

```
mailfill/
  src/
    background/
      service-worker.ts        # Extension lifecycle, context menu registration
    content/
      detector.ts              # Finds email input fields on page
      overlay.ts               # Renders icon overlay on detected fields
      injector.ts              # Inserts generated address into field
    popup/
      popup.html               # Toolbar popup UI
      popup.ts
      popup.css
    options/
      options.html             # Full settings page
      options.ts
      options.css
    core/
      template.ts              # Template engine (parse + resolve)
      domain.ts                # Domain extraction via tldts
      storage.ts               # chrome.storage.sync typed wrapper
      types.ts                 # Shared type definitions
    manifest.json
  tsconfig.json
  vite.config.ts
  package.json
```

### Separation of Concerns

- `core/` - Pure logic, zero DOM or browser API dependencies, fully unit-testable
- `content/` - Page interaction (content script context)
- `background/` - Service worker (MV3), context menu, shortcut handling
- `popup/` - Toolbar popup UI
- `options/` - Full configuration page

## Cross-Browser Support

### Chrome / Edge / Chromium-based (primary)
- Manifest V3, service worker background
- No shims needed

### Firefox
- Manifest V3 (supported in recent versions)
- `webextension-polyfill` for `browser.*` vs `chrome.*` namespace normalization
- Same build, polyfill included

### Safari (deferred)
- Code is identical; packaging via Apple's `safari-web-extension-converter`
- Requires Xcode + Apple Developer account
- Target after Chrome + Firefox are stable

### Build

- Vite with web extension plugin or custom config
- Single source, two build outputs (Chrome, Firefox)
- Browser-specific manifest fields handled at build time

## Testing

### Unit Tests (Vitest)
- Template engine: parsing, resolution, edge cases, invalid templates
- Domain extraction: subdomains, multi-part TLDs, fallbacks
- Storage: serialization, counter atomicity

### Manual Testing
- Load unpacked in Chrome/Firefox
- Test against real registration forms (Amazon, GitHub, etc.)

### E2E (deferred)
- Playwright with browser extension support, added later if needed

## Tech Stack

- **Language**: TypeScript
- **Bundler**: Vite
- **Testing**: Vitest
- **Date formatting**: date-fns
- **Domain parsing**: tldts
- **Browser compat**: webextension-polyfill
- **Target**: Manifest V3

## Non-Goals

- No network calls (purely client-side)
- No mail server integration
- No Safari in initial release
- No E2E tests in initial release
