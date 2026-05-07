# Credit Scoring and Loan Approval System

This is a complete, production-ready Credit Scoring and Loan Approval System. It includes an ML pipeline, a FastAPI backend, and a modern React + Tailwind CSS frontend.

## Project Structure

- `backend/`: FastAPI REST API and ML pipeline.
- `frontend/`: React + Vite + Tailwind frontend (User Panel & Admin Panel).
- `archive/`: Contains the original `cs-training.csv` and `cs-test.csv`.

## ⚙️ Backend Setup

The backend handles model training and predictions using Python, Scikit-learn, XGBoost, and FastAPI.

### 1. Install Dependencies
Open a command prompt (or PowerShell) and navigate to the `backend` folder:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Train the Model
Before running the API, train the model to generate `saved_model.pkl`:
```bash
python model/train.py
```
*This process will read `cs-training.csv`, preprocess the data, handle class imbalance using SMOTE, and evaluate Logistic Regression, Random Forest, and XGBoost. It will save the XGBoost model as the final pipeline.*

### 3. Run the API Hub
Start the FastAPI server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- API will run at `http://localhost:8000`
- Swagger UI available at `http://localhost:8000/docs`

---

## 🎨 Frontend Setup

The frontend provides two interfaces: a User Panel for applications, and an Admin Panel.

### 1. Install Dependencies
Open a command prompt (make sure you bypass execution policies if using PowerShell) and navigate to the `frontend` folder:
```bash
cd frontend
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Interfaces:
- **User Panel (`/`)**: Input financial details via form. Visual feedback includes a real-time risk gauge, probability of default (%), and an automated decision (APPROVE / REVIEW / REJECT).
- **Admin Panel (`/admin`)**: Login with `admin` / `admin123`. View dashboard statistics, total applications, approval rates, a risk distribution chart, and retrain the model in the background.

## Database
SQLite is used to store predictions natively inside `backend/credit_scoring.db`. It automatically tracks input metrics, raw probability, credit score mappings, and final decisions.

## ML Architecture Decisions
- **Missing Data**: Handled via Median Imputation.
- **Outliers**: Features clipped at the 99th percentile to improve tree-based model convergence and remove extreme outliers.
- **Data Scaling**: StandardScaler wraps numeric inputs.
- **Imbalance**: Integrated `imblearn.over_sampling.SMOTE` inside the preprocessing pipeline to accurately predict defaults (minority class).
- **Best Model Output**: Saved as `saved_model.pkl`. XGBoost is selected as the preferred final model, evaluated via ROC-AUC.
