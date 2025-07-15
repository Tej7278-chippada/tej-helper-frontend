// components/Friends/Friends.js
import React, { useState, useEffect } from 'react';
import { Alert, Box, Snackbar, Switch, Typography } from '@mui/material';
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
                const response = await API.get(`/api/auth/profile/${id}`, {
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

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    return (
        <Box mb={1} sx={{ background: 'rgba(255, 255, 255, 0)',  backdropFilter: 'blur(10px)', paddingTop: '1rem', paddingBottom: '1rem', mx: isMobile ? '6px' : '8px', paddingInline: isMobile ? '8px' : '10px', borderRadius: '10px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', m: '12px', alignItems: 'center', gap: '4px' }}>
            <Typography color="text.secondary">Do you want to make your profile visible to nearby Friends?</Typography>
            <Switch
                color="primary"
                checked={isVisible}
                onChange={handleToggle}
                disabled={loadingProfileVisibility}
            />
        </Box>
        <Box sx={{ 
            textAlign: 'center', 
            p: 3,
            backgroundColor: 'rgba(25, 118, 210, 0.05)',
            borderRadius: '12px',
            mt: 2
            }}>
            <Typography color="text.secondary">
                The Friends feature is currently in development and will be available soon.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Discover and connect with friends in your area!
            </Typography>
        </Box>
        </Box>
    );
};

export default Friends;