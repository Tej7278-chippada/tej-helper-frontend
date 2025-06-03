// components/helper/LazyBackgroundImage.js
import React, { useState, useEffect, useRef } from 'react';

const LazyBackgroundImage = ({ base64Image, alt, children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: '200px', // Load images 200px before they come into view
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const imageSrc = base64Image 
    ? `data:image/jpeg;base64,${base64Image}` 
    : 'https://placehold.co/600x400?text=No+Image';

    {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#e0e0e0',
          animation: 'pulse 1.5s infinite',
        }} />
      )}

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Low-quality placeholder (LQIP) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f5f5f5',
        backgroundImage: isInView ? `url(${imageSrc})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: isLoaded ? 'brightness(0.9)' : 'blur(5px)',
        transition: 'filter 0.3s ease',
        opacity: isLoaded ? 1 : 0.8
      }}
      >
        {/* Preload the image */}
        {isInView && !isLoaded && (
          <img 
            src={imageSrc} 
            alt={alt}
            style={{ display: 'none' }}
            onLoad={() => setIsLoaded(true)}
            onError={() => setIsLoaded(true)} // Fallback if image fails to load
          />
        )}
      </div>
      
      {children}
    </div>
  );
};

export default React.memo(LazyBackgroundImage);