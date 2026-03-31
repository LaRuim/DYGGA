import dask.dataframe as dd
import pandas as pd
import argparse
import os
import shutil
import glob
from tqdm import tqdm

def count_lines(filepath):
    with open(filepath, 'rb') as f:
        return sum(buf.count(b'\n') for buf in iter(lambda: f.read(1024*1024), b''))

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample", action="store_true", help="Execute on a 100,000 row sample")
    return parser.parse_args()

def run_ingestion(args, project_root):
    dataset_dir = os.path.join(project_root, "data", "raw")
    output_dir = os.path.join(project_root, "data", "processed", "01_ingested")
    os.makedirs(output_dir, exist_ok=True)

    # Remove stale part files from previous runs to avoid mixed-schema reads
    stale = glob.glob(os.path.join(output_dir, "parquet/part_*.parquet"))
    if stale:
        print(f"Removing {len(stale)} stale parquet file(s) from {output_dir}")
        for f in stale:
            print(f"Removing {f}")
            os.remove(f)
    
    popular_csv = os.path.join(dataset_dir, "most_popular.csv")
    tags_csv = os.path.join(dataset_dir, "tag.csv")
    tags_cache = os.path.join(output_dir, "tags_grouped.parquet")
    
    tags_grouped_list = None
    if os.path.exists(tags_cache) and not args.sample:
        print(f"Loading cached tags from {tags_cache}")
        tags_grouped_list = pd.read_parquet(tags_cache, engine="pyarrow")
        print("Done.")
    elif os.path.exists(tags_csv):
        print(f"Aggregating tags from {tags_csv}")
        tags_chunks = []
        
        total_rows = count_lines(tags_csv) - 1
        total_chunks = (total_rows // 1000000) + 1
        if args.sample:
            total_chunks = 1
            
        it = enumerate(pd.read_csv(tags_csv, chunksize=1000000, dtype={'region_code': 'category'}))
        for i, chunk in tqdm(it, total=total_chunks):
            chunk['tag'] = chunk['tag'].fillna('').astype(str)
            agg_chunk = chunk.groupby(['collection_date', 'region_code', 'rank'])['tag'].agg(', '.join).reset_index()
            tags_chunks.append(agg_chunk)
            if args.sample:
                break
        
        print("Ingested; aggregating now")

        import gc
        tags_grouped_list = pd.concat(tags_chunks, ignore_index=True)
        del tags_chunks
        gc.collect()
        print("Concatened tags and data")

        # Memory optimization: only groupby the exact elements that straddled a chunk boundary
        is_dup = tags_grouped_list.duplicated(subset=['collection_date', 'region_code', 'rank'], keep=False)
        dup_tags = tags_grouped_list[is_dup].copy()
        
        # In-place drop to save memory
        tags_grouped_list.drop_duplicates(subset=['collection_date', 'region_code', 'rank'], keep=False, inplace=True)
        del is_dup
        gc.collect()
        
        if not dup_tags.empty:
            dup_tags = dup_tags.groupby(['collection_date', 'region_code', 'rank'])['tag'].agg(lambda x: ', '.join(filter(None, x))).reset_index()
            tags_grouped_list = pd.concat([tags_grouped_list, dup_tags], ignore_index=True)
            del dup_tags
            gc.collect()

        print("Aggregated data")
        

        tags_grouped_list['collection_date'] = tags_grouped_list['collection_date'].astype(str)
        tags_grouped_list['region_code'] = tags_grouped_list['region_code'].astype(str)
        tags_grouped_list['rank'] = tags_grouped_list['rank'].astype(float)
        tags_grouped_list.set_index(['collection_date', 'region_code', 'rank'], inplace=True)
        print("Tag aggregation complete.")
        
        if not args.sample:
            print(f"Caching tags to {tags_cache}")
            tags_grouped_list.to_parquet(tags_cache, engine="pyarrow")
            
    else:
        print(f"Warning: {tags_csv} not found, ignoring tags")

    print(f"Ingesting {popular_csv} via chunking")
    
    dtypes = {
        'collection_date': 'str', 'region_code': 'str', 'rank': 'float64',
        'video_id': 'str', 'title': 'str', 'description': 'str',
        'published_at': 'str', 'channel_id': 'str', 'channel_title': 'str',
        'category_id': 'float64', 'default_language': 'str',
        'default_audio_language': 'str', 'live_broadcast_content': 'str',
        'view_count': 'float64', 'comment_count': 'float64'
    }

    columns_to_keep = [
        'collection_date', 'region_code', 'rank', 'video_id', 'title', 
        'published_at', 'channel_id', 'category_id', 'view_count', 'comment_count', 'default_language'
    ]

    # 500k sized chunks because 1mil was breaking
    chunk_size = 500000 if not args.sample else 100000
    
    total_rows = count_lines(popular_csv) - 1
    total_chunks = (total_rows // chunk_size) + 1
    if args.sample:
        total_chunks = min(total_chunks, 2)
        
    chunk_iterator = pd.read_csv(popular_csv, chunksize=chunk_size, dtype=dtypes, lineterminator='\n')
    
    for i, raw_video_chunk in enumerate(tqdm(chunk_iterator, total=total_chunks)):
        
        existing_cols = [c for c in columns_to_keep if c in raw_video_chunk.columns]
        raw_video_chunk = raw_video_chunk[existing_cols]
        
        if tags_grouped_list is not None:
            raw_video_chunk = raw_video_chunk.join(tags_grouped_list, on=['collection_date', 'region_code', 'rank'], how='left')
        else:
            raw_video_chunk['tag'] = ''
            
        output_file = os.path.join(output_dir, f"parquet/part_{i:04d}.parquet")
        raw_video_chunk.to_parquet(output_file, engine="pyarrow", index=False)
        
        if args.sample and i == 1:
            break


    print(f"Ingestion pipeline completed. Output written to {output_dir}")

def run_cleaning(args, project_root):
    input_dir = os.path.join(project_root, "data", "processed", "01_ingested")
    output_dir = os.path.join(project_root, "data", "processed", "02_cleaned")
    os.makedirs(output_dir, exist_ok=True)

    # Remove stale cleaned parquet(s) from previous runs
    for item in os.listdir(output_dir):
        item_path = os.path.join(output_dir, item)
        if item.endswith(".parquet"):
            print(f"Removing stale cleaned output: {item_path}")
            if os.path.isdir(item_path):
                shutil.rmtree(item_path)
            else:
                os.remove(item_path)
    
    dataset = dd.read_parquet(os.path.join(input_dir, "parquet/part_*.parquet"))

    dataset['collection_date'] = dd.to_datetime(dataset['collection_date'], errors='coerce', utc=True)
    dataset['published_at'] = dd.to_datetime(dataset['published_at'], errors='coerce', utc=True)
    
    text_cols = ['title', 'default_language', 'tag']
    for col in text_cols:
        if col in dataset.columns:
            dataset[col] = dataset[col].fillna("Unknown")
    
    # Normalize en-* variants (en-GB, en-US, en-IN, etc.) to just 'en'
    if 'default_language' in dataset.columns:
        dataset['default_language'] = dataset['default_language'].str.replace(r'^en-.*', 'en', regex=True)
            
    # downcast categorical columns to optimize memory usage
    cat_cols = ['region_code', 'category_id', 'default_language']
    for col in cat_cols:
        if col in dataset.columns:
            dataset[col] = dataset[col].astype('category').cat.as_known()

    int_cols = ['rank', 'view_count', 'comment_count']
    for col in int_cols:
        if col in dataset.columns:
            dataset[col] = dataset[col].fillna(0).astype('Int64')

    output_path = os.path.join(output_dir, "cleaned_sampled.parquet" if args.sample else "cleaned_full.parquet")
    
    dataset.to_parquet(output_path, engine="pyarrow", write_index=False)
    print("Cleaning completed")

def main():
    args = parse_args()
    
    curr_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(curr_dir)))
    
    print("Loading Data")
    run_ingestion(args, project_root)
    
    print("\nCleaning Data")
    run_cleaning(args, project_root)

if __name__ == "__main__":
    main()
