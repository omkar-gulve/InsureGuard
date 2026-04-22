from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
import datetime
from database import Base

class RoleEnum(str, enum.Enum):
    admin = "admin"
    agent = "agent"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.agent, nullable=False)
    
    full_name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    
    claims = relationship("Claim", back_populates="agent", cascade="all, delete-orphan")

class Claim(Base):
    __tablename__ = "claims"
    id = Column(Integer, primary_key=True, index=True)
    policy_number = Column(String, index=True, nullable=False)
    claim_amount = Column(Float, nullable=False)
    status = Column(String, default="Pending") # Pending, Approved, Rejected
    fraud_probability = Column(Float, nullable=True) # ML model output
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    agent_id = Column(Integer, ForeignKey("users.id"))
    agent = relationship("User", back_populates="claims")
