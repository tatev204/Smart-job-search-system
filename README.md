# Diplomayin (Monorepo)

This repository contains two services started by `main.go`:
- API (Go) — runs on port 8088
- Scraper (Go) — runs on port 8080 (also uses 8070)

## Running with Docker

The easiest way to run the entire project is using Docker Compose.

1. Ensure you have Docker and Docker Compose installed.
2. From the project root, run:
   ```bash
   docker-compose up --build
   ```
3. The services will be available at:
   - Frontend: http://localhost
   - Backend API: http://localhost:8088
   - Scraper API: http://localhost:8070

## Manual Setup

To run both services locally:

```powershell
cd C:\Users\aniar\GolandProjects\Diplomayin
go run main.go
```

Then open the frontend (separate terminal):

```powershell
cd C:\Users\aniar\GolandProjects\Diplomayin\frontend
npm install
npm run dev
```

If you don't have Node.js installed, install it from https://nodejs.org/

CORS: the backend currently listens on `:8088` and does not set CORS headers. For local frontend development either:
- Enable CORS support in the Go server (add middleware) OR
- Use the proxy configured in `frontend/vite.config.ts` (ensure requests go through `/api` path).


