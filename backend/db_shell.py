import sqlite3
import pandas as pd
import sys

def run_shell():
    try:
        conn = sqlite3.connect('claims.db')
        print("--- InsureGuard Database Shell Started ---")
        print("Ready for SQL queries. Type 'exit' to quit.")
        sys.stdout.flush()
        
        while True:
            # Using sys.stdin.readline for better compatibility with automation
            line = sys.stdin.readline()
            if not line:
                break
                
            query = line.strip()
            if query.lower() in ['exit', 'quit', 'q']:
                break
            if not query:
                continue
                
            try:
                if query.lower().startswith('select') or query.lower().startswith('pragma'):
                    df = pd.read_sql_query(query, conn)
                    if df.empty:
                        print("Empty result set.")
                    else:
                        print(df.to_string(index=False))
                else:
                    cursor = conn.cursor()
                    cursor.execute(query)
                    conn.commit()
                    print(f"DONE. Rows affected: {cursor.rowcount}")
            except Exception as e:
                print(f"Error: {e}")
            
            sys.stdout.flush()
            
        conn.close()
    except Exception as e:
        print(f"Critical Error: {e}")
        sys.stdout.flush()

if __name__ == "__main__":
    run_shell()
