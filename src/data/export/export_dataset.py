import dask.dataframe as dd
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
    dataset = dd.read_parquet(input_dir)
    print("Reading parquet")
    output_path = os.path.join(input_dir, "final_dataset_sampled.csv" if args.sample else "final_dataset_full.csv")
    
    if args.sample:
        local_df = dataset.compute()
        local_df.to_csv(output_path, index=False)
    else:
        sort_cols = ['collection_date', 'region_code', 'rank', 'view_count']
        df = dataset.compute()
        df = df.sort_values(by=[c for c in sort_cols if c in df.columns])
        chunk_size = 500_000
        for i, start in enumerate(tqdm(range(0, len(df), chunk_size))):
            df.iloc[start:start + chunk_size].to_csv(output_path, mode='a', index=False, header=(i == 0))

    print("Created CSV")

if __name__ == "__main__":
    main()
