// src/components/Admin/PostReports.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Pagination,
  Stack,
  Avatar,
  Skeleton,
  useMediaQuery
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Block as SuspendIcon,
  CheckCircle as ResolveIcon,
  Warning as WarningIcon,
  ReportGmailerrorred as ReportIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { getReports, updateReport, suspendPostFromReport, getReportStatistics } from '../api/adminApi';
import Layout from '../Layout';
import { useTheme } from '@emotion/react';
import { useNavigate } from 'react-router-dom';

const PostReports = ({ darkMode, toggleDarkMode, unreadCount, shouldAnimate, username }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [action, setAction] = useState('');
  const [postStatus, setPostStatus] = useState('Suspended');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalReports: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    minReports: 1
  });
  const [statistics, setStatistics] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchStatistics();
  }, [pagination.page, filters]);

  const fetchReports = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const params = {
        page: pagination.page,
        limit: 10,
        ...filters
      };
      const response = await getReports(params);
      if (response.data.success) {
        setReports(response.data.reports);
        setPagination(prev => ({
          ...prev,
          totalPages: response.data.pagination.totalPages,
          totalReports: response.data.pagination.totalReports
        }));
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await getReportStatistics();
      if (response.data.success) {
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports(false);
    await fetchStatistics();
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setDetailDialogOpen(true);
  };

  const handleTakeAction = (report, actionType) => {
    setSelectedReport(report);
    setAction(actionType);
    // Pre-fill existing admin notes when editing
    setAdminNotes(report.adminNotes || '');
    setPostStatus('Suspended');
    setActionDialogOpen(true);
  };

  const handleSubmitAction = async () => {
    try {
      let response;
      
      if (action === 'suspend') {
        response = await suspendPostFromReport(selectedReport._id, {
          postStatus,
          adminNotes
        });
      } else {
        response = await updateReport(selectedReport._id, {
          status: action === 'resolve' ? 'Resolved' : 'UnderReview',
          adminNotes
        });
      }

      if (response.data.success) {
        // Update the specific report in state without refreshing entire page
        setReports(prevReports => 
          prevReports.map(report => 
            report._id === selectedReport._id 
              ? { 
                  ...report, 
                  status: response.data.report.status,
                  adminNotes: response.data.report.adminNotes,
                  post: {
                    ...report.post,
                    postStatus: response.data.report.postId?.postStatus || report.post.postStatus
                  }
                } 
              : report
          )
        );

        // Update statistics if needed
        if (statistics) {
          await fetchStatistics();
        }

        setActionDialogOpen(false);
        
        // Show success message
        setSelectedReport(prev => prev ? {
          ...prev,
          status: response.data.report.status,
          adminNotes: response.data.report.adminNotes
        } : null);
      }
    } catch (error) {
      console.error('Error taking action:', error);
    }
  };

  const handleEditAdminNotes = (report) => {
    setSelectedReport(report);
    setAction('edit');
    setAdminNotes(report.adminNotes || '');
    setActionDialogOpen(true);
  };

  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'UnderReview': return 'info';
      case 'Resolved': return 'success';
      case 'ActionTaken': return 'error';
      case 'Dismissed': return 'default';
      default: return 'default';
    }
  };

  const openPostDetail = (postId) => {
    navigate(`/post/${postId}`);
  };

  const LoadingSkeleton = () => (
    <Grid container spacing={isMobile ? 1 : 2} >
      {[...Array(4)].map((_, index) => (
        <Grid item xs={6} sm={6} md={3} lg={3} key={index}>
        <Card key={index} sx={{ mb: 0, p: 2, borderRadius: '8px' }}>
          <Box sx={{ mb: 2 }}>
              <Skeleton variant="text" width="50%" />
          </Box>
          <Skeleton variant="rectangular" height={40} />
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
        username={username}
    >
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ReportIcon color="error" />
            Reported Posts Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and take action on reported posts
          </Typography>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton 
            onClick={handleRefresh} 
            disabled={refreshing}
            color="primary"
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              '&:disabled': { bgcolor: 'action.disabled' }
            }}
          >
            {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Tooltip>
      </Box>

        {(loading) ?
            <LoadingSkeleton />
            :
            <>
            {/* Statistics */}
            {statistics && (
                <Grid container spacing={ isMobile ? 1 : 2} sx={{ mb: 4 }}>
                    <Grid item xs={6} sm={6} md={3}>
                        <Card sx={{ borderRadius: '8px' }}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                            Total Reports
                            </Typography>
                            <Typography variant="h4">
                            {statistics.totalReports?.[0]?.count || 0}
                            </Typography>
                        </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                        <Card sx={{ borderRadius: '8px' }}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                            Pending Review
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                            {statistics.reportsByStatus?.find(s => s._id === 'Pending')?.count || 0}
                            </Typography>
                        </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                        <Card sx={{ borderRadius: '8px' }}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                            Critical Reports
                            </Typography>
                            <Typography variant="h4" color="error.main">
                            {statistics.reportsBySeverity?.find(s => s._id === 'Critical')?.count || 0}
                            </Typography>
                        </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                        <Card sx={{ borderRadius: '8px' }}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                            Action Taken
                            </Typography>
                            <Typography variant="h4" color="success.main">
                            {statistics.reportsByStatus?.find(s => s._id === 'ActionTaken')?.count || 0}
                            </Typography>
                        </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Filters */}
            <Card sx={{ mb: isMobile ? 1 : 2, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={filters.status}
                        label="Status"
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="UnderReview">Under Review</MenuItem>
                        <MenuItem value="Resolved">Resolved</MenuItem>
                        <MenuItem value="ActionTaken">Action Taken</MenuItem>
                        <MenuItem value="Dismissed">Dismissed</MenuItem>
                    </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                    <InputLabel>Severity</InputLabel>
                    <Select
                        value={filters.severity}
                        label="Severity"
                        onChange={(e) => handleFilterChange('severity', e.target.value)}
                    >
                        <MenuItem value="">All Severity</MenuItem>
                        <MenuItem value="Low">Low</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                        <MenuItem value="Critical">Critical</MenuItem>
                    </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                    <InputLabel>Min Reports</InputLabel>
                    <Select
                        value={filters.minReports}
                        label="Min Reports"
                        onChange={(e) => handleFilterChange('minReports', e.target.value)}
                    >
                        <MenuItem value={1}>1+ Reports</MenuItem>
                        <MenuItem value={3}>3+ Reports</MenuItem>
                        <MenuItem value={5}>5+ Reports</MenuItem>
                        <MenuItem value={10}>10+ Reports</MenuItem>
                    </Select>
                    </FormControl>
                </Grid>
                </Grid>
            </Card>

            {/* Reports Table */}
            <TableContainer component={Paper}>
                <Table>
                <TableHead>
                    <TableRow>
                    <TableCell>Post</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Reports</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Reported</TableCell>
                    <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {reports.map((report) => (
                    <TableRow key={report._id}
                        hover
                        sx={{
                            '&:hover': { backgroundColor: 'action.hover' },
                            borderLeft: `4px solid ${
                                report.stats.severity === 'Critical'
                                ? '#f44336'
                                : report.stats.severity === 'High'
                                ? '#ff9800'
                                : report.stats.severity === 'Medium'
                                ? '#2196f3'
                                : '#4caf50'
                            }`,
                        }}
                    >
                        <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                                src={report.post?.media?.[0] ? (`data:image/jpeg;base64,${report.post.media[0]}`) : 'https://placehold.co/80x80?text=No+Image'}
                                variant="rounded" 
                                onClick={() => openPostDetail(report.post._id)}
                                sx={{ width: 40, height: 40, cursor: 'pointer' }}
                            />
                            <Box>
                            <Typography variant="body2" fontWeight="bold" onClick={() => openPostDetail(report.post._id)} sx={{ cursor: 'pointer' }}>
                                {report.post?.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {report.post?.postType} • {report.post?.serviceType || report.post?.categories}
                            </Typography>
                            <Typography variant="caption" display="block" color={
                                report.post?.postStatus === 'Suspended' ? 'error' : 
                                report.post?.postStatus === 'Active' ? 'success' : 'warning'
                            }>
                                Status: {report.post?.postStatus}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(report.post?.createdAt).toLocaleString()}
                            </Typography>
                            </Box>
                        </Box>
                        </TableCell>
                        <TableCell>
                        <Typography variant="body2">
                            {report.postOwner?.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {report.postOwner?.userCode}
                        </Typography>
                        </TableCell>
                        <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                            {report.stats.totalReports}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {Object.entries(report.stats.typesSummary)
                            .filter(([_, count]) => count > 0)
                            .slice(0, 2)
                            .map(([type, count]) => (
                                <Chip
                                key={type}
                                label={`${type}: ${count}`}
                                size="small"
                                variant="outlined"
                                />
                            ))}
                        </Box>
                        </TableCell>
                        <TableCell>
                        <Chip
                            label={report.stats.severity}
                            color={getSeverityColor(report.stats.severity)}
                            size="small"
                        />
                        </TableCell>
                        <TableCell>
                        <Chip
                            label={report.status}
                            color={getStatusColor(report.status)}
                            size="small"
                        />
                        </TableCell>
                        <TableCell>
                        {new Date(report.lastReportedAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                        <Stack direction="row" spacing={1}>
                            <Tooltip title="View Details">
                            <IconButton
                                size="small"
                                onClick={() => handleViewDetails(report)}
                            >
                                <ViewIcon />
                            </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Admin Notes">
                            <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleEditAdminNotes(report)}
                            >
                                <EditIcon />
                            </IconButton>
                            </Tooltip>
                            <Tooltip title="Suspend Post">
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleTakeAction(report, 'suspend')}
                            >
                                <SuspendIcon />
                            </IconButton>
                            </Tooltip>
                            <Tooltip title="Resolve Report">
                            <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleTakeAction(report, 'resolve')}
                            >
                                <ResolveIcon />
                            </IconButton>
                            </Tooltip>
                        </Stack>
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
                    onChange={handlePageChange}
                    color="primary"
                />
                </Box>
            )}
            </>
        }

      {/* Report Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: darkMode 
              ? 'rgba(30, 30, 30, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
          }
        }}
      >
        <DialogTitle>
          Report Details
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Post Information
              </Typography>
              <Card sx={{ p: 2, mb: 2, borderRadius: '12px' }}>
                <Typography><strong>Title:</strong> {selectedReport.post?.title}</Typography>
                <Typography><strong>Type:</strong> {selectedReport.post?.postType}</Typography>
                <Typography><strong>Category:</strong> {selectedReport.post?.serviceType || selectedReport.post?.categories}</Typography>
                <Typography color={
                  selectedReport.post?.postStatus === 'Suspended' ? 'error' : 
                  selectedReport.post?.postStatus === 'Active' ? 'success' : 'warning'
                }>
                  <strong>Status:</strong> {selectedReport.post?.postStatus}
                </Typography>
                <Typography><strong>Created:</strong> {new Date(selectedReport.post?.createdAt).toLocaleString()}</Typography>
              </Card>

              <Typography variant="h6" gutterBottom>
                Report Statistics
              </Typography>
              <Card sx={{ p: 2, mb: 2, borderRadius: '12px' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography><strong>Total Reports:</strong> {selectedReport.stats.totalReports}</Typography>
                    <Typography color={getSeverityColor(selectedReport.stats.severity)}><strong>Severity:</strong> {selectedReport.stats.severity}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color={getStatusColor(selectedReport.status)}><strong>Status:</strong> {selectedReport.status}</Typography>
                    <Typography><strong>Last Reported:</strong> {new Date(selectedReport.lastReportedAt).toLocaleString()}</Typography>
                  </Grid>
                </Grid>
              </Card>

              <Typography variant="h6" gutterBottom>
                Report Types Summary
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {Object.entries(selectedReport.stats.typesSummary)
                  .filter(([_, count]) => count > 0)
                  .map(([type, count]) => (
                    <Chip
                      key={type}
                      label={`${type}: ${count}`}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
              </Box>

              {selectedReport.adminNotes && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Admin Notes
                  </Typography>
                  <Card sx={{ p: 2, bgcolor: 'grey.100', borderRadius: '12px' }}>
                    <Typography whiteSpace="pre-wrap">{selectedReport.adminNotes}</Typography>
                  </Card>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button sx={{borderRadius: '12px'}} onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Action Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: darkMode 
              ? 'rgba(30, 30, 30, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {action === 'suspend' && <SuspendIcon color="error" />}
          {action === 'resolve' && <ResolveIcon color="success" />}
          {action === 'edit' && <EditIcon color="info" />}
          {action === 'suspend' ? 'Suspend Post' : 
           action === 'resolve' ? 'Resolve Report' : 
           'Edit Admin Notes'}
        </DialogTitle>
        <DialogContent>
          {action === 'suspend' && (
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Post Status</InputLabel>
              <Select
                value={postStatus}
                label="Post Status"
                onChange={(e) => setPostStatus(e.target.value)}
              >
                <MenuItem value="Suspended">Suspend</MenuItem>
                <MenuItem value="Closed">Close</MenuItem>
                <MenuItem value="InActive">Make Inactive</MenuItem>
              </Select>
            </FormControl>
          )}
          <TextField
            label="Admin Notes"
            multiline
            rows={4}
            fullWidth
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder={selectedReport?.adminNotes ? "Update admin notes..." : "Add notes about the action taken..."}
            helperText={`${adminNotes.length}/1000 characters`}
            inputProps={{ maxLength: 1000 }}
            sx={{ mt: 2,
              '& .MuiOutlinedInput-root': { borderRadius: '12px', }
            }}
          />
          {selectedReport?.adminNotes && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Previous notes will be replaced with the new content
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button sx={{borderRadius: '12px'}} onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitAction}
            variant="contained" 
            sx={{borderRadius: '12px'}}
            color={
              action === 'suspend' ? 'error' : 
              action === 'resolve' ? 'success' : 
              'primary'
            }
          >
            {action === 'suspend' ? 'Suspend Post' : 
             action === 'resolve' ? 'Resolve Report' : 
             'Update Notes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Layout>
  );
};

export default PostReports;