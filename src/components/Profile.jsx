import React, { useState, useEffect } from 'react';
import './Profile.css';
import Spotify from './Spotify';

const DISCORD_ID = "959837362404356128";

const getElapsed = (startTimestamp) => {
  if (!startTimestamp) return null;
  const elapsed = Date.now() - startTimestamp;
  const h = Math.floor(elapsed / 3600000);
  const m = Math.floor((elapsed % 3600000) / 60000);
  const s = Math.floor((elapsed % 60000) / 1000);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const STATUS_CONFIG = {
  online:  { label: 'Green Online',     color: '#3ba55c' },
  idle:    { label: 'Idle',             color: '#faa61a' },
  dnd:     { label: 'Do Not Disturb',   color: '#ed4245' },
  offline: { label: 'Offline',          color: '#747f8d' },
};
const Bow = ({ className = '' }) => (
  <svg className={`bow-icon ${className}`} viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#f4b8c8" strokeWidth="2">
      <ellipse cx="20" cy="20" rx="18" ry="11" fill="#f9d0dc" opacity="0.85"/>
      <ellipse cx="60" cy="20" rx="18" ry="11" fill="#f9d0dc" opacity="0.85"/>
      <circle  cx="40" cy="20" r="6"  fill="#f4b8c8"/>
      <line x1="34" y1="20" x2="22" y2="20"/>
      <line x1="46" y1="20" x2="58" y2="20"/>
    </g>
  </svg>
);

const Dots = () => (
  <>
    <span className="deco-dot deco-dot--tl">✦</span>
    <span className="deco-dot deco-dot--tr">✦</span>
    <span className="deco-dot deco-dot--bl">✦</span>
    <span className="deco-dot deco-dot--br">✦</span>
  </>
);

const Profile = () => {
  const [lanyardData, setLanyardData] = useState(null);
  const [elapsed,     setElapsed]     = useState('');
  const [error,       setError]       = useState(false);
  useEffect(() => {
    const fetchLanyard = async () => {
      try {
        const res  = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const data = await res.json();
        if (data.success) { setLanyardData(data.data); setError(false); }
      } catch { setError(true); }
    };
    fetchLanyard();
    const id = setInterval(fetchLanyard, 10000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!lanyardData) return;
    const game = lanyardData.activities?.find(a => a.type === 0);
    if (!game?.timestamps?.start) return;
    const tick = () => setElapsed(getElapsed(game.timestamps.start));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lanyardData]);
  if (!lanyardData && !error) return (
    <div className="profile-card loading-state">
      <div className="loading-spinner"/>
      <p>Memuat debu peri… 🧚‍♀️✨</p>
    </div>
  );
  if (error) return (
    <div className="profile-card error-state">
      <p>⚠️ Gagal memuat data Discord</p>
    </div>
  );

  const { discord_user, discord_status, activities, kv } = lanyardData;

  const displayName  = discord_user.global_name || discord_user.display_name || discord_user.username;
  const username     = discord_user.username;
  const avatarUrl    = `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png?size=256`;
  const status       = STATUS_CONFIG[discord_status] || STATUS_CONFIG.offline;

  const customStatus = activities?.find(a => a.type === 4);
  const statusEmoji  = customStatus?.emoji?.name ?? null;
  const statusText   = customStatus?.state ?? null;

  const gameActivity = activities?.find(a => a.type === 0);
  const aboutMe = kv?.about_me ?? 'She/Her. Just a cozy art & music lover. Let\'s be friends! ✨';

  return (
    <div className="profile-card">
      <Dots />

      <div className="bow-row bow-row--top">
        <Bow /> <Bow />
      </div>
      <div className="welcome-banner">
        <span>🎀</span>
        <h1 className="welcome-title">Welcome to my little space</h1>
        <span>🎀</span>
      </div>
      <div className="discord-card">
        <div className="lace-border"/>

        <div className="discord-inner">
          <div className="avatar-wrap">
            <img src={avatarUrl} alt={displayName} className="dc-avatar"/>
            <span className="dc-status-dot" style={{ background: status.color }}/>
          </div>
          <div className="dc-identity">
            <h2 className="dc-name">{displayName}</h2>
            <p className="dc-status-label">
              <span className="dc-status-dot-inline" style={{ background: status.color }}/>
              {status.label}
            </p>
            <p className="dc-about">
              {statusEmoji && <span>{statusEmoji} </span>}
              {statusText ?? aboutMe}
            </p>
          </div>
          <div className="dc-logo">
            <svg viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M60.1 4.9A58.6 58.6 0 0 0 45.7.6a40.7 40.7 0 0 0-1.8 3.7 54.2 54.2 0 0 0-16.3 0A40.5 40.5 0 0 0 25.8.6 58.5 58.5 0 0 0 11.4 5C1.6 19.7-1 34 .3 48.2a59 59 0 0 0 18 9.1 44.4 44.4 0 0 0 3.8-6.2 38.4 38.4 0 0 1-6-2.9l1.5-1.1a42.1 42.1 0 0 0 36.1 0l1.5 1.1a38.2 38.2 0 0 1-6 2.9 44.1 44.1 0 0 0 3.8 6.2 58.8 58.8 0 0 0 18-9C72.7 31.7 68.8 17.5 60.1 4.9ZM23.8 39.4c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.3 6.4 7.2c0 4-2.8 7.2-6.4 7.2Zm23.4 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.3 6.4 7.2c0 4-2.8 7.2-6.4 7.2Z" fill="#5865F2"/>
            </svg>
          </div>
        </div>
        {gameActivity && (
          <div className="dc-activity">
            <p className="dc-activity-label">Discord Activity</p>
            <div className="dc-activity-row">
              <span className="dc-activity-text">
                Currently Playing {gameActivity.name}
                {gameActivity.details && ` (${gameActivity.details})`}
              </span>
              {elapsed && <span className="dc-activity-time">⏳ {elapsed}</span>}
              {gameActivity.application_id && (
                <img
                  src={`https://cdn.discordapp.com/app-icons/${gameActivity.application_id}/${gameActivity.assets?.large_image}.png`}
                  alt={gameActivity.name}
                  className="dc-activity-icon"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
          </div>
        )}
        <div className="lace-border lace-border--bottom"/>
      </div>

      <div className="section-box">
        <Dots />
        <div className="section-header">
          <span>✨</span>
          <h3 className="section-title">About Me</h3>
          <span>✨</span>
        </div>
        <p className="about-me-text">{aboutMe}</p>
      </div>

      <Spotify spotify={lanyardData.spotify} />
      <div className="bow-row bow-row--bottom">
        <Bow /> <Bow />
      </div>
    </div>
  );
};

export default Profile;