// src/components/Admin/SystemHealthDashboard.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Stack,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Memory as MemoryIcon,
  Storage as DatabaseIcon,
  Schedule as JobIcon,
  Notifications as NotificationIcon,
  CheckCircle as HealthyIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from "@mui/icons-material";
import { getSystemHealth, getNotificationStats } from "../api/adminApi";
import WorkHistoryRoundedIcon from '@mui/icons-material/WorkHistoryRounded';
import Layout from "../Layout";

const SystemHealthDashboard = ({ darkMode, toggleDarkMode, unreadCount, shouldAnimate, userName }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [systemHealth, setSystemHealth] = useState(null);
  const [notificationStats, setNotificationStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [daysRange, setDaysRange] = useState(7);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [healthResponse, statsResponse] = await Promise.all([
        getSystemHealth(),
        getNotificationStats(daysRange)
      ]);

      setSystemHealth(healthResponse.data.data);
      setNotificationStats(statsResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load system health data");
      console.error("Error loading system health:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [daysRange]);

  // auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadData();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [loading]);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getDatabaseStatus = (readyState) => {
    switch (readyState) {
      case 1: return { status: 'connected', color: 'success', icon: <HealthyIcon /> };
      case 2: return { status: 'connecting', color: 'warning', icon: <WarningIcon /> };
      case 3: return { status: 'disconnecting', color: 'warning', icon: <WarningIcon /> };
      default: return { status: 'disconnected', color: 'error', icon: <ErrorIcon /> };
    }
  };

  // Get platform information from user agent (browser-based)
  const getPlatformInfo = () => {
    const userAgent = navigator.userAgent;
    let platform = 'Unknown';
    
    if (userAgent.includes('Win')) platform = 'Windows';
    else if (userAgent.includes('Mac')) platform = 'macOS';
    else if (userAgent.includes('Linux')) platform = 'Linux';
    else if (userAgent.includes('Android')) platform = 'Android';
    else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) platform = 'iOS';
    
    return platform;
  };

  // if (loading && !systemHealth) {
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
      {(loading && !systemHealth) ?
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box> 
        :
        <Box sx={{ p: isMobile ? 1 : 3 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                  System Health Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Monitor system performance, database status, and notification metrics
                </Typography>
              </Box>
              <Tooltip title="Refresh Data">
                <IconButton onClick={loadData} disabled={loading} size="large">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* System Health Cards */}
          <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 4 }}>
            {/* Database Status */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                    <DatabaseIcon color="primary" />
                    <Typography variant="h6">Database</Typography>
                  </Box>
                  {systemHealth?.database && (
                    <Box>
                      <Chip
                        icon={getDatabaseStatus(systemHealth.database.readyState).icon}
                        label={getDatabaseStatus(systemHealth.database.readyState).status}
                        color={getDatabaseStatus(systemHealth.database.readyState).color}
                        variant="filled"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        State: {systemHealth.database.readyState}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* System Uptime */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                    <WorkHistoryRoundedIcon color="primary" />
                    <Typography variant="h6">Uptime</Typography>
                  </Box>
                  {systemHealth?.system && (
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        {formatUptime(systemHealth.system.uptime)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Node: {systemHealth.system.nodeVersion}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Memory Usage */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                    <MemoryIcon color="primary" />
                    <Typography variant="h6">Memory</Typography>
                  </Box>
                  {systemHealth?.system?.memory && (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Used: {formatBytes(systemHealth.system.memory.heapUsed)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total: {formatBytes(systemHealth.system.memory.heapTotal)}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(systemHealth.system.memory.heapUsed / systemHealth.system.memory.heapTotal) * 100}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Job Status */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                    <JobIcon color="primary" />
                    <Typography variant="h6">Post Status Job</Typography>
                  </Box>
                  {systemHealth?.jobs?.postStatusUpdate && (
                    <Box>
                      <Chip
                        label={systemHealth.jobs.postStatusUpdate.isRunning ? 'Running' : 'Idle'}
                        color={systemHealth.jobs.postStatusUpdate.isRunning ? 'warning' : 'success'}
                        variant="filled"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Pending: {systemHealth.jobs.postStatusUpdate.pendingUpdates}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Notification Statistics */}
          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3 }}>
                    <NotificationIcon color="primary" />
                    <Typography variant="h6">Notification Statistics</Typography>
                  </Box>
                  
                  {/* Time Range Filter */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Time Range:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {[7, 30, 90].map((days) => (
                        <Chip
                          key={days}
                          label={`${days} days`}
                          variant={daysRange === days ? "filled" : "outlined"}
                          onClick={() => setDaysRange(days)}
                          color="primary"
                          size="small"
                        />
                      ))}
                    </Stack>
                  </Box>

                  {notificationStats && (
                    <Box>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={4}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="primary.main">
                              {notificationStats.totalStats.total}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="success.main">
                              {notificationStats.totalStats.read}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Read
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="warning.main">
                              {notificationStats.totalStats.unread}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Unread
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Daily Stats Table */}
                      {notificationStats.dailyStats && notificationStats.dailyStats.length > 0 ? (
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell align="right">Sent</TableCell>
                                <TableCell align="right">Read</TableCell>
                                <TableCell align="right">Rate</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {notificationStats.dailyStats.map((day) => (
                                <TableRow key={day._id}>
                                  <TableCell>{day._id}</TableCell>
                                  <TableCell align="right">{day.count}</TableCell>
                                  <TableCell align="right">{day.readCount}</TableCell>
                                  <TableCell align="right">
                                    {day.count > 0 ? ((day.readCount / day.count) * 100).toFixed(1) + '%' : '0%'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                          No notification data available for the selected period
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* System Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Information
                  </Typography>
                  {systemHealth && (
                    <Box>
                      <Stack spacing={1}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Last Updated:
                          </Typography>
                          <Typography variant="body2">
                            {systemHealth.timestamp ? new Date(systemHealth.timestamp).toLocaleString() : 'N/A'}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Node.js Version:
                          </Typography>
                          <Typography variant="body2">
                            {systemHealth.system?.nodeVersion || 'N/A'}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Client Platform:
                          </Typography>
                          <Typography variant="body2">
                            {getPlatformInfo()}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Browser:
                          </Typography>
                          <Typography variant="body2">
                            {navigator.userAgent.split(' ').find(agent => agent.includes('/'))?.split('/')[0] || 'Unknown'}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Memory Usage:
                          </Typography>
                          <Typography variant="body2">
                            {systemHealth.system?.memory ? 
                              `${formatBytes(systemHealth.system.memory.heapUsed)} / ${formatBytes(systemHealth.system.memory.heapTotal)}`
                              : 'N/A'
                            }
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Database:
                          </Typography>
                          <Typography variant="body2">
                            {systemHealth.database?.connected ? 'Connected' : 'Disconnected'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Auto-refresh indicator */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Data auto-refreshes every 30 seconds
            </Typography>
          </Box>
        </Box>
      }
    </Layout>
  );
};

export default SystemHealthDashboard;