// CategoryBar.js - New component to add to your components folder
import React from 'react';
import { Box, Chip } from '@mui/material';
// import { useTheme } from '@emotion/react';
import PaidIcon from '@mui/icons-material/Paid';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import EmergencyIcon from '@mui/icons-material/Emergency';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

const CategoryBar = ({ selectedCategory, onCategorySelect, darkMode, isMobile }) => {
  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const categories = [
    { 
      value: '', 
      label: 'All', 
      icon: <ViewModuleIcon sx={{ fontSize: '18px' }} />,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)'
    },
    { 
      value: 'Paid', 
      label: 'Paid', 
      icon: <PaidIcon sx={{ fontSize: '18px' }} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    { 
      value: 'UnPaid', 
      label: 'Volunteer', 
      icon: <VolunteerActivismIcon sx={{ fontSize: '18px' }} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    { 
      value: 'Emergency', 
      label: 'Emergency', 
      icon: <EmergencyIcon sx={{ fontSize: '18px' }} />,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    }
  ];

  const getGlassmorphismStyle = (darkMode) => ({
    background: darkMode 
      ? 'rgba(30, 30, 30, 0.85)' 
      : 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    border: darkMode 
      ? '1px solid rgba(255, 255, 255, 0.1)' 
      : '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: darkMode 
      ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
      : '0 8px 32px rgba(0, 0, 0, 0.1)',
  });

  return (
    <Box
      sx={{
        ...getGlassmorphismStyle(darkMode),
        m: '12px',
        p: isMobile ? '8px' : '8px',
        borderRadius: '12px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: isMobile ? 1 : 1.5,
          overflowX: 'auto', borderRadius: '6px',
          scrollBehavior: 'smooth', scrollbarWidth: 'none',
        //   pb: 0.5,
          '&::-webkit-scrollbar': {
            height: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(99, 102, 241, 0.5)',
            borderRadius: '10px',
            '&:hover': {
              background: 'rgba(99, 102, 241, 0.7)',
            }
          },
        }}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.value;
          return (
            <Chip
              key={category.value}
              icon={category.icon}
              label={category.label}
              onClick={() => onCategorySelect(category.value)}
              variant={isSelected ? 'filled' : 'outlined'}
              sx={{
                minWidth: 'fit-content',
                height: isMobile ? '36px' : '40px',
                px: isMobile ? 1 : 1.5,
                fontWeight: isSelected ? 600 : 500,
                fontSize: isMobile ? '0.875rem' : '0.9rem',
                borderRadius: '20px',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: isSelected 
                  ? category.color 
                  : category.bgColor,
                color: isSelected 
                  ? 'white' 
                  : category.color,
                border: `1px solid ${category.color}`,
                '&:hover': {
                  backgroundColor: category.color,
                  color: 'white',
                //   transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${category.color}40`,
                },
                '& .MuiChip-icon': {
                  color: isSelected ? 'white' : category.color,
                  marginLeft: isMobile ? '4px' : '8px',
                },
                '&:hover .MuiChip-icon': {
                  color: 'white',
                }
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default CategoryBar;