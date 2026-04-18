import { Waves, Heart } from 'lucide-react';
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
  { id: 1, title: 'Deep Dive: Understanding the DVA Dataset Features', author: 'Team Gatech', views: '50K views', time: '2 days ago' },
  { id: 2, title: 'How we engineered our NLP pipeline for Assignment 1', author: 'Team Gatech', views: '12K views', time: '1 week ago' },
  { id: 3, title: 'Visualizing 1 Million records with Dask and D3', author: 'Team Gatech', views: '100K views', time: '3 weeks ago' },
  { id: 4, title: 'Reviewing our machine learning models', author: 'Team Gatech', views: '34K views', time: '1 month ago' },
  { id: 5, title: 'Interactive Dashboard Demo - Final Project', author: 'Team Gatech', views: '10K views', time: '1 day ago' },
  { id: 6, title: 'The architecture behind our scalable frontend', author: 'Team Gatech', views: '45K views', time: '5 days ago' },
];

export function Home({ likedOnly = false }) {
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

  return (
    <div className="content-area">
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

      {!likedOnly && (
        <>
          <div className="home-section-title" style={{ marginTop: '24px' }}>
            Standard Visualizations
          </div>

          <div className="video-grid">
            {MOCK_VIDEOS.map((video) => (
              <div key={video.id} className="video-card">
                <div className="video-thumbnail-container" style={{ background: `hsl(${video.id * 40 + 100}, 50%, 30%)` }}></div>
                <div className="video-info">
                  <div className="video-author-avatar"></div>
                  <div className="video-details">
                    <div className="video-title">{video.title}</div>
                    <div className="video-meta">{video.author}</div>
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
