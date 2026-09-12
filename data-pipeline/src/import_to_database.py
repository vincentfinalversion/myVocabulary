import pandas as pd
import os
from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.types import Integer, Text

root_dir = Path(__file__).resolve().parents[1]
env_path = root_dir / ".env"

load_dotenv(dotenv_path=env_path)

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = BASE_DIR / "data" / "processed" / "preprocessed.csv"

db_url = os.getenv("DATABASE_URL")

def main():
    df = pd.read_csv(INPUT_FILE)

    df["character_count"] = df["character_count"].astype(int)


    df.insert(0, "id", range(1, len(df) + 1))

    engine = create_engine(db_url)

    df.to_sql(
        "words",
        engine,
        if_exists="replace",
        index=False,
        dtype={
            "id": Integer,
            "word": Text,
            "definition": Text,
            "character_count": Integer,
        },
    )

    # to_sql doesn't create constraints or indexes — add them back
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE words ADD PRIMARY KEY (id);"))
        conn.execute(text(
            "CREATE INDEX idx_words_character_count ON words (character_count);"
        ))
        conn.execute(text(
            "CREATE INDEX idx_words_first_letter_character_count "
            "ON words (LOWER(LEFT(word, 1)), character_count);"
        ))

    print(f"Imported {len(df)} words into the database.")

if __name__ == "__main__":
    main()