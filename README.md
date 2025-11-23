# Multilingual Transformer Lab

A playful, multilingual transformer lab delivered entirely as a static web application. Explore grammar data, dialog drills, sentence correction, and transformer introspection demos without running any backend services.

## Highlights

- 🌍 **Language-Agnostic Content** – All lesson material lives in versioned JSON files under `frontend/public/data`.
- 🔬 **Transformer Introspection** – Tokenization, embedding, and attention visualizations are generated client-side with deterministic mock data.
- 🧠 **Interactive Modules** – Pattern learning, dialog practice, and correction helpers work offline once the bundle loads.
- 📦 **Pure Static Build** – `npm run build` (executed from `frontend/`) outputs everything to `frontend/dist`, ready for Azure Static Web Apps or any static host.

## Project Layout

```
frontend/
├── index.html            # Overview entry point
├── lab.html              # Dedicated lab entry point
├── appendix.html         # Appendix entry point
├── public/
│   ├── data/             # CEFR/manifest JSON served as-is
│   ├── icons/            # PWA icons
│   └── manifest.json     # Web app manifest, copied to dist/
├── src/
│   ├── components/       # Header, layout, shared UI
│   ├── modules/          # Pattern, correction, dialog, introspection
│   ├── pages/            # Overview + appendix detail views
│   ├── utils/nlpMockApi  # Deterministic mock NLP helpers
│   ├── App.jsx           # React Router config
│   └── main.jsx          # Single entry script reused by every HTML file
└── vite.config.js        # Multi-page + relative asset build config

backend/ contains the historical Flask prototype but is no longer required or referenced during local development or deployment.
```

## Prerequisites

- Node.js 18+
- npm 9+

## Local Development

```bash
cd frontend
npm install
npm run dev
```

Visit the printed localhost URL (defaults to <http://localhost:3000>). All data loads from the bundled JSON files; no separate API process is necessary.

## Production Build & Deployment

```bash
cd frontend
npm run build
```

This command produces `frontend/dist/` with the following structure:

```
dist/
├── index.html
├── lab.html
├── appendix.html
├── manifest.json
└── assets/...
```

Upload the `dist/` folder to your static host. For Azure Static Web Apps, use:

```yaml
app_location: "frontend"
output_location: "dist"
api_location: ""
```

The Vite config already includes every `.html` file in the project root, sets `base: './'` for relative asset paths, and copies everything from `frontend/public/` (manifest, icons, JSON data) into the build.

## Data & Content

- `frontend/public/data/languages/manifest.json` drives the appendix pickers.
- Each language level includes `grammar.json`, `vocabulary.json`, `conversation.json`, and optional `patterns.json` bundles that are fetched at runtime via relative URLs (no server required).
- UI copy for languages and nav controls lives in `frontend/src/data/languages.json`.

To add or update content, edit the JSON files and rebuild. Because they sit under `public/`, they are copied verbatim to `dist/data/...` and can be versioned independently from the React bundle.

## Legacy Backend Note

The `backend/` directory remains in the repository for reference but is no longer part of the build or deployment process. All NLP behaviors have deterministic, in-browser equivalents under `frontend/src/utils/nlpMockApi.js`. Do not start the Flask server when working with the current version of the app.

## License

MIT License – see `LICENSE` for details.
