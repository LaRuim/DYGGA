import dask.dataframe as dd
import pandas as pd
import argparse
import os
import shutil

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample", action="store_true", help="Execute on the sampled dataset")
    return parser.parse_args()

def main():
    args = parse_args()
    curr_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(curr_dir)))
    
    input_dir = os.path.join(project_root, "data", "processed", "02_cleaned")
    output_dir = os.path.join(project_root, "data", "processed", "03_features")
    os.makedirs(output_dir, exist_ok=True)

    # Remove stale output from previous runs to avoid mixed-schema reads
    for item in os.listdir(output_dir):
        item_path = os.path.join(output_dir, item)
        if item.endswith(".parquet"):
            print(f"Removing stale output: {item_path}")
            shutil.rmtree(item_path) if os.path.isdir(item_path) else os.remove(item_path)
    
    dataset = dd.read_parquet(input_dir)
    print('Loaded data from cleaned parquet at ', input_dir)
    
    if 'category_id' in dataset.columns:
        dataset['category_id'] = dataset['category_id'].astype('float64')
    
    # Force PyArrow strings on join keys to prevent Pandas from mangling categorical types during grouping
    # We also cast default_language because PyArrow dictionary bounds exceed int8 (-128 to 127) limits
    for col in ['video_id', 'region_code', 'default_language']:
        if col in dataset.columns:
            dataset[col] = dataset[col].astype('string')
            
    print("Calculating duration metrics per video")
    lifecycle_bounds = dataset.groupby(['video_id', 'region_code']).agg(
        first_seen=('collection_date', 'min'),
        last_seen=('collection_date', 'max'),
        published_at_min=('published_at', 'min')
    ).reset_index().compute()
    
    lifecycle_bounds['time_to_trend'] = (lifecycle_bounds['first_seen'] - lifecycle_bounds['published_at_min']).dt.total_seconds() / 3600.0
    lifecycle_bounds['trending_duration'] = (lifecycle_bounds['last_seen'] - lifecycle_bounds['first_seen']).dt.total_seconds() / 3600.0
    
    durations_df = lifecycle_bounds[['video_id', 'region_code', 'time_to_trend', 'trending_duration', 'first_seen']]

    # helper to guarantee pandas computations output robust strings for PyArrow merges
    def enforce_str_keys(df):
        for col in ['video_id', 'region_code']:
            if col in df.columns:
                df[col] = df[col].astype('string')
        return df

    durations_df = enforce_str_keys(durations_df.copy())

    print("Extracting milestone snapshots")
    entry_dates = enforce_str_keys(dataset.groupby(['video_id', 'region_code'])['collection_date'].min().compute().reset_index())
    exit_dates = enforce_str_keys(dataset.groupby(['video_id', 'region_code'])['collection_date'].max().compute().reset_index())
    best_ranks = enforce_str_keys(dataset.groupby(['video_id', 'region_code'])['rank'].min().compute().reset_index())
    
    print("Merging snapshots (using Dask merge with Pandas right-sides)")
    entry_rows = dataset.merge(entry_dates, on=['video_id', 'region_code', 'collection_date'], how='inner')
    entry_rows['snapshot_type'] = 'entry'
    
    exit_rows = dataset.merge(exit_dates, on=['video_id', 'region_code', 'collection_date'], how='inner')
    exit_rows['snapshot_type'] = 'exit'
    
    peak_candidates = dataset.merge(best_ranks, on=['video_id', 'region_code', 'rank'], how='inner')
    peak_latest_dates = enforce_str_keys(peak_candidates.groupby(['video_id', 'region_code'])['collection_date'].max().compute().reset_index())
    peak_rows = peak_candidates.merge(peak_latest_dates, on=['video_id', 'region_code', 'collection_date'], how='inner')
    peak_rows['snapshot_type'] = 'peak'
    
    print("Concatenating and finalizing schemas")
    snapshots = dd.concat([entry_rows, peak_rows, exit_rows])
    snapshots = snapshots.drop_duplicates(subset=['video_id', 'region_code', 'collection_date', 'snapshot_type'])
    final_dataset = snapshots.merge(enforce_str_keys(durations_df), on=['video_id', 'region_code'], how='left')
    
    output_path = os.path.join(output_dir, "features_sampled.parquet" if args.sample else "features_full.parquet")
    print(f"Saving snapshots to {output_path}")
    final_dataset.to_parquet(output_path, engine="pyarrow", write_index=False)
    print("Finished Successfully!")

if __name__ == "__main__":
    main()
