import React from "react";
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";

const GoogleOAuth = ({ setSuccess, setError, darkMode }) => {
    const navigate = useNavigate();

    useEffect(() => {
        // This helps prevent COOP issues
        window.addEventListener('message', (event) => {
            if (event.origin !== 'https://accounts.google.com') return;
            // console.log('Received message from Google Auth', event);
        });
    }, []);

    return (
        <GoogleOAuthProvider 
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            onScriptLoadError={() => console.error("Google OAuth script failed to load")}
            onScriptLoadSuccess={() => console.log("Google OAuth script loaded")}
        >
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                        try {
                            // console.log('Received credential:', credentialResponse);

                            const response = await axios.post(
                                `${process.env.REACT_APP_API_URL}/api/auth/google`,
                                { token: credentialResponse.credential },
                                {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Accept': 'application/json'
                                    },
                                    // withCredentials: true
                                }
                            );

                            // console.log('Auth response:', response.data);

                            const { authToken, tokenUsername, userId, tokenPic } = response.data;
                            localStorage.setItem('authToken', authToken);
                            localStorage.setItem('activeUser', tokenUsername);
                            localStorage.setItem('tokenUsername', tokenUsername);
                            localStorage.setItem('userId', userId);
                            if (tokenPic) {
                                localStorage.setItem('tokenProfilePic', tokenPic);
                            }

                            setSuccess('Google login successful!');
                            navigate('/', { replace: true });
                        } catch (error) {
                            console.error("Login error:", error.response?.data || error.message);
                            setError(error.response?.data?.error || 'Login failed. Please try again.');
                        }
                    }}
                    onError={() => {
                        console.error("Google OAuth client error");
                        setError('Google login failed. Please try again later.');
                    }}
                    useOneTap={false} // all mails showing in a popup card at page mounting (Disable if issues persist)
                    // ux_mode="redirect" // Alternative to popup
                    theme={darkMode ? "filled_black" : "outline"}
                    shape="pill"
                    size="large"
                    text="continue_with"
                />
            </Box>
        </GoogleOAuthProvider>
    );
};

export default GoogleOAuth;