import { useEffect, useRef, useState } from 'react';
import { Heart, MinusCircle, MessageCircle, Send, MoreHorizontal, ArrowLeft, Play, BarChart2, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { InteractiveVisualization } from '../components/InteractiveVisualization';
import {
  ConvergenceShort,
  SurvivalShort,
  BertopicShort,
  ArchetypeShort,
  ChurnShort,
  ClusterScatterShort,
  WorldSyncShort,
} from '../components/ShortsVisualizations';

const MOCK_SHORTS_DATA = [
  {
    id: 1,
    type: 'interactive',
    shortKind: 'convergence',
    title: 'Attention is Concentrating',
    creator: '@dva_graph',
    desc: 'Shannon entropy drops and top-3 category share climbs across 2022–2025. Scrub the year or hit play to watch YouTube\u2019s trending attention consolidate.',
    comments: [
      { user: '@data_scientist', text: 'Insight: entropy falls from 3.140 → 3.116 while the top-3 share rises by ~3.3 pp. Small in absolute terms, huge given 104 countries moving together.', isInsight: true },
      { user: '@geo_master', text: 'The parallel shift across all regions is what makes this feel platform-driven, not cultural.', isInsight: false },
    ],
  },
  {
    id: 2,
    type: 'interactive',
    shortKind: 'survival',
    title: 'Videos linger longer',
    creator: '@dva_graph',
    desc: 'Kaplan-Meier median trending duration jumps from 8.0 days (2022) to 10.75 days (2024). Tap a year to see that year\u2019s survival curve highlighted.',
    comments: [
      { user: '@data_scientist', text: 'Insight: log-rank p < 0.001 between 2022 and 2025 — the shift in trending lifetimes is statistically significant, not noise.', isInsight: true },
      { user: '@student123', text: 'Does this correlate with lower engagement depth? Feels like it should.', isInsight: false },
    ],
  },
  {
    id: 3,
    type: 'interactive',
    shortKind: 'bertopic',
    title: 'BERTopic outlier reduction',
    creator: '@ml_eval',
    desc: 'Before/after noise rates for per-category BERTopic across 5 categories. Toggle the phase and pick a category — Sports drops from 47.9% to 6.7% noise.',
    comments: [
      { user: '@ml_eval', text: 'Insight: outlier reduction with cosine threshold 0.5 cuts avg noise from ~50% to ~11%. Biggest win: Gaming and Sports, the densest language-specific jargon.', isInsight: true },
    ],
  },
  {
    id: 4,
    type: 'interactive',
    shortKind: 'archetype',
    title: 'DBSCAN archetype profiles',
    creator: '@ml_eval',
    desc: 'Tap any of the 6 DBSCAN archetypes to inspect its trending duration, time-to-trend, engagement depth, and mean views — normalized against peer archetypes.',
    comments: [
      { user: '@ml_eval', text: 'Insight: the Western Anglosphere collapses to ~148 hrs trending duration — less than half the Gulf/ME cluster (372 hrs). Fastest content cycle on the platform.', isInsight: true },
      { user: '@geo_master', text: 'Nordic/Oceania and Central/E. Europe both land on the high-views, slow-TTT corner — different regions, same shape.', isInsight: false },
    ],
  },
  {
    id: 10,
    type: 'interactive',
    shortKind: 'world-sync',
    title: 'The World is Syncing',
    creator: '@world_insights',
    desc: 'Cosine similarity between countries\u2019 trending lists has risen from 84.9% → 86.7% (peak 2024). Tap a year to watch the gauge fill.',
    comments: [
      { user: '@geo_explorer', text: 'Insight: 2024 marks peak convergence at 86.69% — one in every six trending slots is effectively shared across borders.', isInsight: true },
      { user: '@data_scientist', text: 'The 2025 dip to 85.34% is interesting — possibly local content surges post-pandemic reversing a platform-push trend.', isInsight: false },
    ],
  },
  {
    id: 9,
    type: 'interactive',
    shortKind: 'cluster-scatter',
    title: 'Six archetypes, one map',
    creator: '@geo_explorer',
    desc: 'Each bubble is a DBSCAN archetype — x = time-to-trend, y = trending duration, size = avg views. Tap any bubble to inspect it.',
    comments: [
      { user: '@geo_master', text: 'Insight: Western Anglosphere sits alone in the bottom-left — fastest TTT and shortest duration by a wide margin. Every other cluster clusters tightly by comparison.', isInsight: true },
      { user: '@data_scientist', text: 'Nordic/Oceania and C/E Europe nearly overlap despite being geographically distant — similar algorithmic behaviour.', isInsight: false },
    ],
  },
  {
    id: 8,
    type: 'interactive',
    shortKind: 'churn',
    title: 'Entries outpace exits every month',
    creator: '@dva_graph',
    desc: 'Monthly new trending-list entries vs exits, Jul 2022 – Jun 2025. Scrub or hit play to watch the platform\'s churn rate grow year-over-year.',
    comments: [
      { user: '@data_scientist', text: 'Insight: December consistently spikes ~15% above the annual baseline — holiday content floods the trending lists each year.', isInsight: true },
      { user: '@ml_eval', text: 'The gap between entries and exits stays roughly constant (~4K/mo), suggesting the active pool is slowly growing.', isInsight: false },
    ],
  },
];

function RenderVisualizationPlaceholder({ type, id, shortKind }) {
  if (type === 'interactive' && shortKind) {
    if (shortKind === 'convergence') return <ConvergenceShort />;
    if (shortKind === 'survival') return <SurvivalShort />;
    if (shortKind === 'bertopic') return <BertopicShort />;
    if (shortKind === 'archetype') return <ArchetypeShort />;
    if (shortKind === 'churn') return <ChurnShort />;
    if (shortKind === 'cluster-scatter') return <ClusterScatterShort />;
    if (shortKind === 'world-sync') return <WorldSyncShort />;
  }
  return <RenderLegacyPlaceholder type={type} id={id} />;
}

function RenderLegacyPlaceholder({ type, id }) {
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
      default: // portrait
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

          {/* Main content card */}
          <div className="short-content-box" style={{ ...getResolutionStyle(short.resolution) }}>

            <RenderVisualizationPlaceholder type={short.type} id={short.id} shortKind={short.shortKind} />

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

          {/* Interaction buttons — outside the content box so they don't overlap the visual */}
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

        </div>
      ))}
    </div>
  );
}
