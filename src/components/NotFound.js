import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Box, Container } from "@mui/material";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", textAlign: "center" }}>
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>
          This page is hosted on a static Netlify page. Page refreshing can't be done.
        </Typography>
        <Typography variant="h6" sx={{ mb: 4 }}>
          Please click the button below to navigate to the Home page.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate("/helper")}>
          Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
