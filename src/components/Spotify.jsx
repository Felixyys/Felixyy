import { useState, useEffect } from 'react';
import './Spotify.css';

const LASTFM_USERNAME = import.meta.env.VITE_LASTFM_USERNAME;
const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY;

const DEFAULT_TRACKS = [
  {
    rank: 1,
    song: "From The Start",
    artist: "Laufey",
    art: "https://lastfm.freetls.fastly.net/i/u/300x300/3875932ff9d87debe979c34e7e1dd6e4.png",
    url: "https://open.spotify.com/track/1yvjmqOIaD65c4H9s177Ue"
  },
  {
    rank: 2,
    song: "we fell in love in october",
    artist: "girl in red",
    art: "https://lastfm.freetls.fastly.net/i/u/300x300/548676aecb07a9f7030278e8d222bf4a.png",
    url: "https://open.spotify.com/track/1BYEOztalrmZJnCi758nS9"
  },
  {
    rank: 3,
    song: "Sofia",
    artist: "Clairo",
    art: "https://lastfm.freetls.fastly.net/i/u/300x300/73e6abff1b50d7d05a6d02857240263c.png",
    url: "https://open.spotify.com/track/7Ge79irv7n4Fh5Nu44URMI"
  },
  {
    rank: 4,
    song: "Lover",
    artist: "Taylor Swift",
    art: "https://lastfm.freetls.fastly.net/i/u/300x300/2174c0a24106bad7c5eb41c852139f58.png",
    url: "https://open.spotify.com/track/1dGr142FiFGwMMhpR214Pv"
  },
  {
    rank: 5,
    song: "Video Games",
    artist: "Lana Del Rey",
    art: "https://lastfm.freetls.fastly.net/i/u/300x300/2b007b4344235bf2657c4cbfa18d1921.png",
    url: "https://open.spotify.com/track/2H10dZ590rq7cEvzkz516B"
  }
];

const Spotify = ({ spotify }) => {
  const [elapsed, setElapsed] = useState(0);
  const [topTracks, setTopTracks] = useState(DEFAULT_TRACKS);
  const [loading, setLoading] = useState(true);

  const duration = spotify?.timestamps ? (spotify.timestamps.end - spotify.timestamps.start) : 0;

  useEffect(() => {
    if (!spotify || !spotify.timestamps) return;

    const calculateElapsed = () => {
      const current = Date.now();
      const elapsedMs = Math.max(0, current - spotify.timestamps.start);
      return Math.min(elapsedMs, duration);
    };

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

  useEffect(() => {
    if (!LASTFM_USERNAME || !LASTFM_API_KEY) {
      setLoading(false);
      return;
    }

    const fetchTopTracks = async () => {
      try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=5&period=1month`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch top tracks");
        const data = await res.json();
        
        if (data.toptracks && data.toptracks.track) {
          const rawTracks = data.toptracks.track.slice(0, 5);
          
          const formatted = await Promise.all(rawTracks.map(async (t, idx) => {
            let art = "https://lastfm.freetls.fastly.net/i/u/300x300/3875932ff9d87debe979c34e7e1dd6e4.png";
            let trackUrl = `https://open.spotify.com/search/$${encodeURIComponent(t.name + ' ' + t.artist.name)}`;
            
            try {
              const query = encodeURIComponent(`${t.name} ${t.artist.name}`);
              const iTunesRes = await fetch(`https://itunes.apple.com/search?term=${query}&limit=1&entity=song`);
              if (iTunesRes.ok) {
                const iTunesData = await iTunesRes.json();
                if (iTunesData.results && iTunesData.results.length > 0) {
                  const itunesArt = iTunesData.results[0].artworkUrl100;
                  art = itunesArt.replace("100x100bb.jpg", "300x300bb.jpg");

                  const appleUrl = iTunesData.results[0].trackViewUrl;
                  if (appleUrl) {
                    try {
                      const odesliRes = await fetch(`https://api.odesli.co/v1/links?url=${encodeURIComponent(appleUrl)}`);
                      if (odesliRes.ok) {
                        const odesliData = await odesliRes.json();
                        const spotifyUrl = odesliData.linksByPlatform?.spotify?.url;
                        if (spotifyUrl) {
                          trackUrl = spotifyUrl;
                        }
                      }
                    } catch (e) {
                      console.warn("Odesli lookup failed, using search fallback:", e);
                    }
                  }
                } else {
                  throw new Error("No iTunes results");
                }
              } else {
                throw new Error("iTunes request failed");
              }
            } catch {
              const mediumArt = t.image?.find(img => img.size === 'medium')?.['#text'];
              const largeArt = t.image?.find(img => img.size === 'large')?.['#text'];
              
              const isDefaultStar = (url) => {
                if (!url) return true;
                return url.includes("c6f59c1e5e7240a4c0d4c18c2d97af6d") || 
                       url.includes("2a96cbd8b46e442fc41c2b86b821562f");
              };

              if (mediumArt && !isDefaultStar(mediumArt)) {
                art = mediumArt;
              } else if (largeArt && !isDefaultStar(largeArt)) {
                art = largeArt;
              } else if (DEFAULT_TRACKS[idx]) {
                art = DEFAULT_TRACKS[idx].art;
              }
            }
            
            return {
              rank: idx + 1,
              song: t.name,
              artist: t.artist.name,
              art: art,
              url: trackUrl
            };
          }));
          
          setTopTracks(formatted);
        }
      } catch (err) {
        console.warn("Last.fm top tracks fetch failed, using defaults:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopTracks();
  }, []);

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
      <div className="spotify-layout">
        
        <div className="spotify-left-currently">
          <div className="spotify-header">
            <div className="spotify-header-left">
              <span className="spotify-icon-container">
                <svg viewBox="0 0 24 24" fill="#1DB954" className="spotify-svg">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.377-1.454-5.37-1.783-8.893-1.022-.336.073-.668-.14-.74-.476-.072-.335.14-.668.476-.74 3.854-.882 7.15-.502 9.807 1.17.295.18.387.563.207.861zm1.224-2.723c-.226.367-.707.487-1.074.26-2.717-1.67-6.86-2.15-10.055-1.18-.413.125-.85-.107-.975-.52-.125-.413.107-.85.52-.975 3.655-1.11 8.214-.574 11.323 1.34.367.227.487.708.261 1.075zm.107-2.835C14.392 8.71 8.623 8.52 5.285 9.533c-.512.156-1.054-.134-1.21-.646-.156-.512.134-1.054.646-1.21 3.84-1.167 10.2-0.947 14.26 1.464.46.273.61.87.337 1.33-.273.46-.87.61-1.33.337z"/>
                </svg>
              </span>
              <span className="spotify-listening-text">
                {spotify ? 'Currently Playing' : 'Daydreaming...'}
              </span>
            </div>
            {spotify && (
              <div className="music-bars">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div>
            )}
          </div>

          <div className="spotify-content">
            <div className="album-art-wrapper">
              {spotify ? (
                <img 
                  src={spotify.album_art_url} 
                  alt={spotify.album} 
                  className="spotify-album-art"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://lastfm.freetls.fastly.net/i/u/300x300/3875932ff9d87debe979c34e7e1dd6e4.png";
                  }}
                />
              ) : (
                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg" className="spotify-album-art spotify-album-art--offline">
                  <rect width="68" height="68" rx="8" fill="#fcf4f6" />
                  <rect x="2" y="2" width="64" height="64" rx="6" fill="none" stroke="#f4b8c8" strokeWidth="1.5" strokeDasharray="3 3" />
                  <path d="M34 26C31.5 22.5 27.5 22.5 25.5 24.5C23.5 26.5 23.5 30.5 27 34L34 41L41 34C44.5 30.5 44.5 26.5 42.5 24.5C40.5 22.5 36.5 22.5 34 26Z" fill="#f4b8c8" opacity="0.85" />
                  <text x="34" y="52" fill="#6674a0" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="'Nunito', sans-serif">SHH...</text>
                </svg>
              )}
              <div className={`vinyl-disc ${!spotify ? 'vinyl-disc--paused' : ''}`}>
                <div className="vinyl-grooves"></div>
                <div className="vinyl-center"></div>
              </div>
            </div>

            <div className="spotify-details">
              {spotify ? (
                <>
                  <a 
                    href={`https://open.spotify.com/track/$${spotify.track_id}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="spotify-song-link"
                  >
                    <h3 className="spotify-song">{spotify.song}</h3>
                  </a>
                  <p className="spotify-artist">by {spotify.artist}</p>
                  <p className="spotify-album">on {spotify.album}</p>
                </>
              ) : (
                <>
                  <h3 className="spotify-song">No music playing</h3>
                  <p className="spotify-artist">Quiet & cozy... 🎀</p>
                  <p className="spotify-album">Silence is golden</p>
                </>
              )}
            </div>
          </div>

          <div className="spotify-progress-container">
            <div className="spotify-time elapsed">{spotify ? formatTime(elapsed) : '--:--'}</div>
            <div className="spotify-progress-bg">
              <div 
                className="spotify-progress-fill" 
                style={{ width: `${spotify ? progressPercent : 0}%` }}
              >
                <span className="progress-heart">🎀</span>
              </div>
            </div>
            <div className="spotify-time duration">{spotify ? formatTime(duration) : '--:--'}</div>
          </div>
        </div>

        <div className="spotify-right-top5">
          <div className="top5-header">
            <span className="top5-title">Top 5 Monthly</span>
            <span className="top5-subtitle">Obsessions ✨</span>
          </div>
          <div className="top5-list">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="top5-skeleton">
                  <span className="skeleton-rank"></span>
                  <div className="skeleton-art"></div>
                  <div className="skeleton-info">
                    <div className="skeleton-song"></div>
                    <div className="skeleton-artist"></div>
                  </div>
                </div>
              ))
            ) : (
              topTracks.map((track) => (
                <a 
                  key={track.rank}
                  href={track.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="top5-item"
                  title={`${track.song} - ${track.artist}`}
                >
                  <span className="top5-rank">{track.rank}</span>
                  <img 
                    src={track.art} 
                    alt={track.song} 
                    className="top5-art" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://lastfm.freetls.fastly.net/i/u/300x300/3875932ff9d87debe979c34e7e1dd6e4.png";
                    }}
                  />
                  <div className="top5-info">
                    <span className="top5-song">{track.song}</span>
                    <span className="top5-artist">{track.artist}</span>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>

      </div>
      <div className="lace-border lace-border--bottom" />
    </div>
  );
};

export default Spotify;