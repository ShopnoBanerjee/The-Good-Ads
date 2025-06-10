from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.api.v1 import api_router  # make sure this path is correct
from app.db.session import engine
from app.db.base import Base

async def lifespan(app: FastAPI):
    # Create tables if they do not exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="The Good Ads API",
    lifespan=lifespan,
)

app.mount("/app", StaticFiles(directory="app/static"), name="static")  # match the correct folder

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to The Good Ads API"}
