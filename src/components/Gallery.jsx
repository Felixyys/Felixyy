import React, { useState } from 'react';
import './Gallery.css';

// ─── Ganti src dengan path gambar kamu ───────────────────────
const galleryItems = [
  {
    id: 1,
    src: '/images/digital-art.jpg',       // ganti path
    title: 'Digital Art',
    subtitle: 'Cute character',
    rotation: -3,
  },
  {
    id: 2,
    src: '/images/blue-sky.jpg',
    title: 'Blue Sky',
    subtitle: '',
    rotation: 2,
  },
  {
    id: 3,
    src: '/images/doodles.jpg',
    title: 'Doodles',
    subtitle: '',
    rotation: -2,
  },
  {
    id: 4,
    src: '/images/cafe-day.jpg',
    title: 'Cafe Day',
    subtitle: '',
    rotation: 4,
  },
  {
    id: 5,
    src: '/images/cozy-room.jpg',
    title: 'Cozy Room',
    subtitle: 'Cozy vibes',
    rotation: -4,
  },
  {
    id: 6,
    src: '/images/sweet-treats.jpg',
    title: 'Sweet Treats',
    subtitle: '',
    rotation: 3,
  },
  {
    id: 7,
    src: '/images/garden-walk.jpg',
    title: 'Garden Walk',
    subtitle: 'Beautiful flowers',
    rotation: -2,
  },
  {
    id: 8,
    src: '/images/starry-night.jpg',
    title: 'Starry Night',
    subtitle: 'Quiet evening',
    rotation: 4,
  },
];

const Gallery = () => {
  const [lightbox, setLightbox] = useState(null); // item yang sedang dibuka

  const openLightbox  = (item) => setLightbox(item);
  const closeLightbox = ()     => setLightbox(null);

  // tutup kalau klik backdrop
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) closeLightbox();
  };

  return (
    <section className="gallery-section">

      {/* ── Header ── */}
      <div className="gallery-header">
        <span className="header-sparkle">✦</span>
        <span className="header-icon">🖼️</span>
        <h2 className="gallery-title">Art &amp; Memories Gallery</h2>
        <span className="header-icon">🖼️</span>
        <span className="header-sparkle">✦</span>
      </div>

      {/* ── Grid ── */}
      <div className="gallery-grid">
        {galleryItems.map((item) => (
          <button
            key={item.id}
            className="polaroid"
            style={{ '--rotation': `${item.rotation}deg` }}
            onClick={() => openLightbox(item)}
            aria-label={`Lihat ${item.title}`}
          >
            {/* Tape */}
            <span className="tape" />

            {/* Foto */}
            <div className="polaroid-photo">
              <img src={item.src} alt={item.title} />
            </div>

            {/* Label */}
            <div className="polaroid-label">
              <p className="label-title">{item.title}</p>
              {item.subtitle && (
                <p className="label-subtitle">{item.subtitle}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="lightbox-backdrop" onClick={handleBackdrop}>
          <div className="lightbox-card">
            <button className="lightbox-close" onClick={closeLightbox}>✕</button>

            <div className="lightbox-photo">
              <img src={lightbox.src} alt={lightbox.title} />
            </div>

            <div className="lightbox-label">
              <p className="label-title">{lightbox.title}</p>
              {lightbox.subtitle && (
                <p className="label-subtitle">{lightbox.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default Gallery;