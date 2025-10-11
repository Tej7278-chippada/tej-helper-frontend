// src/components/Admin/PostStatusManagement.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  LinearProgress,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import {
  PlayArrow as RunIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Visibility as ViewIcon
} from "@mui/icons-material";
// import { getPostStatusStats } from "../api/adminApi";
import { 
  triggerPostStatusUpdate, 
  getPostStatusStats, 
  getPendingUpdates,
  getUpdateHistory 
} from "../api/adminApi";
import Layout from "../Layout";

const PostStatusManagement = ({ darkMode, toggleDarkMode, unreadCount, shouldAnimate, userName }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [stats, setStats] = useState(null);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [updateHistory, setUpdateHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedPostType, setSelectedPostType] = useState("all");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsResponse, pendingResponse, historyResponse] = await Promise.all([
        getPostStatusStats(),
        getPendingUpdates(1, 100, selectedPostType === "all" ? "" : selectedPostType),
        getUpdateHistory()
      ]);

      setStats(statsResponse.data.data);
      setPendingPosts(pendingResponse.data.data.posts);
      setUpdateHistory(historyResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
      console.error("Error loading post status data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPostType]);

  const handleRunUpdate = async () => {
    setUpdating(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await triggerPostStatusUpdate();
      setSuccess(`Successfully updated ${response.data.data.totalUpdated} posts`);
      await loadData(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.message || "Failed to run post status update");
    } finally {
      setUpdating(false);
    }
  };

  const handleViewDetails = (post) => {
    setSelectedPost(post);
    setDetailDialogOpen(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getDaysAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPostStatusColor = (post) => {
    if (post.postType === 'HelpRequest') {
      return 'warning';
    } else {
      return 'info';
    }
  };

  // if (loading && !stats) {
  //   return (
  //     <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  return (
    <Layout
      darkMode={darkMode} 
      toggleDarkMode={toggleDarkMode} 
      unreadCount={unreadCount} 
      shouldAnimate={shouldAnimate} 
      userName={userName}
    >
      {(loading && !stats) ?
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box> 
        :
        <Box sx={{ p: isMobile ? 1 : 3 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Post Status Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Automatically update post statuses based on service dates and activity
            </Typography>
          </Box>

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}

          {/* Stats Cards */}
          <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Posts
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats?.postStats?.totalPosts?.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {stats?.postStats?.activePosts?.toLocaleString() || 0} active
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Pending Updates
                  </Typography>
                  <Typography variant="h4" component="div" color="warning.main">
                    {((stats?.jobStats?.pendingHelpRequestUpdates || 0) + (stats?.jobStats?.pendingServiceOfferingUpdates || 0)).toLocaleString()}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                    <Chip 
                      size="small" 
                      label={`${stats?.jobStats?.pendingHelpRequestUpdates || 0} Help`} 
                      color="warning" 
                      variant="outlined"
                    />
                    <Chip 
                      size="small" 
                      label={`${stats?.jobStats?.pendingServiceOfferingUpdates || 0} Service`} 
                      color="info" 
                      variant="outlined"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Job Status
                  </Typography>
                  <Box display="flex" alignItems="center">
                    {stats?.jobStats?.isRunning ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        <Typography variant="h6" color="warning.main">
                          Running
                        </Typography>
                      </>
                    ) : (
                      <>
                        <SuccessIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="h6" color="success.main">
                          Ready
                        </Typography>
                      </>
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Scheduled: Daily 2 AM
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Recent Activity
                  </Typography>
                  <Typography variant="h4" component="div">
                    {updateHistory?.summary?.last24Hours || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {updateHistory?.summary?.lastHour || 0} in last hour
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Notifications Sent
                  </Typography>
                  <Typography variant="h4" component="div" color="info.main">
                    {stats?.jobStats?.notificationStats?.totalNotifications?.toLocaleString() || 0}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                    <Chip 
                      size="small" 
                      label={`${stats?.jobStats?.notificationStats?.readNotifications || 0} read`} 
                      color="success" 
                      variant="outlined"
                    />
                    <Chip 
                      size="small" 
                      label={`${stats?.jobStats?.notificationStats?.unreadNotifications || 0} unread`} 
                      color="warning" 
                      variant="outlined"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Control Section */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Manual Update
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Trigger post status update immediately
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={updating ? <CircularProgress size={20} /> : <RunIcon />}
                  onClick={handleRunUpdate}
                  disabled={updating || stats?.jobStats?.isRunning}
                  size="large"
                >
                  {updating ? "Updating..." : "Run Update Now"}
                </Button>
              </Box>
              
              {stats?.jobStats?.isRunning && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Update job is currently running...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Pending Updates Section */}
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
                <Typography variant="h6">
                  Posts Pending Status Update ({pendingPosts.length})
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    label="All Types"
                    variant={selectedPostType === "all" ? "filled" : "outlined"}
                    onClick={() => setSelectedPostType("all")}
                    color="primary"
                  />
                  <Chip
                    label="Help Requests"
                    variant={selectedPostType === "HelpRequest" ? "filled" : "outlined"}
                    onClick={() => setSelectedPostType("HelpRequest")}
                    color="warning"
                  />
                  <Chip
                    label="Service Offerings"
                    variant={selectedPostType === "ServiceOffering" ? "filled" : "outlined"}
                    onClick={() => setSelectedPostType("ServiceOffering")}
                    color="info"
                  />
                  <Tooltip title="Refresh">
                    <IconButton onClick={loadData} disabled={loading}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Service Date</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Days Ago</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingPosts
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((post) => (
                        <TableRow key={post._id} hover>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {post.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={post.postType}
                              color={getPostStatusColor(post)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {post.serviceDate ? formatDate(post.serviceDate) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {formatDate(post.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${getDaysAgo(post.serviceDate || post.createdAt)} days`}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(post)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={pendingPosts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </CardContent>
          </Card>

          {/* Post Details Dialog */}
          <Dialog
            open={detailDialogOpen}
            onClose={() => setDetailDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Post Details
            </DialogTitle>
            <DialogContent>
              {selectedPost && (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                    <Typography variant="body1">{selectedPost.title}</Typography>
                  </Box>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                      <Chip
                        label={selectedPost.postType}
                        color={getPostStatusColor(selectedPost)}
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip
                        label={selectedPost.postStatus}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </Box>
                  {selectedPost.serviceDate && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Service Date</Typography>
                      <Typography variant="body1">{formatDate(selectedPost.serviceDate)}</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                    <Typography variant="body1">{formatDate(selectedPost.createdAt)}</Typography>
                  </Box>
                  {selectedPost.updatedAt && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                      <Typography variant="body1">{formatDate(selectedPost.updatedAt)}</Typography>
                    </Box>
                  )}
                </Stack>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      }
    </Layout>
  );
};

export default PostStatusManagement;