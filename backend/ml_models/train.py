import pandas as pd
import numpy as np
import joblib
import os
import json
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, FunctionTransformer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, mean_absolute_error, r2_score

from ml_utils import to_dense_array

def load_and_train_fraud():
    print("Initializing Fraud Detection Training Pipeline...")
    df = pd.read_excel('d:/PBL/datasets/Fraud_dataset.xlsx')
    
    # Feature Selection explaining:
    # 1. incident_type: Type of incident (Multi-vehicle collision, etc.)
    # 2. incident_severity: High severity usually means more payout, but also more scrutiny.
    # 3. property_damage: Fraudulent claims often lack evidence of property damage.
    # 4. total_claim_amount: Magnitude of potential fraud.
    # 5. months_as_customer: Detects suspicious new accounts.
    # 6. police_report_available: Veracity check.
    # 7. witnesses: Scenario validation.
    # 8. bodily_injuries: Common 'payout booster' tactic.
    # 9. policy_annual_premium: Baseline risk.
    selected_features = [
        'incident_type',
        'incident_severity',
        'property_damage',
        'total_claim_amount', 
        'months_as_customer', 
        'police_report_available', 
        'witnesses', 
        'bodily_injuries', 
        'policy_annual_premium'
    ]
    target = 'fraud_reported'
    
    X = df[selected_features]
    y = df[target].apply(lambda x: 1 if str(x).strip().upper() == 'Y' else 0)
    
    num_cols = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    cat_cols = X.select_dtypes(include=['object', 'string']).columns.tolist()
    
    num_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    cat_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_transformer, num_cols),
            ('cat', cat_transformer, cat_cols)
        ])
        
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print(f"Dataset split: {len(X_train)} training samples, {len(X_test)} testing samples.")

    # --- Model 1: SVM ---
    svm_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', SVC(kernel='rbf', probability=True, class_weight='balanced', random_state=42))
    ])
    
    # --- Model 2: Naive Bayes ---
    nb_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('to_dense', FunctionTransformer(to_dense_array)),
        ('classifier', GaussianNB())
    ])

    # --- Model 3: Random Forest (Optimized for False Alarms) ---
    rf_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, class_weight='balanced_subsample', random_state=42, max_depth=8))
    ])

    models = {
        "SVM": svm_pipeline,
        "Naive Bayes": nb_pipeline,
        "Random Forest": rf_pipeline
    }

    results = {}
    
    print("\nTraining models...")
    for name, pipeline in models.items():
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)
        
        metrics = {
            'accuracy':  accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, zero_division=0),
            'recall':    recall_score(y_test, y_pred, zero_division=0),
            'f1':        f1_score(y_test, y_pred, zero_division=0)
        }
        results[name] = metrics
        print(f"[OK] {name} trained.")

    # --- Comparison ---
    print("\n" + "="*60)
    print(f"{'Algorithm':<15} {'Accuracy':>10} {'Precision':>10} {'Recall':>10} {'F1':>8}")
    print("-" * 60)
    for name, m in results.items():
        print(f"{name:<15} {m['accuracy']:>10.4f} {m['precision']:>10.4f} {m['recall']:>10.4f} {m['f1']:>8.4f}")
    print("="*60)

    # --- Model Selection (Optimized for LOW FALSE ALARMS) ---
    # We prioritize Precision to ensure that when we say 'Fraud', we are right.
    best_name = max(results, key=lambda k: results[k]['precision'])
    best_model = models[best_name]

    print(f"\nSelected Model: {best_name} (Highest Precision: {results[best_name]['precision']:.4f})")
    print("This model is optimized to MINIMIZE FALSE ALARMS.")
    
    joblib.dump(best_model, 'd:/PBL/backend/ml_models/fraud_model.pkl')
    print("Saved fraud_model.pkl\n")
    
    # Save feature info
    features_info = {'num': num_cols, 'cat': cat_cols, 'all': selected_features}
    with open('d:/PBL/backend/ml_models/features.json', 'w') as f:
        json.dump(features_info, f)
        
    return features_info


def load_and_train_premium():
    print("Training Premium Prediction Model...")
    df = pd.read_csv('d:/PBL/datasets/Insurance Premium Prediction Dataset.csv')
    
    selected_features = [
        'Age', 'Annual Income', 'Vehicle Age', 'Credit Score', 
        'Previous Claims', 'Health Score', 'Smoking Status'
    ]
    target = 'Premium Amount'
    
    df = df.dropna(subset=[target])
    X = df[selected_features]
    y = df[target]
    
    num_cols = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    cat_cols = X.select_dtypes(include=['object', 'string']).columns.tolist()
    
    num_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    cat_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_transformer, num_cols),
            ('cat', cat_transformer, cat_cols)
        ])
    
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=20, random_state=42, max_depth=10, n_jobs=-1))
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    print(f"Premium Model R2 Score: {r2_score(y_test, y_pred):.4f}")
    
    joblib.dump(model, 'd:/PBL/backend/ml_models/premium_model.pkl')
    print("Saved premium_model.pkl\n")


if __name__ == "__main__":
    try:
        os.makedirs('d:/PBL/backend/ml_models', exist_ok=True)
        load_and_train_fraud()
        load_and_train_premium()
        print("All models retrained and optimized successfully.")
    except Exception as e:
        print(f"Error during training: {e}")
