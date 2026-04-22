import datetime
import random
from sqlalchemy.orm import Session
from database import engine, SessionLocal
import models

def seed_data(db: Session = None):
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True
    
    try:
        # Get users
        users = db.query(models.User).all()
        if not users:
            print("No users found. Please register a user first.")
            return False
        
        user_ids = [u.id for u in users]
        
        # Sample policy numbers
        policies = [f"POL-{random.randint(100000, 999999)}" for _ in range(20)]
        
        colors = ["Pending", "Approved", "Rejected"]
        
        # Generate claims for earlier months
        # 2026-01 to 2026-04
        for month in range(1, 4): # Jan to March
            for _ in range(5): # 5 claims per month
                day = random.randint(1, 28)
                created_at = datetime.datetime(2026, month, day, random.randint(9, 17), random.randint(0, 59))
                
                claim = models.Claim(
                    policy_number=random.choice(policies),
                    claim_amount=round(random.uniform(500, 15000), 2),
                    status=random.choice(colors),
                    fraud_probability=round(random.uniform(0.01, 0.99), 2),
                    agent_id=random.choice(user_ids),
                    created_at=created_at
                )
                db.add(claim)
        
        db.commit()
        print("Successfully added 15 claims for earlier months (Jan-Mar 2026).")
        return True
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
        return False
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_data()
