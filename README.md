# InclusiView — AI Equity Decision Intelligence Platform

AI-powered platform for analyzing community accessibility, equity, and generating actionable recommendations for city stakeholders.

## Features

- **Dashboard** — KPI cards, equity score bar/radar charts, interactive equity heatmap
- **Equity Map** — Multi-layer map (accessibility issues, transit stops, service centers)
- **AI Reports** — Generate equity briefs and recommendations using LLM (OpenRouter/Gemini)

## Tech Stack

- **Frontend:** React + Vite + TypeScript + Recharts + Tailwind CSS (zero image deps)
- **Backend:** FastAPI + SQLAlchemy + SQLite/PostgreSQL
- **AI:** OpenRouter API (GPT-4o-mini) or Google Gemini
- **Deployment:** Google Cloud Run (single container)

## Run Locally

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Deploy to Cloud Run

```powershell
# 1. Set your project ID in deploy-cloudrun.ps1
# 2. Run:
.\deploy-cloudrun.ps1
```

## Architecture

```
Browser → Cloud Run (FastAPI + static frontend)
                │
                ├── /api/insights (data queries)
                └── /api/analysis (AI briefs + recommendations)
                              │
                              └── OpenRouter / Gemini API
```
