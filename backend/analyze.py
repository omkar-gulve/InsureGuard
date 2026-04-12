import pandas as pd

def extract_details():
    try:
        df_fraud = pd.read_excel('d:/PBL/datasets/Fraud_dataset.xlsx')
        print("--- Fraud Dataset Columns ---")
        for col in df_fraud.columns:
            print(f"{col}: {df_fraud[col].dtype}")
        print("Target variable candidate for fraud:", [c for c in df_fraud.columns if 'fraud' in c.lower() or 'status' in c.lower()])
    except Exception as e:
        print("Error", e)
        
    try:
        df_premium = pd.read_csv('d:/PBL/datasets/Insurance Premium Prediction Dataset.csv')
        print("\n--- Premium Dataset Columns ---")
        for col in df_premium.columns:
            print(f"{col}: {df_premium[col].dtype}")
        print("Target variable candidate for premium:", [c for c in df_premium.columns if 'premium' in c.lower() or 'amount' in c.lower()])
    except Exception as e:
        print("Error", e)

if __name__ == "__main__":
    extract_details()
