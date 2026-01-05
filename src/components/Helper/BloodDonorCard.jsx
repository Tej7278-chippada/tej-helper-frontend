import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Avatar, Rating } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';

const BloodDonorCard = ({ donor, onClick, darkMode }) => {

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return null;

    if (distance < 1) {
      return `${Math.round(distance * 1000)} m away`;
    }

    return `${distance.toFixed(1)} km away`;
  };

  return (
    <Card 
      sx={{ 
        cursor: 'pointer', 
        // mb: 2,
        borderRadius: 3,
        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
        transition: 'all 0.3s ease',
        WebkitTapHighlightColor: 'transparent', // Remove tap highlight
        WebkitTouchCallout: 'none', // Disable iOS callout
        WebkitUserSelect: 'none', // Disable text selection
        userSelect: 'none', // Disable text selection
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: darkMode 
            ? '0 8px 25px rgba(220, 53, 69, 0.3)' 
            : '0 8px 25px rgba(220, 53, 69, 0.2)',
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="flex-start" gap={2} mb={1}>
          {/* Profile Picture */}
          <Avatar 
            src={donor.profilePic ? `data:image/jpeg;base64,${donor.profilePic}` : null}
            sx={{ 
              width: 60, 
              height: 60,
              // border: `2px solid ${donor.bloodDonor?.bloodGroup === 'O+' ? '#dc3545' : '#1976d2'}`
            }}
          >
            {!donor.profilePic && donor.username?.charAt(0).toUpperCase()}
          </Avatar>
          
          <Box flex={1}>
            {/* Username and Verification */}
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {donor.username}
              </Typography>
              {donor.idVerification?.status === 'approved' && (
                <VerifiedIcon color="success" fontSize="small" />
              )}
            </Box>
            
            {/* Blood Group and Distance */}
            <Box display="flex" gap={1} alignItems="center" mb={1}>
              <Chip 
                label={`Blood Group: ${donor.bloodDonor?.bloodGroup || 'Unknown'}`}
                color="error"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
              <Box display="flex" alignItems="center">
                <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {/* {donor.distance?.toFixed(1)} km away */}
                  {formatDistance(donor.distance) ? `${formatDistance(donor.distance)}` : ''}
                </Typography>
              </Box>
            </Box>
            
            
          </Box>
        </Box>
        {/* Profile Description */}
        {donor.profileDescription ? (
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
            {donor.profileDescription.length > 100 
              ? `${donor.profileDescription.substring(0, 100)}...`
              : donor.profileDescription
            }
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1, fontStyle: 'italic' }}>
            No profile description provided.
          </Typography>
        )}
        
        {/* Additional Info */}
        <Box display="flex" gap={1} flexWrap="wrap">
          {/* Trust Level */}
          <Chip 
            label={
              <Box display="flex" alignItems="center">
                <Rating value={donor.trustLevel || 0} size="small" readOnly />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  ({donor.trustLevel > 0 ? `${donor.trustLevel}/5` : 'N/A'})
                </Typography>
              </Box>
            }
            variant="outlined"
            size="small"
          />
          
          {/* Last Donated */}
          {donor.bloodDonor?.lastDonated?.[0] && (
            <Chip 
              label={`Last donated: ${new Date(donor.bloodDonor.lastDonated[0]).toLocaleDateString()}`}
              variant="outlined"
              size="small"
              color="info"
            />
          )}
          
          {/* Follower Count */}
          <Chip 
            label={`${donor.followerCount || 0} followers`}
            variant="outlined"
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default BloodDonorCard;