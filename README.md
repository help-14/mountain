# Mountain ⛰️

A fast, lightweight, self-hosted web file manager built with [SolidStart](https://start.solidjs.com).

## Features

- **Browse** with tile or list views, breadcrumbs (click to edit the path), back/forward history and a folder tree
- **Split view**: up to four panels side by side; drag items between them to move (hold <kbd>Alt</kbd>/<kbd>Ctrl</kbd> to copy)
- **File operations**: create files and folders, rename inline, copy / cut / paste, copy or move to a chosen folder, delete, compress to ZIP
- **Upload** files or whole folders (button or drag-and-drop from your desktop) with live progress and cancel
- **Download** single files, or folders and multi-selections as a streamed ZIP
- **Preview panel** for images, video, audio, PDF and text, plus image thumbnails
- **Search** recursively within the current folder
- **Selection**: click, <kbd>Shift</kbd>/<kbd>Ctrl</kbd>/<kbd>⌘</kbd>-click, keyboard navigation, selection mode for touch devices
- **Keyboard shortcuts** for everything (press <kbd>?</kbd> to see them)
- Sorting, folders-first, hidden-file toggle, relative dates, and English / Tiếng Việt / Русский
- Responsive layout with a mobile navigation drawer; respects `prefers-reduced-motion`

## Running

```bash
pnpm install
pnpm dev            # http://localhost:4000
```

Production:

```bash
pnpm build
MOUNTAIN_ROOT=/srv/files PORT=8080 pnpm start
```

Docker:

```bash
docker compose up -d   # serves ./data on http://localhost:8080
```

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `MOUNTAIN_ROOT` | your home directory | Folder that is served. Nothing outside it can be reached (symlinks included). |
| `MOUNTAIN_USERNAME` / `MOUNTAIN_PASSWORD` | — | When both are set, every request requires HTTP basic auth. |
| `MOUNTAIN_READONLY` | `false` | Disables create, rename, move, delete, compress and upload. |
| `PORT` | `3000` (`8080` in Docker) | Port for the production server. |

> Mountain gives full read/write access to `MOUNTAIN_ROOT`. If you expose it beyond localhost, set a username and password and put it behind HTTPS.

## API

All paths are virtual paths rooted at `/` (= `MOUNTAIN_ROOT`).

| Method | Route | Body / query |
| --- | --- | --- |
| GET | `/api/list` | `?path=&dirs=1` |
| GET | `/api/search` | `?path=&q=` |
| GET | `/api/text` | `?path=` (first 256 KB of a text file) |
| GET | `/api/download` | `?path=` (repeatable; folders/multiple → ZIP), `&inline=1` |
| POST | `/api/upload` | `?path=&name=relative/name` with the raw file as body |
| POST | `/api/create` | `{ path, name, directory?, content? }` |
| POST | `/api/rename` | `{ path, name }` |
| POST | `/api/copy`, `/api/move` | `{ paths, destination }` |
| POST | `/api/delete` | `{ paths }` |
| POST | `/api/compress` | `{ paths, destination, name }` |

## Special thanks

- Freepik for the logo
