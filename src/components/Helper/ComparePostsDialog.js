// src/components/Helper/ComparePostsDialog.js
import { Box, Button, Chip, Dialog, DialogContent, DialogTitle, Grid, IconButton, Slide, Typography } from "@mui/material";
import CompareRoundedIcon from '@mui/icons-material/CompareRounded';
import LazyBackgroundImage from "./LazyBackgroundImage";
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import WorkIcon from '@mui/icons-material/Work';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const ComparePostsDialog = ({ isMobile, darkMode, formatPrice, openPostDetail, compareDialogOpen, setCompareDialogOpen, selectedPosts, setSelectedPosts }) => {

    return(
        <Dialog
            open={compareDialogOpen}
            onClose={() => setCompareDialogOpen(false)}
            maxWidth="xl"
            fullWidth fullScreen={isMobile ? true : false}
            scroll="paper"
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: '16px',
                    background: darkMode
                        ? 'rgba(30, 30, 30, 0.95)'
                        : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                }
            }}
            TransitionComponent={Slide}
            TransitionProps={{ direction: 'right' }}
        >
            <DialogTitle sx={{
                borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CompareRoundedIcon color="primary" />
                    <Typography variant="h6" component="span">
                        Compare Posts
                    </Typography>
                    {/* <Typography variant="caption" color="text.secondary">
                      People
                    </Typography> */}
                    <Chip
                        label={`${selectedPosts.length}/3 selected`}
                        size="small"
                        // color="primary" 
                        variant="outlined"
                    />
                </Box>
                <IconButton
                    onClick={() => setCompareDialogOpen(false)}
                    sx={{
                        color: 'text.secondary',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                <Box sx={{
                    display: 'flex',
                    overflow: 'auto',
                    minHeight: '60vh',
                    '&::-webkit-scrollbar': { height: '8px' },
                    '&::-webkit-scrollbar-thumb': {
                        background: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                        borderRadius: '4px'
                    }
                }}>
                    {selectedPosts.map((post, index) => (
                        <Box
                            key={post._id}
                            sx={{
                                minWidth: isMobile ? '100%' : '350px',
                                maxWidth: isMobile ? '100%' : '350px',
                                borderRight: index < selectedPosts.length - 1 ?
                                    `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` : 'none',
                                position: 'relative'
                            }}
                        >
                            {/* Close button for individual post */}
                            <IconButton
                                size="small"
                                onClick={() => setSelectedPosts(prev => prev.filter(p => p._id !== post._id))}
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    zIndex: 10,
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>

                            {/* Media Section */}
                            <Box sx={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                                {post.media?.[0] ? (
                                    <LazyBackgroundImage
                                        base64Image={post.media[0]}
                                        alt={post.title}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Typography color="white" variant="h6">
                                            No Image
                                        </Typography>
                                    </Box>
                                )}

                                {/* Status and Type Overlay */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: 12,
                                    left: 12,
                                    display: 'flex',
                                    gap: 1,
                                    flexWrap: 'wrap'
                                }}>
                                    <Chip
                                        label={post.postStatus}
                                        size="small"
                                        sx={{
                                            backgroundColor: post.postStatus === 'Active' ? 'success.main' : 'error.main',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                    <Chip
                                        label={post.postType === 'HelpRequest' ? (post.categories || 'Help') : (post.serviceType || 'Service')}
                                        size="small"
                                        color={post.postType === 'HelpRequest' ? 'primary' : 'secondary'}
                                        sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                                    />
                                </Box>
                            </Box>

                            {/* Content Section */}
                            <Box sx={{ p: 2, mb: 4 }}>
                                {/* Title and Price */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 'bold',
                                        flex: 1,
                                        mr: 1
                                    }}>
                                        {post.title}
                                    </Typography>
                                    {post.price > 0 && (
                                        <Chip
                                            icon={<CurrencyRupeeRoundedIcon sx={{ mr: 0 }} />}
                                            label={formatPrice(post.price)}
                                            color="white"
                                            variant="filled"
                                            sx={{
                                                backgroundColor: 'success.main',
                                                color: '#fff',
                                                px: 0.5, py: 0.1,
                                                fontWeight: 500,
                                                fontSize: '0.875rem',
                                                transition: 'transform 0.2s ease',
                                                '& .MuiChip-label': {
                                                    px: '4px', mr: '4px'
                                                },
                                                '& .MuiChip-icon': {
                                                    marginLeft: '0px',
                                                    height: '16px'
                                                },
                                            }}
                                        />
                                    )}
                                </Box>

                                {/* Full Time Badge */}
                                {post.isFullTime && (
                                    <Chip
                                        icon={<WorkIcon sx={{ fontSize: 16 }} />}
                                        label="Full Time"
                                        size="small"
                                        color="info"
                                        sx={{ mb: 2 }}
                                    />
                                )}

                                {/* Basic Info Grid */}
                                <Grid container spacing={1} sx={{ mb: 2 }}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Distance
                                        </Typography>
                                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <LocationOnIcon fontSize="small" />
                                            {post.distance < 1
                                                ? `${Math.round(post.distance * 1000)}m`
                                                : `${post.distance.toFixed(1)}km`
                                            }
                                        </Typography>
                                    </Grid>
                                    {post.peopleCount && (
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">
                                                People
                                            </Typography>
                                            <Typography variant="body2">
                                                {post.peopleCount} {post.gender || 'People'}
                                            </Typography>
                                        </Grid>
                                    )}
                                    {post.gender && !post.peopleCount && (
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">
                                                Gender
                                            </Typography>
                                            <Typography variant="body2">
                                                {post.gender}
                                            </Typography>
                                        </Grid>
                                    )}
                                </Grid>

                                {/* Service Specific Details */}
                                {post.postType === 'ServiceOffering' && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                            Service Details
                                        </Typography>

                                        {/* Availability */}
                                        {post.availability?.isAlwaysAvailable ? (
                                            <Chip
                                                label="Available 24/7"
                                                size="small"
                                                color="success"
                                                variant="outlined"
                                                sx={{ mb: 1 }}
                                            />
                                        ) : post.availability?.days && post.availability.days.length > 0 && (
                                            <Box sx={{ mb: 1 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Available Days:
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                                    {post.availability.days.slice(0, 3).map(day => (
                                                        <Chip
                                                            key={day}
                                                            label={day.slice(0, 3)}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.7rem' }}
                                                        />
                                                    ))}
                                                    {post.availability.days.length > 3 && (
                                                        <Chip
                                                            label={`+${post.availability.days.length - 3}`}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.7rem' }}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Service Features */}
                                        {post.serviceFeatures && post.serviceFeatures.length > 0 && (
                                            <Box sx={{ mb: 1 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Features:
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                                    {post.serviceFeatures.slice(0, 3).map((feature, idx) => (
                                                        <Chip
                                                            key={idx}
                                                            label={feature}
                                                            size="small"
                                                            sx={{ fontSize: '0.7rem' }}
                                                        />
                                                    ))}
                                                    {post.serviceFeatures.length > 3 && (
                                                        <Chip
                                                            label={`+${post.serviceFeatures.length - 3}`}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.7rem' }}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Capacity */}
                                        {post.capacity && (
                                            <Typography variant="caption" color="text.secondary">
                                                Capacity: <Typography variant="caption" component="span">{post.capacity} slots</Typography>
                                            </Typography>
                                        )}
                                    </Box>
                                )}

                                {/* Help Request Specific Details */}
                                {post.postType === 'HelpRequest' && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                            Request Details
                                        </Typography>
                                        <Grid container spacing={1}>
                                            {post.serviceDate && (
                                                <Grid item xs={12}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Service Date:
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {new Date(post.serviceDate).toLocaleDateString()}
                                                    </Typography>
                                                </Grid>
                                            )}
                                            {post.serviceDays && (
                                                <Grid item xs={12}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Service Days:
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {post.serviceDays} days
                                                    </Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Box>
                                )}

                                {/* Description */}
                                <Typography variant="caption" color="text.secondary">
                                    Description
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                                    {post.description}
                                </Typography>

                            </Box>

                            {/* Action Buttons */}
                            <Box sx={{ display: 'flex', gap: 1, p: 2, mt: 2, position: 'absolute', bottom: 0, left: 0, right: 0, }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    onClick={() => openPostDetail(post)}
                                    sx={{
                                        borderRadius: '8px', textTransform: 'none',
                                        color: darkMode
                                            ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                                            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        // boxShadow: darkMode 
                                        //   ? '0 4px 14px rgba(59, 130, 246, 0.4)'
                                        //   : '0 4px 14px rgba(37, 99, 235, 0.3)',
                                        '&:hover': {
                                            color: darkMode
                                                ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                                                : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                            boxShadow: darkMode
                                                ? '0 6px 20px rgba(59, 130, 246, 0.6)'
                                                : '0 6px 20px rgba(37, 99, 235, 0.4)',
                                            transform: 'translateY(-1px)'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    View Details
                                </Button>
                                {/* <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            onClick={() => openPostDetail(post)}
                            sx={{ borderRadius: '8px', textTransform: 'none' }}
                          >
                            Contact
                          </Button> */}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </DialogContent>
        </Dialog>
    );
}

export default ComparePostsDialog;