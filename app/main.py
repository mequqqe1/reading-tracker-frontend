from fastapi import FastAPI
from app import models
from app.database import engine
from app.routes import users, books, challenges, progress
from fastapi.security import OAuth2PasswordBearer
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware

###models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Reading Tracker API")

app.include_router(users.router)
app.include_router(books.router)
app.include_router(challenges.router)
app.include_router(progress.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # или ["http://localhost:19006"] для безопасности
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Reading Tracker API",
        version="1.0.0",
        description="API для отслеживания чтения книг и челленджей",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi