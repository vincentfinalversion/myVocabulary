import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = BASE_DIR / "data" / "raw" / "main.csv"
OUTPUT_DIR = BASE_DIR / "data" / "processed"

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(INPUT_FILE)

    df = df.dropna(subset=["word"])

    df["word"] = df["word"].str.strip()

    df = df[df["word"] != ""]

    df["character_count"] = df["word"].str.len()

    df["starting_letter"] = df["word"].str[0].str.lower()
    df = df[df["starting_letter"].str.match(r"^[a-z]$")]

    # partition dataset by starting letter
    for letter, group in df.groupby("starting_letter"):
        output_file = OUTPUT_DIR / f"starts_with_{letter}.csv"

        # remove the temporary starting_letter column
        group = group.drop(columns=["starting_letter"])

        # write the processed group to CSV
        group.to_csv(output_file, index=False)

        print(f"Created {output_file} ({len(group)} words)")

    print("\nDataset partitioning complete.")

if __name__ == "__main__":
    main()
