import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Avatar, Rating } from '@mui/material';
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
} from '@mui/icons-material';

const BloodDonorCard = ({ donor, onClick, darkMode }) => {

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return null;

    if (distance < 1) {
      return `${Math.round(distance * 1000)} m away`;
    }

    return `${distance.toFixed(1)} km away`;
  };

  const donationCount = (donor?.bloodDonor?.donationCount)
    ? donor.bloodDonor.donationCount
    : 0;

  const formatDonateDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-IN', {
      dateStyle: 'medium',
      // timeStyle: 'short',
    }) : '—';

  // const formatDate = (date) =>
  //   date ? new Date(date).toLocaleString('en-IN', {
  //     dateStyle: 'medium',
  //     timeStyle: 'short',
  //   }) : '—';

  const LAST_DONATION_GAP_DAYS = 56; // 8 weeks

  const lastDonationDate =
    donationCount > 0
      ? donor.bloodDonor.lastDonated // latest donation
      : null;

  const getEligibilityInfo = () => {
    if (!lastDonationDate) {
      return { eligible: true, daysLeft: 0 };
    }

    const lastDate = new Date(lastDonationDate);
    const today = new Date();

    const diffTime = today.getTime() - lastDate.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const daysLeft = LAST_DONATION_GAP_DAYS - daysPassed;

    return {
      eligible: daysLeft <= 0,
      daysLeft: daysLeft > 0 ? daysLeft : 0
    };
  };

  const eligibility = getEligibilityInfo();

  
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
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', gap:1, mb: 1 }} >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, flex: 1 }}>
                <Typography variant="h6"
                sx={{ fontWeight: 'bold',
                  // flex: 1,
                  // minWidth: 0, //critical for ellipsis
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {donor.username}
                </Typography>
                {donor.idVerification?.status === 'approved' && (
                  <VerifiedIcon color="success" fontSize="small" />
                )}
              </Box>
              {donationCount > 0 && (
                <Chip
                  label={`Donated ${donationCount} time${donationCount > 1 ? 's' : ''}`}
                  variant="outlined"
                  size="small"
                  // color="success" 
                  sx={{ ml: 'auto', color: '#F57C00', borderColor: '#F57C00' }}
                />
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
          {/* {donor.bloodDonor?.lastDonated?.[0] && (
            <Chip 
              label={`Last donated: ${new Date(donor.bloodDonor.lastDonated[0]).toLocaleDateString()}`}
              variant="outlined"
              size="small"
              color="info"
            />
          )} */}
          
          {/* Follower Count */}
          <Chip 
            label={`${donor.followerCount || 0} followers`}
            variant="outlined"
            size="small"
          />
        </Box>
        <Box sx={{ my: 1 }}>
          <Typography variant="body2" mb={0.5} >
            Contact Medium:
          </Typography>
          {(donor?.bloodDonor?.contactWay?.phone || donor?.bloodDonor?.contactWay?.email ||  donor?.bloodDonor?.contactWay?.socialMedia?.length > 0) ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {donor.bloodDonor.contactWay.phone && <PhoneIcon fontSize="small" sx={{ color: '#0088cc' }} />}
              {donor.bloodDonor.contactWay.email && <EmailIcon fontSize="small" sx={{ color: '#E4405F' }} />}

              {donor.bloodDonor.contactWay.socialMedia.map((social, index) => {
                const platform = detectSocialPlatform(social.url || social.platform);
                const platformData =
                  SOCIAL_MEDIA_PLATFORMS[platform] || SOCIAL_MEDIA_PLATFORMS.other;

                return (
                  <Box key={index} sx={{ color: platformData.color }}> {/* platformData.color */}
                    {getSocialIcon(platform, 'small')}
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" mb={1.5} >
              N/A
            </Typography>
          )}
        </Box>
        <Typography variant="body2" sx={{ mt: 1, color: 'inherit'  }}>
          Last donated: {donor.bloodDonor?.lastDonated?.[0] ? formatDonateDate(lastDonationDate) : 'No donation history yet'} {' '}
          {lastDonationDate && (`(${eligibility.eligible
            ? 'Eligible to donate now'
            : `Eligible in ${eligibility.daysLeft} day${eligibility.daysLeft > 1 ? 's' : ''}`})`)}
        </Typography>
        {/* {lastDonationDate && (
          <Chip
            label={
              eligibility.eligible
                ? 'Eligible to donate now'
                : `Eligible in ${eligibility.daysLeft} day${eligibility.daysLeft > 1 ? 's' : ''}`
            }
            color={eligibility.eligible ? 'success' : 'warning'}
            variant="outlined"
            size="small"
          />
        )} */}
        {/* <Typography variant="body2" sx={{ mt: 1, color: 'inherit'  }}>
          Last seen : {formatDate(donor?.lastLoginAt) || 'Not found'}
        </Typography> */}
      </CardContent>
    </Card>
  );
};

export default BloodDonorCard;