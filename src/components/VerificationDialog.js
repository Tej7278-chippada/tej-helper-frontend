import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Grid
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
// import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';

const steps = ['Select Document', 'Upload Documents', 'Take Selfie'];

const VerificationDialog = ({ open, onClose, onSubmit, loading, attempts, maxAttempts, isMobile, darkMode }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [documentType, setDocumentType] = useState('');
  const [documentFront, setDocumentFront] = useState(null);
  const [documentBack, setDocumentBack] = useState(null);
  const [selfieWithDocument, setSelfieWithDocument] = useState(null);
  
  // Camera states
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' for front camera, 'environment' for back
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize camera
  const initializeCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(cameraStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions and try again.');
    }
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Initialize camera when selfie step is active
  useEffect(() => {
    if (activeStep === 2 && open) {
      initializeCamera();
    } else {
      // Clean up camera when leaving selfie step
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  }, [activeStep, open, facingMode]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        const file = new File([blob], 'selfie-with-document.jpg', { 
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        setCapturedImage(URL.createObjectURL(blob));
        setSelfieWithDocument(file);
      }, 'image/jpeg', 0.8);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setSelfieWithDocument(null);
    initializeCamera();
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // compress front image if size > 2MB
  const handleDocFrontPic = async (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      const resizedBlob = await resizeImage(file, 2 * 1024 * 1024);
      const resizedFile = new File([resizedBlob], file.name, { type: file.type });
      setDocumentFront(resizedFile);
    } else {
      setDocumentFront(file);
    }
  };

  // compress back image if size > 2MB
  const handleDocBackPic = async (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      const resizedBlob = await resizeImage(file, 2 * 1024 * 1024);
      const resizedFile = new File([resizedBlob], file.name, { type: file.type });
      setDocumentBack(resizedFile);
    } else {
      setDocumentBack(file);
    }
  };

  const resizeImage = (blob, maxSize) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let width = img.width;
        let height = img.height;
        const scaleFactor = Math.sqrt(maxSize / blob.size);
        width *= scaleFactor;
        height *= scaleFactor;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (resizedBlob) => resolve(resizedBlob),
          "image/jpeg",
          0.8
        );
      };
    });
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('documentFront', documentFront);
    if (documentBack) {
      formData.append('documentBack', documentBack);
    }
    formData.append('selfieWithDocument', selfieWithDocument);
    
    onSubmit(formData);
    // handleReset();
  };

  const handleReset = () => {
    setActiveStep(0);
    setDocumentType('');
    setDocumentFront(null);
    setDocumentBack(null);
    setSelfieWithDocument(null);
    setCapturedImage(null);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCloseDialog = () => {
    handleReset();
    onClose();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Select the type of government-issued ID you want to use for verification.
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Document Type</InputLabel>
              <Select
                value={documentType}
                label="Document Type"
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <MenuItem value="aadhaar">Aadhaar Card</MenuItem>
                <MenuItem value="driving_license">Driving License</MenuItem>
                <MenuItem value="passport">Passport</MenuItem>
                <MenuItem value="voter_id">Voter ID</MenuItem>
                <MenuItem value="pan_card">PAN Card</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info">
              Make sure your document is valid and not expired. Clear, well-lit photos are required.
            </Alert>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body2" color="textSecondary">
              Upload clear photos of your document. Front side is required, back side is optional for some documents.
            </Typography>
            
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Front Side *
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="document-front"
                  type="file"
                  // capture="environment" // Opens camera on mobile
                  // onChange={(e) => setDocumentFront(e.target.files[0])}
                  onChange={handleDocFrontPic}
                />
                <label htmlFor="document-front">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                    <span
                      style={{
                        display: "inline-block",
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "left"
                      }}
                    >
                      {documentFront ? documentFront.name : "Upload Front Side"}
                    </span>
                  </Button>
                </label>
                {documentType === 'aadhaar' && (
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    Upload the front side of your Aadhaar card
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Back Side (Optional)
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="document-back"
                  type="file"
                  // capture="environment" // Opens camera on mobile
                  // onChange={(e) => setDocumentBack(e.target.files[0])}
                  onChange={handleDocBackPic}
                />
                <label htmlFor="document-back">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                    <span
                      style={{
                        display: "inline-block",
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "left"
                      }}
                    >
                      {documentBack ? documentBack.name : 'Upload Back Side'}
                    </span>
                  </Button>
                </label>
                {documentType === 'aadhaar' && (
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    Upload the back side of your Aadhaar card (optional)
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body2" color="textSecondary">
              Take a live selfie while holding your document. Make sure both your face and the document are clearly visible.
            </Typography>
            
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  {!capturedImage ? (
                    // Camera view
                    <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                          width: '100%',
                          borderRadius: '8px',
                          border: '2px solid #e0e0e0'
                        }}
                      />
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        display: 'flex',
                        gap: 1
                      }}>
                        <IconButton 
                          onClick={switchCamera}
                          sx={{ 
                            backgroundColor: 'rgba(0,0,0,0.5)', 
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                          }}
                          size="small"
                        >
                          <CameraswitchIcon />
                        </IconButton>
                      </Box>
                      
                      <Button
                        variant="contained"
                        onClick={capturePhoto}
                        startIcon={<PhotoCameraIcon />}
                        sx={{ 
                          mt: 2,
                          borderRadius: '50px',
                          minWidth: '120px'
                        }}
                        fullWidth
                      >
                        Capture
                      </Button>
                    </Box>
                  ) : (
                    // Captured image preview
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <img
                        src={capturedImage}
                        alt="Captured selfie with document"
                        style={{
                          width: '100%',
                          maxWidth: 400,
                          borderRadius: '8px',
                          border: '2px solid #e0e0e0'
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                        <Button
                          variant="outlined"
                          onClick={retakePhoto}
                          sx={{ borderRadius: '50px', flex: 1 }}
                        >
                          Retake
                        </Button>
                        {/* <Button
                          variant="contained"
                          onClick={() => {
                            // Photo is already set, proceed
                          }}
                          sx={{ flex: 1 }}
                        >
                          Use This Photo
                        </Button> */}
                      </Box>
                    </Box>
                  )}
                  
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </Box>
              </CardContent>
            </Card>

            <Alert severity="warning">
              <Typography variant="body2" fontWeight="bold">
                Important Instructions:
              </Typography>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Hold your document next to your face</li>
                <li>Make sure both your face and document are clearly visible</li>
                <li>Ensure good lighting and no glare on the document</li>
                <li>Document text should be readable</li>
                <li>Your face should not be covered</li>
              </ul>
            </Alert>

            {/* Updated Example Section with Demo Image */}
            <Box sx={{ p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom color="textPrimary">
                <strong>Example:</strong>
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    Hold your {documentType === 'aadhaar' ? 'Aadhaar card' : 
                    documentType === 'driving_license' ? 'Driving License' : 
                    documentType === 'passport' ? 'Passport' : 'document'} in one hand and position it next to your face. 
                    Make sure the camera can see both your face and the document clearly.
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <img
                    src="/demoid.jpg" // Make sure this image exists in your public folder
                    alt="Demo of selfie with document"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '150px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      e.target.style.display = 'none';
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return documentType !== '';
      case 1:
        return documentFront !== null;
      case 2:
        return selfieWithDocument !== null;
      default:
        return false;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCloseDialog}
      maxWidth="md" fullScreen={isMobile}
      fullWidth
      // PaperProps={{ sx: { borderRadius: '12px' } }}
      PaperProps={{
          sx: {
            background: darkMode 
              ? 'rgba(30, 30, 30, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
          }
        }}
    >
      <DialogTitle>
        Identity Verification
        {attempts > 0 && (
          <Typography variant="caption" display="block" color="textSecondary">
            Attempts: {attempts}/{maxAttempts}
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button sx={{borderRadius: '12px', textTransform: 'none'}} onClick={handleCloseDialog} disabled={loading}>
          Cancel
        </Button>
        
        <Box sx={{ flex: 1 }} />
        
        {activeStep > 0 && (
          <Button sx={{borderRadius: '12px', textTransform: 'none'}} onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button sx={{borderRadius: '12px', textTransform: 'none'}}
            onClick={handleNext} 
            variant="contained"
            disabled={!isStepValid() || loading}
          >
            Next
          </Button>
        ) : (
          <Button sx={{borderRadius: '12px', textTransform: 'none'}}
            onClick={handleSubmit} 
            variant="contained"
            disabled={!isStepValid() || loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Submitting...' : 'Submit Verification'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VerificationDialog;