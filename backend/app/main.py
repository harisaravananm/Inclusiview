import os
import logging
from contextlib import asynccontextmanager

# Load .env file from project root
_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
if os.path.exists(_env_path):
    with open(_env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())
    logging.getLogger(__name__).info(f"Loaded environment from {_env_path}")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.database import engine, Base
from app.seed_data import seed_database
from app.routers import insights, analysis
from app.services.ai_service import init_llm

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting InclusiView API...")
    Base.metadata.create_all(bind=engine)
    seed_database()
    init_llm()
    yield
    logger.info("Shutting down InclusiView API...")


app = FastAPI(
    title="InclusiView - Equity Decision Intelligence Platform",
    description="AI-powered platform for analyzing accessibility and equity in communities",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(insights.router)
app.include_router(analysis.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


# Serve frontend static files (for single-container Cloud Run deploy)
_static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.exists(_static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(_static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(_static_dir, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index = os.path.join(_static_dir, "index.html")
        if os.path.exists(index):
            return FileResponse(index, media_type="text/html")
        return {"error": "not found"}
