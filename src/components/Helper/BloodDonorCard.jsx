// Enhanced BloodDonorCard.jsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Rating,
  Tooltip,
  Badge
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
  FavoriteRounded,
  // FiberManualRecord,
  // AccessTimeRounded,
  PeopleRounded,
  BloodtypeRounded,
  HistoryRounded,
  ScheduleRounded,
  PhoneRounded,
  // EmailRounded,
  // CakeRounded,
  // TransgenderRounded,
  // ManRounded,
  // WomanRounded,
  // PersonRounded,
} from '@mui/icons-material';

const BloodDonorCard = ({ donor, onClick, darkMode }) => {

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

  // const getActivityStatus = (lastLoginAt) => {
  //   if (!lastLoginAt) return { color: '#9e9e9e', label: 'Offline', icon: <FiberManualRecord fontSize="small" /> };

  //   const lastSeen = new Date(lastLoginAt);
  //   const now = new Date();
  //   const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));

  //   if (diffInMinutes < 5) return { color: '#4caf50', label: 'Online', icon: <FiberManualRecord fontSize="small" /> };
  //   if (diffInMinutes < 60) return { color: '#ff9800', label: 'Recently active', icon: <AccessTimeRounded fontSize="small" /> };
  //   return { color: '#9e9e9e', label: 'Offline', icon: <FiberManualRecord fontSize="small" /> };
  // };

  // const getGenderIcon = (gender) => {
  //   switch (gender) {
  //     case 'Male': return <span style={{ color: '#2196f3' }}><ManRounded fontSize="small" /></span>;
  //     case 'Female': return <span style={{ color: '#e91e63' }}><WomanRounded fontSize="small" /></span>;
  //     case 'Non-binary': return <span style={{ color: '#9c27b0' }}><TransgenderRounded fontSize="small" /></span>;
  //     case 'Other': return <span style={{ color: '#ff9800' }}><PersonRounded fontSize="small" /></span>;
  //     default: return <TransgenderRounded fontSize="small" />;
  //   }
  // };

  const donationCount = (donor?.bloodDonor?.donationCount)
    ? donor.bloodDonor.donationCount
    : 0;

  const formatDonateDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-IN', {
      dateStyle: 'medium',
    }) : '—';

  const LAST_DONATION_GAP_DAYS = 56; // 8 weeks

  const lastDonationDate =
    donationCount > 0
      ? donor.bloodDonor.lastDonated
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

  // const activityStatus = getActivityStatus(donor.lastLoginAt);
  const bloodGroupColor = donor.bloodDonor?.bloodGroup === 'O+' ? '#dc3545' :
    donor.bloodDonor?.bloodGroup?.startsWith('O') ? '#c62828' :
      donor.bloodDonor?.bloodGroup?.startsWith('A') ? '#1976d2' :
        donor.bloodDonor?.bloodGroup?.startsWith('B') ? '#2e7d32' :
          donor.bloodDonor?.bloodGroup?.startsWith('AB') ? '#9c27b0' : '#757575';

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
            ? '0 12px 30px rgba(220, 53, 69, 0.25)'
            : '0 12px 30px rgba(220, 53, 69, 0.15)',
          borderColor: '#dc3545',
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
              src={donor.profilePic ? `data:image/jpeg;base64,${donor.profilePic}` : null}
              sx={{
                width: 70,
                height: 70,
                // border: `2px solid ${bloodGroupColor}`
              }}
            >
              {!donor.profilePic && donor.username?.charAt(0).toUpperCase()}
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
                  {donor.username}
                </Typography>
                {donor.idVerification?.status === 'approved' && (
                  <Tooltip title="Verified Profile">
                    <VerifiedIcon color="success" fontSize="small" />
                  </Tooltip>
                )}
              </Box>
              {/* <Chip
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
              /> */}
            </Box>

            {/* Basic Info */}
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              {/* Blood Group */}
              <Chip
                icon={<BloodtypeRounded sx={{ fontSize: 16 }} />}
                label={donor.bloodDonor?.bloodGroup || 'Unknown'}
                size="small"
                sx={{
                  backgroundColor: `${bloodGroupColor}15`,
                  color: bloodGroupColor,
                  fontWeight: 'bold',
                  border: `1px solid ${bloodGroupColor}40`
                }}
              />

              {/* Distance */}
              <Box display="flex" alignItems="center" gap={0.5}>
                <LocationOnIcon sx={{ fontSize: 16, color: '#ff5722' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {formatDistance(donor.distance) || 'Unknown'}
                </Typography>
              </Box>

              {/* Gender (if available from friendsProfile) */}
              {/* {donor.friendsProfile?.gender && donor.friendsProfile.gender !== 'Unknown' && (
                <Box display="flex" alignItems="center" gap={0.2}>
                  {getGenderIcon(donor.friendsProfile.gender)}
                  <Typography variant="caption" color="text.secondary">
                    {donor.friendsProfile.gender}
                  </Typography>
                </Box>
              )} */}

              {/* Age (if available from friendsProfile) */}
              {/* {donor.friendsProfile?.age && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CakeRounded sx={{ fontSize: 16, color: '#9c27b0' }} />
                  <Typography variant="caption" color="text.secondary">
                    {donor.friendsProfile.age} yrs
                  </Typography>
                </Box>
              )} */}
            </Box>

            {/* Donation Count */}
            {donationCount >= 0 && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <FavoriteRounded sx={{ fontSize: 14, color: '#dc3545' }} />
                <Typography variant="caption" color="text.secondary">
                  Donated {donationCount} time{donationCount > 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Profile Description */}
        {donor.profileDescription ? (
          <Typography variant="body2" color="text.secondary" paragraph sx={{
            mb: 2,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {donor.profileDescription}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" paragraph sx={{
            mb: 2,
            opacity: 0.7
          }}>
            No bio yet
          </Typography>
        )}

        {/* Eligibility Status */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            <ScheduleRounded sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
            Donation Status
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              icon={<HistoryRounded fontSize="small" />}
              label={lastDonationDate ? `Last: ${formatDonateDate(lastDonationDate)}` : 'No history'}
              size="small"
              variant="outlined"
              sx={{
                borderRadius: '12px',
                fontSize: '0.7rem',
                height: 24,
                // borderColor: eligibility.eligible ? '#4caf50' : '#ff9800',
                // color: eligibility.eligible ? '#4caf50' : '#ff9800'
              }}
            />
            <Chip
              label={eligibility.eligible ? 'Ready to donate' : `Ready in ${eligibility.daysLeft}d`}
              size="small"
              sx={{
                borderRadius: '12px',
                backgroundColor: eligibility.eligible ? '#4caf5015' : '#ff980015',
                color: eligibility.eligible ? '#4caf50' : '#ff9800',
                fontSize: '0.7rem',
                height: 24
              }}
            />
          </Box>
        </Box>

        {/* Interests (if available) */}
        {/* {donor.interests && donor.interests.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Interests
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {donor.interests.slice(0, 3).map((interest, index) => (
                <Chip
                  key={index}
                  label={interest}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    height: 20,
                    borderColor: darkMode ? '#555555' : '#9e9e9e',
                    color: darkMode ? '#757575' : '#616161'
                  }}
                />
              ))}
              {donor.interests.length > 3 && (
                <Chip
                  label={`+${donor.interests.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: '8px',
                    borderColor: darkMode ? '#555555' : '#9e9e9e',
                    color: darkMode ? '#757575' : '#616161',
                    fontSize: '0.7rem',
                    height: 20
                  }}
                />
              )}
            </Box>
          </Box>
        )} */}

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
                  value={donor.trustLevel || 0}
                  size="small"
                  readOnly
                  precision={0.5}
                  sx={{ fontSize: '1rem' }}
                />
                <Typography variant="caption" color="text.secondary">
                  {donor.trustLevel > 0 ? donor.trustLevel.toFixed(1) : 'N/A'}
                </Typography>
              </Box>
            </Tooltip>

            {/* Followers */}
            <Tooltip title="Followers">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PeopleRounded sx={{ fontSize: 16, color: '#757575' }} />
                <Typography variant="caption" color="text.secondary">
                  {donor.followerCount || 0}
                </Typography>
              </Box>
            </Tooltip>
          </Box>

          {/* Right: Contact Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Contact Methods */}
            {(donor.bloodDonor?.contactWay?.phone || donor.bloodDonor?.contactWay?.email) && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {donor.bloodDonor.contactWay.phone && (
                  <Tooltip title="Phone available">
                    <Avatar sx={{
                      bgcolor: darkMode ? 'rgba(97, 97, 97, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                      color: '#2196F3',
                      width: 24,
                      height: 24
                    }}>
                      <PhoneRounded sx={{ fontSize: 18 }} />
                    </Avatar>
                  </Tooltip>
                )}
                {/* {donor.bloodDonor.contactWay.email && (
                  <Tooltip title="Email available">
                    <Avatar sx={{
                      bgcolor: darkMode ? 'rgba(97, 97, 97, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                      color: '#E4405F',
                      width: 24,
                      height: 24
                    }}>
                      <EmailRounded sx={{ fontSize: 18 }} />
                    </Avatar>
                  </Tooltip>
                )} */}
              </Box>
            )}

            {/* Social Media */}
            {donor.bloodDonor?.contactWay?.socialMedia?.slice(0, 2).map((social, index) => {
              const platform = detectSocialPlatform(social.url || social.platform);
              const platformData = SOCIAL_MEDIA_PLATFORMS[platform] || SOCIAL_MEDIA_PLATFORMS.other;

              return (
                <Tooltip key={index} title={platformData.label}>
                  <Avatar sx={{
                    bgcolor: darkMode ? 'rgba(97, 97, 97, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                    color: platformData.color,
                    width: 24,
                    height: 24,
                    borderRadius: '50%'
                  }}>
                    {getSocialIcon(platform, '18', platformData.color)}
                  </Avatar>
                </Tooltip>
              );
            })}

            {donor.bloodDonor?.contactWay?.socialMedia?.length > 2 && (
              <Tooltip title={`+${donor.bloodDonor.contactWay.socialMedia.length - 2} more social profiles`}>
                <Chip
                  label={`+${donor.bloodDonor.contactWay.socialMedia.length - 2}`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    backgroundColor: darkMode ? 'rgba(97, 97, 97, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                    color: darkMode ? '#757575' : '#616161'
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
          Last active: {formatLastSeen(donor.lastLoginAt)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default BloodDonorCard;