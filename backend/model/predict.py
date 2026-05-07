import pandas as pd
import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "saved_model.pkl")

# Load model globally to avoid loading on every request
model = None

def get_model():
    global model
    if model is None:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
        else:
            raise Exception("Model not found. Please train the model first.")
    return model

def make_prediction(data):
    """
    Args:
        data (dict): The input financial details
    Returns:
        dict: Probability, credit score, and decision
    """
    model = get_model()
    
    # Ensure all original columns are expected (drop unneeded, align structure)
    # The training dataset has specific column names:
    # RevolvingUtilizationOfUnsecuredLines
    # age
    # NumberOfTime30-59DaysPastDueNotWorse
    # DebtRatio
    # MonthlyIncome
    # NumberOfOpenCreditLinesAndLoans
    # NumberOfTimes90DaysLate
    # NumberRealEstateLoansOrLines
    # NumberOfTime60-89DaysPastDueNotWorse
    # NumberOfDependents

    input_df = pd.DataFrame([{
        "RevolvingUtilizationOfUnsecuredLines": data.get("RevolvingUtilizationOfUnsecuredLines", 0),
        "age": data.get("age", 30),
        "NumberOfTime30-59DaysPastDueNotWorse": data.get("NumberOfTime30-59DaysPastDueNotWorse", 0),
        "DebtRatio": data.get("DebtRatio", 0),
        "MonthlyIncome": data.get("MonthlyIncome", 0),
        "NumberOfOpenCreditLinesAndLoans": data.get("NumberOfOpenCreditLinesAndLoans", 0),
        "NumberOfTimes90DaysLate": data.get("NumberOfTimes90DaysLate", 0),
        "NumberRealEstateLoansOrLines": data.get("NumberRealEstateLoansOrLines", 0),
        "NumberOfTime60-89DaysPastDueNotWorse": data.get("NumberOfTime60-89DaysPastDueNotWorse", 0),
        "NumberOfDependents": data.get("NumberOfDependents", 0)
    }])
    
    prob_default = float(model.predict_proba(input_df)[:, 1][0])
    
    credit_score = round((1 - prob_default) * 100, 2)
    
    if prob_default < 0.2:
        decision = "APPROVE"
    elif prob_default < 0.5:
        decision = "REVIEW"
    else:
        decision = "REJECT"
        
    return {
        "probability": float(prob_default),
        "credit_score": credit_score,
        "decision": decision
    }
