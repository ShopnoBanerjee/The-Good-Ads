from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import post_login
from app.api import complete_registration
from app.api import create_project
from app.api import marketplace
from app.api import proposals
from app.api import portfolio
from app.api import chat
from app.api import file_upload
from app.api import milestones

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://in-halt.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["health"], summary="Check API health status")
def health():
    return {"health": "ok"}

app.include_router(post_login.router)
app.include_router(complete_registration.router)
app.include_router(create_project.router)
app.include_router(marketplace.router)
app.include_router(proposals.router)
app.include_router(portfolio.router)
app.include_router(chat.router)
app.include_router(file_upload.router)
app.include_router(milestones.router)    