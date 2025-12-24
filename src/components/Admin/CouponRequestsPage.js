// components/Admin/CouponRequestsPage.js
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, useTheme, useMediaQuery,
  IconButton, Tooltip, CircularProgress, Pagination, Avatar, Grid
} from '@mui/material';
import { 
  CheckCircle, Cancel, Visibility, Refresh, 
  CardGiftcard, Person
} from '@mui/icons-material';
import Layout from '../Layout';
import API from '../api/adminApi';
// import API from '../api/api';

const CouponRequestsPage = ({ darkMode, toggleDarkMode, unreadCount, shouldAnimate, username }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [action, setAction] = useState('');
  const [message, setMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalDocs: 0
  });
  const [filter, setFilter] = useState('all');

  const fetchRequests = async (page = 1) => {
    try {
      setLoading(true);
      const response = await API.get(`/api/coupon/admin/requests`, {
        params: { status: filter, page, limit: pagination.limit },
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      setRequests(response.data.docs);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
        totalDocs: response.data.totalDocs
      });
    } catch (error) {
      console.error('Error fetching coupon requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const handleReview = (request, actionType) => {
    setSelectedRequest(request);
    setAction(actionType);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    try {
      setProcessing(true);
      await API.put(`/api/coupon/admin/request/${selectedRequest._id}/review`, {
        action,
        adminMessage: message,
        rejectionReason: action === 'reject' ? rejectionReason : undefined
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });

      setReviewDialogOpen(false);
      setMessage('');
      setRejectionReason('');
      fetchRequests(pagination.page);
      
    } catch (error) {
      console.error('Error reviewing request:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Requested': return 'warning';
      case 'Pending': return 'info';
      case 'Approved': return 'success';
      case 'Completed': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} 
            unreadCount={unreadCount} shouldAnimate={shouldAnimate} username={username}>
      
      <Box sx={{ m: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Coupon Requests Management
        </Typography>

        {/* Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {['all', 'Requested', 'Pending', 'Approved', 'Completed', 'Rejected'].map((status) => (
            <Chip
              key={status}
              label={status === 'all' ? 'All Requests' : status}
              onClick={() => setFilter(status === 'all' ? 'all' : status)}
              color={filter === (status === 'all' ? 'all' : status) ? 'primary' : 'default'}
              variant={filter === (status === 'all' ? 'all' : status) ? 'filled' : 'outlined'}
            />
          ))}
          <Button
            startIcon={<Refresh />}
            onClick={() => fetchRequests(pagination.page)}
            variant="outlined"
            size="small"
          >
            Refresh
          </Button>
        </Box>

        {/* Requests Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : requests.length === 0 ? (
          <Typography sx={{ p: 4, textAlign: 'center' }}>
            No coupon requests found
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Followers</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Requested</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {request.userId?.profilePic ? (
                            <Avatar 
                              src={`data:image/jpeg;base64,${request.userId.profilePic}`}
                              sx={{ width: 32, height: 32 }}
                            />
                          ) : (
                            <Person />
                          )}
                          <Box>
                            <Typography variant="body2">{request.userId?.username}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {request.userId?.userCode}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={request.userId?.followerCount || 0}
                          size="small"
                          color={request.userId?.followerCount >= 50 ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={request.status}
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedRequest(request);
                                setDetailDialogOpen(true);
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {['Requested', 'Pending'].includes(request.status) && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleReview(request, 'approve')}
                                >
                                  <CheckCircle fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleReview(request, 'reject')}
                                >
                                  <Cancel fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={(e, page) => fetchRequests(page)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)}>
          <DialogTitle>
            {action === 'approve' ? 'Approve Coupon Request' : 'Reject Coupon Request'}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" gutterBottom>
              User: {selectedRequest?.userId?.username}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Followers: {selectedRequest?.userId?.followerCount}
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Admin Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              margin="normal"
              placeholder="Optional message to the user"
            />
            
            {action === 'reject' && (
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Rejection Reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                margin="normal"
                required
                placeholder="Please provide a reason for rejection"
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitReview}
              variant="contained"
              color={action === 'approve' ? 'success' : 'error'}
              disabled={processing || (action === 'reject' && !rejectionReason)}
            >
              {processing ? <CircularProgress size={24} /> : action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog 
          open={detailDialogOpen} 
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Coupon Request Details</DialogTitle>
          <DialogContent>
            {selectedRequest && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User Information
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    {selectedRequest.userId?.profilePic ? (
                      <Avatar 
                        src={`data:image/jpeg;base64,${selectedRequest.userId.profilePic}`}
                        sx={{ width: 64, height: 64 }}
                      />
                    ) : (
                      <Avatar sx={{ width: 64, height: 64 }}>
                        <Person />
                      </Avatar>
                    )}
                    <Box>
                      <Typography variant="h6">{selectedRequest.userId?.username}</Typography>
                      <Typography variant="body2">{selectedRequest.userId?.userCode}</Typography>
                      <Typography variant="body2">{selectedRequest.userId?.email}</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={`${selectedRequest.userId?.followerCount || 0} Followers`}
                      color={selectedRequest.userId?.followerCount >= 50 ? 'success' : 'error'}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Request Details
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Status:</strong> {selectedRequest.status}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Requested:</strong> {new Date(selectedRequest.requestedAt).toLocaleString()}
                    </Typography>
                    {selectedRequest.reviewedAt && (
                      <Typography variant="body2">
                        <strong>Reviewed:</strong> {new Date(selectedRequest.reviewedAt).toLocaleString()}
                      </Typography>
                    )}
                    {selectedRequest.completedAt && (
                      <Typography variant="body2">
                        <strong>Completed:</strong> {new Date(selectedRequest.completedAt).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                  
                  {selectedRequest.couponCode && (
                    <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="subtitle2">Coupon Generated</Typography>
                      <Typography variant="h6">{selectedRequest.couponCode}</Typography>
                      <Typography variant="body2">Value: ₹{selectedRequest.couponValue}</Typography>
                    </Box>
                  )}
                  
                  {selectedRequest.adminMessage && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Admin Message</Typography>
                      <Typography variant="body2">{selectedRequest.adminMessage}</Typography>
                    </Box>
                  )}
                  
                  {selectedRequest.rejectionReason && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="error">
                        Rejection Reason
                      </Typography>
                      <Typography variant="body2">{selectedRequest.rejectionReason}</Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default CouponRequestsPage;