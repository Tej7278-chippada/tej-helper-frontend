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
  DialogActions,
  Switch,
  FormControlLabel,
  TextField,
  MenuItem,
  InputAdornment,
  Slide,
  Skeleton
} from "@mui/material";
import {
  PlayArrow as RunIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  AccessTime as TimeIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { 
  triggerPostStatusUpdate, 
  getPostStatusStats, 
  getPendingUpdates,
  getUpdateHistory,
  getAdminPreferences,
  updateAdminPreferences,
  getServiceStatus,
  getActivityLogs
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedPostType, setSelectedPostType] = useState("all");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  
  // Preferences state
  const [preferences, setPreferences] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [preferencesDialogOpen, setPreferencesDialogOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Timezone options
  const timezoneOptions = [
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
  ];

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsResponse, pendingResponse, historyResponse, prefsResponse, statusResponse, activityResponse] = await Promise.all([
        getPostStatusStats(),
        getPendingUpdates(1, 100, selectedPostType === "all" ? "" : selectedPostType),
        getUpdateHistory(),
        getAdminPreferences(),
        getServiceStatus(),
        getActivityLogs(7, 20),
      ]);

      setStats(statsResponse.data.data);
      setPendingPosts(pendingResponse.data.data.posts);
      setUpdateHistory(historyResponse.data.data);
      setPreferences(prefsResponse.data.data);
      setServiceStatus(statusResponse.data.data);
      setActivityLogs(activityResponse.data.data);
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

  const handlePreferenceChange = (key, value) => {
    setPendingChanges(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const openConfirmDialog = () => {
    if (Object.keys(pendingChanges).length > 0) {
      setConfirmDialogOpen(true);
    } else {
      setPreferencesDialogOpen(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      await updateAdminPreferences('post_status_updates', pendingChanges);
      
      // Update local state
      setPreferences(prev => ({
        ...prev,
        post_status_updates: {
          ...prev.post_status_updates,
          ...pendingChanges
        }
      }));
      
      setSuccess('Preferences updated successfully');
      setPendingChanges({});
      setConfirmDialogOpen(false);
      setPreferencesDialogOpen(false);
      
      // Reload service status to get updated schedule
      const statusResponse = await getServiceStatus();
      setServiceStatus(statusResponse.data.data);
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update preferences");
    } finally {
      setSaving(false);
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

  const getCurrentSetting = (key) => {
    const current = preferences?.post_status_updates?.[key];
    const pending = pendingChanges[key];
    return pending !== undefined ? pending : current;
  };

  const formatNextRun = (nextRun) => {
    if (!nextRun) return 'Not scheduled';
    return new Date(nextRun).toLocaleString();
  };

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'scheduled_update': return 'success';
      case 'manual_update': return 'secondary';
      case 'preferences_change': return 'info';
      case 'system_event': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'error';
      case 'running': return 'warning';
      default: return 'default';
    }
  };

  const LoadingSkeleton = () => (
    <Grid container spacing={isMobile ? 1 : 2} >
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={3} lg={3} key={index}>
        <Card key={index} sx={{ mb: 0, p: 2, borderRadius: '8px' }}>
          <Box sx={{ mb: 2 }}>
              <Skeleton variant="text" width="50%" />
          </Box>
          <Skeleton variant="rectangular" height={40} />
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexDirection: 'row' }}>
            <Skeleton variant="rectangular" width={60} height={20} />
            <Skeleton variant="rectangular" width={60} height={20} />
          </Box>
        </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Layout
      darkMode={darkMode} 
      toggleDarkMode={toggleDarkMode} 
      unreadCount={unreadCount} 
      shouldAnimate={shouldAnimate} 
      userName={userName}
    >
      {/* Header */}
      <Box sx={{ mb: 0, p: isMobile ? 1 : 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Post Status Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Automatically update post statuses based on service dates and activity
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />} sx={{ borderRadius: '12px', textTransform: 'none'}}
            onClick={() => setPreferencesDialogOpen(true)}
          >
            Settings
          </Button>
        </Box>
      </Box>
      {(loading && !stats) ?
        <Box sx={{ p: isMobile ? 1 : 3 }}>
          <LoadingSkeleton />
        </Box> 
        :
        <Box sx={{ p: isMobile ? 1 : 3 }}> 
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
              <Card sx={{ borderRadius: '8px' }}>
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
              <Card sx={{ borderRadius: '8px' }}>
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
              <Card sx={{ borderRadius: '8px' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Service Status
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
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                    <Chip 
                      size="small" 
                      label={`Sched: ${serviceStatus?.preferences?.scheduledUpdatesEnabled ? 'ON' : 'OFF'}`} 
                      color={serviceStatus?.preferences?.scheduledUpdatesEnabled ? 'success' : 'error'} 
                      variant="outlined"
                    />
                    <Chip 
                      size="small" 
                      label={`Notify: ${serviceStatus?.preferences?.notificationsEnabled ? 'ON' : 'OFF'}`} 
                      color={serviceStatus?.preferences?.notificationsEnabled ? 'success' : 'error'} 
                      variant="outlined"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: '8px' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Next Scheduled Run
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                    <TimeIcon color="primary" fontSize="small" />
                    <Typography variant="h6" component="div">
                      {serviceStatus?.schedule?.scheduledTime || '02:00'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {serviceStatus?.schedule?.isScheduled ? 
                      formatNextRun(serviceStatus?.schedule?.nextRun) : 
                      'Not scheduled'
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: '8px' }}>
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
              <Card sx={{ borderRadius: '8px' }}>
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
          <Card sx={{ mb: 2, borderRadius: '8px' }}>
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
                  onClick={handleRunUpdate} sx={{ borderRadius: '12px'}}
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

          {/* Recent Activity */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <HistoryIcon color="primary" />
                <Typography variant="h6">Recent Activity</Typography>
              </Box>

              {activityLogs.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Activity</TableCell>
                        <TableCell>Details</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activityLogs.slice(0, 25).map((activity) => (
                        <TableRow
                          key={activity._id}
                          hover
                          sx={{
                            '&:hover': { backgroundColor: 'action.hover' },
                            borderLeft: `4px solid ${
                              activity.status === 'failed'
                                ? '#f44336'
                                : activity.status === 'running'
                                ? '#ff9800'
                                : '#4caf50'
                            }`,
                          }}
                        >
                          {/* Activity Type */}
                          <TableCell>
                            <Chip
                              icon={
                                activity.activityType === 'scheduled_update'
                                  ? <ScheduleIcon />
                                  : activity.activityType === 'manual_update'
                                  ? <BuildRoundedIcon />
                                  : activity.activityType === 'preferences_change'
                                  ? <TuneRoundedIcon />
                                  : <SettingsIcon />
                              }
                              label={activity.activityType.replace('_', ' ')}
                              color={getActivityColor(activity.activityType)}
                              size="small"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </TableCell>

                          {/* Description */}
                          <TableCell>
                            <Tooltip title={activity.description}>
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{ maxWidth: 220, fontWeight: 500 }}
                              >
                                {activity.description}
                              </Typography>
                            </Tooltip>
                            <Typography variant="caption" color="text.secondary">
                              by {activity.performedBy?.username || 'System'}
                            </Typography>
                          </TableCell>

                          {/* Details */}
                          <TableCell>
                            {activity.activityType === 'preferences_change' ? (
                              <>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  Preferences Changed:
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={0.5}>
                                  {activity.details.preferencesChanged?.length > 0 ? (
                                    activity.details.preferencesChanged.map((pref, idx) => (
                                      <Chip
                                        key={idx}
                                        label={pref}
                                        size="small"
                                        variant="outlined"
                                      />
                                    ))
                                  ) : (
                                    <Typography variant="caption" color="text.secondary">
                                      No details
                                    </Typography>
                                  )}
                                </Box>
                                {activity.details.error && (
                                  <Typography
                                    variant="body2"
                                    color="error"
                                    sx={{ mt: 0.5, fontWeight: 500 }}
                                  >
                                    ⚠ Error: {activity.details.error}
                                  </Typography>
                                )}
                              </>
                            ) : (
                              <>
                                <Typography variant="body2">
                                  Updated Posts:{' '}
                                  <b>{activity.details.postsUpdated ?? 0}</b>
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Batch: {activity.details.batchSize ?? 0} | Duration:{' '}
                                  {activity.details.duration ?? 0}s
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Triggered by {activity.details?.triggeredBy || 'System'}
                                </Typography>
                                {activity.details.error && (
                                  <Typography
                                    variant="body2"
                                    color="error"
                                    sx={{ mt: 0.5, fontWeight: 500 }}
                                  >
                                    ⚠ Error: {activity.details.error}
                                  </Typography>
                                )}
                              </>
                            )}
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Chip
                              label={activity.status}
                              color={getStatusColor(activity.status)}
                              size="small"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </TableCell>

                          {/* Date */}
                          <TableCell>
                            <Typography variant="caption">
                              {formatDate(activity.performedAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  py={2}
                >
                  No recent activity
                </Typography>
              )}
            </CardContent>
          </Card>


          {/* Preferences Dialog */}
          <Dialog open={preferencesDialogOpen} onClose={openConfirmDialog} maxWidth="md" fullWidth fullScreen={isMobile}
            sx={{ 
              '& .MuiPaper-root': { borderRadius: '14px', backdropFilter: 'blur(12px)', }
            }}
            TransitionComponent={Slide}
            TransitionProps={{ direction: 'up' }}
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <SettingsIcon color="primary" />
                Post Status Update Settings
              </Box>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                {/* Scheduled Updates Toggle */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      Scheduled Updates
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Automatically update post statuses daily
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={getCurrentSetting('scheduledUpdatesEnabled') !== false}
                        onChange={(e) => handlePreferenceChange(
                          'scheduledUpdatesEnabled',
                          e.target.checked
                        )}
                      />
                    }
                    // label={getCurrentSetting('scheduledUpdatesEnabled') !== false ? 
                    //   <ToggleOnIcon color="success" /> : <ToggleOffIcon color="disabled" />
                    // }
                    // labelPlacement="start"
                  />
                </Box>

                {/* Schedule Time Settings - Only show if scheduled updates are enabled */}
                {getCurrentSetting('scheduledUpdatesEnabled') !== false && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                      Schedule Settings
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Scheduled Time"
                          type="time"
                          value={getCurrentSetting('scheduledUpdateTime') || '02:00'}
                          onChange={(e) => handlePreferenceChange(
                            'scheduledUpdateTime',
                            e.target.value
                          )}
                          fullWidth
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 300 }} // 5 minute steps
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <TimeIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                          helperText="Daily execution time (24-hour)"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Timezone"
                          value={getCurrentSetting('scheduledUpdateTimezone') || 'Asia/Kolkata'}
                          onChange={(e) => handlePreferenceChange(
                            'scheduledUpdateTimezone',
                            e.target.value
                          )}
                          fullWidth
                          size="small"
                          helperText="Time zone for scheduling"
                        >
                          {timezoneOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                <Divider />

                {/* Notifications Toggle */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      User Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Send notifications to post owners when status changes
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={getCurrentSetting('notificationsEnabled') !== false}
                        onChange={(e) => handlePreferenceChange(
                          'notificationsEnabled',
                          e.target.checked
                        )}
                      />
                    }
                    // label={getCurrentSetting('notificationsEnabled') !== false ? 
                    //   <ToggleOnIcon color="success" /> : <ToggleOffIcon color="disabled" />
                    // }
                    // labelPlacement="start"
                  />
                </Box>

                <Divider />

                {/* Advanced Settings */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                    Advanced Settings
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Batch Size"
                        type="number"
                        value={getCurrentSetting('batchSize') || 1000}
                        onChange={(e) => handlePreferenceChange(
                          'batchSize',
                          parseInt(e.target.value)
                        )}
                        fullWidth
                        size="small"
                        inputProps={{ min: 100, max: 5000 }}
                        helperText="Posts to process at once"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Max Concurrent Batches"
                        type="number"
                        value={getCurrentSetting('maxConcurrentBatches') || 3}
                        onChange={(e) => handlePreferenceChange(
                          'maxConcurrentBatches',
                          parseInt(e.target.value)
                        )}
                        fullWidth
                        size="small"
                        inputProps={{ min: 1, max: 10 }}
                        helperText="Parallel processing"
                      />
                    </Grid>
                  </Grid>
                </Box>

                {Object.keys(pendingChanges).length > 0 && (
                  <Alert severity="info">
                    You have unsaved changes. Click "Save Changes" to apply them.
                  </Alert>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setPendingChanges({});
                setPreferencesDialogOpen(false);
              }}
              sx={{ borderRadius: '12px'}}>
                Cancel
              </Button>
              <Button 
                onClick={openConfirmDialog}
                variant="contained" sx={{ borderRadius: '12px'}}
                disabled={Object.keys(pendingChanges).length === 0}
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Confirm Changes Dialog */}
          <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth 
            sx={{ 
              '& .MuiPaper-root': { borderRadius: '14px', backdropFilter: 'blur(12px)', }
            }}
          >
            <DialogTitle>Confirm Preference Changes</DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                Are you sure you want to save the following changes?
              </Typography>
              <Box sx={{ mt: 2 }}>
                {Object.entries(pendingChanges).map(([key, value]) => (
                  <Box key={key} display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : value}
                    </Typography>
                  </Box>
                ))}
              </Box>
              {(pendingChanges.scheduledUpdateTime || pendingChanges.scheduledUpdateTimezone) && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Changing the schedule time will restart the scheduled job with the new timing.
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmDialogOpen(false)} disabled={saving} sx={{ borderRadius: '12px'}}>
                Cancel
              </Button>
              <Button 
                onClick={savePreferences} 
                variant="contained" 
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : null}
                sx={{ borderRadius: '12px'}}
              >
                {saving ? 'Saving...' : 'Confirm Changes'}
              </Button>
            </DialogActions>
          </Dialog>

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