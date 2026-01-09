// /src/components/Reports/ReportUser.js
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import ReportGmailerrorredRoundedIcon from '@mui/icons-material/ReportGmailerrorredRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import { reportPost, reportUser } from '../api/api';

const reportTypes = [
  { value: 'Fraud', label: 'Fraud or Scam', description: 'Misleading information or potential scam' },
  { value: 'Suspicious', label: 'Suspicious Activity', description: 'Unusual or potentially harmful activity' },
  { value: 'Inappropriate', label: 'Inappropriate Content', description: 'Offensive, explicit, or harmful content' },
  { value: 'Spam', label: 'Spam', description: 'Repetitive, unwanted, or promotional content' },
  { value: 'WrongCategory', label: 'Wrong Category', description: 'Post is in incorrect category' },
  { value: 'Duplicate', label: 'Duplicate Post', description: 'Same post appears multiple times' },
  { value: 'Expired', label: 'Expired or Unavailable', description: 'Service or offer is no longer available' },
  { value: 'Other', label: 'Other', description: 'Other issues not listed above' }
];

const ReportUser = ({ open, onClose, onReportSuccess, userId, darkMode }) => {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const [success, setSuccess] = useState('');

  const handleTypeChange = (event) => {
    const value = event.target.value;
    setSelectedTypes(prev =>
      prev.includes(value)
        ? prev.filter(type => type !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (selectedTypes.length === 0) {
      setError('Please select at least one report type');
      return;
    }

    setLoading(true);
    setError('');
    // setSuccess('');

    try {
      const response = await reportUser(userId, selectedTypes, comment.trim());

      if (response.data.success) {
        
        // Call the success callback
        if (onReportSuccess) {
          onReportSuccess();
        }

        // Reset form state
        setSelectedTypes([]);
        setComment('');
        setError('');
        
        // Auto close after success
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error reporting user:', error);
      const errorMessage = error.response?.data?.message || 
        (error.response?.status === 400 ? 'You have already reported this user' : 
         'Failed to report user. Please try again.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form state
    setSelectedTypes([]);
    setComment('');
    setError('');
    // setSuccess('');
    setLoading(false);
    onClose();
  };

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setSelectedTypes([]);
      setComment('');
      setError('');
      // setSuccess('');
      setLoading(false);
    }
  }, [open]);

  const getSelectedTypesDescription = () => {
    return selectedTypes.map(type => 
      reportTypes.find(t => t.value === type)?.description
    ).filter(Boolean).join(', ');
  };

  return (
    <Dialog 
      open={open} 
      onClose={!loading ? handleClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: darkMode 
            ? 'rgba(30, 30, 30, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          minHeight: '60vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
      }}>
        <ReportGmailerrorredRoundedIcon color="error" />
        <Typography variant="h6" component="span">
          Report User
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
          <>

            <Typography variant="body1" sx={{ my: 2, fontWeight: 500 }}>
              Why are you reporting this user?
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Select all reasons that apply. Your report helps keep our community safe.
            </Typography>

            <Grid container spacing={2}>
              {reportTypes.map((type) => (
                <Grid item xs={12} md={6} key={type.value}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      cursor: loading ? 'not-allowed' : 'pointer',
                      border: selectedTypes.includes(type.value) ? 
                        `2px solid ${darkMode ? '#ff6b6b' : '#d32f2f'}` : 
                        `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      bgcolor: selectedTypes.includes(type.value) ? 
                        (darkMode ? 'rgba(211, 47, 47, 0.1)' : 'rgba(211, 47, 47, 0.05)') : 
                        'transparent',
                      transition: 'all 0.2s ease', borderRadius: '12px',
                      opacity: loading ? 0.6 : 1,
                      '&:hover': loading ? {} : {
                        borderColor: darkMode ? '#ff6b6b' : '#d32f2f',
                        bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                      }
                    }}
                    onClick={loading ? undefined : () => handleTypeChange({ target: { value: type.value } })}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedTypes.includes(type.value)}
                            onChange={handleTypeChange}
                            value={type.value}
                            color="error"
                            disabled={loading}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle2" fontWeight="500">
                              {type.label}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {type.description}
                            </Typography>
                          </Box>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 3 }}>
              <TextField
                label="Additional Details (Optional)"
                multiline
                rows={3}
                fullWidth
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                variant="outlined"
                placeholder="Please provide specific details about what's wrong with this user..."
                inputProps={{ 
                  maxLength: 500,
                  disabled: loading
                }}
                helperText={`${comment.length}/500 characters - ${getSelectedTypesDescription()}`}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '12px', }
                }}
              />
            </Box>

            {selectedTypes.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PeopleAltRoundedIcon fontSize="small" />
                  Selected reasons ({selectedTypes.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedTypes.map(type => (
                    <Chip
                      key={type}
                      label={reportTypes.find(t => t.value === type)?.label}
                      size="small"
                      color="error"
                      variant="outlined"
                      onDelete={loading ? undefined : () => setSelectedTypes(prev => prev.filter(t => t !== type))}
                      disabled={loading}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </>
      </DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 0 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        <DialogActions sx={{ 
          p: 2, 
          gap: 2,
          borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
        }}>
          <Button 
            onClick={handleClose}
            disabled={loading}
            color="inherit"
            sx={{ borderRadius: 1.5 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || selectedTypes.length === 0}
            variant="contained"
            color="error"
            startIcon={loading ? <CircularProgress size={20} sx={{mr: 1}}/> : <ReportGmailerrorredRoundedIcon />}
            sx={{ minWidth: 140, borderRadius: '12px', textTransform: 'none' }}
          >
            {loading ? 'Reporting...' : 'Report User'}
          </Button>
        </DialogActions>
    </Dialog>
  );
};

export default ReportUser;