import dask.dataframe as dd
from dask.diagnostics import ProgressBar
import os
import argparse
from tqdm import tqdm   

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample", action="store_true", help="Export the sample partition")
    return parser.parse_args()

def main():
    args = parse_args()
    
    curr_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(curr_dir)))
    
    input_dir = os.path.join(project_root, "data", "processed", "04_final")
    print("Reading final parquet...")
    dataset = dd.read_parquet(input_dir)
    output_path = os.path.join(input_dir, "final_dataset_sampled.csv" if args.sample else "final_dataset_full.csv")
    
    if args.sample:
        print("Computing sample dataset...")
        with ProgressBar():
            local_df = dataset.compute()
        print(f"Writing {len(local_df):,} rows to CSV...")
        local_df.to_csv(output_path, index=False)
    else:
        sort_cols = ['collection_date', 'region_code', 'rank', 'view_count']
        print("Computing full dataset...")
        with ProgressBar():
            df = dataset.compute()
        print(f"Sorting {len(df):,} rows...")
        df = df.sort_values(by=[c for c in sort_cols if c in df.columns])
        chunk_size = 500_000
        total_chunks = (len(df) // chunk_size) + 1
        print(f"Writing {len(df):,} rows to CSV in {total_chunks} chunks...")
        for i, start in enumerate(tqdm(range(0, len(df), chunk_size), total=total_chunks, desc="Writing CSV chunks")):
            df.iloc[start:start + chunk_size].to_csv(output_path, mode='a', index=False, header=(i == 0))

    print(f"Created CSV at {output_path}")

if __name__ == "__main__":
    main()