from fastapi import FastAPI
from routes.workspace import router as workspace_router


app = FastAPI(
    title="Smart Workspace Manager API"
)


app.include_router(workspace_router)


@app.get("/")
def home():
    return {
        "message": "Smart Workspace Manager Backend Running"
    }