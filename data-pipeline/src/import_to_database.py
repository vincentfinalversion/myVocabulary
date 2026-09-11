import pandas as pd
import os
from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy import create_engine

root_dir = Path(__file__).resolve().parents[1]
env_path = root_dir / ".env"

load_dotenv(dotenv_path=env_path)

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = BASE_DIR / "data" / "processed" / "preprocessed.csv"

db_url = os.getenv("DATABASE_URL")

def main():
    df = pd.read_csv(INPUT_FILE)

    engine = create_engine(db_url)

    df.to_sql(
        "words",
        engine,
        if_exists="replace",
        index=False,
    )

    print(f"Imported {len(df)} words into the database.")

if __name__ == "__main__":
    main()
