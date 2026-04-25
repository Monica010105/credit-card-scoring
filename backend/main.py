import os
import json
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
import tempfile

from database import models
from database.database import engine, get_db
from schemas import schemas
from model.predict import make_prediction, get_model
import joblib
from email_utils import send_registration_email, send_prediction_result_email

app = FastAPI(title="Credit Scoring API", version="1.0")

@app.get("/")
def root():
    return {"message": "Credit Scoring API is running!", "docs": "/docs", "redoc": "/redoc"}

# Create database tables
models.Base.metadata.create_all(bind=engine)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict", response_model=schemas.PredictResponse)
def predict(request: schemas.PredictRequest, db: Session = Depends(get_db)):
    data = request.model_dump()
    # Map the underscores from request to the dataset format expected by model
    mapped_data = {
        "RevolvingUtilizationOfUnsecuredLines": data["RevolvingUtilizationOfUnsecuredLines"],
        "age": data["age"],
        "NumberOfTime30-59DaysPastDueNotWorse": data["NumberOfTime30_59DaysPastDueNotWorse"],
        "DebtRatio": data["DebtRatio"],
        "MonthlyIncome": data["MonthlyIncome"],
        "NumberOfOpenCreditLinesAndLoans": data["NumberOfOpenCreditLinesAndLoans"],
        "NumberOfTimes90DaysLate": data["NumberOfTimes90DaysLate"],
        "NumberRealEstateLoansOrLines": data["NumberRealEstateLoansOrLines"],
        "NumberOfTime60-89DaysPastDueNotWorse": data["NumberOfTime60_89DaysPastDueNotWorse"],
        "NumberOfDependents": data["NumberOfDependents"]
    }
    
    try:
        prediction_result = make_prediction(mapped_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    prob = prediction_result["probability"]
    score = prediction_result["credit_score"]
    decision = prediction_result["decision"]
    
    # Save to db
    db_record = models.PredictionRecord(
        name=data.get("name", "Unknown"),
        age=data["age"],
        MonthlyIncome=data["MonthlyIncome"],
        DebtRatio=data["DebtRatio"],
        RevolvingUtilizationOfUnsecuredLines=data["RevolvingUtilizationOfUnsecuredLines"],
        NumberOfTime30_59DaysPastDueNotWorse=data["NumberOfTime30_59DaysPastDueNotWorse"],
        NumberOfOpenCreditLinesAndLoans=data["NumberOfOpenCreditLinesAndLoans"],
        NumberOfTimes90DaysLate=data["NumberOfTimes90DaysLate"],
        NumberRealEstateLoansOrLines=data["NumberRealEstateLoansOrLines"],
        NumberOfTime60_89DaysPastDueNotWorse=data["NumberOfTime60_89DaysPastDueNotWorse"],
        NumberOfDependents=data["NumberOfDependents"],
        probability=prob,
        credit_score=score,
        decision=decision
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    
    # Send prediction result email
    if hasattr(request, 'email') and request.email:
        try:
            send_prediction_result_email(request.email, data.get("name", "Unknown"), score, decision)
        except Exception as e:
            print(f"Error sending email: {e}")
    
    return schemas.PredictResponse(
        probability=prob,
        credit_score=score,
        decision=decision
    )

@app.post("/train")
def train():
    return {"message": "Training is disabled in production."}

@app.get("/metrics")
def get_metrics():
    metrics_path = os.path.join(os.path.dirname(__file__), "model", "metrics.json")
    if os.path.exists(metrics_path):
        with open(metrics_path, "r") as f:
            return json.load(f)
    return {"message": "Metrics not found. Train the model first."}

@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)):
    records = db.query(models.PredictionRecord).order_by(models.PredictionRecord.timestamp.desc()).all()
    return records

@app.post("/admin/login")
def admin_login(login: schemas.AdminLogin):
    # Dummy authentication logic
    if login.username == "admin" and login.password == "admin123":
        return {"access_token": "mock_jwt_token", "token_type": "bearer"}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password"
    )

import hashlib

def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

@app.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(name=user.name, email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    try:
        send_registration_email(user.email, user.name)
    except Exception as e:
        print(f"Error sending registration email: {e}")
    
    return {"access_token": "user_mock_jwt_token", "token_type": "bearer"}

@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    hashed_password = get_password_hash(user.password)
    if db_user.hashed_password != hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    return {"access_token": "user_mock_jwt_token", "token_type": "bearer"}

@app.post("/reset-password")
def reset_password(data: schemas.PasswordReset, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == data.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    hashed_password = get_password_hash(data.new_password)
    db_user.hashed_password = hashed_password
    db.commit()
    
    return {"message": "Password updated successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=10000, reload=False)
