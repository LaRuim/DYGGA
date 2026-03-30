# DYGGA

Non-repo files can be found here: <https://drive.google.com/drive/folders/16-32W6aK_Q8s72FcLFNHLfO8SaQx_9Zc>

## Running the Pipeline


```bash
# 0. Install dependencies
pip install -r src/requirements.txt

# 1. Ingest raw CSVs (most_popular.csv + tag.csv) and clean
#    Reads from:  data/raw/
#    Writes to:   data/processed/01_ingested/ → data/processed/02_cleaned/
python src/data/ingestion/ingest_and_clean.py

# 2. Compute temporal features and extract entry/peak/exit snapshots
#    Reads from:  data/processed/02_cleaned/
#    Writes to:   data/processed/03_features/
python src/data/feature_engineering/temporal_features.py

# 3. Prepare concatenated text column for NLP/BERTopic
#    Reads from:  data/processed/03_features/
#    Writes to:   data/processed/04_final/
python src/data/feature_engineering/text_prep.py

# 4. Export final dataset to CSV
#    Reads from:  data/processed/04_final/
#    Writes to:   data/processed/04_final/ (as .csv)
python src/data/export/export_dataset.py
```

To run the full pipeline end-to-end on a sample:

```bash
python src/data/ingestion/ingest_and_clean.py --sample
python src/data/feature_engineering/temporal_features.py --sample
python src/data/feature_engineering/text_prep.py --sample
python src/data/export/export_dataset.py --sample
```

## Dataset

The cleaned dataset's schema is as follows:

| Column | Type | Description |
|---|---|---|
| `collection_date` | datetime (UTC) | Date the record was collected from YouTube trending |
| `region_code` | string | ISO 3166-1 alpha-2 country code |
| `rank` | Int64 | Trending rank (1 = top) |
| `video_id` | string | YouTube video ID |
| `title` | string | Original video title |
| `published_at` | datetime (UTC) | When the video was uploaded to YouTube |
| `category_id` | float64 | YouTube category ID |
| `view_count` | Int64 | View count at time of collection |
| `comment_count` | Int64 | Comment count at time of collection |
| `default_language` | string | Video's declared default language |
| `tag` | string | Comma-separated tags (aggregated from `tag.csv`) |
| `subscriber_count` | Int64 | Channel subscriber count at time of collection |
| `channel_video_count` | Int64 | Total videos on the channel at time of collection |
| `channel_view_count` | Int64 | Total channel views at time of collection |
| `hidden_subscriber_count` | string | Whether the channel hides its subscriber count |
| `channel_lookup_status` | string | Status of the channel API lookup |
| `channel_stats_fetched_at` | datetime (UTC) | When the channel stats were fetched from the API |
| `snapshot_type` | string | `entry`, `peak`, or `exit` |
| `time_to_trend` | float64 | Hours from publish to first trending appearance |
| `trending_duration` | float64 | Hours the video spent in trending |
| `first_seen` | datetime (UTC) | First date video appeared in trending |
| `text_for_nlp` | string | Cleaned, lowercased `title + tag` string for NLP/BERTopic |

For each `(video_id, region_code)` pair, the following are computed metrics:

| Field | Description |
|---|---|
| `first_seen` | Earliest `collection_date` the video appeared in trending |
| `last_seen` | Latest `collection_date` the video appeared in trending (not included in final dataset)|
| `time_to_trend` | Hours from `published_at` to `first_seen` |
| `trending_duration` | Hours from `first_seen` to `last_seen` |

Each video is represented by up to **3 snapshot rows**, not the full daily history:

| Snapshot Type | Definition |
|---|---|
| `entry` | The row where the video **first appeared** in trending for that region |
| `exit` | The row where the video **last appeared** in trending for that region |
| `peak` | The row where the video achieved its **best (lowest) rank**. If multiple days tied for best rank, the *latest* such day is used |

Duplicate snapshot rows (e.g. a video whose entry and peak occurred on the same day) are dropped, keeping one row per `(video_id, region_code, collection_date, snapshot_type)`.

Category ID Mapping:
1: "Film & Animation", 2: "Autos & Vehicles", 10: "Music", 15: "Pets & Animals",
17: "Sports", 18: "Short Movies", 19: "Travel & Events", 20: "Gaming",
21: "Videoblogging", 22: "People & Blogs", 23: "Comedy", 24: "Entertainment",
25: "News & Politics", 26: "Howto & Style", 27: "Education", 28: "Science & Technology",
29: "Nonprofits & Activism", 30: "Movies", 31: "Anime/Animation", 32: "Action/Adventure",
33: "Classics", 34: "Comedy", 35: "Documentary", 36: "Drama", 37: "Family",
38: "Foreign", 39: "Horror", 40: "Sci-Fi/Fantasy", 41: "Thriller", 42: "Shorts",
43: "Shows", 44: "Trailers"