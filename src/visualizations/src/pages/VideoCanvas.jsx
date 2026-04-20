import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clapperboard, Film, MoreVertical, MessageSquare, Send } from 'lucide-react';
import { InteractiveVisualization } from '../components/InteractiveVisualization';
import { WorldMapVisualization } from '../components/WorldMapVisualization';
import { CategoryStreamgraph } from '../components/CategoryStreamgraph';

const MOCK_VIDEO_STORIES = [
  {
    id: 1,
    title: 'Decoding YouTube\u2019s Grip on Global Attention \u2014 DBSCAN Country Archetypes',
    author: '',
    description: 'Interactive world map of 104 countries grouped into 6 attention archetypes by DBSCAN on a 21-feature profile.',
    descriptionLine2: 'Click any country to see per-country metrics, prototypicality score, and top category mix.',
    defaultVideo: 'https://www.w3schools.com/html/mov_bbb.mp4',
    visualization: 'worldmap',
  },
  {
    id: 2,
    title: 'How we engineered our NLP pipeline for Assignment 1',
    author: 'Team Gatech',
    description: 'From tokenization to model serving, this video unpacks the design decisions.',
    defaultVideo: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-video-of-a-liquid-texture-evolving-and-changing-32490-large.mp4',
  },
  {
    id: 3,
    title: 'Visualizing 1 Million records with Dask and D3',
    author: 'Team Gatech',
    description: 'Performance-friendly rendering strategy for high-volume visual analytics.',
    defaultVideo: 'https://www.w3schools.com/html/movie.mp4',
  },
  {
    id: 7,
    title: 'Category Composition Over Time — Streamgraph',
    author: '',
    description: 'Stacked area chart showing the quarterly share of the top 8 YouTube categories from Q3 2022 to Q2 2025.',
    descriptionLine2: 'Entertainment\'s share grows from 27.8% → 29.4% as Sports retreats. Hover any band or the legend to isolate a category.',
    defaultVideo: 'https://www.w3schools.com/html/mov_bbb.mp4',
    visualization: 'streamgraph',
  },
];

export function VideoCanvas() {
  const navigate = useNavigate();
  const { id } = useParams();
  const parsedId = Number.parseInt(id ?? '1', 10);

  const selectedVideo = useMemo(() => {
    const matched = MOCK_VIDEO_STORIES.find((entry) => entry.id === parsedId);
    return matched ?? MOCK_VIDEO_STORIES[0];
  }, [parsedId]);

  const [contentMode, setContentMode] = useState(selectedVideo.visualization === 'worldmap' ? 'visual' : 'video');
  const [menuOpen, setMenuOpen] = useState(false);
  const videoUrl = selectedVideo.defaultVideo;

  return (
    <div className="video-page-shell">
      <button className="icon-btn video-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={22} />
      </button>

      <div className="video-main-layout">
        <section className="video-player-column">
          <div className="video-player-frame" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 50 }}>
              <button 
                className="icon-btn" 
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <MoreVertical size={20} color="#fff" />
              </button>
              {menuOpen && (
                <div style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  right: 0, 
                  marginTop: '8px',
                  background: 'rgba(15, 15, 15, 0.95)',
                  border: '1px solid var(--divider)',
                  borderRadius: '8px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '160px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Playback Mode</div>
                  <button
                    className={`video-mode-btn ${contentMode === 'video' ? 'active' : ''}`}
                    onClick={() => { setContentMode('video'); setMenuOpen(false); }}
                    style={{ justifyContent: 'flex-start' }}
                  >
                    <Film size={16} /> Video
                  </button>
                  <button
                    className={`video-mode-btn ${contentMode === 'visual' ? 'active' : ''}`}
                    onClick={() => { setContentMode('visual'); setMenuOpen(false); }}
                    style={{ justifyContent: 'flex-start' }}
                  >
                    <Clapperboard size={16} /> Visualization
                  </button>
                </div>
              )}
            </div>

            {contentMode === 'video' ? (
              <video controls className="video-player-element" src={videoUrl}>
                Your browser does not support embedded video playback.
              </video>
            ) : selectedVideo.visualization === 'worldmap' ? (
              <div className="video-visualization-stage worldmap-stage">
                <WorldMapVisualization />
              </div>
            ) : selectedVideo.visualization === 'streamgraph' ? (
              <div className="video-visualization-stage">
                <CategoryStreamgraph />
              </div>
            ) : (
              <div className="video-visualization-stage">
                <InteractiveVisualization id={selectedVideo.id} />
              </div>
            )}
          </div>

          <div className="video-meta-stack">
            <h1 className="video-page-title">{selectedVideo.title}</h1>
            <p className="video-page-subtitle">
              {selectedVideo.author ? `${selectedVideo.author} • ` : ''}{selectedVideo.description}
            </p>
            {selectedVideo.descriptionLine2 && (
              <p className="video-page-subtitle video-page-subtitle-secondary">{selectedVideo.descriptionLine2}</p>
            )}
            <p className="video-trademark-note">Independent data video layout. No affiliation with YouTube or other video platforms.</p>
            
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--divider)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <MessageSquare size={20} /> Comments
              </h3>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <div className="video-author-avatar" style={{ backgroundColor: '#00bcd4' }}></div>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    style={{ 
                      width: '100%', 
                      background: 'transparent', 
                      border: 'none', 
                      borderBottom: '1px solid var(--divider)', 
                      padding: '8px 0', 
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Mock Comment 1 */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="video-author-avatar" style={{ width: '32px', height: '32px', backgroundColor: '#e91e63' }}></div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '500', fontSize: '0.85rem' }}>@datanerd</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>2 days ago</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>This visualization really helps understand the clustering over time. Impressive work!</p>
                  </div>
                </div>
                {/* Mock Comment 2 */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="video-author-avatar" style={{ width: '32px', height: '32px', backgroundColor: '#4caf50' }}></div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '500', fontSize: '0.85rem' }}>@visfanatic</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>1 week ago</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>Could you make the tooltip more responsive? It lags slightly on mobile.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
