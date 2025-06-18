// src/contexts/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get saved theme from localStorage or default to light mode
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Create MUI theme based on dark mode state
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#4361ee',
        light: '#6b7fff',
        dark: '#2940d3',
      },
      secondary: {
        main: '#3f37c9',
        light: '#6b5fff',
        dark: '#2815a8',
      },
      background: {
        default: isDarkMode ? '#121212' : '#f5f5f5',
        paper: isDarkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#ffffff' : '#000000',
        secondary: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
  });

  const value = {
    isDarkMode,
    toggleTheme,
    theme,
  };

  return (
    
      <MuiThemeProvider theme={theme}>
        <ThemeContext.Provider value={value}>
        <CssBaseline />
        {children}
        </ThemeContext.Provider>
      </MuiThemeProvider>
    // </ThemeContext.Provider>
  );
};