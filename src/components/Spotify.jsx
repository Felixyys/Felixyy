import { useState, useEffect } from 'react';
import './Spotify.css';

const Spotify = ({ spotify }) => {
  const [elapsed, setElapsed] = useState(0);

  const duration = spotify?.timestamps ? (spotify.timestamps.end - spotify.timestamps.start) : 0;

  useEffect(() => {
    if (!spotify || !spotify.timestamps) return;

    const calculateElapsed = () => {
      const current = Date.now();
      const elapsedMs = Math.max(0, current - spotify.timestamps.start);
      return Math.min(elapsedMs, duration);
    };

    // Defer the initial calculation to the next event loop tick to avoid synchronous setState warning
    const initialTimer = setTimeout(() => {
      setElapsed(calculateElapsed());
    }, 0);

    const intervalTimer = setInterval(() => {
      setElapsed(calculateElapsed());
    }, 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [spotify, duration]);

  if (!spotify) return null;

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (elapsed / duration) * 100 : 0;

  return (
    <div className="spotify-card-custom animate-fade-in">
      <div className="lace-border" />
      <div className="spotify-inner">
        {/* Header */}
        <div className="spotify-header">
          <div className="spotify-header-left">
            <span className="spotify-icon-container">
              <svg viewBox="0 0 24 24" fill="#1DB954" className="spotify-svg">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.377-1.454-5.37-1.783-8.893-1.022-.336.073-.668-.14-.74-.476-.072-.335.14-.668.476-.74 3.854-.882 7.15-.502 9.807 1.17.295.18.387.563.207.861zm1.224-2.723c-.226.367-.707.487-1.074.26-2.717-1.67-6.86-2.15-10.055-1.18-.413.125-.85-.107-.975-.52-.125-.413.107-.85.52-.975 3.655-1.11 8.214-.574 11.323 1.34.367.227.487.708.261 1.075zm.107-2.835C14.392 8.71 8.623 8.52 5.285 9.533c-.512.156-1.054-.134-1.21-.646-.156-.512.134-1.054.646-1.21 3.84-1.167 10.2-0.947 14.26 1.464.46.273.61.87.337 1.33-.273.46-.87.61-1.33.337z"/>
              </svg>
            </span>
            <span className="spotify-listening-text">Listening to Spotify</span>
          </div>
          <div className="music-bars">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        </div>

        {/* Content */}
        <div className="spotify-content">
          <div className="album-art-wrapper">
            <img 
              src={spotify.album_art_url || "https://i.imgur.com/8Q5N7aF.png"} 
              alt={spotify.album} 
              className="spotify-album-art"
            />
            <div className="vinyl-disc">
              <div className="vinyl-grooves"></div>
              <div className="vinyl-center"></div>
            </div>
          </div>

          <div className="spotify-details">
            <a 
              href={`https://open.spotify.com/track/${spotify.track_id}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="spotify-song-link"
            >
              <h3 className="spotify-song">{spotify.song}</h3>
            </a>
            <p className="spotify-artist">by {spotify.artist}</p>
            <p className="spotify-album">on {spotify.album}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="spotify-progress-container">
          <div className="spotify-time elapsed">{formatTime(elapsed)}</div>
          <div className="spotify-progress-bg">
            <div 
              className="spotify-progress-fill" 
              style={{ width: `${progressPercent}%` }}
            >
              <span className="progress-heart">🎀</span>
            </div>
          </div>
          <div className="spotify-time duration">{formatTime(duration)}</div>
        </div>
      </div>
      <div className="lace-border lace-border--bottom" />
    </div>
  );
};

export default Spotify;
