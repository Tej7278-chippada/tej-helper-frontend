import { Box, Button, Chip, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import API from "../api/api";
import {
  CardGiftcardRounded,
  LockRounded,
  CheckCircleRounded,
  PendingRounded,
  CancelRounded
} from '@mui/icons-material';

const RequestCoupon = ({setSnackbar, id, isAuthenticated, followerCount }) => {
      const [couponRequest, setCouponRequest] = useState(null);
      const [userCoupon, setUserCoupon] = useState(null);
      const [requestLoading, setRequestLoading] = useState(false);
      // const [couponDialogOpen, setCouponDialogOpen] = useState(false);
      const isEligibleForCoupon = followerCount >= 50;
    
      // Add this function to handle coupon request:
      const handleRequestCoupon = async () => {
        if (followerCount < 50) {
          setSnackbar({
            open: true,
            message: 'You need at least 50 followers to request Amazon Pay gift card' || 'Error requesting gift card',
            severity: 'warning'
          });
          return;
        }
        try {
          setRequestLoading(true);
          const response = await API.post('/api/coupon/request-coupon', {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
          });
          
          setCouponRequest(response.data);
          setSnackbar({
            open: true,
            message: response.data.message,
            severity: 'success'
          });
          
          // Fetch updated request status
          fetchCouponRequest();
          
        } catch (error) {
          console.error('Error requesting coupon:', error);
          setSnackbar({
            open: true,
            message: error.response?.data?.message || 'Error requesting coupon',
            severity: 'error'
          });
        } finally {
          setRequestLoading(false);
        }
      };
    
      // Add function to fetch coupon request status:
      const fetchCouponRequest = async () => {
        try {
          const response = await API.get('/api/coupon/my-coupon-request', {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
          });
          setCouponRequest(response.data);
        } catch (error) {
          // No request found is okay
          if (error.response?.status !== 404) {
            console.error('Error fetching coupon request:', error);
          }
        }
      };
    
      // Add function to fetch user's coupon:
      const fetchUserCoupon = async () => {
        try {
          const response = await API.get('/api/coupon/my-coupon', {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
          });
          setUserCoupon(response.data);
        } catch (error) {
          // No coupon found is okay
          if (error.response?.status !== 404) {
            console.error('Error fetching coupon:', error);
          }
        }
      };
    
      // Add these useEffect calls:
      useEffect(() => {
        if (isAuthenticated && followerCount >= 50) {
          fetchCouponRequest();
          fetchUserCoupon();
        }
      }, [id, isAuthenticated]);

    return(
        <Box sx={{ mt: 2, ml: 4 }}>
            {/* Display current coupon if user has one */}
            {userCoupon && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CheckCircleRounded color="success" />
                        <Typography variant="subtitle1" fontWeight={600}>
                            Active Coupon Available!
                        </Typography>
                    </Box>
                    <Typography variant="body2">
                        Code: <strong>{userCoupon.code}</strong>
                    </Typography>
                    <Typography variant="body2">
                        Value: ₹{userCoupon.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Expires: {new Date(userCoupon.expiresAt).toLocaleDateString()}
                    </Typography>
                    {userCoupon.isUsed && (
                        <Chip label="Used" color="default" size="small" sx={{ mt: 1 }} />
                    )}
                </Box>
            )}

            {/* Display request status if pending */}
            {couponRequest && !userCoupon && (
                <Box sx={{
                    mb: 3, p: 2,
                    bgcolor: couponRequest.status === 'Approved' ? 'success.light' :
                        couponRequest.status === 'Rejected' ? 'error.light' : 'warning.light',
                    borderRadius: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {couponRequest.status === 'Requested' || couponRequest.status === 'Pending' ? (
                            <PendingRounded color="warning" />
                        ) : couponRequest.status === 'Approved' ? (
                            <CheckCircleRounded color="success" />
                        ) : (
                            <CancelRounded color="error" />
                        )}
                        <Typography variant="subtitle1" fontWeight={600}>
                            Coupon Request: {couponRequest.status}
                        </Typography>
                    </Box>
                    <Typography variant="body2">
                        Requested on: {new Date(couponRequest.requestedAt).toLocaleDateString()}
                    </Typography>
                    {couponRequest.reviewedAt && (
                        <Typography variant="body2">
                            Reviewed on: {new Date(couponRequest.reviewedAt).toLocaleDateString()}
                        </Typography>
                    )}
                    {couponRequest.adminMessage && (
                        <Typography variant="body2">
                            Message: {couponRequest.adminMessage}
                        </Typography>
                    )}
                    {couponRequest.rejectionReason && (
                        <Typography variant="body2" color="error">
                            Reason: {couponRequest.rejectionReason}
                        </Typography>
                    )}
                </Box>
            )}

            {/* Request button (only show if no active coupon or pending request) */}
            {!userCoupon && (!couponRequest || ['Rejected'].includes(couponRequest.status)) && (
                <>
                    <Button
                        fullWidth
                        disabled={requestLoading} // !isEligibleForCoupon ||
                        onClick={handleRequestCoupon}
                        startIcon={
                            // !isEligibleForCoupon ? (
                            //   <LockRounded />
                            // ) : (
                            <CardGiftcardRounded />
                            // )
                        }
                        sx={{
                            background:
                                //  isEligibleForCoupon
                                //   ? 
                                'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
                            // : 'linear-gradient(135deg, #bdbdbd, #9e9e9e)',
                            color: 'white',
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 600,
                            py: 1.2,
                            boxShadow:
                                //  isEligibleForCoupon
                                //   ? 
                                '0 6px 25px rgba(67,97,238,0.35)',
                            // : 'none',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform:
                                    //  isEligibleForCoupon ? 
                                    'translateY(-2px)',
                                // : 'none',
                                boxShadow:
                                    //  isEligibleForCoupon
                                    // ? 
                                    '0 10px 30px rgba(67,97,238,0.45)',
                                // : 'none',
                            },
                        }}
                    >
                        {requestLoading ? (
                            <CircularProgress size={22} sx={{ color: '#fff' }} />
                        ) : (
                            'Request ₹500 Gift Card'
                        )}
                    </Button>

                    {/* Eligibility Helper Text */}
                    {!isEligibleForCoupon && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.8 }}
                        >
                            Reach <strong>50 followers</strong> to unlock Amazon pay gift card request
                        </Typography>
                    )}

                    {isEligibleForCoupon && (
                        <Typography
                            variant="caption"
                            color="success.main"
                            sx={{ display: 'block', mt: 0.8 }}
                        >
                            🎉 You're eligible! Request your gift card now
                        </Typography>
                    )}
                </>
            )}
        </Box>
    );
}

export default RequestCoupon;