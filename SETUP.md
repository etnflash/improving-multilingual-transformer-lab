# Multilingual Transformer Lab · Setup Guide

The project now runs entirely from the `frontend/` directory. There is no backend or API server to start, and every build/deployment step should be executed inside `frontend/`.

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

- Vite prints the development URL (defaults to <http://localhost:3000>).
- JSON lesson data is read from `public/data`, so changes to those files are picked up immediately.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `npm install` fails | Verify you have Node.js 18+ and npm 9+. |
| Port 3000 in use | Edit `server.port` in `frontend/vite.config.js` and restart `npm run dev`. |
| Static JSON 404s | Make sure the files live under `frontend/public/data` so Vite copies them into `dist/data`. |
| Manifest missing after deploy | Confirm `frontend/public/manifest.json` exists and that `<link rel="manifest" href="/manifest.json">` is present in every HTML file. |

## Production Build

```bash
cd frontend
npm run build
```

Outputs `frontend/dist/` containing:

```
dist/
├── index.html
├── lab.html
├── appendix.html
├── manifest.json
└── assets/
```

Use `npm run preview` (still from `frontend/`) to verify the optimized build locally.

## Azure Static Web Apps

Point the workflow at the true project root:

```yaml
app_location: frontend
output_location: dist
api_location: ""
```

Because the site is pure static content, you do not need an API directory or any serverless functions.

## Content Updates

- UI strings: `frontend/src/data/languages.json`
- Appendix bundles: `frontend/public/data/languages/**`
- Transformer demos: `frontend/src/utils/nlpMockApi.js`

After editing JSON, rerun `npm run build` so the new files are emitted into `dist/data` for deployment.

## Legacy Backend

The historical Flask prototype under `backend/` is no longer wired into the application. Leave it untouched unless you are intentionally reviving the old API; the current production build ignores it entirely.
