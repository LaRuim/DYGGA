# DYGGA

Non-repo files can be found here: <https://drive.google.com/drive/folders/16-32W6aK_Q8s72FcLFNHLfO8SaQx_9Zc>

## Dataset

The cleaned dataset's schema is as follows:

| Column | Type | Description |
| --- | --- | --- |
| `collection_date` | datetime (UTC) | Date the record was collected from YouTube trending |
| `region_code` | string | ISO 3166-1 alpha-2 country code |
| `rank` | Int64 | Trending rank (1 = top) |
| `video_id` | string | YouTube video ID |
| `title` | string | Original video title |
| `published_at` | datetime (UTC) | When the video was uploaded to YouTube |
| `channel_id` | string | YouTube channel ID |
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
| `channel_name` | string | Name of the channel (joined from subscriber stats) |
| `subscriber_count` | float64 | Channel's total subscriber count |
| `channel_video_count` | float64 | Total videos uploaded to the channel |
| `channel_view_count` | float64 | Total views across the entire channel |

For each `(video_id, region_code)` pair, the following are computed metrics:

| Field | Description |
| --- | --- |
| `first_seen` | Earliest `collection_date` the video appeared in trending |
| `last_seen` | Latest `collection_date` the video appeared in trending (not included in final dataset)|
| `time_to_trend` | Hours from `published_at` to `first_seen` |
| `trending_duration` | Hours from `first_seen` to `last_seen` |

Each video is represented by up to **3 snapshot rows**, not the full daily history:

| Snapshot Type | Definition |
| --- | --- |
| `entry` | The row where the video **first appeared** in trending for that region |
| `exit` | The row where the video **last appeared** in trending for that region |
| `peak` | The row where the video achieved its **best (lowest) rank**. If multiple days tied for best rank, the *latest* such day is used |

Duplicate snapshot rows (e.g. a video whose entry and peak occurred on the same day) are dropped, keeping one row per `(video_id, region_code, collection_date, snapshot_type)`.

### Category ID Mapping

| ID | Category | ID | Category |
| --- | --- | --- | --- |
| `1` | Film & Animation | `29` | Nonprofits & Activism |
| `2` | Autos & Vehicles | `30` | Movies |
| `10` | Music | `31` | Anime/Animation |
| `15` | Pets & Animals | `32` | Action/Adventure |
| `17` | Sports | `33` | Classics |
| `18` | Short Movies | `34` | Comedy |
| `19` | Travel & Events | `35` | Documentary |
| `20` | Gaming | `36` | Drama |
| `21` | Videoblogging | `37` | Family |
| `22` | People & Blogs | `38` | Foreign |
| `23` | Comedy | `39` | Horror |
| `24` | Entertainment | `40` | Sci-Fi/Fantasy |
| `25` | News & Politics | `41` | Thriller |
| `26` | Howto & Style | `42` | Shorts |
| `27` | Education | `43` | Shows |
| `28` | Science & Technology | `44` | Trailers |
