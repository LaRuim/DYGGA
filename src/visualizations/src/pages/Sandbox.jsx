import { useState } from 'react';
import { Upload, Video as VideoIcon } from 'lucide-react';

export function Sandbox() {
  const [videoUrl, setVideoUrl] = useState('');

  const onFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);
  };

  return (
    <div className="content-area">
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
        <h1 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <VideoIcon /> Sandbox
        </h1>

        {!videoUrl ? (
          <div style={{ 
            border: '2px dashed var(--divider)', 
            borderRadius: '12px', 
            padding: '60px', 
            textAlign: 'center',
            backgroundColor: 'var(--bg-secondary)'
          }}>
            <Upload size={48} color="var(--text-secondary)" style={{ marginBottom: '16px' }} />
            <h2>Upload a local video</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Preview and test your visualization videos
            </p>
            <label className="video-upload-btn" htmlFor="studio-video-file">
              Select File
            </label>
            <input
              id="studio-video-file"
              type="file"
              accept="video/*"
              onChange={onFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', position: 'relative' }}>
             <button 
               className="icon-btn" 
               onClick={() => setVideoUrl('')}
               style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)' }}
             >
               &times;
             </button>
             <video controls style={{ width: '100%', borderRadius: '8px' }} src={videoUrl} />
          </div>
        )}
      </div>
    </div>
  );
}
