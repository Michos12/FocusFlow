# FocusFlow — web client

React + TypeScript + Vite frontend, styled with Tailwind CSS.

This package is not meant to run on its own: it needs the API and the database
from the repository root. See the [main README](../README.md) for setup.

```bash
npm install
npm start      # Vite dev server on http://localhost:5173
```

| Command           | What it does                      |
| ----------------- | --------------------------------- |
| `npm start`       | Dev server on port 5173           |
| `npm run build`   | Type-checks and builds to `dist/` |
| `npm run lint`    | Runs ESLint                       |
| `npm run preview` | Serves the production build       |

The API base URL is set in `src/services/api.ts`.
