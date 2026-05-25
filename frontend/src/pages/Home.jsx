import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const getCoverColors = (name = 'audio') => {
  let hash = 0;

  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colorA = `hsl(${(hash * 37) % 360}, 82%, 62%)`;
  const colorB = `hsl(${(hash * 97 + 40) % 360}, 78%, 58%)`;

  return [colorA, colorB];
};

const getInitials = (name = 'Audio') => {
  const cleaned = name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
  const words = cleaned.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return 'AU';
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

export const Home = ({ activeUploadId, onSelectUpload }) => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const syncAuthState = () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setUploads([]);
        setLoading(false);
        setError('Log in to see your uploaded songs and play them here.');
        return;
      }

      setLoading(true);
      setError('');

      axiosInstance.get('/api/upload')
        .then((res) => {
          setUploads(res.data.uploads || []);
        })
        .catch((err) => {
          if (err?.response?.status === 401) {
            setError('Please log in again to view your uploads.');
            return;
          }

          setError('Unable to load your uploads right now.');
        })
        .finally(() => {
          setLoading(false);
        });
    };

    syncAuthState();
    window.addEventListener('auth:changed', syncAuthState);

    return () => {
      window.removeEventListener('auth:changed', syncAuthState);
    };
  }, []);

  const handleCardClick = (upload) => {
    onSelectUpload(upload);
  };

  return (
    <div className="page-shell">
      <section className="hero-panel glass-panel">
        <p className="eyebrow">Modern audio workspace</p>
        <h1 className="page-title">Your music library</h1>
        <p className="page-copy">
          Click any song card to start playing it instantly. Manage your uploads from the dashboard and keep your listening space calm, focused, and beautifully minimal.
        </p>

        <div className="inline-actions">
          <Link to="/dashboard" className="glass-button glass-button-secondary">
            Open Dashboard
          </Link>

          {!localStorage.getItem('authToken') && (
            <Link to="/login" className="glass-button glass-button-primary">
              Login to view uploads
            </Link>
          )}
        </div>
      </section>

      <section className="section-panel glass-panel" style={{ marginTop: '1rem' }}>
        {loading && <p className="muted-copy">Loading your uploads...</p>}

        {error && !loading && <p className="status-error">{error}</p>}

        {!loading && !error && uploads.length === 0 && (
          <p className="muted-copy">
            You have no uploads yet. Add songs from the dashboard to see them here.
          </p>
        )}

        {!loading && !error && uploads.length > 0 && (
          <div className="song-grid">
            {uploads.map((upload) => {
              const [colorA, colorB] = getCoverColors(upload.filename || 'Audio');
              const isActive = activeUploadId === upload._id;

              return (
                <button
                  key={upload._id}
                  type="button"
                  onClick={() => handleCardClick(upload)}
                  className={`song-card ${isActive ? 'song-card-active' : ''}`}
                >
                  {upload.coverArt ? (
                    <img
                      src={upload.coverArt}
                      alt={upload.filename || 'Album art'}
                      className="song-cover"
                    />
                  ) : (
                    <div
                      className="song-cover-empty"
                      style={{ background: `linear-gradient(135deg, ${colorA}, ${colorB})` }}
                    >
                      {getInitials(upload.filename || 'Audio')}
                    </div>
                  )}

                  <div className="song-content">
                    <p className="song-title">{upload.filename || 'Untitled song'}</p>
                    <p className="song-subtitle">Tap to play</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
