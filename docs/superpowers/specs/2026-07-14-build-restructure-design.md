# Build Restructure Design

## Goal

Restructure build output, add packaging for distribution, add a release workflow via GitHub Actions, and consolidate browser-specific build files.

## Output Structure

```
dist/
  chrome/                          # unpacked Chrome build (gitignored)
  firefox/                         # unpacked Firefox build (gitignored)
  aliaser-<version>-chrome.zip     # packaged for Chrome Web Store
  aliaser-<version>-firefox.xpi    # packaged for Firefox/AMO
```

`dist/` is gitignored. Packaged artifacts are published as GitHub Release assets.

## Build Files

Browser-specific build scripts and overrides move to `build/`:

```
build/
  build-firefox.mjs       # copies Chrome dist, patches manifest for Firefox
  manifest.firefox.json   # Firefox manifest overrides (moved from src/)
```

## Taskfile Commands

| Command | Description |
|---|---|
| `task build` | Build Chrome extension (unpacked) to `dist/chrome/` |
| `task build:firefox` | Build Firefox extension (unpacked) to `dist/firefox/` |
| `task build:all` | Build both browsers |
| `task package` | Build all + create `.zip` and `.xpi` in `dist/` |
| `task release -- 0.2.0` | Bump version in `package.json` + `src/manifest.json`, commit, create+push tag `v0.2.0` |

Existing commands (`task dev`, `task test`, `task check`, etc.) unchanged.

## Release Flow

1. Developer runs `task release -- X.Y.Z`
2. Task updates `version` in `package.json` and `src/manifest.json`
3. Task commits the change and creates git tag `vX.Y.Z`
4. Task pushes the commit and tag
5. GitHub Actions triggers on `v*` tag push

## GitHub Actions (`.github/workflows/release.yml`)

Trigger: push of tags matching `v*`

Steps:
1. Checkout repository
2. Install Node.js and dependencies
3. Run `task check` (typecheck + tests)
4. Run `task package`
5. Create GitHub Release with `.zip` and `.xpi` as downloadable assets

## What Changes

- `vite.config.ts` — output dir changes from `dist` to `dist/chrome`
- `scripts/build-firefox.mjs` → `build/build-firefox.mjs` (updated paths)
- `src/manifest.firefox.json` → `build/manifest.firefox.json`
- `.gitignore` — add `dist/`
- `Taskfile.yml` — updated commands, add `package` and `release`
- New `.github/workflows/release.yml`

## What Stays the Same

- `src/manifest.json` stays in `src/`
- Vite plugin logic (Chrome extension plugin) — just path updates
- All dev/test commands
- Project structure under `src/`
