// src/components/Admin/AdminPreferences.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  TextField,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import {
  Settings as SettingsIcon,
  History as HistoryIcon,
  PlayArrow as RunIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon
} from "@mui/icons-material";
import { 
  getAdminPreferences, 
  updateAdminPreferences, 
  getActivityLogs,
  getServiceStatus,
  triggerPostStatusUpdate 
} from "../api/adminApi";

const AdminPreferences = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [preferences, setPreferences] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [runUpdateDialog, setRunUpdateDialog] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [prefsResponse, activityResponse, statusResponse] = await Promise.all([
        getAdminPreferences(),
        getActivityLogs(7, 20),
        getServiceStatus()
      ]);

      setPreferences(prefsResponse.data.data);
      setActivityLogs(activityResponse.data.data);
      setServiceStatus(statusResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin preferences");
      console.error("Error loading admin preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePreferenceChange = async (category, key, value) => {
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      const updatedSettings = {
        ...preferences[category],
        [key]: value
      };
      
      await updateAdminPreferences(category, updatedSettings);
      
      // Update local state
      setPreferences(prev => ({
        ...prev,
        [category]: updatedSettings
      }));
      
      setSuccess(`Preference updated successfully: ${key}`);
      
      // Reload service status to get updated preferences
      const statusResponse = await getServiceStatus();
      setServiceStatus(statusResponse.data.data);
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update preference");
    } finally {
      setSaving(false);
    }
  };

  const handleRunUpdate = async () => {
    setUpdating(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await triggerPostStatusUpdate();
      setSuccess(`Post status update completed. Updated ${response.data.data.totalUpdated} posts`);
      setRunUpdateDialog(false);
      await loadData(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.message || "Failed to run post status update");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'scheduled_update': return 'primary';
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

  if (loading && !preferences) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Admin Preferences
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage post status update settings and system preferences
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<RunIcon />}
            onClick={() => setRunUpdateDialog(true)}
            disabled={serviceStatus?.isRunning}
          >
            Run Update Now
          </Button>
        </Box>
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

      <Grid container spacing={3}>
        {/* Post Status Update Preferences */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3 }}>
                <SettingsIcon color="primary" />
                <Typography variant="h6">Post Status Update Settings</Typography>
              </Box>

              <Stack spacing={3}>
                {/* Scheduled Updates Toggle */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      Scheduled Updates
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Automatically update post statuses daily at 2 AM
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences?.post_status_updates?.scheduledUpdatesEnabled !== false}
                        onChange={(e) => handlePreferenceChange(
                          'post_status_updates',
                          'scheduledUpdatesEnabled',
                          e.target.checked
                        )}
                        disabled={saving}
                      />
                    }
                    label={preferences?.post_status_updates?.scheduledUpdatesEnabled !== false ? 
                      <ToggleOnIcon color="success" /> : <ToggleOffIcon color="disabled" />
                    }
                    labelPlacement="start"
                  />
                </Box>

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
                        checked={preferences?.post_status_updates?.notificationsEnabled !== false}
                        onChange={(e) => handlePreferenceChange(
                          'post_status_updates',
                          'notificationsEnabled',
                          e.target.checked
                        )}
                        disabled={saving}
                      />
                    }
                    label={preferences?.post_status_updates?.notificationsEnabled !== false ? 
                      <ToggleOnIcon color="success" /> : <ToggleOffIcon color="disabled" />
                    }
                    labelPlacement="start"
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
                        value={preferences?.post_status_updates?.batchSize || 1000}
                        onChange={(e) => handlePreferenceChange(
                          'post_status_updates',
                          'batchSize',
                          parseInt(e.target.value)
                        )}
                        disabled={saving}
                        fullWidth
                        size="small"
                        inputProps={{ min: 100, max: 5000 }}
                        helperText="Number of posts to process at once"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Max Concurrent Batches"
                        type="number"
                        value={preferences?.post_status_updates?.maxConcurrentBatches || 3}
                        onChange={(e) => handlePreferenceChange(
                          'post_status_updates',
                          'maxConcurrentBatches',
                          parseInt(e.target.value)
                        )}
                        disabled={saving}
                        fullWidth
                        size="small"
                        inputProps={{ min: 1, max: 10 }}
                        helperText="Parallel batch processing"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Service Status */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Service Status
              </Typography>
              
              {serviceStatus && (
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Current Status:
                    </Typography>
                    <Chip
                      label={serviceStatus.isRunning ? 'Running' : 'Idle'}
                      color={serviceStatus.isRunning ? 'warning' : 'success'}
                      size="small"
                    />
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Scheduled Updates:
                    </Typography>
                    <Chip
                      label={serviceStatus.preferences?.scheduledUpdatesEnabled ? 'Enabled' : 'Disabled'}
                      color={serviceStatus.preferences?.scheduledUpdatesEnabled ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Notifications:
                    </Typography>
                    <Chip
                      label={serviceStatus.preferences?.notificationsEnabled ? 'Enabled' : 'Disabled'}
                      color={serviceStatus.preferences?.notificationsEnabled ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>

                  {serviceStatus.lastActivity && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Last Activity:
                      </Typography>
                      <Typography variant="body2">
                        {serviceStatus.lastActivity.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(serviceStatus.lastActivity.performedAt)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              )}
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
                        <TableCell>Activity</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activityLogs.slice(0, 5).map((activity) => (
                        <TableRow key={activity._id}>
                          <TableCell>
                            <Typography variant="body2">
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              by {activity.performedBy?.username || 'System'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={activity.status}
                              color={getStatusColor(activity.status)}
                              size="small"
                            />
                          </TableCell>
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
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  No recent activity
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Run Update Dialog */}
      <Dialog open={runUpdateDialog} onClose={() => setRunUpdateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Run Post Status Update</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            This will manually trigger the post status update process. Are you sure you want to continue?
          </Typography>
          {serviceStatus?.preferences && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Current settings:
              </Typography>
              <Typography variant="body2">
                • Notifications: {serviceStatus.preferences.notificationsEnabled ? 'Enabled' : 'Disabled'}
              </Typography>
              <Typography variant="body2">
                • Batch Size: {serviceStatus.preferences.batchSize}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRunUpdateDialog(false)} disabled={updating}>
            Cancel
          </Button>
          <Button 
            onClick={handleRunUpdate} 
            variant="contained" 
            disabled={updating}
            startIcon={updating ? <CircularProgress size={20} /> : null}
          >
            {updating ? 'Running...' : 'Run Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPreferences;