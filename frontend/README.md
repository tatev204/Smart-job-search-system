# Diplomayin Frontend

This frontend is a minimal React + TypeScript app (Vite) that talks to the Go backend.

Prerequisites
- Node.js and npm installed (Windows PowerShell)
- Backend running locally (see project root README)

Environment
- Uses `VITE_API_BASE_URL` from `.env` (defaults to `http://localhost:8088`)

Quick start (PowerShell)

```powershell
cd C:\Users\aniar\GolandProjects\Diplomayin\frontend
npm install
npm run dev
```

Notes
- The backend exposes API on port 8088 by default. If backend runs on another host/port, update `.env` or `VITE_API_BASE_URL`.
- Some backend endpoints are protected by JWT (see `api/jwt.go`). To access protected endpoints add `Authorization: Bearer <token>` header in requests.
- If you get CORS errors, either enable CORS in the Go server or use the proxy in `vite.config.ts`. Current `api.ts` uses absolute URL; change to `'/api'` if you prefer proxying and adjust `vite.config.ts` accordingly.

Files added
- `src/pages/*` — pages (VacancyList, VacancyDetail, UploadResume)
- `src/services/*` — API wrappers
- `vite.config.ts`, `.env`, `tsconfig.json`, `styles.css`

Next steps I can take for you (choose any):
- Implement login flow and store JWT (localStorage) and attach to requests
- Add skill selection and AddUserSkills flow
- Improve UI using a component library (MUI/AntD)
- Add unit tests / e2e tests

