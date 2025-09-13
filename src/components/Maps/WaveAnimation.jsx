import React, { useEffect, useState } from 'react';
import { Circle } from 'react-leaflet';
import { styled, keyframes } from '@mui/material/styles';

// Keyframes for wave animation
const waveAnimation = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
`;

// Styled component for wave circles (if you need DOM-based waves)
const WaveCircle = styled('div')(({ theme, delay, size }) => ({
  position: 'absolute',
  borderRadius: '50%',
  border: `2px solid ${theme.palette.primary.main}`,
  animation: `${waveAnimation} 2s ease-out infinite`,
  animationDelay: `${delay}s`,
  width: size,
  height: size,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none',
  zIndex: 1000,
}));

// Wave animation component using Leaflet Circles
const WaveAnimationCircles = ({ center, loading, distanceRange }) => {
  const [waves, setWaves] = useState([]);

  useEffect(() => {
    if (!loading) {
      setWaves([]);
      return;
    }

    const createWave = (id, delay) => ({
      id,
      delay,
      opacity: 1,
      radius: 0,
    });

    // Create initial waves
    const initialWaves = [
      createWave(1, 0),
      createWave(2, 0.5),
      createWave(3, 1),
      createWave(4, 1.5),
    ];

    setWaves(initialWaves);

    const interval = setInterval(() => {
      setWaves(currentWaves => {
        const newWaves = currentWaves.map(wave => {
          const progress = (Date.now() / 1000 - wave.delay) % 2; // 2 second cycle
          const normalizedProgress = Math.max(0, Math.min(1, progress / 2));
          
          return {
            ...wave,
            radius: normalizedProgress * distanceRange * 1000, // Scale to current distance range
            opacity: 1 - normalizedProgress,
          };
        });

        return newWaves;
      });
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, [loading, distanceRange]);

  if (!loading || !center) return null;

  return (
    <>
      {waves.map(wave => (
        <Circle
          key={wave.id}
          center={center}
          radius={wave.radius}
          pathOptions={{
            color: '#1976d2',
            fillColor: 'transparent',
            fillOpacity: 0,
            weight: 2,
            opacity: wave.opacity,
            dashArray: '5, 10', // Dashed line for wave effect
          }}
        />
      ))}
    </>
  );
};

// Alternative DOM-based wave animation (overlay on map container)
const DOMWaveAnimation = ({ loading }) => {
  if (!loading) return null;

  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      pointerEvents: 'none',
      zIndex: 1000 
    }}>
      <WaveCircle delay={0} size="100px" />
      <WaveCircle delay={0.5} size="200px" />
      <WaveCircle delay={1} size="300px" />
      <WaveCircle delay={1.5} size="400px" />
    </div>
  );
};



export { WaveAnimationCircles, DOMWaveAnimation };