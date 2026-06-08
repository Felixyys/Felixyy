import React from 'react';
import Profile from './components/Profile';
import Gallery from './components/Gallery';
import Spotify from './components/Spotify';
import './App.css';

function App() {
  return (
    <div className="coquette-container">
      <Profile />
      <Gallery />
    </div>
  );
}

export default App;