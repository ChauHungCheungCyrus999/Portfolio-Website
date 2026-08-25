# Job Website

A full-stack starter with a React JavaScript frontend and a Flask Python backend.

## Project folders

- `frontend/` — React 19, Vite, and ESLint
- `backend/` — Flask API, Flask-CORS, and python-dotenv

## Requirements

- Node.js 20.19+ or 22.12+
- Python 3.9+

## Run in VS Code

Run the **Full Stack: Dev** task from **Terminal → Run Task**. It starts:

- React at `http://localhost:5173`
- Flask at `http://localhost:5001`
- Health API at `http://localhost:5001/api/health`

## Run manually

Use two terminals from the project root.

### Backend

```sh
PORT=5001 backend/.venv/bin/python backend/app.py
```

### Frontend

```sh
npm --prefix frontend run dev
```

## Environment configuration

Copy either example only when custom local values are needed:

- `backend/.env.example` to `backend/.env`
- `frontend/.env.example` to `frontend/.env`

During local development, Vite proxies `/api` requests to Flask automatically.

## Validation

```sh
npm --prefix frontend run lint
npm --prefix frontend run build
backend/.venv/bin/python -m compileall -q backend
```
