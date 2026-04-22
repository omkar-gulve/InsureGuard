from pydantic import BaseModel, EmailStr
from typing import Optional, List
import datetime
from models import RoleEnum

# User Auth schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[RoleEnum] = RoleEnum.agent

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: RoleEnum
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    profile_image_url: Optional[str] = None
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    profile_image_url: Optional[str] = None

class UserUpdateResponse(BaseModel):
    username: str
    email: str
    role: RoleEnum
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    profile_image_url: Optional[str] = None
    class Config:
        from_attributes = True

class UserWithStats(UserResponse):
    claims_count: int
    created_at: Optional[datetime.datetime] = None
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Claim schemas
class ClaimCreate(BaseModel):
    policy_number: str
    claim_amount: float
    fraud_probability: Optional[float] = 0.0
    status: Optional[str] = "Pending"

class ClaimResponse(BaseModel):
    id: int
    policy_number: str
    claim_amount: float
    status: str
    fraud_probability: float
    created_at: datetime.datetime
    agent_id: int
    class Config:
        from_attributes = True

# ML Predict schemas
class FraudFeatureInput(BaseModel):
    incident_type: str
    incident_severity: str
    property_damage: str          # YES / NO / ?
    total_claim_amount: float
    months_as_customer: int
    police_report_available: str
    witnesses: int
    bodily_injuries: int
    policy_annual_premium: float

class FraudPredictResponse(BaseModel):
    fraud_prediction: str
    probability: float

class PremiumFeatureInput(BaseModel):
    Age: float
    Annual_Income: float  # Snake case allows easy parsing in FastAPI despite column names in CSV having space
    Vehicle_Age: int
    Credit_Score: float
    Previous_Claims: float
    Health_Score: float
    Smoking_Status: str

class PremiumPredictResponse(BaseModel):
    predicted_premium: float
