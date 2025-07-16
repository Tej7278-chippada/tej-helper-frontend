// components/Friends/Friends.js
import React, { useState, useEffect } from 'react';
// import { Alert, Box, Snackbar, Switch, Typography } from '@mui/material';
import { 
    Alert, 
    Box, 
    Snackbar, 
    Switch, 
    Typography, 
    Card, 
    CardContent,
    Chip,
    IconButton,
    Tooltip,
    Fade,
    CircularProgress
} from '@mui/material';
import { 
    Visibility, 
    VisibilityOff, 
    People, 
    Info,
    Shield,
    LocationOn
} from '@mui/icons-material';
import API from '../api/api';

const Friends = ({ isMobile , darkMode, setSnackbar}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [loadingProfileVisibility, setLoadingProfileVisibility] = useState(false);

    useEffect(() => {
        // Fetch initial visibility status when component mounts
        const fetchVisibility = async () => {
            setLoadingProfileVisibility(true);
            try {
                const authToken = localStorage.getItem('authToken');
                const id = localStorage.getItem('userId');
                const response = await API.get(`/api/auth/friendsProfile/${id}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setIsVisible(response.data.friendsProfile || false);
            } catch (error) {
                console.error('Error fetching profile visibility:', error);
            } finally {
                setLoadingProfileVisibility(false);
            }
        };
        fetchVisibility();
    }, []);

    const handleToggle = async (event) => {
        const newVisibility = event.target.checked;
        setIsVisible(newVisibility);
        
        try {
            const authToken = localStorage.getItem('authToken');
            await API.patch('/api/auth/friends-profile', {
                friendsProfile: newVisibility
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setSnackbar({
                open: true,
                message: newVisibility 
                    ? 'Your profile is now visible to nearby friends. They can discover and connect with you.' 
                    : 'Your profile is now hidden from nearby friends. Others won\'t be able to find you in searches.',
                severity: newVisibility ? 'success' : 'info'
            });
        } catch (error) {
            console.error('Error updating profile visibility:', error);
            // Revert if API call fails
            setIsVisible(!newVisibility);
            setSnackbar({
                open: true,
                message: 'Failed to update visibility settings. Please try again later.',
                severity: 'error'
            });
        }
    };

    // const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    return (
        <Box mb={1} sx={{ background: 'rgba(255, 255, 255, 0)',  backdropFilter: 'blur(10px)', paddingTop: '1rem', paddingBottom: '1rem', mx: isMobile ? '6px' : '8px', paddingInline: isMobile ? '8px' : '10px', borderRadius: '10px' }}>
            {/* Enhanced Profile Visibility Toggle Card */}
            <Card sx={{ 
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                position: 'relative',
                mb: 2
            }}>
                <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                    {/* Header Section */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        gap: 1
                    }}>
                        <People sx={{ 
                            color: 'primary.main', 
                            fontSize: isMobile ? '1.2rem' : '1.4rem' 
                        }} />
                        <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ 
                            fontWeight: 600,
                            color: 'text.primary'
                        }}>
                            Friend Discovery
                        </Typography>
                        <Tooltip title="Control who can find and connect with you">
                            <IconButton size="small" sx={{ ml: 'auto' }}>
                                <Info sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Status Chip */}
                    <Box sx={{ mb: 2 }}>
                        <Chip
                            icon={isVisible ? <Visibility /> : <VisibilityOff />}
                            label={isVisible ? 'Visible to Friends' : 'Hidden from Friends'}
                            color={isVisible ? 'success' : 'default'}
                            variant={isVisible ? 'filled' : 'outlined'}
                            size="small"
                            sx={{ 
                                fontWeight: 500,
                                '& .MuiChip-icon': {
                                    fontSize: '0.9rem'
                                }
                            }}
                        />
                    </Box>

                    {/* Toggle Section */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        p: 2,
                        borderRadius: '12px',
                        backgroundColor: isVisible 
                            ? 'rgba(76, 175, 80, 0.08)' 
                            : 'rgba(158, 158, 158, 0.08)',
                        border: `1px solid ${isVisible 
                            ? 'rgba(76, 175, 80, 0.2)' 
                            : 'rgba(158, 158, 158, 0.2)'}`,
                        transition: 'all 0.3s ease-in-out'
                    }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ 
                                fontWeight: 500,
                                color: 'text.primary',
                                mb: 0.5
                            }}>
                                Profile Visibility
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.875rem'
                            }}>
                                {isVisible 
                                    ? 'Friends can discover and connect with you' 
                                    : 'Stay hidden from friend searches'}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1 
                        }}>
                            {loadingProfileVisibility && (
                                <CircularProgress size={20} sx={{ color: 'primary.main' }} />
                            )}
                            <Switch
                                checked={isVisible}
                                onChange={handleToggle}
                                disabled={loadingProfileVisibility}
                                color="primary"
                                size="medium"
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: 'success.main',
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: 'success.main',
                                    },
                                    '& .MuiSwitch-track': {
                                        backgroundColor: 'rgba(158, 158, 158, 0.3)',
                                    }
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Privacy Notice */}
                    <Fade in={isVisible}>
                        <Box sx={{ 
                            mt: 2,
                            p: 1.5,
                            backgroundColor: 'rgba(33, 150, 243, 0.08)',
                            borderRadius: '10px',
                            border: '1px solid rgba(33, 150, 243, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            <LocationOn sx={{ 
                                color: 'info.main', 
                                fontSize: '1rem' 
                            }} />
                            <Typography variant="caption" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.8rem'
                            }}>
                                Your location is only shared with confirmed friends
                            </Typography>
                        </Box>
                    </Fade>
                </CardContent>
            </Card>

            {/* Coming Soon Section */}
            <Card sx={{ 
                background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.05) 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(25, 118, 210, 0.2)',
                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.1)'
            }}>
                <CardContent sx={{ 
                    textAlign: 'center', 
                    p: isMobile ? 2 : 3
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: 1.5 
                    }}>
                        <Shield sx={{ 
                            color: 'primary.main', 
                            fontSize: '2rem' 
                        }} />
                    </Box>
                    <Typography variant="h6" sx={{ 
                        fontWeight: 600,
                        color: 'primary.main',
                        mb: 1
                    }}>
                        Coming Soon
                    </Typography>
                    <Typography variant="body2" sx={{ 
                        color: 'text.secondary',
                        mb: 1
                    }}>
                        The Friends feature is currently in development and will be available soon.
                    </Typography>
                    <Typography variant="body2" sx={{ 
                        color: 'text.secondary',
                        fontStyle: 'italic'
                    }}>
                        Discover and connect with friends in your area!
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Friends;