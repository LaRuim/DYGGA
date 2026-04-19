"""
join_subscriber_stats.py
------------------------
Joins the exported final CSV with subscriber_counts.csv on channel_id,
enriching each row with channel_name, subscriber_count, channel_video_count,
and channel_view_count.

Usage:
    python join_subscriber_stats.py [--sample]
"""

import pandas as pd
import os
import argparse
from tqdm import tqdm


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample", action="store_true", help="Join the sample CSV instead of the full one")
    return parser.parse_args()


def main():
    args = parse_args()

    curr_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(curr_dir)))

    final_dir = os.path.join(project_root, "data", "processed", "04_final")
    raw_dir = os.path.join(project_root, "data", "raw")

    csv_name = "final_dataset_sampled.csv" if args.sample else "final_dataset_full.csv"
    final_csv = os.path.join(final_dir, csv_name)

    subscriber_csv = os.path.join(raw_dir, "subscriber_counts.csv")
    output_csv = os.path.join(final_dir, csv_name.replace(".csv", "_with_channel_stats.csv"))

    print(f"Loading subscriber stats from {subscriber_csv} ...")
    subs = pd.read_csv(subscriber_csv, dtype={
        "channel_id": "str",
        "channel_name": "str",
        "subscriber_count": "float64",
        "channel_video_count": "float64",
        "channel_view_count": "float64",
    })
    print(f"  {len(subs):,} channels loaded.")

    print(f"Joining {csv_name} with subscriber stats in chunks ...")
    
    # Fast iteration over the file to determine the exact number of rows for ETA calculation
    print("Calculating exact total rows for precise ETA...")
    with open(final_csv, 'rb') as f:
        total_rows = sum(1 for _ in f) - 1
        
    chunk_size = 500_000
    total_chunks = (total_rows // chunk_size) + (1 if total_rows % chunk_size > 0 else 0)
    
    first_chunk = True

    for i, chunk in enumerate(tqdm(pd.read_csv(final_csv, chunksize=chunk_size, dtype={"channel_id": "str"}), total=total_chunks)):
        merged = chunk.merge(subs, on="channel_id", how="left")
        merged.to_csv(output_csv, mode="a", index=False, header=first_chunk)
        first_chunk = False

    print(f"Done! Enriched dataset written to:\n  {output_csv}")


if __name__ == "__main__":
    main()
