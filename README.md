# InsureGuard — Secure Insurance Fraud Detection & Premium Prediction 🛡️

InsureGuard is a full-stack, AI-powered platform designed for insurance agents to detect fraudulent claims and estimate monthly premiums using high-performance Machine Learning models.

## 🚀 Key Features
- **Fraud Detection Engine**: Analyzes claim severity, amounts, and witness data to predict fraud probability.
- **Premium Estimator**: Calculates risk-adjusted monthly premiums based on applicant profiles.
- **Dynamic Dashboard**: Real-time visualization of claims, fraud rates, and historical analytics using Recharts.
- **Secure Authentication**: JWT-based login system with role-based access control (Admin, Agent).
- **Audit Logging**: Automatic recording of all predictions into a centralized SQLite database.
- **Premium Dark UI**: Immersive, cyberpunk-inspired high-end interface built with React & Tailwind CSS.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: FastAPI (Python 3.10+), SQLAlchemy, Pydantic
- **Database**: SQLite (SQLAlchemy ORM)
- **Machine Learning**: Scikit-learn (Random Forest Classifier & Regressor), Joblib
- **Authentication**: JWT (python-jose), Passlib (Bcrypt)

---

## 📦 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### 1. Setup Backend
```bash
cd backend
# Create virtual environment
python -m venv venv
# Activate virtual environment (Windows)
.\venv\Scripts\activate
# Activate virtual environment (Unix/macOS)
source venv/bin/activate
# Install dependencies
pip install -r requirements.txt
# Train ML Models (Required once)
python ml_models/train.py
# Start Server
uvicorn main:app --reload
```
The API will be live at `http://localhost:8000`.

### 2. Setup Frontend
```bash
cd frontend
# Install dependencies
npm install
# Start Dev Server
npm run dev
```
The application will be live at `http://localhost:5173`.

---

## 🧪 Testing the Application
1. **Register**: Create a new account at `/register`.
2. **Login**: Use your credentials at `/login`.
3. **Analyze**:
   - Go to **Fraud Detection** to test the classification model.
   - Go to **Premium Estimator** to test the regression model.
4. **Monitor**: Check the **Dashboard** to see your results recorded in the live claims table and charts.

---

## 🐳 Docker Deployment
You can also run the backend using Docker:
```bash
cd backend
docker build -t insureguard-backend .
docker run -p 8000:8000 insureguard-backend
```

---

## 📈 ML Model Details
The models are trained using `RandomForest` algorithms on the provided insurance datasets:
- **Fraud Model**: Trained on `incident_severity`, `total_claim_amount`, etc.
- **Premium Model**: Trained on `Age`, `Annual Income`, `Credit Score`, etc.
Feature selection was applied to use high-weight parameters for optimal accuracy and speed.

---

Developed by **Antigravity AI**.
