import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = BASE_DIR / "data" / "raw" / "main.csv"
OUTPUT_FILE = BASE_DIR / "data" / "processed" / "preprocessed.csv"

def main():
    df = pd.read_csv(INPUT_FILE)

    df["character_count"] = df["word"].str.len().astype("Int64")

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    df.to_csv(OUTPUT_FILE, index=False)

    print(f"Processed {len(df)} words.")
    print(f"Output: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()