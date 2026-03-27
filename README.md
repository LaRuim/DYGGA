# DYGGA

Non-repo files can be found here: <https://drive.google.com/drive/folders/16-32W6aK_Q8s72FcLFNHLfO8SaQx_9Zc>

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
