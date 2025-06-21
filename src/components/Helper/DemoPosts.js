// /components/Helper/DemoPosts.js
import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardMedia, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { fetchPostMediaById } from "../api/api";

const DemoPosts = ({isMobile}) => {
  const [offers, setOffers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    // Fetch offers images from backend
    // const fetchOffers = async () => {
    //   try {
    //     const response = await getOffers();
    //     setOffers(response.data);
    //   } catch (error) {
    //     console.error("Error fetching offers:", error);
    //   }
    // };
    // fetchOffers();
    const fetchPostMedia = async (postId) => {
        // setLoadingMedia(true);
        try {
          const response = await fetchPostMediaById('683597f121dde4cabe495deb');
          setOffers(response.data.media.map((media, index) => ({ data: media.toString('base64'), _id: index.toString(), remove: false })));
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.error('Post Unavailable.', error);
            setSnackbar({ open: true, message: "Post Unavailable.", severity: "warning" });
          } else if (error.response && error.response.status === 401) {
            console.error('Error fetching post details:', error);
          } else {
            console.error('Error fetching post details:', error);
          }
        // } finally {
        //   setLoadingMedia(false);
        }
      };
      fetchPostMedia();
  }, []);

  

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length);
    }, 3000); // Auto-scroll every 3 seconds
    return () => clearInterval(interval);
  }, [offers]);

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "1200px", margin: "auto", mt: 2 }}>
      {/* <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
        Help others with their needs and get paid for your services.
      </Typography> */}
      {offers.length > 0 && (
        <Card sx={{ position: "relative", borderRadius: "16px" }}>
          {/* <CardMedia
            component="img"
            height="400"
            image={`data:image/jpeg;base64,${offers[currentIndex]?.image}`}
            alt={offers[currentIndex]?.title}
            sx={{ borderRadius: "16px" }}
          /> */}
          <CardMedia
            component="img"
            height= {isMobile ? '200' : '400'}
            image={`data:image/jpeg;base64,${offers[currentIndex]?.data}`}
            alt={offers[currentIndex]?.title}
            sx={{ borderRadius: isMobile ? 0 : '16px', cursor: "pointer" }}
            onClick={() => window.open(offers[currentIndex]?.url, "_blank")} // Open URL in a new tab
          />
          {/* Dots Navigation */}
          <Box
            sx={{
              position: "absolute",
              bottom: "16px",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {offers.map((_, index) => (
              <IconButton
                key={index}
                onClick={() => handleDotClick(index)}
                sx={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: index === currentIndex ? theme.palette.primary.main : "#ccc",
                  borderRadius: "50%",
                  transition: "background-color 0.3s",
                }}
              />
            ))}
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default DemoPosts;
