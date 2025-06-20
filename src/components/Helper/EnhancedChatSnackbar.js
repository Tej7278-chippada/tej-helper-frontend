import React from 'react';
import {
  Snackbar,
  Alert,
  Button,
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  useMediaQuery,
  useTheme,
  Slide,
  Paper
} from '@mui/material';
import {
  MarkUnreadChatAltRounded as ChatIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Article as ArticleIcon,
  Schedule as TimeIcon
} from '@mui/icons-material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

// Custom transition component
function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

// Enhanced Snackbar Component
const EnhancedChatSnackbar = ({ 
  chatNotificationView, 
  setChatNotificationView, 
  chatNotificationData, 
  chatNotificationPath, 
  navigate,
  darkMode = false 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Handle close
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setChatNotificationView({ ...chatNotificationView, open: false });
  };

  // Handle navigation
  const handleViewChat = () => {
    navigate(chatNotificationPath);
    setChatNotificationView({ ...chatNotificationView, open: false });
  };

  // Get theme colors
  const getColors = () => {
    if (darkMode) {
      return {
        primary: '#1976d2',
        background: 'rgba(18, 18, 18, 0.95)',
        surface: 'rgba(255, 255, 255, 0.1)',
        text: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.7)',
        accent: '#ffd700',
        border: 'rgba(255, 255, 255, 0.2)'
      };
    }
    return {
      primary: '#1976d2',
      background: 'rgba(255, 255, 255, 0.95)',
      surface: 'rgba(0, 0, 0, 0.05)',
      text: '#333333',
      textSecondary: 'rgba(0, 0, 0, 0.6)',
      accent: '#ff9800',
      border: 'rgba(0, 0, 0, 0.1)'
    };
  };

  const getGlassmorphismStyle1 = (theme, darkMode) => ({
  background: darkMode 
    ? 'rgba(205, 201, 201, 0.15)' 
    : 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  border: darkMode 
    ? '1px solid rgba(255, 255, 255, 0.1)' 
    : '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: darkMode 
    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
});

  const colors = getGlassmorphismStyle1(theme, darkMode);

  // Truncate text function
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Format notification data
  const formatNotificationData = (data) => {
    if (!data) return { senderName: 'Unknown', postTitle: 'Unknown Post' };
    
    if (typeof data === 'string') {
      return { senderName: data, postTitle: 'Message' };
    }
    
    return {
      senderName: data.senderName || 'Unknown User',
      postTitle: data.postTitle || 'Post',
      text: data.text || 'message',
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
    };
  };

  const notificationInfo = formatNotificationData(chatNotificationData);

  return (
    <Snackbar
      open={chatNotificationView.open}
      autoHideDuration={8000}
      onClose={handleClose}
      anchorOrigin={{ 
        vertical: "bottom", 
        horizontal: "right" // horizontal: isMobile ? "center" : "right" 
      }}
      TransitionComponent={SlideTransition}
      sx={{
        bottom: isMobile ? 60 : 80,
        right: isMobile ? 10 : 20,
        left: isMobile ? 'auto' : 'auto',
        // width: isMobile ? '100%' : '100%',
        maxWidth: isMobile ? '200px' : '300px', minWidth: '200px', width: '100%',
        // px: isMobile ? 2 : 0,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: isMobile ? '300px' : '300px',
          backgroundColor: colors.background,
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
        //   position: 'relative',
        }}
      >
        {/* Header */}
        {/* <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            pb: 1.5,
            borderBottom: `1px solid ${colors.border}`,
            background: `linear-gradient(135deg, ${colors.primary}22, ${colors.accent}11)`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              }}
            >
              <ChatIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  color: colors.text,
                  fontWeight: 700,
                  fontSize: '16px',
                  lineHeight: 1.2,
                }}
              >
                New Message
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: colors.textSecondary,
                  fontSize: '12px',
                }}
              >
                Just now
              </Typography>
            </Box>
          </Box>
          
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{
              color: colors.textSecondary,
              '&:hover': {
                backgroundColor: colors.surface,
                color: colors.text,
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box> */}

        {/* Content */}
        <Box sx={{ p: isMobile ? 1 : 2, pt: isMobile ? 1 : 1.5, px: 2 }}>
          {/* Post Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0 }}>
            <ArticleIcon 
              sx={{ 
                color: colors.accent, 
                fontSize: 18, 
                mr: 1,
                opacity: 0.8 
              }} 
            />
            <Typography
              variant="body2"
              sx={{
                color: colors.text,
                fontWeight: 600,
                fontSize: '14px',
                flex: 1,
              }}
            >
              {truncateText(notificationInfo.postTitle, isMobile ? 10 : 20)}
            </Typography>
            <IconButton onClick={handleClose}>
            <CloseRoundedIcon 
              sx={{ 
                color: colors.accent, 
                fontSize: 18, 
                // mr: 1,
                opacity: 0.8 
              }} 
            />
            </IconButton>
          </Box>

          {/* Sender Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0 }}>
            {!isMobile && <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: 14,
                fontWeight: 600,
                mr: 1.5,
                backgroundColor: colors.primary,
                border: `2px solid ${colors.surface}`,
              }}
            >
              {notificationInfo.senderName?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: colors.text,
                  fontWeight: 600,
                  fontSize: '13px',
                  lineHeight: 1.2,
                }}
              >
                {notificationInfo.senderName}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                    color: colors.text,
                    fontSize: '13px',
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                }}
                >
                "{truncateText(notificationInfo.text, isMobile ? 10 : 20)}"
                </Typography>
              {/* <Typography
                variant="caption"
                sx={{
                  color: colors.textSecondary,
                  fontSize: '11px',
                }}
              >
                sent you a message
              </Typography> */}
            </Box>
            <Button
              variant="outlined"
              size="small"
            //   startIcon={<ChatIcon sx={{ fontSize: 16 }} />}
              onClick={handleViewChat}
              sx={{
                flex: 2, maxWidth: '40px', ml: 1,
                // backgroundColor: colors.primary,
                // color: '#fff',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '12px',
                p: '4px 12px',
                boxShadow: `0 4px 12px ${colors.primary}40`,
                '&:hover': {
                  backgroundColor: colors.primary,
                  opacity: 0.9,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 6px 16px ${colors.primary}50`,
                }
              }}
            >
              View
            </Button>
          </Box>

          {/* Message Preview */}
          {/* <Box
            sx={{
              backgroundColor: colors.surface,
              borderRadius: '12px',
              p: 1.5,
              mb: 2,
              borderLeft: `4px solid ${colors.primary}`,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: `linear-gradient(90deg, ${colors.primary}, transparent)`,
              }
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: colors.text,
                fontSize: '13px',
                lineHeight: 1.5,
                fontStyle: 'italic',
              }}
            >
              "{truncateText(chatNotificationDataMessage, 80)}"
            </Typography>
          </Box> */}

          {/* Action Buttons */}
          {/* <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleClose}
              sx={{
                flex: 1,
                color: colors.textSecondary,
                borderColor: colors.border,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '12px',
                py: 1,
                '&:hover': {
                  backgroundColor: colors.surface,
                  borderColor: colors.textSecondary,
                }
              }}
            >
              Dismiss
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<ChatIcon sx={{ fontSize: 16 }} />}
              onClick={handleViewChat}
              sx={{
                flex: 2,
                backgroundColor: colors.primary,
                color: '#fff',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '12px',
                py: 1,
                boxShadow: `0 4px 12px ${colors.primary}40`,
                '&:hover': {
                  backgroundColor: colors.primary,
                  opacity: 0.9,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 6px 16px ${colors.primary}50`,
                }
              }}
            >
              View Chat
            </Button>
          </Box> */}
        </Box>

        {/* Animated Border */}
        {/* <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent}, ${colors.primary})`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s ease-in-out infinite',
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '-200% 0' },
              '100%': { backgroundPosition: '200% 0' },
            },
          }}
        /> */}
      </Paper>
    </Snackbar>
  );
};

export default EnhancedChatSnackbar;