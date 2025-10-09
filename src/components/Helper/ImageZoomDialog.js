import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, IconButton, Box, Slide,} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CloseIcon from '@mui/icons-material/Close';
// import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';

const ImageZoomDialog = ({ selectedImage, handleCloseImageModal, images, isMobile }) => {
    const [zoomLevel, setZoomLevel] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 }); // Offset for panning
    const [isDragging, setIsDragging] = useState(false);
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    const [currentIndex, setCurrentIndex] = useState(0);
    // const isMobile = useMediaQuery("(max-width:600px)");
    const [initialDistance, setInitialDistance] = useState(null);
    const [swipeStart, setSwipeStart] = useState({ x: 0, y: 0 });
    const [isSwiping, setIsSwiping] = useState(false);

    const imageRef = useRef(null);

    // Update the index when a new image is passed
    useEffect(() => {
        if (selectedImage && images) {
            const initialIndex = images.indexOf(selectedImage); // Find the index of selectedImage
            if (initialIndex !== -1) setCurrentIndex(initialIndex);
        }
    }, [selectedImage, images]);

    // Reset zoom and position when image changes
    useEffect(() => {
        setZoomLevel(1);
        setOffset({ x: 0, y: 0 });
    }, [currentIndex]);

    // Zoom Handlers
    const handleZoomIn = () => {
        setZoomLevel((prevZoom) => Math.min(prevZoom + 0.2, 3)); // Cap zoom level at 3
    };

    const handleZoomOut = () => {
        setZoomLevel((prevZoom) => Math.max(prevZoom - 0.2, 1)); // Minimum zoom level is 1
        if (zoomLevel <= 1.2) setOffset({ x: 0, y: 0 }); // Reset position when fully zoomed out
    };

    // Drag Handlers // Mouse handlers for desktop
    const handleMouseDown = (event) => {
        if (zoomLevel > 1) {
            setIsDragging(true);
            setStartPosition({ x: event.clientX - offset.x, y: event.clientY - offset.y });
        }
    };

    const handleMouseMove = (event) => {
        if (isDragging) {
            const newOffset = {
                x: event.clientX - startPosition.x,
                y: event.clientY - startPosition.y,
            };
            setOffset(newOffset);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // For touch devices Two-finger zoom handler
    const handleTouchStart = (event) => {
        if (event.touches.length === 2) {
            // Two fingers - handle zoom
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const distance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            setInitialDistance(distance);
            setIsDragging(false);
        } else if (event.touches.length === 1 && zoomLevel <= 1) {
            // One finger - handle swipe for navigation (only when not zoomed)
            const touch = event.touches[0];
            setSwipeStart({ x: touch.clientX, y: touch.clientY });
            setIsSwiping(true);
            setIsDragging(false);
        } else if (event.touches.length === 1 && zoomLevel > 1) {
            // One finger - handle panning when zoomed
            const touch = event.touches[0];
            setIsDragging(true);
            setStartPosition({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
            setIsSwiping(false);
        }
    };

    const handleTouchMove = (event) => {
        if (event.touches.length === 2 && initialDistance !== null) {
            // Two-finger zoom
            event.preventDefault();
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const currentDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            
            const scaleChange = currentDistance / initialDistance;
            const newZoom = Math.max(1, Math.min(zoomLevel * scaleChange, 3));
            setZoomLevel(newZoom);
            
            // Update initial distance for continuous zooming
            setInitialDistance(currentDistance);
        } else if (event.touches.length === 1 && isDragging && zoomLevel > 1) {
            // One finger panning when zoomed
            const touch = event.touches[0];
            const newOffset = {
                x: touch.clientX - startPosition.x,
                y: touch.clientY - startPosition.y,
            };
            setOffset(newOffset);
        } else if (event.touches.length === 1 && isSwiping && zoomLevel <= 1) {
            // One finger swipe for navigation
            const touch = event.touches[0];
            const deltaX = touch.clientX - swipeStart.x;
            
            // Add some visual feedback during swipe
            if (imageRef.current) {
                imageRef.current.style.transform = `translateX(${deltaX * 0.5}px)`;
                imageRef.current.style.opacity = `${1 - Math.abs(deltaX) / 200}`;
            }
        }
    };

    const handleTouchEnd = (event) => {
        if (isSwiping && zoomLevel <= 1) {
            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - swipeStart.x;
            const swipeThreshold = 50;
            
            // Reset image position and opacity
            if (imageRef.current) {
                imageRef.current.style.transform = '';
                imageRef.current.style.opacity = '';
            }
            
            // Handle swipe navigation
            if (Math.abs(deltaX) > swipeThreshold) {
                if (deltaX > 0) {
                    // Swipe right - go to previous image
                    handlePrev();
                } else {
                    // Swipe left - go to next image
                    handleNext();
                }
            }
        }
        
        // Reset all states
        setInitialDistance(null);
        setIsDragging(false);
        setIsSwiping(false);
    };

    // Handle navigation
    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    return (
        <Dialog
            open={!!selectedImage}
            onClose={handleCloseImageModal}
            maxWidth="md"
            fullWidth fullScreen={isMobile} sx={{ 
                // margin: '1rem',
                '& .MuiPaper-root': { // Target the dialog paper
                  borderRadius: '16px', // Apply border radius
                }, }}
            TransitionComponent={Slide}
            TransitionProps={{ direction: 'right' }}
        >
            <DialogContent
                style={{
                    padding: 0,
                    position: 'relative',
                    backgroundColor: '#000',
                    overflow: 'hidden',
                    display: 'flex', // Use flexbox for centering
                    justifyContent: 'center', // Horizontal centering
                    alignItems: 'center', // Vertical centering
                    touchAction: 'none', // Prevent browser touch actions
                }}
            >


                {/* Image with Zoom, Pan, and Swipe */}
                <img
                    ref={imageRef}
                    src={`data:image/jpeg;base64,${images[currentIndex]}`}
                    alt={`Zoomed ${currentIndex}`}
                    style={{
                        transform: `scale(${zoomLevel}) translate(${offset.x}px, ${offset.y}px)`,
                        transition: isDragging || isSwiping ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
                        cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                        maxWidth: '100%',
                        maxHeight: '95vh',
                        objectFit: 'contain',
                        display: 'block', // Center the image horizontally
                        margin: 'auto',  // Center the image vertically in the dialog
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                />

                {/* Close Button */}
                <IconButton
                    onClick={handleCloseImageModal}
                    style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        color: '#fff', backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    }}
                >
                    <CloseIcon />
                </IconButton>

                {/* Zoom Controls */}
                <Box
                    style={{
                        position: 'absolute',
                        bottom: 10,
                        left: 10,
                        display: 'flex',
                        gap: '10px',
                        borderRadius: '6px',
                        padding: '8px',
                    }}
                >
                    <IconButton
                        onClick={handleZoomIn}
                        style={{ color: '#fff', backgroundColor: 'rgba(0, 0, 0, 0.5)', }}
                        aria-label="Zoom In"
                    >
                        <ZoomInIcon />
                    </IconButton>
                    <IconButton
                        onClick={handleZoomOut}
                        style={{ color: '#fff', backgroundColor: 'rgba(0, 0, 0, 0.5)', }}
                        aria-label="Zoom Out"
                    >
                        <ZoomOutIcon />
                    </IconButton>
                </Box>
                
                {/* Navigation Buttons */}
                {images.length > 1 && (
                    <Box
                        style={{
                            position: 'absolute',
                            bottom: 10,
                            right: 10,
                            display: 'flex',
                            gap: '10px',
                            borderRadius: '6px',
                            padding: '8px',
                        }}
                    >
                        {/* Previous Button */}
                        <IconButton
                            onClick={handlePrev}
                            style={{
                                // position: "absolute",
                                // top: "50%",
                                // left: 16,
                                // transform: "translateY(-50%)",
                                backgroundColor: "rgba(0,0,0,0.3)",
                                color: "white",
                            }}
                        >
                            <ArrowBackIosRoundedIcon />
                        </IconButton>

                        {/* Next Button */}
                        <IconButton
                            onClick={handleNext}
                            style={{
                                // position: "absolute",
                                // top: "50%",
                                // right: 16,
                                // transform: "translateY(-50%)",
                                backgroundColor: "rgba(0,0,0,0.3)",
                                color: "white",
                            }}
                        >
                            <ArrowForwardIosRoundedIcon />
                        </IconButton>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ImageZoomDialog;
