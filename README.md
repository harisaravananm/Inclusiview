# InclusiView

<!-- tech-version-badges -->
![React 18%2B](https://img.shields.io/badge/React-18%2B-61DAFB?style=for-the-badge&logo=react&logoColor=white) ![Vite 5%2B](https://img.shields.io/badge/Vite-5%2B-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![TypeScript 5%2B](https://img.shields.io/badge/TypeScript-5%2B-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![FastAPI 0.110%2B](https://img.shields.io/badge/FastAPI-0.110%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white) ![Gemini AI](https://img.shields.io/badge/Gemini-AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
<!-- /tech-version-badges -->

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