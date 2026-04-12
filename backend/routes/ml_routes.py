import os
import joblib
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import schemas
from auth import get_current_user

router = APIRouter(prefix="/predict", tags=["Predictions"])

# Preload models to keep API fast during single inferences
fraud_model_path = os.path.join(os.path.dirname(__file__), "..", "ml_models", "fraud_model.pkl")
premium_model_path = os.path.join(os.path.dirname(__file__), "..", "ml_models", "premium_model.pkl")

fraud_model = None
premium_model = None

try:
    if os.path.exists(fraud_model_path):
        fraud_model = joblib.load(fraud_model_path)
    if os.path.exists(premium_model_path):
        premium_model = joblib.load(premium_model_path)
except Exception as e:
    print(f"Error loading models: {e}")

@router.post("/fraud", response_model=schemas.FraudPredictResponse)
def predict_fraud(data: schemas.FraudFeatureInput, current_user=Depends(get_current_user)):
    if not fraud_model:
        raise HTTPException(status_code=500, detail="Fraud ML model not loaded/trained")
    
    # Convert input to DataFrame
    df = pd.DataFrame([data.dict()])
    
    try:
        # Predict class (0 or 1) and probabilities
        prediction = fraud_model.predict(df)[0]
        probabilities = fraud_model.predict_proba(df)[0]
        
        # Usually model predicts 1 for fraud and 0 for genuine
        fraud_prob = probabilities[1]
        
        return {
            "fraud_prediction": "Fraudulent" if int(prediction) == 1 else "Genuine",
            "probability": round(fraud_prob, 4)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {e}")

@router.post("/premium", response_model=schemas.PremiumPredictResponse)
def predict_premium(data: schemas.PremiumFeatureInput, current_user=Depends(get_current_user)):
    if not premium_model:
        raise HTTPException(status_code=500, detail="Premium ML model not loaded/trained")
    
    df = pd.DataFrame([data.dict(by_alias=True)]) 
    # Replace snake_case keys back to spaced fields expected by the ML model
    df = df.rename(columns={
        "Annual_Income": "Annual Income",
        "Vehicle_Age": "Vehicle Age",
        "Credit_Score": "Credit Score",
        "Previous_Claims": "Previous Claims",
        "Health_Score": "Health Score",
        "Smoking_Status": "Smoking Status"
    })
    
    try:
        prediction = premium_model.predict(df)[0]
        return {
            "predicted_premium": round(prediction, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {e}")
