from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime
from .database import Base

class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Inputs
    name = Column(String, default="Unknown")
    age = Column(Integer)
    MonthlyIncome = Column(Float)
    DebtRatio = Column(Float)
    RevolvingUtilizationOfUnsecuredLines = Column(Float)
    NumberOfTime30_59DaysPastDueNotWorse = Column(Integer)
    NumberOfOpenCreditLinesAndLoans = Column(Integer)
    NumberOfTimes90DaysLate = Column(Integer)
    NumberRealEstateLoansOrLines = Column(Integer)
    NumberOfTime60_89DaysPastDueNotWorse = Column(Integer)
    NumberOfDependents = Column(Integer)
    
    # Outputs
    probability = Column(Float)
    credit_score = Column(Float)
    decision = Column(String)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="User")
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
