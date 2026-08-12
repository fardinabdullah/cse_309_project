from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.workspace import router as workspace_router
from routes.auth import router as auth_router
from routes.paper import router as paper_router
from routes.reading import router as reading_router
from routes.topics import router as topics_router
from routes.documents import router as documents_router

app = FastAPI()

# CORS Configuration - Allow both localhost and GitHub Pages
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://fardinabdullah.github.io",
        "https://fardinabdullah.github.io/cse_309_project",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(workspace_router)
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(paper_router)
app.include_router(reading_router)
app.include_router(topics_router)
app.include_router(documents_router)

@app.get("/")
def home():
    return {"message": "Smart Workspace Manager API"}

@app.get("/test-db")
async def test_db():
    from database.mongodb import client
    try:
        await client.admin.command("ping")
        return {"message": "MongoDB connected successfully"}
    except Exception as e:
        return {"message": f"MongoDB connection failed: {str(e)}"}