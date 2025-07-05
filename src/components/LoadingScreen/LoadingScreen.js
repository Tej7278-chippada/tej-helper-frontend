// src/components/LoadingScreen/LoadingScreen.js
import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ onLoadingComplete, darkMode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [logoAnimationStep, setLogoAnimationStep] = useState(0);

  useEffect(() => {
    // Show the loading animation for 3 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Give some time for exit animation
      setTimeout(() => {
        onLoadingComplete();
      }, 500);
    }, 3000);

    // Show content after initial delay
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(contentTimer);
    };
  }, [onLoadingComplete]);

  return (
    <div className={`loading-screen ${darkMode ? 'dark-mode' : ''} ${!isLoading ? 'fade-out' : ''}`}>
      <div className="loading-background">
        <div className="color-ball ball-1"></div>
        <div className="color-ball ball-2"></div>
        <div className="color-ball ball-3"></div>
      </div>
      
      <div className={`loading-content ${showContent ? 'show' : ''}`}>
        <div className="logo-container">
          <div className="logo-icon">
            <div className="helping-hands">
              <div className="hand hand-1"></div>
              <div className="hand hand-2"></div>
              <div className="hand hand-3"></div>
              <div className="hand hand-4"></div>
              <div className="connection-line line-1"></div>
              <div className="connection-line line-2"></div>
            </div>
          </div>
          <div className="logo-text">Helper</div>
        </div>
        
        <div className="tagline">Your neighborhood marketplace</div>
        
        <div className="loading-indicator">
          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;