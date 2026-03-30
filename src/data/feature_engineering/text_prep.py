import dask.dataframe as dd
from dask.diagnostics import ProgressBar
import pandas as pd
import os
import argparse

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample", action="store_true", help="Execute on the sampled dataset")
    return parser.parse_args()

def main():
    args = parse_args()
    
    curr_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(curr_dir)))
    
    input_dir = os.path.join(project_root, "data", "processed", "03_features")
    output_dir = os.path.join(project_root, "data", "processed", "04_final")
    os.makedirs(output_dir, exist_ok=True)
    
    print("Reading features parquet...")
    dataset = dd.read_parquet(input_dir)
    
    print("Concatenating title and tag columns...")
    safeguarded_titles = dataset['title'].fillna('')
    safeguarded_tags = dataset['tag'].fillna('')
    dataset['text_for_nlp'] = safeguarded_titles + " " + safeguarded_tags
    
    print("Applying regex to clean text...")
    dataset['text_for_nlp'] = dataset['text_for_nlp'].str.replace(r'http\S+|www.\S+', '', regex=True)
    dataset['text_for_nlp'] = dataset['text_for_nlp'].str.replace(r'\s+', ' ', regex=True).str.strip()
    dataset['text_for_nlp'] = dataset['text_for_nlp'].str.lower()
    
    output_path = os.path.join(output_dir, "final_dataset_sampled.parquet" if args.sample else "final_dataset_full.parquet")
    
    print(f"Writing final parquet to {output_path}")
    with ProgressBar():
        dataset.to_parquet(output_path, engine="pyarrow", write_index=False)
    print("Text prep completed!")

if __name__ == "__main__":
    main()