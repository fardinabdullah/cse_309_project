from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.workspace import router as workspace_router


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(workspace_router)


@app.get("/")
def home():
    return {
        "message": "Smart Workspace Manager API"
    }