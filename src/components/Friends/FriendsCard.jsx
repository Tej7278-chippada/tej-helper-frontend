// /src/components/Friends/FriendsCard.jsx
import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Avatar, 
  Rating, 
  IconButton,
  Tooltip,
  Badge,
  Button
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import {
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Link as LinkIcon,
  ChatRounded,
  QuestionAnswerRounded,
  CakeRounded,
  TransgenderRounded,
  InterestsRounded,
  SearchRounded,
  MessageRounded,
  PersonAddRounded,
  FavoriteRounded,
  BusinessCenterRounded,
  SportsSoccerRounded,
  FlightRounded,
  SchoolRounded,
  HandshakeRounded,
  AccessTimeRounded,
  PeopleRounded,
  Circle,
  FiberManualRecord,
  // TransgenderRounded,
  ManRounded,
  WomanRounded,
  PersonRounded,
} from '@mui/icons-material';

const FriendsCard = ({ user, onClick, darkMode }) => {

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return null;

    if (distance < 1) {
      return `${Math.round(distance * 1000)} m away`;
    }

    return `${distance.toFixed(1)} km away`;
  };

  const formatLastSeen = (date) => {
    if (!date) return 'Never active';
    
    const now = new Date();
    const lastSeen = new Date(date);
    const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityStatus = (lastLoginAt) => {
    if (!lastLoginAt) return { color: '#9e9e9e', label: 'Offline', icon: <FiberManualRecord fontSize="small" /> };
    
    const lastSeen = new Date(lastLoginAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));
    
    if (diffInMinutes < 5) return { color: '#4caf50', label: 'Online', icon: <FiberManualRecord fontSize="small" /> };
    if (diffInMinutes < 60) return { color: '#ff9800', label: 'Recently active', icon: <AccessTimeRounded fontSize="small" /> };
    return { color: '#9e9e9e', label: 'Offline', icon: <FiberManualRecord fontSize="small" /> };
  };
  
  const getGenderIcon = (gender) => {
    switch(gender) {
      case 'Male': return <span style={{ color: '#2196f3' }}><ManRounded fontSize="small" /></span>; // ♂
      case 'Female': return <span style={{ color: '#e91e63' }}><WomanRounded fontSize="small" /></span>; //♀
      case 'Non-binary': return <span style={{ color: '#9c27b0' }}><TransgenderRounded fontSize="small" /></span>; // ⚧
      case 'Other': return <span style={{ color: '#ff9800' }}><PersonRounded fontSize="small" /></span>; // ⚥
      default: return <TransgenderRounded fontSize="small" />;
    }
  };
  
  // Helper function to detect social platform from URL
  const detectSocialPlatform = (url) => {
    if (!url) return 'other';
    
    const lowerUrl = url.toLowerCase();
    
    for (const [platform, data] of Object.entries(SOCIAL_MEDIA_PLATFORMS)) {
      if (platform !== 'other' && data.pattern.test(lowerUrl.replace('https://', '').replace('http://', ''))) {
        return platform;
      }
    }
    
    return 'other';
  };
  
  // Helper function to get social media icon component
  const getSocialIcon = (platform, fontSize = 'small', color = 'inherit') => {
    const icons = {
      whatsapp: <WhatsAppIcon fontSize={fontSize} sx={{ color }} />,
      telegram: <TelegramIcon fontSize={fontSize} sx={{ color }} />,
      instagram: <InstagramIcon fontSize={fontSize} sx={{ color }} />,
      facebook: <FacebookIcon fontSize={fontSize} sx={{ color }} />,
      twitter: <TwitterIcon fontSize={fontSize} sx={{ color }} />,
      linkedin: <LinkedInIcon fontSize={fontSize} sx={{ color }} />,
      youtube: <YouTubeIcon fontSize={fontSize} sx={{ color }} />,
      discord: <ChatRounded fontSize={fontSize} sx={{ color }} />,
      snapchat: <QuestionAnswerRounded fontSize={fontSize} sx={{ color }} />,
      other: <LinkIcon fontSize={fontSize} sx={{ color }} />
    };
    return icons[platform] || <LinkIcon fontSize={fontSize} sx={{ color }} />;
  };
  
  // Social media platform options with icons, colors, and domain patterns
  const SOCIAL_MEDIA_PLATFORMS = {
    whatsapp: {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: 'WhatsApp',
      color: '#25D366',
      domain: 'https://wa.me/',
      placeholder: 'wa.me/yournumber',
      pattern: /^wa\.me\/.+/
    },
    telegram: {
      id: 'telegram',
      label: 'Telegram',
      icon: 'Telegram',
      color: '#0088cc',
      domain: 'https://t.me/',
      placeholder: 't.me/username',
      pattern: /^t\.me\/.+/
    },
    instagram: {
      id: 'instagram',
      label: 'Instagram',
      icon: 'Instagram',
      color: '#E4405F',
      domain: 'https://instagram.com/',
      placeholder: 'instagram.com/username',
      pattern: /^instagram\.com\/.+/
    },
    facebook: {
      id: 'facebook',
      label: 'Facebook',
      icon: 'Facebook',
      color: '#1877F2',
      domain: 'https://facebook.com/',
      placeholder: 'facebook.com/profile',
      pattern: /^facebook\.com\/.+/
    },
    twitter: {
      id: 'twitter',
      label: 'Twitter',
      icon: 'Twitter',
      color: '#1DA1F2',
      domain: 'https://twitter.com/',
      placeholder: 'twitter.com/username',
      pattern: /^twitter\.com\/.+/
    },
    linkedin: {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: 'LinkedIn',
      color: '#0A66C2',
      domain: 'https://linkedin.com/in/',
      placeholder: 'linkedin.com/in/username',
      pattern: /^linkedin\.com\/in\/.+/
    },
    youtube: {
      id: 'youtube',
      label: 'YouTube',
      icon: 'YouTube',
      color: '#FF0000',
      domain: 'https://youtube.com/',
      placeholder: 'youtube.com/c/username',
      pattern: /^youtube\.com\/.+/
    },
    discord: {
      id: 'discord',
      label: 'Discord',
      icon: 'Discord',
      color: '#5865F2',
      domain: 'https://discord.gg/',
      placeholder: 'discord.gg/invite-code',
      pattern: /^discord\.gg\/.+/
    },
    snapchat: {
      id: 'snapchat',
      label: 'Snapchat',
      icon: 'Snapchat',
      color: '#FFFC00',
      domain: 'https://snapchat.com/add/',
      placeholder: 'snapchat.com/add/username',
      pattern: /^snapchat\.com\/add\/.+/
    },
    other: {
      id: 'other',
      label: 'Other',
      icon: 'Link',
      color: darkMode ? '#888' : '#666',
      domain: '',
      placeholder: 'Enter full URL',
      pattern: /^https?:\/\/.+/
    }
  };

  const lookingForIcons = {
    'Friendship': <PeopleRounded fontSize="small" />,
    'Dating': <FavoriteRounded fontSize="small" />,
    'Networking': <BusinessCenterRounded fontSize="small" />,
    'Activity Partners': <SportsSoccerRounded fontSize="small" />,
    'Travel Buddies': <FlightRounded fontSize="small" />,
    'Study Partners': <SchoolRounded fontSize="small" />,
    'Business Connections': <HandshakeRounded fontSize="small" />
  };

  const activityStatus = getActivityStatus(user.lastLoginAt);

  return (
    <Card 
      sx={{ 
        cursor: 'pointer', 
        borderRadius: 3,
        backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        transition: 'all 0.3s ease',
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: darkMode 
            ? '0 12px 30px rgba(33, 150, 243, 0.25)' 
            : '0 12px 30px rgba(33, 150, 243, 0.15)',
          borderColor: '#2196f3',
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Header Section */}
        <Box display="flex" alignItems="flex-start" gap={1.5} mb={1}>
          {/* Profile Picture with Activity Badge */}
          {/* <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Tooltip title={activityStatus.label}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: activityStatus.color,
                    border: `2px solid ${darkMode ? '#1e1e1e' : '#fff'}`,
                  }}
                />
              </Tooltip>
            }
          > */}
            <Avatar 
              src={user.profilePic ? `data:image/jpeg;base64,${user.profilePic}` : null}
              sx={{ 
                width: 70, 
                height: 70,
                border: `2px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`
              }}
            >
              {!user.profilePic && user.username?.charAt(0).toUpperCase()}
            </Avatar>
          {/* </Badge> */}
          
          <Box flex={1} minWidth={0}>
            {/* Username and Verification */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {user.username}
                </Typography>
                {user.idVerification?.status === 'approved' && (
                  <Tooltip title="Verified Profile">
                    <VerifiedIcon color="primary" fontSize="small" />
                  </Tooltip>
                )}
              </Box>
              <Chip
                label={activityStatus.label}
                size="small"
                icon={activityStatus.icon}
                sx={{
                  backgroundColor: `${activityStatus.color}15`,
                  color: activityStatus.color,
                  fontSize: '0.7rem',
                  height: 22,
                  '& .MuiChip-icon': { fontSize: '0.8rem', color: activityStatus.color }
                }}
              />
            </Box>
            
            {/* Basic Info */}
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <LocationOnIcon sx={{ fontSize: 16, color: '#ff5722' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {formatDistance(user.distance) || 'Unknown'}
                </Typography>
              </Box>
              
              {user.friendsProfile?.gender && user.friendsProfile.gender !== 'Unknown' && (
                <Box display="flex" alignItems="center" gap={0.2}>
                  {getGenderIcon(user.friendsProfile.gender)}
                  <Typography variant="caption" color="text.secondary">
                    {user.friendsProfile.gender}
                  </Typography>
                </Box>
              )}
              
              {user.friendsProfile?.age && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CakeRounded sx={{ fontSize: 16, color: '#9c27b0', mb: 0.5 }} />
                  <Typography variant="caption" color="text.secondary" >
                    {user.friendsProfile.age} yrs
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* User Code */}
            {/* <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              ID: {user.userCode}
            </Typography> */}
          </Box>
        </Box>
        
        {/* Profile Description */}
        {user.profileDescription ? (
          <Typography variant="body2" color="text.secondary" paragraph sx={{ 
            mb: 1, 
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {user.profileDescription}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" paragraph sx={{ 
            mb: 2, 
            // fontStyle: 'italic',
            opacity: 0.7
          }}>
            No bio yet
          </Typography>
        )}
        
        {/* Looking For Section */}
        {user.friendsProfile?.lookingFor && user.friendsProfile.lookingFor.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              <SearchRounded sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              Looking for
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {user.friendsProfile.lookingFor.slice(0, 3).map((item, index) => (
                <Chip
                  key={index}
                  label={item}
                  size="small"
                  icon={lookingForIcons[item] || <SearchRounded fontSize="small" />}
                  sx={{
                    borderRadius: '6px',
                    backgroundColor: darkMode ? '#f5f5f5' : '#e3f2fd',
                    color: '#1565c0',
                    fontSize: '0.7rem',
                    height: 20,
                    '& .MuiChip-icon': { fontSize: '0.8rem', color: '#1565c0' }
                  }}
                />
              ))}
              {user.friendsProfile.lookingFor.length > 3 && (
                <Chip
                  label={`+${user.friendsProfile.lookingFor.length - 3}`}
                  size="small"
                  sx={{
                    borderRadius: '6px',
                    backgroundColor: darkMode ? '#f5f5f5' : '#e3f2fd',
                    color: '#1565c0',
                    fontSize: '0.7rem',
                    height: 20
                  }}
                />
              )}
            </Box>
          </Box>
        )}
        
        {/* Hobbies Section */}
        {user.friendsProfile?.hobbies && user.friendsProfile.hobbies.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              <InterestsRounded sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              Interests
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {user.friendsProfile.hobbies.slice(0, 4).map((hobby, index) => (
                <Chip
                  key={index}
                  label={hobby}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    height: 20,
                    borderColor: '#9c27b0',
                    color: '#9c27b0'
                  }}
                />
              ))}
              {user.friendsProfile.hobbies.length > 4 && (
                <Chip
                  label={`+${user.friendsProfile.hobbies.length - 4}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    height: 20
                  }}
                />
              )}
            </Box>
          </Box>
        )}
        
        {/* Stats and Contact Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pt: 1, mt: 1.5,
          borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
        }}>
          {/* Left: Stats */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {/* Trust Level */}
            <Tooltip title="Trust Rating">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Rating 
                  value={user.trustLevel || 0} 
                  size="small" 
                  readOnly 
                  precision={0.5}
                  sx={{ fontSize: '1rem' }}
                />
                <Typography variant="caption" color="text.secondary">
                  {user.trustLevel > 0 ? user.trustLevel.toFixed(1) : 'N/A'}
                </Typography>
              </Box>
            </Tooltip>
            
            {/* Followers */}
            <Tooltip title="Followers">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PeopleRounded sx={{ fontSize: 16, color: '#757575' }} />
                <Typography variant="caption" color="text.secondary">
                  {user.followerCount || 0}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
          
          {/* Right: Contact Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* In-App Messaging */}
            {user.friendsProfile?.inAppMessaging && (
              <Tooltip title="Accepts in-app messages">
                <MessageRounded sx={{ 
                  fontSize: 18, 
                  color: '#4caf50',
                  backgroundColor: darkMode ? '#333333' : '#e8f5e9',
                  borderRadius: '50%',
                  p: 0.5
                }} />
              </Tooltip>
            )}
            
            {/* Contact Methods */}
            {(user.friendsProfile?.contactWay?.phone || user.friendsProfile?.contactWay?.email) && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {user.friendsProfile.contactWay.phone && (
                  <Tooltip title="Phone available">
                    <PhoneIcon sx={{ fontSize: 18, color: '#0088cc' }} />
                  </Tooltip>
                )}
                {user.friendsProfile.contactWay.email && (
                  <Tooltip title="Email available">
                    <EmailIcon sx={{ fontSize: 18, color: '#e4405f' }} />
                  </Tooltip>
                )}
              </Box>
            )}
            
            {/* Social Media Count */}
            {user.friendsProfile?.contactWay?.socialMedia && user.friendsProfile.contactWay.socialMedia.length > 0 && (
              <Tooltip title={`${user.friendsProfile.contactWay.socialMedia.length} social profiles`}>
                <Chip
                  label={user.friendsProfile.contactWay.socialMedia.length}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    backgroundColor: darkMode ? '#333333' : '#f5f5f5'
                  }}
                />
              </Tooltip>
            )}
          </Box>
        </Box>
        
        {/* Last Active */}
        <Typography variant="caption" color="text.secondary" sx={{ 
          display: 'block', 
          mt: 1,
          textAlign: 'center',
          opacity: 0.7
        }}>
          Last active: {formatLastSeen(user.lastLoginAt)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FriendsCard;