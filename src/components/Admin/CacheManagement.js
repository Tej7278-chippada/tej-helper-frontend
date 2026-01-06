// src/components/Admin/CacheManagement.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  // CardActions,
  Button,
  TextField,
  // Alert,
  CircularProgress,
  // IconButton,
  Paper,
  Divider,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  // Table,
  // TableBody,
  // TableCell,
  // TableContainer,
  // TableHead,
  // TableRow,
  // LinearProgress,
  // Tooltip,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Info as InfoIcon,
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Article as ArticleIcon,
  // List as ListIcon,
  ExpandMore as ExpandMoreIcon,
  Cached as CacheIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  DataUsage as DataUsageIcon,
  ClearAll as ClearAllIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import Layout from '../Layout';
import { 
  getCacheStats, 
  clearAllCache, 
  warmUpCache, 
  getRedisInfo,
  flushUserCache,
  flushPostCache,
  clearCacheByPattern,
  getCacheHealth,
  getCacheSettings, updateCacheSettings, toggleCache
} from '../api/cacheApi';
import { useSnackbar } from 'notistack';

const CacheManagement = ({ darkMode, toggleDarkMode, unreadCount, shouldAnimate, username }) => {
  const [stats, setStats] = useState(null);
  const [redisInfo, setRedisInfo] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshTime, setRefreshTime] = useState(null);
  const [clearPattern, setClearPattern] = useState('');
  const [flushUserId, setFlushUserId] = useState('');
  const [flushPostId, setFlushPostId] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: '', data: null });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [cacheSettings, setCacheSettings] = useState({
    cacheEnabled: true,
    cacheTTL: 3600,
    userCacheTTL: 3600,
    postCacheTTL: 1800,
    autoWarmUp: false,
    warmUpSchedule: '03:00'
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Add this effect to load cache settings
  useEffect(() => {
    const loadCacheSettings = async () => {
      try {
        setSettingsLoading(true);
        const response = await getCacheSettings();
        if (response.data?.success) {
          setCacheSettings(response.data.data);
        }
      } catch (error) {
        console.error('Error loading cache settings:', error);
      } finally {
        setSettingsLoading(false);
      }
    };
    
    loadCacheSettings();
  }, []);

  // Add these functions for handling cache settings
  const handleCacheToggle = async () => {
    try {
      setSettingsLoading(true);
      const enabled = !cacheSettings.cacheEnabled;
      const response = await toggleCache(enabled);
      
      if (response.data?.success) {
        setCacheSettings(prev => ({ ...prev, cacheEnabled: enabled }));
        enqueueSnackbar(`Cache ${enabled ? 'enabled' : 'disabled'} successfully`, { 
          variant: enabled ? 'success' : 'warning' 
        });
        // Refresh cache stats
        fetchData();
      }
    } catch (error) {
      enqueueSnackbar('Failed to toggle cache', { variant: 'error' });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSettingsLoading(true);
      const response = await updateCacheSettings(cacheSettings);
      
      if (response.data?.success) {
        enqueueSnackbar('Cache settings saved successfully', { variant: 'success' });
        setEditMode(false);
        // Refresh cache stats
        fetchData();
      }
    } catch (error) {
      enqueueSnackbar('Failed to save cache settings', { variant: 'error' });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleTTLChange = (field, value) => {
    setCacheSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatTTL = (seconds) => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Check if user is authenticated
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            enqueueSnackbar('Please login to access cache management', { variant: 'warning' });
            setLoading(false);
            return;
        }

        // // Check if user is admin (you might want to verify this from user context)
        // const userRole = localStorage.getItem('userRole'); // You need to store this on login
        // if (userRole !== 'admin') {
        //     enqueueSnackbar('Admin access required', { variant: 'error' });
        //     setLoading(false);
        //     return;
        // }
      const [statsResponse, redisResponse, healthResponse] = await Promise.all([
        getCacheStats(),
        getRedisInfo(),
        getCacheHealth()
      ]);

      if (statsResponse.data?.success) {
        setStats(statsResponse.data.data);
      }

      if (redisResponse.data?.success) {
        setRedisInfo(redisResponse.data.data);
      }

      if (healthResponse.data) {
        setHealth(healthResponse.data);
      }

      setRefreshTime(new Date());
      enqueueSnackbar('Cache data refreshed successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error fetching cache data:', error);
      enqueueSnackbar('Failed to fetch cache data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchData, 30000); // Auto-refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleClearAllCache = async () => {
    try {
      setActionLoading(true);
      const response = await clearAllCache();
      if (response.data?.success) {
        enqueueSnackbar('All cache cleared successfully', { variant: 'success' });
        fetchData();
      }
    } catch (error) {
      enqueueSnackbar('Failed to clear cache', { variant: 'error' });
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, action: '', data: null });
    }
  };

  const handleWarmUpCache = async () => {
    try {
      setActionLoading(true);
      const response = await warmUpCache();
      if (response.data?.success) {
        enqueueSnackbar('Cache warm-up initiated successfully', { variant: 'success' });
        setTimeout(fetchData, 2000); // Refresh after 2 seconds
      }
    } catch (error) {
      enqueueSnackbar('Failed to warm up cache', { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearByPattern = async () => {
    if (!clearPattern.trim()) {
      enqueueSnackbar('Please enter a pattern', { variant: 'warning' });
      return;
    }

    try {
      setActionLoading(true);
      const response = await clearCacheByPattern(clearPattern);
      if (response.data?.success) {
        enqueueSnackbar(`Cache cleared for pattern: ${clearPattern}`, { variant: 'success' });
        setClearPattern('');
        fetchData();
      }
    } catch (error) {
      enqueueSnackbar('Failed to clear cache by pattern', { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlushUserCache = async () => {
    if (!flushUserId.trim()) {
      enqueueSnackbar('Please enter a User ID', { variant: 'warning' });
      return;
    }

    try {
      setActionLoading(true);
      const response = await flushUserCache(flushUserId);
      if (response.data?.success) {
        enqueueSnackbar(`User cache flushed for: ${flushUserId}`, { variant: 'success' });
        setFlushUserId('');
        fetchData();
      }
    } catch (error) {
      enqueueSnackbar('Failed to flush user cache', { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlushPostCache = async () => {
    if (!flushPostId.trim()) {
      enqueueSnackbar('Please enter a Post ID', { variant: 'warning' });
      return;
    }

    try {
      setActionLoading(true);
      const response = await flushPostCache(flushPostId);
      if (response.data?.success) {
        enqueueSnackbar(`Post cache flushed for: ${flushPostId}`, { variant: 'success' });
        setFlushPostId('');
        fetchData();
      }
    } catch (error) {
      enqueueSnackbar('Failed to flush post cache', { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmAction = (action, data = null) => {
    setConfirmDialog({ open: true, action, data });
  };

  const getRedisHealthStatus = () => {
    if (!health?.services?.redis) return 'unknown';
    return health.services.redis;
  };

  const getRedisHealthColor = () => {
    const status = getRedisHealthStatus();
    switch (status) {
      case 'healthy': return 'success';
      case 'unhealthy': return 'error';
      case 'unknown': return 'warning';
      default: return 'info';
    }
  };

  const getRedisHealthIcon = () => {
    const status = getRedisHealthStatus();
    switch (status) {
      case 'healthy': return <CheckCircleIcon color="success" />;
      case 'unhealthy': return <ErrorIcon color="error" />;
      case 'unknown': return <WarningIcon color="warning" />;
      default: return <InfoIcon color="info" />;
    }
  };

  const renderStatsCard = (title, value, icon, color, subtitle = '') => (
    <Card sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ color, p: 1, borderRadius: 1, bgcolor: `${color}10` }}>
            {icon}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight="bold">
              {loading ? '...' : value || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderRedisInfoCard = () => (
    <Card sx={{ borderRadius: 2, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageIcon /> Redis Information
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        {redisInfo ? (
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                {getRedisHealthIcon()}
                <Chip 
                  label={getRedisHealthStatus().toUpperCase()} 
                  size="small" 
                  color={getRedisHealthColor()}
                />
              </Stack>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">Connected</Typography>
              <Typography variant="body1">
                {redisInfo.connected ? 'Yes' : 'No'}
              </Typography>
            </Box>
            
            {redisInfo.info && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Detailed Redis Info</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ 
                    p: 1, 
                    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    maxHeight: 200,
                    overflow: 'auto'
                  }}>
                    <pre>{redisInfo.info}</pre>
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </Stack>
        ) : (
          <Typography color="text.secondary">Redis information not available</Typography>
        )}
      </CardContent>
    </Card>
  );

  // card component to render cache settings
  const renderCacheSettingsCard = () => (
    <Card sx={{ borderRadius: 2, mb: 3 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon /> Cache Settings
          </Typography>
          <Stack direction="row" spacing={1}>
            {editMode ? (
              <>
                <Button size="small" onClick={() => setEditMode(false)} disabled={settingsLoading}>
                  Cancel
                </Button>
                <Button 
                  size="small" 
                  variant="contained" 
                  onClick={handleSaveSettings}
                  disabled={settingsLoading}
                >
                  {settingsLoading ? <CircularProgress size={20} /> : 'Save'}
                </Button>
              </>
            ) : (
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => setEditMode(true)}
              >
                Edit Settings
              </Button>
            )}
          </Stack>
        </Stack>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Cache Toggle */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="subtitle2">
                Cache System
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {cacheSettings.cacheEnabled 
                  ? 'Cache is currently enabled and active' 
                  : 'Cache is currently disabled'}
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={cacheSettings.cacheEnabled}
                  onChange={handleCacheToggle}
                  disabled={settingsLoading || editMode}
                  color="primary"
                />
              }
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  {cacheSettings.cacheEnabled ? <ToggleOnIcon color="success" /> : <ToggleOffIcon color="disabled" />}
                  <Typography>
                    {cacheSettings.cacheEnabled ? 'Enabled' : 'Disabled'}
                  </Typography>
                </Stack>
              }
            />
          </Stack>
        </Paper>
        
        {/* TTL Settings */}
        {editMode && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon /> Cache Time-to-Live (TTL) Settings
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    General Cache TTL
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Default cache expiration time
                  </Typography>
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={cacheSettings.cacheTTL}
                      onChange={(e, value) => handleTTLChange('cacheTTL', value)}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => formatTTL(value)}
                      min={300}
                      max={86400}
                      step={300}
                      marks={[
                        { value: 300, label: '5m' },
                        { value: 1800, label: '30m' },
                        { value: 3600, label: '1h' },
                        { value: 86400, label: '24h' }
                      ]}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Current: {formatTTL(cacheSettings.cacheTTL)}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    User Cache TTL
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    User profile cache expiration
                  </Typography>
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={cacheSettings.userCacheTTL}
                      onChange={(e, value) => handleTTLChange('userCacheTTL', value)}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => formatTTL(value)}
                      min={300}
                      max={86400}
                      step={300}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Current: {formatTTL(cacheSettings.userCacheTTL)}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Post Cache TTL
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Post data cache expiration
                  </Typography>
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={cacheSettings.postCacheTTL}
                      onChange={(e, value) => handleTTLChange('postCacheTTL', value)}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => formatTTL(value)}
                      min={300}
                      max={86400}
                      step={300}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Current: {formatTTL(cacheSettings.postCacheTTL)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Auto Warm Up Settings */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="subtitle2">
                Automatic Cache Warm-up
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pre-load cache during off-peak hours
              </Typography>
            </Box>
            {editMode ? (
              <Switch
                checked={cacheSettings.autoWarmUp}
                onChange={(e) => setCacheSettings(prev => ({
                  ...prev,
                  autoWarmUp: e.target.checked
                }))}
                color="primary"
              />
            ) : (
              <Chip 
                label={cacheSettings.autoWarmUp ? 'Enabled' : 'Disabled'} 
                color={cacheSettings.autoWarmUp ? 'success' : 'default'}
                size="small"
              />
            )}
          </Stack>
          
          {cacheSettings.autoWarmUp && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Warm-up Schedule
              </Typography>
              {editMode ? (
                <TextField
                  size="small"
                  value={cacheSettings.warmUpSchedule}
                  onChange={(e) => setCacheSettings(prev => ({
                    ...prev,
                    warmUpSchedule: e.target.value
                  }))}
                  placeholder="HH:MM (24-hour format)"
                  fullWidth
                  inputProps={{
                    pattern: '([0-1]?[0-9]|2[0-3]):[0-5][0-9]'
                  }}
                  helperText="Time in 24-hour format (e.g., 03:00 for 3 AM)"
                />
              ) : (
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon fontSize="small" />
                  Daily at {cacheSettings.warmUpSchedule}
                </Typography>
              )}
            </Box>
          )}
        </Paper>
        
        {!cacheSettings.cacheEnabled && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Cache is currently disabled. All cache operations will be bypassed and data will be fetched directly from the database.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Layout 
      darkMode={darkMode} 
      toggleDarkMode={toggleDarkMode} 
      unreadCount={unreadCount} 
      shouldAnimate={shouldAnimate}
      username={username}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CacheIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Cache Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Monitor and manage Redis cache performance and operations
              </Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              disabled={loading}
            >
              Refresh
            </Button>
            
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  color="primary"
                />
              }
              label="Auto-refresh every 30s"
            />
            
            {refreshTime && (
              <Typography variant="caption" color="text.secondary">
                Last updated: {refreshTime.toLocaleTimeString()}
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Add Cache Settings Card after the header */}
        {renderCacheSettingsCard()}

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard(
              'Total Keys',
              stats?.totalKeys,
              <DataUsageIcon />,
              '#2196f3'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard(
              'User Keys',
              stats?.userKeys,
              <PersonIcon />,
              '#4caf50'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard(
              'Post Keys',
              stats?.postKeys,
              <ArticleIcon />,
              '#ff9800'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard(
              'Cache Keys',
              stats?.cacheKeys,
              <CacheIcon />,
              '#9c27b0'
            )}
          </Grid>
        </Grid>

        {/* Redis Info and Actions */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            {renderRedisInfoCard()}
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SpeedIcon /> Cache Operations
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  {/* Clear All Cache */}
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Clear All Cache
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Remove all cached data from Redis. This will force all subsequent requests to fetch fresh data from the database.
                      </Typography>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<ClearAllIcon />}
                        onClick={() => handleConfirmAction('clearAll')}
                        disabled={actionLoading}
                        fullWidth
                      >
                        Clear All Cache
                      </Button>
                    </Paper>
                  </Grid>

                  {/* Warm Up Cache */}
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Warm Up Cache
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Pre-load frequently accessed data (recent users and posts) into cache for better performance.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PlayArrowIcon />}
                        onClick={handleWarmUpCache}
                        disabled={actionLoading}
                        fullWidth
                      >
                        Warm Up Cache
                      </Button>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Advanced Operations */}
        <Card sx={{ mt: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Advanced Cache Operations
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              {/* Clear by Pattern */}
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    <SearchIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Clear by Pattern
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Clear cache keys matching a specific pattern (e.g., "user:*", "post:*")
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      size="small"
                      placeholder="Pattern (e.g., user:*, post:*)"
                      value={clearPattern}
                      onChange={(e) => setClearPattern(e.target.value)}
                      fullWidth
                    />
                    <Button
                      variant="outlined"
                      onClick={handleClearByPattern}
                      disabled={actionLoading || !clearPattern.trim()}
                      startIcon={<DeleteIcon />}
                    >
                      Clear Pattern
                    </Button>
                  </Stack>
                </Paper>
              </Grid>

              {/* Flush User Cache */}
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Flush User Cache
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Clear all cache related to a specific user (user data, user's posts, etc.)
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      size="small"
                      placeholder="User ID"
                      value={flushUserId}
                      onChange={(e) => setFlushUserId(e.target.value)}
                      fullWidth
                    />
                    <Button
                      variant="outlined"
                      onClick={handleFlushUserCache}
                      disabled={actionLoading || !flushUserId.trim()}
                      startIcon={<DeleteIcon />}
                    >
                      Flush User Cache
                    </Button>
                  </Stack>
                </Paper>
              </Grid>

              {/* Flush Post Cache */}
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    <ArticleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Flush Post Cache
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Clear all cache related to a specific post and its listings
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      size="small"
                      placeholder="Post ID"
                      value={flushPostId}
                      onChange={(e) => setFlushPostId(e.target.value)}
                      fullWidth
                    />
                    <Button
                      variant="outlined"
                      onClick={handleFlushPostCache}
                      disabled={actionLoading || !flushPostId.trim()}
                      startIcon={<DeleteIcon />}
                    >
                      Flush Post Cache
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Cache Performance Tips */}
        <Card sx={{ mt: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cache Performance Tips
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    <MemoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Memory Optimization
                  </Typography>
                  <Typography variant="body2">
                    • Keep cache TTLs appropriate (30min-1hour)<br />
                    • Monitor memory usage regularly<br />
                    • Use eviction policies for older keys
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Performance Best Practices
                  </Typography>
                  <Typography variant="body2">
                    • Warm up cache during off-peak hours<br />
                    • Use patterns for bulk operations<br />
                    • Monitor cache hit rates (70% ideal)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Common Issues
                  </Typography>
                  <Typography variant="body2">
                    • High memory usage: Clear old keys<br />
                    • Low hit rate: Warm up cache<br />
                    • Connection issues: Check Redis service
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: '', data: null })}
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.action === 'clearAll' && 
              'Are you sure you want to clear ALL cache? This will remove all cached data and may temporarily increase database load.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: '', data: null })}>
            Cancel
          </Button>
          <Button 
            onClick={handleClearAllCache} 
            color="error" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default CacheManagement;