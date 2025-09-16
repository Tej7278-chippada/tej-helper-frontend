// components/Helper/DistanceSlider.js
import React, { useRef, useEffect } from 'react';
import Slider from '@mui/material/Slider';

const DistanceSlider = ({ distanceRange, setDistanceRange, userLocation, mapRef, isMobile, getZoomLevel, distanceValues, setShowDistanceRanges }) => {
  const lastPlayedRef = useRef(null);
  const timeoutRef = useRef(null);

  // Normalize distances into equal positions (0 to distanceValues.length - 1)
  const marks = distanceValues.map((value, index) => ({
    value: index,
    label: `${value}`,
  }));

  // Sound effect with cleanup
  const playSound = () => {
    try {
      // Don't play if we just played a sound recently
      if (lastPlayedRef.current && Date.now() - lastPlayedRef.current < 100) return;
      
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = isMobile ? 600 : 800;
      gainNode.gain.value = isMobile ? 0.05 : 0.1;
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      oscillator.stop(audioCtx.currentTime + 0.1);
      
      lastPlayedRef.current = Date.now();
    } catch (e) {
      console.warn('Audio not supported', e);
    }
  };

  // Vibration effect
  const vibrate = () => {
    if ('vibrate' in navigator) {
      // Different vibration patterns for mobile vs desktop (if desktop supports it)
      const pattern = isMobile ? [20] : [10];
      navigator.vibrate(pattern);
    }
  };

  // Combined feedback
  const provideFeedback = () => {
    vibrate();
    playSound();
  };

  const handleDistanceRangeChange = (event, newValue) => {
    const selectedDistance = distanceValues[newValue];
    setDistanceRange(selectedDistance); // Convert index back to actual distance
    localStorage.setItem('distanceRange', selectedDistance);
    
    if (mapRef.current && userLocation) {
      mapRef.current.setView(
        [userLocation.latitude, userLocation.longitude],
        getZoomLevel(selectedDistance)
      );
    }
    
    // Clear any pending feedback
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Schedule feedback after a short delay (when sliding stops)
    timeoutRef.current = setTimeout(() => {
      provideFeedback();
    }, 150);
    setShowDistanceRanges(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Slider
        orientation="horizontal" //{isMobile ? "vertical" : "horizontal"}
        value={distanceValues.indexOf(distanceRange)} // Map actual distance to index
        onChange={handleDistanceRangeChange}
        aria-labelledby="distance-slider"
        // valueLabelDisplay="auto"
        step={1}
        marks={marks}
        min={0}
        max={distanceValues.length - 1}
        sx={{
            ...(isMobile
                ? { height: "4px", margin: "0 auto" } //height: "300px"
                : { width: "400px", mx: "10px" }),
            color: "#1976d2",
        }}
    />
  );
};

export default DistanceSlider;