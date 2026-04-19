"""Rebuild per-country ML results exactly matching dva_continuation.ipynb and export JSON for the React map."""
import json, os, numpy as np, pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN

PROJDIR = '/Users/ashutoshbharadwaj/DYGGA/'
OUT = os.path.join(PROJDIR, 'src/visualizations/src/data/perCountry.json')

df = pd.read_csv(os.path.join(PROJDIR, 'final_dataset_full_with_channel_stats.csv'), low_memory=False)
for col in ['rank','view_count','comment_count','category_id','time_to_trend','trending_duration','subscriber_count','channel_video_count','channel_view_count']:
    if col in df.columns: df[col] = pd.to_numeric(df[col], errors='coerce')
df['collection_date']=pd.to_datetime(df['collection_date'],format='mixed',utc=True,errors='coerce')
df['first_seen']=pd.to_datetime(df['first_seen'],format='mixed',utc=True,errors='coerce')
df['time_to_trend']=df['time_to_trend'].clip(lower=0)

CAT_MAP={1:'Film & Animation',2:'Autos & Vehicles',10:'Music',15:'Pets & Animals',17:'Sports',18:'Short Movies',19:'Travel & Events',20:'Gaming',21:'Videoblogging',22:'People & Blogs',23:'Comedy',24:'Entertainment',25:'News & Politics',26:'Howto & Style',27:'Education',28:'Science & Technology',29:'Nonprofits & Activism',30:'Movies',43:'Shows',44:'Trailers'}
df['category_label']=df['category_id'].map(CAT_MAP)

entry = df[df['snapshot_type']=='entry'].copy()
entry['engagement_depth']=entry['comment_count']/entry['view_count'].replace(0,np.nan)
entry['year']=entry['first_seen'].dt.year

# --- features (matches notebook) ---
cat_dist = entry.groupby(['region_code','category_label']).size().reset_index(name='count')
cat_dist['total']=cat_dist.groupby('region_code')['count'].transform('sum')
cat_dist['share']=cat_dist['count']/cat_dist['total']
cat_pivot = cat_dist.pivot_table(index='region_code',columns='category_label',values='share',fill_value=0)

country_stats = entry.groupby('region_code').agg(
    mean_duration=('trending_duration','mean'),
    mean_ttt=('time_to_trend','mean'),
    mean_engagement=('engagement_depth','mean'),
    mean_views=('view_count','mean'),
    median_duration=('trending_duration','median'),
    median_views=('view_count','median'),
    n_categories=('category_label','nunique'),
    n_videos=('video_id','nunique'),
).fillna(0)

country_features = cat_pivot.join(country_stats, how='inner')
print("shape:", country_features.shape)

feat_cols = [c for c in country_features.columns]  # includes scalars
# DBSCAN feature set matches notebook: all cat shares + 6 scalars (no medians)
dbscan_cols = list(cat_pivot.columns) + ['mean_duration','mean_ttt','mean_engagement','mean_views','n_categories','n_videos']
X = country_features[dbscan_cols].values
scaler = StandardScaler(); X_scaled = scaler.fit_transform(X)

from sklearn.neighbors import NearestNeighbors
nn = NearestNeighbors(n_neighbors=5).fit(X_scaled)
dists,_ = nn.kneighbors(X_scaled)
k_dist = np.sort(dists[:,-1])
eps_val = float(np.percentile(k_dist, 35))
labels = DBSCAN(eps=eps_val, min_samples=3, metric='euclidean').fit_predict(X_scaled)
country_features['cluster']=labels
print("clusters:", sorted(set(labels)), "eps:", eps_val)

# centroids + distance-to-centroid (prototypicality)
centroids = {}
for cl in sorted(set(labels)):
    if cl == -1: continue
    centroids[cl] = X_scaled[labels==cl].mean(axis=0)
dists_to_cent = {}
for i, rc in enumerate(country_features.index):
    cl = labels[i]
    if cl == -1:
        # distance to nearest cluster centroid
        best = min(((c, np.linalg.norm(X_scaled[i]-v)) for c,v in centroids.items()), key=lambda x:x[1])
        dists_to_cent[rc] = {'cluster': int(best[0]), 'dist': float(best[1]), 'is_noise': True}
    else:
        dists_to_cent[rc] = {'cluster': int(cl), 'dist': float(np.linalg.norm(X_scaled[i]-centroids[cl])), 'is_noise': False}

# normalize distance per cluster → prototypicality score 0..1 (1 = most prototypical)
cluster_dists = {cl: [v['dist'] for v in dists_to_cent.values() if v['cluster']==cl and not v['is_noise']] for cl in centroids}
for rc, info in dists_to_cent.items():
    cl = info['cluster']
    pool = cluster_dists.get(cl, [info['dist']])
    mn, mx = min(pool), max(pool) or 1
    info['prototypicality'] = 1.0 - (info['dist']-mn)/((mx-mn) or 1)

# top 3 categories per country (by share)
cat_cols = list(cat_pivot.columns)
top_cats = {}
for rc in country_features.index:
    row = country_features.loc[rc, cat_cols].sort_values(ascending=False)
    top_cats[rc] = [(c, float(row[c])) for c in row.index[:5] if row[c] > 0]

# per-country median trending duration (in days, matching report convention)
per_country = {}
for rc in country_features.index:
    row = country_features.loc[rc]
    per_country[rc] = {
        'mean_duration': float(row['mean_duration']),
        'mean_ttt': float(row['mean_ttt']),
        'mean_engagement': float(row['mean_engagement']),
        'mean_views': float(row['mean_views']),
        'median_duration': float(row['median_duration']),
        'median_views': float(row['median_views']),
        'n_categories': int(row['n_categories']),
        'n_videos': int(row['n_videos']),
        'cluster': int(row['cluster']),
        'top_categories': top_cats[rc],
        'category_shares': {c: float(row[c]) for c in cat_cols if row[c] > 0.005},
        'prototypicality': dists_to_cent[rc]['prototypicality'],
        'centroid_distance': dists_to_cent[rc]['dist'],
        'nearest_cluster': dists_to_cent[rc]['cluster'],
        'is_noise': dists_to_cent[rc]['is_noise'],
    }

# cluster means (for delta comparison)
cluster_means = {}
for cl in sorted(set(labels)):
    mask = country_features['cluster']==cl
    cluster_means[int(cl)] = {
        'mean_duration': float(country_features.loc[mask,'mean_duration'].mean()),
        'mean_ttt': float(country_features.loc[mask,'mean_ttt'].mean()),
        'mean_engagement': float(country_features.loc[mask,'mean_engagement'].mean()),
        'mean_views': float(country_features.loc[mask,'mean_views'].mean()),
    }

out = {
    'countries': per_country,
    'cluster_means': cluster_means,
    'dbscan': {'eps': round(eps_val,3), 'min_samples': 3, 'n_clusters': int(len(centroids)), 'n_noise': int((labels==-1).sum())},
    'category_columns': cat_cols,
}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT,'w') as f: json.dump(out, f)
print("wrote", OUT, "—", len(per_country), "countries")
# sample
for rc in ['US','IN','KR','BR','NO','SA']:
    if rc in per_country:
        p = per_country[rc]
        print(f"{rc}: cl={p['cluster']} dur={p['mean_duration']:.0f}h ttt={p['mean_ttt']:.0f}h proto={p['prototypicality']:.2f} top={p['top_categories'][:2]}")
