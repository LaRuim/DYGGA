import { useEffect, useRef, useState } from 'react';
import { Heart, MinusCircle, MessageCircle, Send, MoreHorizontal, ArrowLeft, Play, BarChart2, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { InteractiveVisualization } from '../components/InteractiveVisualization';

const MOCK_SHORTS_DATA = [
  { 
    id: 1, 
    type: 'interactive', 
    title: 'Global Disparity Map', 
    resolution: 'fluid',
    creator: '@dva_graph', 
    desc: 'Key Insight: Notice the extreme density in Northern Europe vs South America. Interact with the countries to see granular income density distributions.',
    comments: [
      { user: '@data_scientist', text: 'Insight: If you hover over Norway, you can see the highest HDI clustering on the map. Here is a zoomed-in overlay of the cluster boundaries:', isInsight: true, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400' },
      { user: '@geo_master', text: 'The Mercator projection distorts the northern regions slightly, but the color scaling perfectly handles the outliers.', isInsight: false },
      { user: '@student123', text: 'This interactive D3 map is incredibly smooth!', isInsight: false }
    ]
  },
  { 
    id: 2, 
    type: 'video', 
    title: 'Cluster Expansion Timelapse', 
    creator: '@data_viz', 
    desc: 'Insight: Cellular clusters exhibit exponential growth during week 40-50. Watch the organic clusters form, expand, and decay in real-time.',
    comments: [
      { user: '@biologist_dave', text: 'Insight: The rapid expansion phase perfectly mirrors the theoretical logistic growth curve we studied in class.', isInsight: true },
      { user: '@random_viewer', text: 'Wow, the simulation frames are mesmerizing.', isInsight: false }
    ]
  },
  { 
    id: 3, 
    type: 'static', 
    title: 'Heatmap Density', 
    creator: '@heatmap_pro', 
    desc: 'Static snapshot of the threshold limits. Hotspots appear predominantly in urban sector blocks.',
    comments: [
      { user: '@heatmap_pro', text: 'Insight: Traffic density drops significantly between 2AM and 4AM across all sector blocks.', isInsight: true }
    ]
  },
  { 
    id: 4, 
    type: 'video', 
    title: '3D Globe Visual', 
    resolution: 'landscape',
    creator: '@geo_master', 
    desc: 'Insight: Trans-Atlantic routes carry 80% more volume than Trans-Pacific in this simulation. Spinning the globe to see international shipping routes.',
    comments: [
      { user: '@supply_chain', text: 'Insight: Look closely at the Suez Canal bottleneck, rendering red during peak volume hours.', isInsight: true },
      { user: '@student_a', text: 'How did you render the 3D curves?', isInsight: false }
    ]
  },
  { 
    id: 5, 
    type: 'static', 
    title: 'Time Series Peaks', 
    creator: '@time_series', 
    desc: 'Finding seasonality in a 10-year trend. Observe the massive dip during Q2 2020.',
    comments: [
      { user: '@market_watcher', text: 'Insight: The recovery slope post-2020 is nearly twice as steep as the decade average.', isInsight: true }
    ]
  },
];

function RenderVisualizationPlaceholder({ type, id }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (type === 'static') {
    return (
      <div className="short-viz-placeholder" style={{ background: `linear-gradient(45deg, hsl(${id * 50}, 40%, 20%), hsl(${id * 60}, 50%, 15%))` }}>
        <BarChart2 size={80} color="rgba(255,255,255,0.4)" />
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div 
        className="short-viz-placeholder" 
        style={{ cursor: 'pointer', backgroundColor: '#000', position: 'relative', overflow: 'hidden' }}
        onClick={toggleVideo}
      >
        <video 
          ref={videoRef}
          src={id === 2 ? "https://assets.mixkit.co/videos/preview/mixkit-abstract-video-of-a-liquid-texture-evolving-and-changing-32490-large.mp4" : "https://www.w3schools.com/html/mov_bbb.mp4"}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          autoPlay 
          loop 
          muted 
          playsInline
        />

        {!isPlaying && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid rgba(255,255,255,0.3)',
            zIndex: 10
          }}>
            <Play size={32} color="white" style={{marginLeft: '4px'}} />
          </div>
        )}
      </div>
    );
  }

  if (type === 'interactive') {
    return <InteractiveVisualization id={id} />;
  }

  return null;
}

export function ShortsCanvas() {
  const navigate = useNavigate();
  const { id } = useParams();
  const containerRef = useRef(null);
  const [openCommentsId, setOpenCommentsId] = useState(null);
  
  // Track liked shorts persistently via localStorage
  const [likedShorts, setLikedShorts] = useState(() => {
    const saved = localStorage.getItem('dva_liked_shorts');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const toggleLike = (shortId) => {
    setLikedShorts((prev) => {
      const newLikes = new Set(prev);
      if (newLikes.has(shortId)) {
        newLikes.delete(shortId);
      } else {
        newLikes.add(shortId);
      }
      localStorage.setItem('dva_liked_shorts', JSON.stringify(Array.from(newLikes)));
      return newLikes;
    });
  };

  const initialIndex = MOCK_SHORTS_DATA.findIndex(s => s.id === parseInt(id));
  const reorderedShorts = initialIndex > -1 
    ? [...MOCK_SHORTS_DATA.slice(initialIndex), ...MOCK_SHORTS_DATA.slice(0, initialIndex)]
    : MOCK_SHORTS_DATA;

  const getResolutionStyle = (resolution) => {
    switch(resolution) {
      case 'landscape':
        return { maxWidth: '1000px', maxHeight: '562px', aspectRatio: '16/9' };
      case 'square':
        return { maxWidth: '800px', maxHeight: '800px', aspectRatio: '1/1' };
      case 'fluid':
        return { maxWidth: '90%', maxHeight: '85vh', aspectRatio: 'auto' };
      default: // default portrait
        return { maxWidth: '450px', maxHeight: '800px', aspectRatio: '9/16' };
    }
  };

  return (
    <div className="shorts-canvas-container no-scrollbar" ref={containerRef}>
      <button className="icon-btn canvas-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} color="white" />
      </button>
      <div style={{ position: 'fixed', top: '24px', left: '80px', zIndex: 50, color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', padding: '8px 16px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
        Not affiliated with YouTube
      </div>

      {reorderedShorts.map((short, idx) => (
        <div key={`${short.id}-${idx}`} className="short-player-wrapper">
          <div className="short-content-box" style={{ ...getResolutionStyle(short.resolution) }}>
            
            <RenderVisualizationPlaceholder type={short.type} id={short.id} />
            
            {/* Overlay Gradient for Text Readability */}
            <div className="shorts-card-info" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)', paddingTop: '60px', paddingBottom: '24px', pointerEvents: 'none', zIndex: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', pointerEvents: 'auto' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff' }}></div>
                <span style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#fff' }}>{short.creator}</span>
              </div>
              <div className="shorts-title" style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#fff' }}>{short.title}</div>
              <div className="shorts-views" style={{ marginTop: '4px', color: '#ddd', lineHeight: '1.4' }}>{short.desc}</div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {short.type}
                </span>
              </div>
            </div>

            {/* Interaction Action Buttons on the Right */}
            <div className="short-interactions" style={{ zIndex: 30 }}>
              <button className="short-action-btn" onClick={() => toggleLike(short.id)}>
                <div className="short-action-icon">
                  <Heart 
                    size={24} 
                    color={likedShorts.has(short.id) ? "#ff3e3e" : "white"} 
                    fill={likedShorts.has(short.id) ? "#ff3e3e" : "none"}
                  />
                </div>
                <span style={{ color: likedShorts.has(short.id) ? '#ff3e3e' : 'white' }}>Like</span>
              </button>
              <button className="short-action-btn">
                <div className="short-action-icon"><MinusCircle size={24} color="white" /></div>
                <span style={{ color: 'white' }}>Ignore</span>
              </button>
              <button 
                className="short-action-btn" 
                onClick={() => setOpenCommentsId(openCommentsId === short.id ? null : short.id)}
              >
                <div className="short-action-icon"><MessageCircle size={24} color="white" /></div>
                <span style={{ color: 'white' }}>{short.comments?.length || 0}</span>
              </button>
              <button className="short-action-btn">
                <div className="short-action-icon"><Send size={24} color="white" /></div>
                <span style={{ color: 'white' }}>Share</span>
              </button>
              <button className="short-action-btn">
                <div className="short-action-icon"><MoreHorizontal size={24} color="white" /></div>
              </button>
            </div>

            {/* Slide-Up Comments Overlay Drawer */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '65%',
              backgroundColor: 'var(--bg-secondary)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
              transform: openCommentsId === short.id ? 'translateY(0)' : 'translateY(100%)',
              opacity: openCommentsId === short.id ? 1 : 0,
              transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s',
              pointerEvents: openCommentsId === short.id ? 'auto' : 'none'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--divider)' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Insights & Comments</h3>
                <button onClick={() => setOpenCommentsId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}>
                  <X size={24} />
                </button>
              </div>

              {/* Comments List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }} className="no-scrollbar">
                {short.comments?.map((comment, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: `hsl(${i * 40 + 200}, 50%, 40%)`, flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                      {comment.user.charAt(1).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>{comment.user}</span>
                        {comment.isInsight && (
                          <span style={{
                            backgroundColor: 'rgba(255, 60, 60, 0.15)', 
                            color: '#ff5555', 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '0.65rem',
                            fontWeight: 'bold',
                            border: '1px solid rgba(255, 60, 60, 0.3)'
                          }}>
                            FEATURED INSIGHT
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.4' }}>
                        {comment.text}
                      </div>
                      {comment.image && (
                        <div style={{ marginTop: '12px' }}>
                          <img 
                            src={comment.image} 
                            alt="Insight attachment" 
                            style={{ width: '100%', maxWidth: '300px', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!short.comments || short.comments.length === 0) && (
                  <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>
                    No insights listed yet.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}
