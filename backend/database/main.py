from database.mongodb import client

@app.get("/test-db")
async def test_db():
    await client.admin.command("ping")
    return {"message": "MongoDB connected successfully"}