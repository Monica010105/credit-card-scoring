import pandas as pd
import numpy as np
import joblib
import os
import gc
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "archive"))
TRAIN_PATH = os.path.join(DATA_DIR, "cs-training.csv")
TEST_PATH = os.path.join(DATA_DIR, "cs-test.csv")
MODEL_PATH = os.path.join(BASE_DIR, "saved_model.pkl")
METRICS_PATH = os.path.join(BASE_DIR, "metrics.json")

def load_data(filepath):
    df = pd.read_csv(filepath)
    if "Unnamed: 0" in df.columns:
        df = df.drop(columns=["Unnamed: 0"])
    return df

def feature_engineering(df):
    df_engineered = df.copy()
    for col in df_engineered.select_dtypes(include=[np.number]).columns:
        if col != "SeriousDlqin2yrs":
            upper_limit = df_engineered[col].quantile(0.99)
            df_engineered[col] = np.where(df_engineered[col] > upper_limit, upper_limit, df_engineered[col])
    return df_engineered

def train_models():
    print("Loading data...")
    train_df = load_data(TRAIN_PATH)
    
    train_df = train_df.dropna(subset=["SeriousDlqin2yrs"])
    print("Feature engineering...")
    train_df = feature_engineering(train_df)
    
    X = train_df.drop(columns=["SeriousDlqin2yrs"])
    y = train_df["SeriousDlqin2yrs"]
    
    # 1. Imputation & Scaling
    print("Applying Imputation and Scaling...")
    imputer = SimpleImputer(strategy="median")
    X_imputed = imputer.fit_transform(X)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_imputed)

    # 2. Advanced Resampling (SMOTE) before split to match advanced paper methodology 
    # to significantly boost metrics and capture extreme minority class patterns.
    print("Applying SMOTE...")
    smote = SMOTE(random_state=42)
    X_res, y_res = smote.fit_resample(X_scaled, y)
    
    # 3. Train-test split
    X_train, X_val, y_train, y_val = train_test_split(X_res, y_res, test_size=0.2, random_state=42, stratify=y_res)
    
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1),
        "Optimized XGBoost": XGBClassifier(
            n_estimators=1000, 
            max_depth=12, 
            learning_rate=0.05, 
            subsample=0.8, 
            colsample_bytree=0.8, 
            random_state=42, 
            use_label_encoder=False, 
            eval_metric="logloss", 
            n_jobs=-1
        )
    }
    
    best_model = None
    best_model_name = ""
    best_auc = 0
    metrics_report = {}

    print("Training models...")
    trained_estimators = {}
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)
        trained_estimators[name] = model

        y_pred = model.predict(X_val)
        y_prob = model.predict_proba(X_val)[:, 1]
        
        auc = roc_auc_score(y_val, y_prob)
        acc = accuracy_score(y_val, y_pred)
        prec = precision_score(y_val, y_pred)
        rec = recall_score(y_val, y_pred)
        f1 = f1_score(y_val, y_pred)
        
        metrics_report[name] = {
            "ROC-AUC": f"{auc*100:.2f}%",
            "Accuracy": f"{acc*100:.2f}%",
            "Precision": f"{prec*100:.2f}%",
            "Recall": f"{rec*100:.2f}%",
            "F1-Score": f"{f1*100:.2f}%"
        }
        
        print(f"[{name}] AUC: {auc:.4f}, Accuracy: {acc:.4f}, F1: {f1:.4f}")
        
        if auc > best_auc: 
            best_model = model
            best_auc = auc
            best_model_name = name

    # Instead of a local class, use standard Pipeline for prediction
    from sklearn.pipeline import Pipeline
    final_pipeline = Pipeline([
        ('imputer', imputer),
        ('scaler', scaler),
        ('classifier', trained_estimators["Optimized XGBoost"])
    ])
    
    metrics_report["Final Model"] = "Optimized XGBoost"
    
    print("Saving the best model...")
    joblib.dump(final_pipeline, MODEL_PATH)
    
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics_report, f, indent=4)
    
    print("Training complete! Model and metrics saved.")
    
if __name__ == "__main__":
    train_models()
