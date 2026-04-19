import { Waves, Heart, Globe2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const MOCK_SHORTS = [
  { id: 1, title: 'Network Graph Explored', views: '1.2M views' },
  { id: 2, title: 'Heatmap Density', views: '800K views' },
  { id: 3, title: 'Scatterplot Outliers', views: '2M views' },
  { id: 4, title: '3D Globe Visual', views: '500K views' },
  { id: 5, title: 'Time Series Peaks', views: '3M views' },
  { id: 6, title: 'Geospatial Trends', views: '2.1M views' },
  { id: 7, title: 'Bar Chart Race', views: '9M views' },
];

const MOCK_VIDEOS = [
  { id: 1, title: 'Decoding YouTube\u2019s Grip on Global Attention', subtitle: 'DBSCAN Country Archetypes \u2014 104 countries, 6 clusters', views: '50K views', time: '2 days ago', kind: 'worldmap' },
  { id: 2, title: 'How we engineered our NLP pipeline for Assignment 1', subtitle: 'BERTopic + embeddings walkthrough', views: '12K views', time: '1 week ago' },
  { id: 3, title: 'Visualizing 1 Million records with Dask and D3', subtitle: 'Performance-first rendering strategy', views: '100K views', time: '3 weeks ago' },
  { id: 4, title: 'Reviewing our machine learning models', subtitle: 'Clustering, survival analysis, topic modeling', views: '34K views', time: '1 month ago' },
  { id: 5, title: 'Interactive Dashboard Demo - Final Project', subtitle: 'End-to-end integrated view', views: '10K views', time: '1 day ago' },
  { id: 6, title: 'The architecture behind our scalable frontend', subtitle: 'React + Vite + D3 pipeline', views: '45K views', time: '5 days ago' },
];

const ARCHETYPE_COLORS = ['#ff6b6b', '#ffe66d', '#4ecdc4', '#a06cd5', '#ff9f43', '#54a0ff'];

function WorldMapPreview() {
  return (
    <div className="video-preview-worldmap">
      <svg viewBox="0 0 100 56" preserveAspectRatio="xMidYMid slice" className="video-preview-svg">
        <defs>
          <radialGradient id="wm-prev-bg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#1a2a4a" />
            <stop offset="100%" stopColor="#05070d" />
          </radialGradient>
        </defs>
        <rect width="100" height="56" fill="url(#wm-prev-bg)" />
        {Array.from({ length: 48 }).map((_, i) => {
          const x = 8 + (i % 12) * 7.5 + (Math.sin(i) * 1.5);
          const y = 10 + Math.floor(i / 12) * 10 + (Math.cos(i) * 1.5);
          const color = ARCHETYPE_COLORS[i % 6];
          return <circle key={i} cx={x} cy={y} r={1.6} fill={color} opacity={0.85} />;
        })}
      </svg>
      <div className="video-preview-overlay">
        <Globe2 size={26} />
        <div className="video-preview-title">Interactive World Map</div>
        <div className="video-preview-sub">DBSCAN · 6 Archetypes · 104 countries</div>
      </div>
    </div>
  );
}

export function Home({ likedOnly = false, videosOnly = false }) {
  const navigate = useNavigate();
  const [likedIds, setLikedIds] = useState([]);

  useEffect(() => {
    if (likedOnly) {
      const saved = localStorage.getItem('dva_liked_shorts');
      setLikedIds(saved ? JSON.parse(saved) : []);
    }
  }, [likedOnly]);

  const displayShorts = likedOnly
    ? MOCK_SHORTS.filter(short => likedIds.includes(short.id))
    : MOCK_SHORTS;

  const showShortsShelf = !videosOnly;

  return (
    <div className="content-area">
      {showShortsShelf && (
        <>
          <div className="home-section-title">
            {likedOnly ? <Heart size={28} color="#ff3e3e" /> : <Waves size={28} color="rgba(100, 200, 255, 0.8)" />}
            {likedOnly ? 'Liked Visualizations' : 'Shorts Visualizations'}
          </div>

          {likedOnly && displayShorts.length === 0 && (
            <div style={{ color: 'var(--text-secondary)', padding: '24px 0' }}>
              No liked visualizations yet. Go watch some shorts and hit the like button!
            </div>
          )}

          <div className="shorts-shelf no-scrollbar" style={{ flexWrap: likedOnly ? 'wrap' : 'nowrap' }}>
            {displayShorts.map((short) => (
              <div
                key={short.id}
                className="shorts-card"
                onClick={() => navigate(`/shorts/${short.id}`)}
              >
                <div className="shorts-thumbnail" style={{ background: `hsl(${short.id * 50}, 70%, 40%)` }}></div>
                <div className="shorts-card-info">
                  <div className="shorts-title">{short.title}</div>
                  <div className="shorts-views">{short.views}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!likedOnly && (
        <>
          <div className="home-section-title" style={{ marginTop: showShortsShelf ? '24px' : 0 }}>
            Standard Visualizations
          </div>

          <div className="video-grid">
            {MOCK_VIDEOS.map((video) => (
              <div key={video.id} className="video-card" onClick={() => navigate(`/video/${video.id}`)}>
                <div className="video-thumbnail-container" style={{ background: video.kind === 'worldmap' ? 'transparent' : `hsl(${video.id * 40 + 100}, 50%, 30%)` }}>
                  {video.kind === 'worldmap' ? <WorldMapPreview /> : null}
                  <div className="video-badge">{video.kind === 'worldmap' ? 'Interactive' : 'Data Story'}</div>
                </div>
                <div className="video-info">
                  <div className="video-author-avatar"></div>
                  <div className="video-details">
                    <div className="video-title">{video.title}</div>
                    <div className="video-meta">{video.subtitle}</div>
                    <div className="video-meta">{video.views} • {video.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
