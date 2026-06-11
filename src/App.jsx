import React, { useState } from 'react';
import Profile from './components/Profile';
import Gallery from './components/Gallery';
import Spotify from './components/Spotify';
import './App.css';

function App() {
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  return (
    <div className="coquette-container">
      <Profile onLoadingChange={setIsProfileLoading} />
      {!isProfileLoading && <Gallery />}
    </div>
  );
}

export default App;
