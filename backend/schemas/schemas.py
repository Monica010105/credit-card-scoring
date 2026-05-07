from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PredictRequest(BaseModel):
    # Mapping exact required columns for simplicity. We match the model features.
    name: str = "Unknown"
    email: Optional[str] = None
    RevolvingUtilizationOfUnsecuredLines: float = 0.0
    age: int = 30
    NumberOfTime30_59DaysPastDueNotWorse: int = 0
    DebtRatio: float = 0.0
    MonthlyIncome: float = 0.0
    NumberOfOpenCreditLinesAndLoans: int = 0
    NumberOfTimes90DaysLate: int = 0
    NumberRealEstateLoansOrLines: int = 0
    NumberOfTime60_89DaysPastDueNotWorse: int = 0
    NumberOfDependents: int = 0

class PredictResponse(BaseModel):
    probability: float
    credit_score: float
    decision: str

class RecordResponse(PredictRequest):
    id: int
    timestamp: datetime
    probability: float
    credit_score: float
    decision: str

    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class PasswordReset(BaseModel):
    email: str
    new_password: str
