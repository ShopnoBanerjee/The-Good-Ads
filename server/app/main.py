from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import post_login
from app.api import complete_registration
from app.api import create_project
from app.api import marketplace
from app.api import proposals
from app.api import portfolio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(post_login.router)
app.include_router(complete_registration.router)
app.include_router(create_project.router)
app.include_router(marketplace.router)
app.include_router(proposals.router)
app.include_router(portfolio.router)    