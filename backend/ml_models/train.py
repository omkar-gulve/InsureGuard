import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, mean_absolute_error, r2_score
import os
import json

def load_and_train_fraud():
    print("Loading Fraud Dataset...")
    df = pd.read_excel('d:/PBL/datasets/Fraud_dataset.xlsx')
    
    # Select only the high-weight/necessary columns for Fraud
    selected_features = [
        'incident_severity', 
        'total_claim_amount', 
        'months_as_customer', 
        'police_report_available', 
        'witnesses', 
        'bodily_injuries', 
        'policy_annual_premium'
    ]
    target = 'fraud_reported'
    
    # Filter dataset
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
        
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # --- Model 1: SVM ---
    svm_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', SVC(kernel='rbf', probability=True, class_weight='balanced', random_state=42))
    ])
    print("Training SVM Classifier...")
    svm_pipeline.fit(X_train, y_train)
    svm_pred = svm_pipeline.predict(X_test)
    svm_metrics = {
        'accuracy':  accuracy_score(y_test, svm_pred),
        'precision': precision_score(y_test, svm_pred, zero_division=0),
        'recall':    recall_score(y_test, svm_pred, zero_division=0),
        'f1':        f1_score(y_test, svm_pred, zero_division=0)
    }

    # --- Model 2: Naive Bayes ---
    # GaussianNB does not accept sparse matrices, so we need a dense version
    from sklearn.preprocessing import FunctionTransformer
    import numpy as np
    nb_preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_transformer, num_cols),
            ('cat', cat_transformer, cat_cols)
        ])
    nb_pipeline = Pipeline(steps=[
        ('preprocessor', nb_preprocessor),
        ('to_dense', FunctionTransformer(lambda x: x.toarray() if hasattr(x, 'toarray') else x)),
        ('classifier', GaussianNB())
    ])
    print("Training Naive Bayes Classifier...")
    nb_pipeline.fit(X_train, y_train)
    nb_pred = nb_pipeline.predict(X_test)
    nb_metrics = {
        'accuracy':  accuracy_score(y_test, nb_pred),
        'precision': precision_score(y_test, nb_pred, zero_division=0),
        'recall':    recall_score(y_test, nb_pred, zero_division=0),
        'f1':        f1_score(y_test, nb_pred, zero_division=0)
    }

    # --- Comparison ---
    print("\n" + "="*50)
    print(f"{'Metric':<12} {'SVM':>10} {'Naive Bayes':>12}")
    print("-"*50)
    for metric in ['accuracy', 'precision', 'recall', 'f1']:
        print(f"{metric.capitalize():<12} {svm_metrics[metric]:>10.4f} {nb_metrics[metric]:>12.4f}")
    print("="*50)

    # --- Save the better model (by F1 score) ---
    if svm_metrics['f1'] >= nb_metrics['f1']:
        best_model = svm_pipeline
        winner = "SVM"
    else:
        best_model = nb_pipeline
        winner = "Naive Bayes"

    print(f"\nWinner: {winner} (F1={max(svm_metrics['f1'], nb_metrics['f1']):.4f})")
    joblib.dump(best_model, 'd:/PBL/backend/ml_models/fraud_model.pkl')
    print("Saved fraud_model.pkl\n")
    return {'num': num_cols, 'cat': cat_cols, 'all': selected_features}


def load_and_train_premium():
    print("Loading Premium Prediction Dataset...")
    df = pd.read_csv('d:/PBL/datasets/Insurance Premium Prediction Dataset.csv')
    
    # Select only the high-weight/necessary columns for Premium
    selected_features = [
        'Age', 
        'Annual Income', 
        'Vehicle Age', 
        'Credit Score', 
        'Previous Claims', 
        'Health Score',
        'Smoking Status'
    ]
    target = 'Premium Amount'
    
    # Filter dataset and drop missing target rows
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
    
    # Use smaller model to speed up training drastically on 40MB data
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=20, random_state=42, max_depth=10, n_jobs=-1))
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print("Training Premium Prediction Model on subset features...")
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    print(f"Premium Model R2 Score: {r2:.4f}, MAE: {mae:.2f}")
    
    joblib.dump(model, 'd:/PBL/backend/ml_models/premium_model.pkl')
    print("Saved premium_model.pkl\n")
    return {'num': num_cols, 'cat': cat_cols, 'all': selected_features}

if __name__ == "__main__":
    os.makedirs('d:/PBL/backend/ml_models', exist_ok=True)
    fraud_features = load_and_train_fraud()
    print("Done. Premium model was NOT retrained.")
