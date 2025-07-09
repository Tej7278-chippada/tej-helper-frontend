// src/components/Feedback/FeedbackDialog.js
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, Typography, TextField, Button, IconButton, CircularProgress, Box, useMediaQuery, Card, CardContent, Avatar, Alert, DialogTitle, DialogActions, Snackbar } from '@mui/material';
import { useTheme } from '@emotion/react';
import {
    Close as CloseIcon,
    PhotoCamera as PhotoCameraIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import { addFeedback } from '../api/api';

function FeedbackDialog({ open, onClose }) {
    const [loading, setLoading] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [formData, setFormData] = useState({ feedback: '', media: null, });
    const [newMedia, setNewMedia] = useState([]);
    const [mediaError, setMediaError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });


    const resizeImage = (blob, maxSize) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(blob);
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                // Set the new dimensions
                let width = img.width;
                let height = img.height;
                const scaleFactor = Math.sqrt(maxSize / blob.size); // Reduce size proportionally

                width *= scaleFactor;
                height *= scaleFactor;
                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                // Convert canvas to Blob
                canvas.toBlob(
                    (resizedBlob) => {
                        resolve(resizedBlob);
                    },
                    "image/jpeg",
                    0.8 // Compression quality
                );
            };
        });
    };

    const handleRemoveNewMedia = (index) => {
        setNewMedia((prev) => {
            const updatedMedia = prev.filter((_, i) => i !== index);

            // Calculate the total media count after deletion
            const updatedTotalMedia = updatedMedia.length;

            // Remove error message if media count is within the limit
            if (updatedTotalMedia <= 8) {
                setMediaError("");
            }

            return updatedMedia;
        });
    };

    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        const resizedFiles = [];

        for (const file of selectedFiles) {
            if (file.size > 2 * 1024 * 1024) { // If file is larger than 2MB
                const resizedBlob = await resizeImage(file, 2 * 1024 * 1024);
                const resizedFile = new File([resizedBlob], file.name, { type: file.type });
                resizedFiles.push(resizedFile);
            } else {
                resizedFiles.push(file); // Keep original if <= 2MB
            }
        }


        const totalMediaCount = resizedFiles.length + newMedia.length;

        // Check conditions for file count
        if (totalMediaCount > 3) {
            setMediaError("Maximum 3 photos allowed.");
            setSnackbar({ open: true, message: 'Maximum 3 photos allowed.', severity: 'warning' });
        } else {
            setMediaError("");
            // Append newly selected files at the end of the existing array
            setNewMedia((prevMedia) => [...prevMedia, ...resizedFiles]); // Add resized/valid files
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Show loading state
        const data = new FormData();

        // Add only new media files to FormData
        newMedia.forEach((file) => data.append('media', file));
        // Append form data
        Object.keys(formData).forEach(key => {
            if (key !== 'media') data.append(key, formData[key]);
        });

        try {
            await addFeedback(data);
            setSnackbar({ open: true, message: 'Feedback submitted.', severity: 'success' });
            // Reset form data to empty
            setFormData({ feedback: '', media: null, });
            setNewMedia([]);
        } catch (error) {
            console.error("Error submitting feedback:", error);
            setSnackbar({
                open: true, message: 'Feedback submittion failed, please try again later.', severity: 'error'
            });
        } finally {
            setLoading(false); // Stop loading state
        }
    };



    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile ? true : false} sx={{
            m: '12px', '& .MuiPaper-root': { // Target the dialog paper
                borderRadius: '14px',
                backdropFilter: 'blur(12px)',
            },
        }} >
            <DialogTitle sx={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', }}>
                {/* Close button */}
                <IconButton
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '1rem',
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography variant="h6">Give your Feedback</Typography>
            </DialogTitle>
            <DialogContent sx={{ position: 'sticky', height: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#888 transparent', }}>


                <TextField
                    label="Feedback message"
                    placeholder="Tell us what you think..."
                    fullWidth
                    multiline
                    rows={5}
                    value={formData.feedback} required
                    onChange={(e) => {
                        const maxLength = 2000;
                        if (e.target.value.length <= maxLength) {
                            setFormData({ ...formData, feedback: e.target.value });
                        }
                    }
                    }
                    inputProps={{ maxLength: 2000 }} // Ensures no more than 100 characters can be typed
                    sx={{
                        marginTop: '1rem',
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            bgcolor: theme.palette.background.paper,
                        },
                        '& .MuiInputBase-input': {
                            padding: '0px 0px', scrollbarWidth: 'thin', scrollbarColor: '#888 transparent',
                        },
                    }}
                />

                {/* Photo Upload Section */}
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.1)', mt: 2 }}>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                                <PhotoCameraIcon />
                            </Avatar>
                            <Typography variant="h6" fontWeight={600}>
                                Tag screenshots
                            </Typography>
                        </Box>

                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<AddPhotoAlternateRoundedIcon />}
                            sx={{ borderRadius: 2, mb: 2, bgcolor: 'rgba(24, 170, 248, 0.07)' }}
                            fullWidth={isMobile}
                        >
                            Choose Photos
                            <input type="file" multiple hidden onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg, image/webp" />
                        </Button>
                        {mediaError && <Alert severity="error">{mediaError}</Alert>}

                        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                            Maximum 3 photos allowed. Supported formats: PNG, JPG, JPEG, WebP
                        </Typography>
                        {newMedia.length > 0 && (
                            <Box sx={{ display: 'flex', gap: '4px', p: '0px', borderRadius: '8px', overflowX: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#888 transparent', }}>
                                {newMedia.map((file, index) => (
                                    <Box key={index} style={{ display: 'flex', position: 'relative', alignItems: 'flex-start', flexDirection: 'column' }}>
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Preview ${index}`}
                                            style={{
                                                height: '120px',
                                                borderRadius: '8px',
                                                objectFit: 'cover',
                                                flexShrink: 0,
                                                cursor: 'pointer' // Make the image look clickable
                                            }}
                                        />
                                        <IconButton
                                            size="small" onClick={() => handleRemoveNewMedia(index)}
                                            sx={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 4,
                                                bgcolor: 'error.main',
                                                color: 'white',
                                                '&:hover': { bgcolor: 'error.dark' }
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}


                    </CardContent>
                </Card>





            </DialogContent>
            <DialogActions sx={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', }}>
                <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: '1rem' }}>
                    {snackbar.message}
                </Alert>
                {/* Align Submit button to the right */}
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}
                >
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        sx={{ borderRadius: 2, }}
                        disabled={loading || formData.feedback.trim() === ''}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Submit'}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}

export default FeedbackDialog;
