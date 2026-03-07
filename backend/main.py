import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from routers import lark, cards, auth
from database import engine, ensure_flashcards_schema
from models import Base

app = FastAPI()

ADMIN_KEY = os.getenv("ADMIN_KEY")
API_KEY = os.getenv("API_KEY")
API_KEY_HEADER = os.getenv("API_KEY_HEADER", "x-api-key")

class ApiKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)
        path = request.url.path
        if path == "/" or path.startswith("/docs") or path.startswith("/openapi.json"):
            return await call_next(request)
        if path.startswith("/lark/webhook"):
            return await call_next(request)
        if API_KEY:
            provided_key = request.headers.get(API_KEY_HEADER)
            if provided_key != API_KEY:
                return JSONResponse(status_code=401, content={"detail": "Unauthorized"})
        if path.startswith("/admin"):
            if not ADMIN_KEY:
                return JSONResponse(status_code=401, content={"detail": "Unauthorized"})
            provided_key = request.headers.get("x-admin-key")
            if provided_key != ADMIN_KEY:
                return JSONResponse(status_code=401, content={"detail": "Unauthorized"})
        return await call_next(request)

app.add_middleware(ApiKeyMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lark.router)
app.include_router(cards.router)
app.include_router(auth.router)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    ensure_flashcards_schema()

@app.get("/")
def read_root():
    return {"message": "AI Flashcards backend is running!"}
