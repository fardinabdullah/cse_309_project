from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.documents import router as documents_router



from routes.workspace import router as workspace_router
from routes.auth import router as auth_router
from routes.paper import router as paper_router
from routes.reading import router as reading_router      # NEW
from routes.topics import router as topics_router        # NEW

app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workspace_router)
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(paper_router)
app.include_router(reading_router)      # NEW
app.include_router(topics_router)   
app.include_router(documents_router)    # NEW

@app.get("/")
def home():
    return {"message": "Smart Workspace Manager API"}