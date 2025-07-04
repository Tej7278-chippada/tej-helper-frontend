import React from "react";
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Alert, Box, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";

const GoogleOAuth = ({ setSuccess, setError, darkMode }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;

    useEffect(() => {
        // Enhanced message listener with better security
        const handleMessage = (event) => {
            const allowedOrigins = [
                'https://accounts.google.com',
                'https://accounts.google.com/gsi',
                'http://localhost:3000',
                'https://tej-helper.netlify.app'
            ];
            
            if (!allowedOrigins.includes(event.origin)) {
                console.warn('Blocked message from unauthorized origin:', event.origin);
                return;
            }
            
            // Handle Google OAuth popup messages
            if (event.data?.type === 'GOOGLE_OAUTH_RESPONSE') {
                console.log('Google OAuth response received');
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleScriptLoadError = () => {
        console.error("Google OAuth script failed to load");
        setError('Failed to load Google authentication. Please refresh the page.');
        setScriptLoaded(false);
    };

    const handleScriptLoadSuccess = () => {
        console.log("Google OAuth script loaded successfully");
        setScriptLoaded(true);
    };

    // Don't render if client ID is missing
    if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Alert severity="error">
                    Google OAuth is not configured. Please contact support.
                </Alert>
            </Box>
        );
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        if (isLoading) return; // Prevent multiple requests
        
        setIsLoading(true);
        setError(null);

        try {
            // Validate credential response
            if (!credentialResponse?.credential) {
                throw new Error('Invalid credential response from Google');
            }

            // Create request with timeout and retry logic
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/auth/google`,
                { 
                    token: credentialResponse.credential,
                    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                    userAgent: navigator.userAgent,
                    timestamp: Date.now()
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    signal: controller.signal,
                    timeout: 15000
                }
            );

            clearTimeout(timeoutId);

            // Enhanced response validation
            const { authToken, tokenUsername, userId, tokenPic, isNewUser } = response.data;
            
            if (!authToken || !tokenUsername || !userId) {
                throw new Error('Incomplete authentication response');
            }

            // Secure token storage with validation
            try {
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('activeUser', tokenUsername);
                localStorage.setItem('tokenUsername', tokenUsername);
                localStorage.setItem('userId', userId);
                // localStorage.setItem('loginMethod', 'google');
                // localStorage.setItem('loginTimestamp', Date.now().toString());
                
                if (tokenPic) {
                    localStorage.setItem('tokenProfilePic', tokenPic);
                }

                // Verify storage worked
                if (localStorage.getItem('authToken') !== authToken) {
                    throw new Error('Failed to store authentication data');
                }
            } catch (storageError) {
                console.error('Storage error:', storageError);
                throw new Error('Failed to save login information');
            }

            // Success feedback
            const successMessage = isNewUser 
                ? 'Account created and logged in successfully!' 
                : 'Google login successful!';
            
            setSuccess(successMessage);
            setRetryCount(0);
            
            // Navigate with slight delay to show success message
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 1000);

        } catch (error) {
            console.error("Google OAuth error:", error);
            
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
                errorMessage = 'Connection timeout. Please check your internet connection.';
            } else if (error.response?.status === 401) {
                errorMessage = 'Authentication failed. Please try again.';
            } else if (error.response?.status === 403) {
                errorMessage = `Access denied. This account has been Suspended or Please verify your Google account.`;
            } else if (error.response?.status === 429) {
                errorMessage = 'Too many attempts. Please wait 10 minutes and try again.';
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message.includes('network')) {
                errorMessage = 'Network error. Please check your connection.';
            }

            setError(errorMessage);
            
            // Retry logic for network errors
            if (retryCount < MAX_RETRIES && (
                error.code === 'ECONNABORTED' || 
                error.message.includes('network') ||
                error.response?.status >= 500
            )) {
                setRetryCount(prev => prev + 1);
                setTimeout(() => {
                    setIsLoading(false);
                }, 2000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = (error) => {
        console.error("Google OAuth client error:", error);
        
        let errorMessage = 'Google login failed. Please try again.';
        
        if (error === 'popup_closed_by_user') {
            errorMessage = 'Login cancelled. Please try again if needed.';
        } else if (error === 'access_denied') {
            errorMessage = 'Access denied. Please grant necessary permissions.';
        } else if (error === 'network_error') {
            errorMessage = 'Network error. Please check your connection.';
        }
        
        setError(errorMessage);
        setIsLoading(false);
    };

    return (
        <GoogleOAuthProvider 
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            onScriptLoadError={handleScriptLoadError}
            onScriptLoadSuccess={handleScriptLoadSuccess}
        >
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, position: 'relative' }}>
                {isLoading && (
                    <Box 
                        sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            // left: 0, 
                            // right: 0, 
                            bottom: 0, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', width : '100px',
                            backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                            zIndex: 1,
                            borderRadius: '24px'
                        }}
                    >
                        <CircularProgress size={24} />
                    </Box>
                )}

                {scriptLoaded && (
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap={false} // all mails showing in a popup card at page mounting (Disable if issues persist)
                        // ux_mode="redirect" // Alternative to popup
                        theme={darkMode ? "filled_black" : "outline"}
                        shape="pill"
                        size="large"
                        text="continue_with"
                        disabled={isLoading}
                        cancel_on_tap_outside={false}
                        auto_select={false}
                        context="signin"
                    />
                )}

                {!scriptLoaded && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        <span>Loading Google Sign-In...</span>
                    </Box>
                )}
            </Box>

            {retryCount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <Alert severity="info" sx={{ fontSize: '0.8rem', borderRadius: '12px' }}>
                        Retrying... ({retryCount}/{MAX_RETRIES})
                    </Alert>
                </Box>
            )}
        </GoogleOAuthProvider>
    );
};

export default GoogleOAuth;