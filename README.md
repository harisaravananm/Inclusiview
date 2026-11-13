# InclusiView

[![License](https://img.shields.io/github/license/harisaravananm/Inclusiview?style=for-the-badge)](https://github.com/harisaravananm/Inclusiview/blob/main/LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/harisaravananm/Inclusiview?style=for-the-badge)](https://github.com/harisaravananm/Inclusiview/commits/main)

An AI-powered equity decision platform for analyzing community accessibility, visualizing service gaps, and generating recommendations for city stakeholders.

## Table of Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Project structure](#project-structure)
- [License](#license)

## Features

- Clear project organization for learning, experimentation, or demonstration
- Project-specific workflows documented below
- Reproducible local setup instructions

## Tech stack

React, Vite, TypeScript, Recharts, Tailwind CSS, FastAPI, SQLAlchemy, SQLite/PostgreSQL, OpenRouter, and Gemini

## Quick start

```bash
git clone https://github.com/harisaravananm/Inclusiview.git
cd Inclusiview

cd backend
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Project structure

```text
.
|-- backend/
|-- frontend/
|-- deploy-cloudrun.ps1
`-- README.md
```

## License

This project is distributed under the license in [LICENSE](LICENSE).
