import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clapperboard, Upload, LayoutTemplate, Film } from 'lucide-react';
import { InteractiveVisualization } from '../components/InteractiveVisualization';

const MOCK_VIDEO_STORIES = [
  {
    id: 1,
    title: 'Deep Dive: Understanding the DVA Dataset Features',
    author: 'Team Gatech',
    description: 'Long-form walkthrough of feature engineering choices and why each signal matters.',
    defaultVideo: 'https://www.w3schools.com/html/mov_bbb.mp4',
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
];

export function VideoCanvas() {
  const navigate = useNavigate();
  const { id } = useParams();
  const parsedId = Number.parseInt(id ?? '1', 10);

  const selectedVideo = useMemo(() => {
    const matched = MOCK_VIDEO_STORIES.find((entry) => entry.id === parsedId);
    return matched ?? MOCK_VIDEO_STORIES[0];
  }, [parsedId]);

  const [contentMode, setContentMode] = useState('video');
  const [videoUrl, setVideoUrl] = useState(selectedVideo.defaultVideo);

  const onFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);
    setContentMode('video');
  };

  return (
    <div className="video-page-shell">
      <button className="icon-btn video-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={22} />
      </button>

      <div className="video-main-layout">
        <section className="video-player-column">
          <div className="video-player-frame">
            {contentMode === 'video' ? (
              <video controls className="video-player-element" src={videoUrl}>
                Your browser does not support embedded video playback.
              </video>
            ) : (
              <div className="video-visualization-stage">
                <InteractiveVisualization id={selectedVideo.id} />
              </div>
            )}
          </div>

          <div className="video-meta-stack">
            <h1 className="video-page-title">{selectedVideo.title}</h1>
            <p className="video-page-subtitle">{selectedVideo.author} • {selectedVideo.description}</p>
            <p className="video-trademark-note">Independent data video layout. No affiliation with YouTube or other video platforms.</p>
          </div>
        </section>

        <aside className="video-tools-column">
          <div className="video-tool-card">
            <div className="video-tool-title"><LayoutTemplate size={16} /> Playback Mode</div>
            <div className="video-toggle-row">
              <button
                className={`video-mode-btn ${contentMode === 'video' ? 'active' : ''}`}
                onClick={() => setContentMode('video')}
              >
                <Film size={16} /> Video
              </button>
              <button
                className={`video-mode-btn ${contentMode === 'visual' ? 'active' : ''}`}
                onClick={() => setContentMode('visual')}
              >
                <Clapperboard size={16} /> Visualization
              </button>
            </div>
          </div>

          <div className="video-tool-card">
            <label htmlFor="video-url" className="video-tool-title"><Film size={16} /> Custom Video URL</label>
            <input
              id="video-url"
              type="url"
              className="video-url-input"
              placeholder="https://..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>

          <div className="video-tool-card">
            <label className="video-upload-btn" htmlFor="video-file">
              <Upload size={16} /> Upload local video
            </label>
            <input
              id="video-file"
              type="file"
              accept="video/*"
              onChange={onFileUpload}
              style={{ display: 'none' }}
            />
            <p className="video-upload-note">Upload a local file to quickly test the player.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
