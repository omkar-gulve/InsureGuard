from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/claims", tags=["Claims"])

@router.post("/", response_model=schemas.ClaimResponse)
def create_claim(
    claim: schemas.ClaimCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_claim = models.Claim(
        policy_number=claim.policy_number,
        claim_amount=claim.claim_amount,
        status=claim.status,
        fraud_probability=claim.fraud_probability,
        agent_id=current_user.id
    )
    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)
    return new_claim

@router.get("/", response_model=List[schemas.ClaimResponse])
def get_claims(
    skip: int = 0, limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == models.RoleEnum.admin:
        claims = db.query(models.Claim).offset(skip).limit(limit).all()
    else:
        claims = db.query(models.Claim).filter(models.Claim.agent_id == current_user.id).offset(skip).limit(limit).all()
    return claims

@router.put("/{claim_id}/status", response_model=schemas.ClaimResponse)
def update_claim_status(
    claim_id: int, 
    status: str, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Only Admin or the agent who created it can update it
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
        
    if current_user.role != models.RoleEnum.admin and claim.agent_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized to update this claim")

    claim.status = status
    db.commit()
    db.refresh(claim)
    return claim

@router.delete("/")
def delete_all_claims(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == models.RoleEnum.admin:
        db.query(models.Claim).delete()
    else:
        db.query(models.Claim).filter(models.Claim.agent_id == current_user.id).delete()
    db.commit()
    return {"detail": "Claims history cleaned successfully"}
