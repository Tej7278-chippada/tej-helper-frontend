import { Box, Button, Card, Chip, CircularProgress, IconButton, Typography } from "@mui/material";
import { useState } from "react";
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import { ArrowForwardRounded, CelebrationRounded, PeopleAltRounded } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";

const OfferBanner = () => {
    const navigate = useNavigate();
    const [showExpandedCard, setShowExpandedCard] = useState(false);
    const [amazonLoading, setAmazonLoading] = useState(false);

    return(
        <Box sx={{ 
          width: 'fit-content' , // isMobile ? '100%' : 'fit-content'
          mb: 2,
          px: 1
        }}>
          <Card sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #232f3e 0%, #37475A 100%)',
            color: 'white',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)'
            }
          }}
          onClick={() => setShowExpandedCard(!showExpandedCard)}
          >
            <Box sx={{ p: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CardGiftcardRoundedIcon fontSize="small" sx={{ color: '#FF9900' }} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    ₹500 Amazon Pay Gift Card
                  </Typography>
                </Box>
                <IconButton size="small" sx={{ color: '#FF9900' }}>
                  {showExpandedCard ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                </IconButton>
              </Box>

              {/* Offer Duration - Always visible */}
              {/* <Box sx={{ 
                mt: 0.5,
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                <Typography variant="caption" sx={{ 
                  opacity: 0.9, 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  background: 'rgba(255, 153, 0, 0.1)',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1
                }}>
                  <span style={{ color: '#FF9900', fontWeight: 600 }}>🎁</span>
                  <span style={{ fontWeight: 500 }}>Dec 25-28</span>
                  <span style={{ opacity: 0.8 }}>• Christmas Special</span>
                </Typography>
              </Box> */}
              
              {!showExpandedCard ? (
                <>
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.5 }}>
                    Build your community and unlock rewards
                  </Typography>
                  {/* <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mb: 0.5, mt: 0.5 }}>
                    Reach 50 followers → My Profile → Network Section
                  </Typography>
                  <Chip 
                    label="50+ Followers Required"
                    size="small"
                    sx={{ 
                      background: 'rgba(255, 153, 0, 0.2)',
                      color: '#FF9900',
                      border: '1px solid rgba(255, 153, 0, 0.3)',
                      fontSize: '0.7rem'
                    }}
                  /> */}
                </>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {/* Expanded Content - Same as desktop but adapted for mobile */}
                  <Box sx={{ mb: 2 }}>
                    {/* Offer Duration Details */}
                    {/* <Box sx={{ 
                      mb: 2, 
                      p: 1.5, 
                      background: 'rgba(211, 47, 47, 0.1)',
                      borderRadius: 2,
                      border: '1px solid rgba(211, 47, 47, 0.2)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CelebrationRounded sx={{ color: '#FFD700' }} />
                        <Typography variant="body2" fontWeight={600}>
                          🎄 Christmas Celebration Offer
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.5, opacity: 0.9 }}>
                        <strong>Limited Time:</strong> December 25th to 28th, 2025
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                        This special ₹500 Amazon Pay gift card is exclusively available during our Christmas celebrations.
                        Requests must be made within this period to qualify.
                      </Typography>
                    </Box> */}
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.5 }}>
                      Build your community and unlock rewards
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PeopleAltRounded fontSize="small" />
                      <Typography variant="body2" fontWeight={500}>
                        Eligibility Requirement:
                      </Typography>
                    </Box>
                    <Chip
                      label="50+ Followers"
                      size="small"
                      sx={{ 
                        background: 'linear-gradient(135deg, #FF9900 0%, #FFAD33 100%)',
                        color: 'white',
                        fontWeight: 600,
                        mb: 1
                      }}
                    />
                    {/* <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.5 }}>
                      Build your community and unlock rewards
                    </Typography> */}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                      How to Claim:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%', 
                        background: '#FF9900',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.25
                      }}>
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>1</Typography>
                      </Box>
                      <Typography variant="caption">
                        Login and grow your followers to 50+ 
                        {/* <strong style={{ color: '#FF9900' }}>(Before Dec 28)</strong> */}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%', 
                        background: '#FF9900',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.25
                      }}>
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>2</Typography>
                      </Box>
                      <Typography variant="caption">
                        Go to <strong>My Profile</strong>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%', 
                        background: '#FF9900',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.25
                      }}>
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>3</Typography>
                      </Box>
                      <Typography variant="caption">
                        Click <strong>Request Coupon</strong> in Network Section
                      </Typography>
                    </Box>
                    {/* Important Note */}
                    <Box sx={{ 
                      mt: 2, 
                      p: 1, 
                      background: 'rgba(255, 153, 0, 0.1)',
                      borderRadius: 1,
                      borderLeft: '3px solid #FF9900'
                    }}>
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: '#FF9900' }}>
                        ⚡ Important:
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
                        {/* • Offer valid only from <strong>December 25-28, 2025</strong><br/>
                        • Coupon requests must be submitted within this period<br/> */}
                        • Gift cards will be shared within 24 hours of request
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    component="a"
                    href="https://www.amazon.in/dp/B018TV9HIM?_encoding=UTF8&ref=cm_sw_r_cp_ud_dp_CBF59JWWGXDD3490DTFE&ref_=cm_sw_r_cp_ud_dp_CBF59JWWGXDD3490DTFE&social_share=cm_sw_r_cp_ud_dp_CBF59JWWGXDD3490DTFE&th=1&gpo=500"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAmazonLoading(true);
                      setTimeout(() => {
                        setAmazonLoading(false);
                      }, 2000);
                    }}
                   sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: 1,
                    my: 1,
                    p: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    textDecoration: 'none',
                    cursor: amazonLoading ? 'default' : 'pointer',
                    pointerEvents: amazonLoading ? 'none' : 'auto',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}>
                    {amazonLoading ? (
                      <>
                        <CircularProgress size={18} sx={{ color: '#FF9900' }} />
                        <Typography variant="body2" sx={{ color: '#FF9900', fontWeight: 600 }}>
                          Opening Amazon Pay...
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#FF9900' }}>
                        Amazon Pay
                      </Typography>
                    )}
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card toggle
                      navigate('/register');
                    }}
                    sx={{
                      background: 'linear-gradient(135deg, #FF9900 0%, #FFAD33 100%)',
                      color: 'white',
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      py: 0.8,
                      mt: 1,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #E68900 0%, #FF9900 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(255, 153, 0, 0.3)'
                      }
                    }}
                    endIcon={<ArrowForwardRounded />}
                  >
                    Sign Up to Get Started
                  </Button>
                  
                  <Typography variant="caption" sx={{ 
                    display: 'block', 
                    textAlign: 'center', 
                    mt: 1.5,
                    opacity: 0.7,
                    fontStyle: 'italic'
                  }}>
                    Tap card to collapse
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Box>
    )
}

export default OfferBanner;