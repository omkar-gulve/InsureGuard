from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine

# Create sqlite database using SQLAlchemy
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Insurance Claim Predictor API",
    description="Backend for classifying fraudulent insurance claims and predicting premiums.",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes import auth_routes, claim_routes, ml_routes
app.include_router(auth_routes.router)
app.include_router(claim_routes.router)
app.include_router(ml_routes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Insurance Policy Machine Learning API!"}
