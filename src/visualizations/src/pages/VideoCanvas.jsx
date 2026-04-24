import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clapperboard, Film, MoreVertical, MessageSquare } from 'lucide-react';
import { InteractiveVisualization } from '../components/InteractiveVisualization';
import { WorldMapVisualization } from '../components/WorldMapVisualization';
import { CategoryStreamgraph } from '../components/CategoryStreamgraph';
import { SubtopicsVisualization } from '../components/SubtopicsVisualization';
import { FingerprintDuel } from '../features/fingerprint-duel/FingerprintDuel';
import { TttScatter } from '../features/ttt-scatter/TttScatter';

const MOCK_VIDEO_STORIES = [
  {
    id: 1,
    title: 'Decoding YouTube\u2019s Grip on Global Attention \u2014 DBSCAN Country Archetypes',
    author: '',
    description: 'Interactive world map of 104 countries grouped into 6 attention archetypes by DBSCAN on a 21-feature profile.',
    descriptionLine2: 'Click any country to see per-country metrics, prototypicality score, and top category mix.',
    defaultVideo: 'https://www.w3schools.com/html/mov_bbb.mp4',
    visualization: 'worldmap',
    comments: [
      { user: '@atlas_anand',  color: '#e91e63', time: '2 days ago',  text: 'The Gulf/ME cluster popping out in warm red makes the engagement-depth story immediate. Great colour choice.' },
      { user: '@region_rohan', color: '#4caf50', time: '1 day ago',   text: 'Interesting that Japan and South Korea end up as noise — would\u2019ve bet money they\u2019d anchor their own cluster.' },
      { user: '@country_coder',color: '#9c27b0', time: '5 days ago',  text: 'Click-through to per-country top categories + prototypicality is gold. This is basically a country explainer by itself.' },
    ],
  },
  {
    id: 2,
    title: 'How we engineered our NLP pipeline for Assignment 1',
    author: 'Team Gatech',
    description: 'From tokenization to model serving, this video unpacks the design decisions.',
    defaultVideo: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-video-of-a-liquid-texture-evolving-and-changing-32490-large.mp4',
    comments: [
      { user: '@tokenizer_tara', color: '#ff9800', time: '3 days ago', text: 'Batching at 256 on MPS for 726k rows in an hour is wild — did you quantize at all or stay fp32?' },
      { user: '@embed_evan',     color: '#2196f3', time: '6 days ago', text: 'Using the multilingual MiniLM was the right call given the 104-country spread. English-only would\u2019ve ghettoed the non-English clusters.' },
      { user: '@pipeline_pete',  color: '#00bcd4', time: '1 week ago', text: 'The per-category BERTopic pivot is underrated. Saved you from language-as-topic collapse.' },
    ],
  },
  {
    id: 10,
    title: 'Attention Fingerprint Duel',
    author: 'Team Gatech',
    description: 'Pick any two countries and compare their 13-axis YouTube category attention fingerprint.',
    descriptionLine2: 'The Lottie gauge scores cosine similarity — same cluster doesn\'t always mean same shape.',
    defaultVideo: 'https://www.w3schools.com/html/mov_bbb.mp4',
    visualization: 'fingerprint',
    comments: [
      { user: '@fingerprint_fi', color: '#ff4081', time: '1 day ago',  text: 'Tried US vs GB expecting 0.99 — got 0.92. Comedy weight is way different than I assumed.' },
      { user: '@cosine_cleo',    color: '#8bc34a', time: '2 days ago', text: 'Love that the Lottie gauge animates the score. Makes a dry cosine number feel like a verdict.' },
      { user: '@duel_dan',       color: '#673ab7', time: '4 days ago', text: 'Would be cool to persist a "duel history" so you can walk back through comparisons you already ran.' },
    ],
  },
  {
    id: 11,
    title: 'TTT vs Duration — Where Do Countries Land?',
    author: 'Team Gatech',
    description: 'Scatter plot of 104 countries plotting Time-to-Trend (x) against Trending Duration (y), colored by DBSCAN cluster.',
    descriptionLine2: 'Hover any dot for country details. Click a cluster in the legend to isolate it. Dashed lines mark the median TTT and duration.',
    defaultVideo: 'https://www.w3schools.com/html/mov_bbb.mp4',
    visualization: 'tttscatter',
    comments: [
      { user: '@scatter_sam',   color: '#f44336', time: '2 days ago', text: 'The bottom-left Anglosphere cluster is so isolated it almost looks like a labeling bug. But no — they really cycle that fast.' },
      { user: '@median_maya',   color: '#03a9f4', time: '3 days ago', text: 'The median crosshairs are a nice touch. Lets you eyeball which quadrant each cluster dominates.' },
      { user: '@outlier_oscar', color: '#ffc107', time: '1 week ago', text: 'Japan sitting way off to the right-top drags the noise cluster — would be worth a callout annotation.' },
    ],
  },
  {
    id: 3,
    title: 'Visualizing 1 Million records with Dask and D3',
    author: 'Team Gatech',
    description: 'Performance-friendly rendering strategy for high-volume visual analytics.',
    defaultVideo: 'https://www.w3schools.com/html/movie.mp4',
    comments: [
      { user: '@dask_dora',    color: '#009688', time: '4 days ago', text: 'Streaming partitions was the fix for us too — in-memory pandas choked on the trending CSVs\u2019 multi-line descriptions.' },
      { user: '@render_ricky', color: '#ff5722', time: '6 days ago', text: 'Canvas over SVG at this row count is non-negotiable. Curious how you handle hover hit-testing though.' },
      { user: '@perf_phil',    color: '#795548', time: '2 weeks ago',text: 'The cached aggregated tags tip is what took this from "technically works" to "interactive". More people need to steal that.' },
    ],
  },
  {
    id: 8,
    title: 'BERTopic Sub-topic Rank Mobility',
    author: '',
    description: 'Bump chart tracking the top 6 BERTopic sub-topics per category across 2022–2025. Lines show rank changes year-over-year.',
    descriptionLine2: 'Select a category, hover any line to reveal its % share. Bold lines are the biggest riser and faller.',
    defaultVideo: 'https://www.w3schools.com/html/mov_bbb.mp4',
    visualization: 'subtopics',
    comments: [
      { user: '@ml_eval',       color: '#e91e63', time: '2 days ago',  text: 'In Gaming, Roblox/Clash climbed from rank 8 → rank 3 (2022→2025) while GTA+FC dropped out of the top 10 — reflecting a shift toward battle-royale crossovers.' },
      { user: '@geo_master',    color: '#4caf50', time: '1 day ago',   text: 'TikTok\'s rise in People & Blogs (rank 10 → rank 5) is a clear signal — attention spans are shrinking and short-form content is taking over even on YouTube.' },
      { user: '@data_scientist',color: '#2196f3', time: '3 hours ago', text: 'The BIAAS cluster in Music (rank 8 → rank 4) shows new regional artists breaking through the algorithm over time.' },
    ],
  },
  {
    id: 7,
    title: 'Category Composition Over Time — Streamgraph',
    author: '',
    description: 'Stacked area chart showing the quarterly share of the top 8 YouTube categories from Q3 2022 to Q2 2025.',
    descriptionLine2: 'Entertainment\'s share grows from 27.8% → 29.4% as Sports retreats. Hover any band or the legend to isolate a category.',
    defaultVideo: 'https://www.w3schools.com/html/mov_bbb.mp4',
    visualization: 'streamgraph',
    comments: [
      { user: '@stream_sita',      color: '#e040fb', time: '3 days ago', text: 'Sports losing ground Q4 every year reads like the World Cup / Super Bowl cycle bleeding into Entertainment. Seasonality you can feel.' },
      { user: '@composition_carl', color: '#00e676', time: '5 days ago', text: '1.6pp shift for Entertainment in 3 years is huge on a platform this saturated. The streamgraph framing sells it well.' },
      { user: '@share_saanvi',     color: '#7c4dff', time: '1 day ago',  text: 'Hovering a band to isolate is exactly the interaction I wanted. Most streamgraphs just sit there.' },
    ],
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

  const [contentMode, setContentMode] = useState(
    ['worldmap', 'streamgraph', 'subtopics', 'fingerprint', 'tttscatter'].includes(selectedVideo.visualization) ? 'visual' : 'video'
  );
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
            ) : selectedVideo.visualization === 'subtopics' ? (
              <div className="video-visualization-stage">
                <SubtopicsVisualization />
              </div>
            ) : selectedVideo.visualization === 'fingerprint' ? (
              <div className="video-visualization-stage">
                <FingerprintDuel />
              </div>
            ) : selectedVideo.visualization === 'tttscatter' ? (
              <div className="video-visualization-stage">
                <TttScatter />
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
                {(selectedVideo.comments ?? []).map((c) => (
                  <div key={c.user} style={{ display: 'flex', gap: '12px' }}>
                    <div className="video-author-avatar" style={{ width: '32px', height: '32px', backgroundColor: c.color }}></div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '500', fontSize: '0.85rem' }}>{c.user}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.time}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
