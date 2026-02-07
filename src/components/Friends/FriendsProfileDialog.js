// src/components/Friends/FriendsProfileDialog.js
import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    CircularProgress,
    Chip,
    Grid,
    Slide, FormGroup, FormControlLabel, Checkbox,
    Switch, Alert, useMediaQuery, Snackbar, Tooltip,  Card, CardContent, Rating, TextField, InputAdornment, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import { AddRounded } from '@mui/icons-material';
import { updateUserFriendsProfile } from '../api/api';


// Social media platform options with icons and domain patterns
const SOCIAL_MEDIA_OPTIONS = [
  { id: 'whatsapp', label: 'WhatsApp', domain: 'wa.me/', placeholder: 'wa.me/yournumber' },
  { id: 'telegram', label: 'Telegram', domain: 't.me/', placeholder: 't.me/username' },
  { id: 'instagram', label: 'Instagram', domain: 'instagram.com/', placeholder: 'instagram.com/username' },
  { id: 'facebook', label: 'Facebook', domain: 'facebook.com/', placeholder: 'facebook.com/profile' },
  { id: 'twitter', label: 'Twitter', domain: 'twitter.com/', placeholder: 'twitter.com/username' },
  { id: 'linkedin', label: 'LinkedIn', domain: 'linkedin.com/in/', placeholder: 'linkedin.com/in/username' },
  { id: 'youtube', label: 'YouTube', domain: 'youtube.com/', placeholder: 'youtube.com/c/username' },
  { id: 'discord', label: 'Discord', domain: 'discord.gg/', placeholder: 'discord.gg/invite-code' },
  { id: 'snapchat', label: 'Snapchat', domain: 'snapchat.com/add/', placeholder: 'snapchat.com/add/username' },
  { id: 'other', label: 'Other', domain: '', placeholder: 'Enter full URL' }
];

const LOOKING_FOR_OPTIONS = [
  'Friendship',
  'Dating',
  'Networking',
  'Activity Partners',
  'Travel Buddies',
  'Study Partners',
  'Business Connections'
];

const FriendsProfileDialog = ({ showEditFriendsDialog,setShowEditFriendsDialog, isMobile, darkMode, setSnackbar,
    friendsProfileData, setFriendsProfileData, error, setError, newSocialLink, setNewSocialLink, id
    }) => {

    const [updating, setUpdating] = useState(false);
    const [hobbies, setHobbies] = useState('');
    // const [newSocialLink, setNewSocialLink] = useState({
    //     platform: '',
    //     url: ''
    // });

    // Handle social media platform change
    const handlePlatformChange = (platformId) => {
        const selectedPlatform = SOCIAL_MEDIA_OPTIONS.find(opt => opt.id === platformId);
        setNewSocialLink({
            platformId,
            url: selectedPlatform?.domain
                ? selectedPlatform.domain
                : ''
        });

    };

    // Handle social media URL change
    const handleSocialUrlChange = (e) => {
        const value = e.target.value;
        setNewSocialLink(prev => ({
            ...prev,
            url: value
        }));
    };

    // Add new social media link
    const addSocialLink = () => {
        if (!newSocialLink.platformId || !newSocialLink.url.trim()) {
        setError('Please select a platform and enter URL');
        return;
        }

        // Validate URL
        // const url = newSocialLink.url.trim();
        // if (!url.startsWith('http://') && !url.startsWith('https://')) {
        //   setError('Please enter a valid URL starting with http:// or https://');
        //   return;
        // }

        setFriendsProfileData(prev => ({
        ...prev,
        socialMedia: [
            ...prev.socialMedia,
            {
            platform: SOCIAL_MEDIA_OPTIONS.find(
                opt => opt.id === newSocialLink.platformId
            )?.label,
            url: !newSocialLink.url.startsWith('https://') ? `https://${newSocialLink.url.trim()}` : newSocialLink.url.trim()
            }
        ]
        }));

        setNewSocialLink({ platform: '', url: '' });
        setError('');
    };

    // Remove social media link
    const removeSocialLink = (index) => {
        setFriendsProfileData(prev => ({
            ...prev,
            socialMedia: prev.socialMedia.filter((_, i) => i !== index)
        }));
    };

    const toggleFriendsProfile = (e) => {
        const isChecked = e.target.checked;
        setFriendsProfileData((prev) => ({
            ...prev,
            friend: isChecked,
            // bloodGroup: isChecked ? prev.bloodGroup : '' // remove group if turned off
        }));
    };

    const handleFriendsDataChange = (e) => {
        const { name, value } = e.target;
        setFriendsProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleInAppMessaging = (e) => {
        const isChecked = e.target.checked;
        setFriendsProfileData(prev => ({
            ...prev,
            inAppMessaging: isChecked
        }));
    };

    const handleUpdateFriendsProfile = async () => {
        try {
            setUpdating(true);
            setError('');

            let emailId = null;
            // Email validation
            if (friendsProfileData.email && friendsProfileData.email.length > 0) {
                if (!friendsProfileData.email.includes('@') || !friendsProfileData.email.endsWith('.com')) {
                    setError('Invalid mail id.');
                    setUpdating(false);
                    return;
                }
                emailId = friendsProfileData.email;
            }

            let phoneNumber = null;
            // Phone validation
            if (friendsProfileData.phone && friendsProfileData.phone.length > 0) {
                if (friendsProfileData.phone.length !== 10 || !/^\d+$/.test(friendsProfileData.phone)) {
                    setError('Invalid mobile number.');
                    setUpdating(false);
                    return;
                }
                phoneNumber = friendsProfileData.phone;
            }

            let ageValue = null;
            if (friendsProfileData.age === '' || friendsProfileData.age === undefined || friendsProfileData.age === null) {
                ageValue = null;
            } else if (friendsProfileData.age !== undefined && friendsProfileData.age !== '') {
                const ageNum = parseInt(friendsProfileData.age);
                if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
                    setError('Age must be between 18 and 120.');
                    setUpdating(false);
                    return;
                }
                ageValue = ageNum;
            }

            // Validate social media URLs
            for (const link of friendsProfileData.socialMedia) {
                try {
                    new URL(link.url);
                } catch {
                    setError(`Invalid URL for ${link.platform}. Please check the format.`);
                    setUpdating(false);
                    return;
                }
            }

            const response = await updateUserFriendsProfile(id, {
                friend: friendsProfileData.friend,
                gender: friendsProfileData.gender,
                phone: phoneNumber,
                email: emailId,
                socialMedia: friendsProfileData.socialMedia,
                inAppMessaging: friendsProfileData.inAppMessaging,
                hobbies: friendsProfileData.hobbies || [],
                age: ageValue,
                lookingFor: friendsProfileData.lookingFor || []
            });
            const updated = response.data.friendsProfile;
            setFriendsProfileData(prev => ({
                ...prev,
                friend: updated.friend ?? false,
                gender: updated.gender || '',
                contactWay: {
                    phone: updated.contactWay?.phone || '',
                    email: updated.contactWay?.email || '',
                    socialMedia: updated.contactWay?.socialMedia || []
                },
                inAppMessaging: updated.inAppMessaging || false,
                hobbies: updated.hobbies || [],
                age: updated.age ?? null,
                lookingFor: updated.lookingFor || []
            }));
            setShowEditFriendsDialog(false);
            setSnackbar({
                open: true,
                message: 'Profile friends Profile updated successfully!',
                severity: 'success'
            });
            setError('');
        } catch (error) {
            console.error('Error updating profile friends data:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Error updating profile friends data',
                severity: 'error'
            });
        } finally {
            setUpdating(false);
        }
    };

    return (
        <Dialog
            open={showEditFriendsDialog}
            onClose={() => setShowEditFriendsDialog(false)}
            fullWidth
            maxWidth="md"
            fullScreen={isMobile}
            TransitionComponent={Slide}
            TransitionProps={{ direction: 'up' }}
            sx={{
                '& .MuiPaper-root': {
                    borderRadius: '14px',
                    backdropFilter: 'blur(12px)',
                },
            }}
        >
            <DialogTitle>Edit Friends Profile Information</DialogTitle>
            <DialogContent>
                <Box >
                    <Box >
                        <Box sx={{ p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Typography variant="body2" fontWeight={500}>
                                    {friendsProfileData.friend
                                        ? "You enabled friends profile!"
                                        : "You turned off friends profile."}
                                </Typography>

                                <Switch
                                    checked={friendsProfileData.friend}
                                    onChange={toggleFriendsProfile}
                                    color="primary"
                                />
                            </Box>

                            {friendsProfileData.friend && (
                                <FormControl fullWidth required sx={{ mt: 2 }}>
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                        value={friendsProfileData.gender || ''}
                                        onChange={(e) =>
                                            setFriendsProfileData({ ...friendsProfileData, gender: e.target.value })
                                        }
                                        label="Gender"
                                        sx={{ borderRadius: 2 }}
                                        required
                                    >
                                        <MenuItem value="Male">Male</MenuItem>
                                        <MenuItem value="Female">Female</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                        <MenuItem value="Unknown">I don't know my gender</MenuItem>
                                    </Select>
                                </FormControl>
                            )}

                            {/* <Typography variant="caption" color="text.secondary" marginTop={4}>
                *If you choose to donate, your blood group will be visible to nearby people who may need emergency blood support.
                </Typography> */}
                        </Box>
                        {friendsProfileData.friend &&
                        <>
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
                            <TextField
                                fullWidth
                                label="Add Interest"
                                value={hobbies}
                                onChange={(e) => setHobbies(e.target.value)}
                                onKeyPress={(e) => {
                                if (e.key === 'Enter' && hobbies.trim()) {
                                    e.preventDefault();
                                    setFriendsProfileData(prev => ({
                                    ...prev,
                                    hobbies: [...(prev.hobbies || []), hobbies.trim()]
                                    }));
                                    setHobbies('');
                                }
                                }}
                                placeholder="Type an interest and press Enter"
                                sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                },
                                }}
                                inputProps={{ maxLength: 20 }}
                                InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                    <Button 
                                        onClick={() => {
                                        if (hobbies.trim()) {
                                            setFriendsProfileData(prev => ({
                                            ...prev,
                                            hobbies: [...(prev.hobbies || []), hobbies.trim()]
                                            }));
                                            setHobbies('');
                                        }
                                        }}
                                        disabled={!hobbies.trim() || friendsProfileData?.hobbies?.length >= 10}
                                        sx={{ borderRadius: '8px' }}
                                    >
                                        Add
                                    </Button>
                                    </InputAdornment>
                                ),
                                }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Typography variant="body2" gutterBottom>Interests</Typography>
                                <Typography variant="caption" color="textSecondary">
                                {friendsProfileData?.hobbies?.length}/10 added
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                {friendsProfileData.hobbies?.map((interest, index) => (
                                <Chip
                                    key={index}
                                    label={interest}
                                    onDelete={() => {
                                    const newInterests = [...friendsProfileData.hobbies];
                                    newInterests.splice(index, 1);
                                    setFriendsProfileData(prev => ({ ...prev, hobbies: newInterests }));
                                    }}
                                    sx={{ borderRadius: '8px' }}
                                />
                                ))}
                            </Box>
                        </Box>

                        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Typography variant="body2" fontWeight={500}>
                                {friendsProfileData.inAppMessaging
                                    ? 'In App Messaging is Turned On.'
                                    : 'In App Messaging is Turned Off.'}
                                </Typography>
                                <Switch
                                checked={friendsProfileData.inAppMessaging}
                                onChange={toggleInAppMessaging}
                                color="primary"
                                />
                            </Box>
                            <Typography variant="caption" color="text.secondary" marginTop={4}>
                                *If you enable this, users can chat with you in app messaging.
                            </Typography>
                        </Box>

                        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
                            <TextField
                                fullWidth
                                label="Age"
                                name="age"
                                type="number"
                                value={friendsProfileData.age || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Allow empty or numeric values only
                                    if (value === '' || /^\d+$/.test(value)) {
                                    setFriendsProfileData(prev => ({ 
                                        ...prev, 
                                        age: value === '' ? '' : value 
                                    }));
                                    }
                                }}
                                margin="normal"
                                InputProps={{
                                    inputProps: { 
                                    min: 1, 
                                    max: 120 
                                    }
                                }}
                                placeholder="Optional"
                                helperText="Your age will help others find suitable friends"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    },
                                }}
                            />
                        </Box>

                        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Looking For
                            </Typography>
                            <Typography variant="caption" color="text.secondary" paragraph>
                                Select what you're interested in finding through the friends feature
                            </Typography>
                            <FormGroup>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {LOOKING_FOR_OPTIONS.map((option) => (
                                    <FormControlLabel
                                    key={option}
                                    control={
                                        <Checkbox
                                        checked={friendsProfileData.lookingFor?.includes(option) || false}
                                        onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            setFriendsProfileData(prev => {
                                            const currentLookingFor = prev.lookingFor || [];
                                            return {
                                                ...prev,
                                                lookingFor: isChecked
                                                ? [...currentLookingFor, option]
                                                : currentLookingFor.filter(item => item !== option)
                                            };
                                            });
                                        }}
                                        size="small"
                                        />
                                    }
                                    label={option}
                                    sx={{ 
                                        m: 0,
                                        '& .MuiFormControlLabel-label': { fontSize: '0.875rem' }
                                    }}
                                    />
                                ))}
                                </Box>
                            </FormGroup>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Selected: {friendsProfileData.lookingFor?.length || 0} items
                            </Typography>
                        </Box>

                        {/* Contact Information */}
                        
                        <Box sx={{ p: 2, mt: 2, bgcolor: 'rgba(25, 210, 34, 0.05)', borderRadius: 2 }}>
                            <Typography variant="h6" fontWeight={500} gutterBottom>
                                Contact Medium
                            </Typography>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="phone"
                                type="number"
                                value={friendsProfileData?.phone || ''}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 10) {
                                        setFriendsProfileData(prev => ({ ...prev, phone: value }));
                                    }
                                }}
                                margin="normal"
                                // size="small"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                                    inputProps: {
                                        style: { paddingLeft: 8 },
                                        maxLength: 10 // restrict to 10 digits after +91 if needed
                                    },
                                }}
                                placeholder="Enter 10-digit phone number"
                                helperText="Optional - Only visible to verified users"
                                // sx={{ mb: 2 }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        // backgroundColor: '#ffffff',
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#1976d2',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#5f6368',
                                    },
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={friendsProfileData?.email || ''}
                                onChange={handleFriendsDataChange}
                                margin="normal"
                                placeholder="your.email@example.com"
                                helperText="Optional - For public contact"
                                // required
                                // size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        // backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#1976d2',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#5f6368',
                                    },
                                }}
                            />
                            {/* Social Media Links Section */}
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                                    Social Media Links (Optional)
                                </Typography>
                                <Typography variant="caption" color="text.secondary" paragraph>
                                    Add links to your social media profiles for easier communication
                                </Typography>

                                {/* Add Social Media Link Form */}
                                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', flexDirection: 'column' }}>
                                    <FormControl sx={{ minWidth: 150, flex: 1, borderRadius: 2 }}>
                                        <InputLabel id="platform-label">Platform</InputLabel>
                                        <Select
                                            labelId="platform-label"
                                            id="platform-select"
                                            value={newSocialLink.platformId}
                                            onChange={(e) => handlePlatformChange(e.target.value)}
                                            label="Platform"
                                            // size="small"
                                            sx={{ borderRadius: 2 }}
                                        >
                                            <MenuItem value="">
                                                <em>Select Platform</em>
                                            </MenuItem>
                                            {SOCIAL_MEDIA_OPTIONS.map((option) => (
                                                <MenuItem key={option.id} value={option.id}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        fullWidth
                                        label="URL"
                                        value={newSocialLink.url}
                                        onChange={handleSocialUrlChange}
                                        placeholder={
                                            SOCIAL_MEDIA_OPTIONS.find(opt => opt.id === newSocialLink.platformId)?.placeholder ||
                                            'Enter full URL (https://...)'
                                        }
                                        // size="small"
                                        InputProps={{
                                            startAdornment: newSocialLink.url.startsWith('http') ? null : (
                                                <InputAdornment position="start">https://</InputAdornment>
                                            )
                                        }}
                                        sx={{
                                            minWidth: 150, flex: 2, borderRadius: 2,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                                // backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#1976d2',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: '#5f6368',
                                            },
                                        }}
                                    />

                                    <Button
                                        variant="contained"
                                        onClick={addSocialLink}
                                        startIcon={<AddRounded />}
                                        disabled={!newSocialLink.platformId || !newSocialLink.url.trim()}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Add
                                    </Button>
                                </Box>

                                {/* Display Added Social Media Links */}
                                {friendsProfileData?.socialMedia?.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" gutterBottom>
                                            Added Links ({friendsProfileData.socialMedia.length})
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {friendsProfileData.socialMedia.map((link, index) => (
                                                <Chip
                                                    key={index} fullWidth
                                                    label={`${link.platform}: ${link.url.substring(0, 20)}...`}
                                                    onDelete={() => removeSocialLink(index)}
                                                    // deleteIcon={<Close />}
                                                    sx={{
                                                        borderRadius: '8px',
                                                        // maxWidth: 200,
                                                        '& .MuiChip-label': {
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Tip: Add WhatsApp or Telegram links for instant communication
                                </Typography>
                            </Box>
                        </Box>
                        </>
                        }
                    </Box>
                </Box>
            </DialogContent>
            {error && <Alert
                sx={{ mx: 2, borderRadius: '12px', color: darkMode ? 'error.contrastText' : 'text.primary', border: darkMode ? '1px solid rgba(244, 67, 54, 0.3)' : '1px solid rgba(244, 67, 54, 0.2)', boxShadow: darkMode ? '0 2px 8px rgba(244, 67, 54, 0.15)' : '0 2px 8px rgba(244, 67, 54, 0.1)', }}
                severity="error">{error}</Alert>}
            {/* <Typography variant="caption" color="text.secondary" sx={{ 
                display: 'block', mx: 2, borderRadius: '12px', 
                // color: darkMode ? 'warning.contrastText' : 'text.primary', 
                // border: darkMode ? '1px solid rgba(255, 152, 0, 0.3)' : '1px solid rgba(255, 152, 0, 0.2)', 
                // boxShadow: darkMode ? '0 2px 8px rgba(255, 152, 0, 0.15)' : '0 2px 8px rgba(255, 152, 0, 0.1)',
                // mt: 3,
                p: 2,
                // borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                fontSize: '0.75rem',
                lineHeight: 1.4
                }}>
                ⚠️ Note: When you enable Friends profile, your profile information and activity status 
                will be visible to nearby people in search of Nearby Friends.
                You can update your privacy settings anytime.
            </Typography> */}
            <DialogActions sx={{ p: 2 }}>

                <Button sx={{ borderRadius: '12px', textTransform: 'none' }} onClick={() => setShowEditFriendsDialog(false)}>Cancel</Button>
                <Button
                    onClick={handleUpdateFriendsProfile}
                    variant="contained"
                    disabled={updating}
                    sx={{
                        textTransform: 'none', borderRadius: '12px'
                    }}
                >
                    {updating ? <CircularProgress size={24} /> : 'Submit'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FriendsProfileDialog;