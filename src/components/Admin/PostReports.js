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
  ReportGmailerrorred as ReportIcon
} from '@mui/icons-material';
import { getReports, updateReport, suspendPostFromReport, getReportStatistics } from '../api/adminApi';
import Layout from '../Layout';
import { useTheme } from '@emotion/react';
import { useNavigate } from 'react-router-dom';

const PostReports = ({ darkMode, toggleDarkMode, unreadCount, shouldAnimate, userName }) => {
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

  useEffect(() => {
    fetchReports();
    fetchStatistics();
  }, [pagination.page, filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
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

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setDetailDialogOpen(true);
  };

  const handleTakeAction = (report, actionType) => {
    setSelectedReport(report);
    setAction(actionType);
    setAdminNotes('');
    setPostStatus('Suspended');
    setActionDialogOpen(true);
  };

  const handleSubmitAction = async () => {
    try {
      if (action === 'suspend') {
        const response = await suspendPostFromReport(selectedReport._id, {
          postStatus,
          adminNotes
        });
        if (response.data.success) {
          await fetchReports();
          setActionDialogOpen(false);
        }
      } else {
        const response = await updateReport(selectedReport._id, {
          status: action === 'resolve' ? 'Resolved' : 'UnderReview',
          adminNotes
        });
        if (response.data.success) {
          await fetchReports();
          setActionDialogOpen(false);
        }
      }
    } catch (error) {
      console.error('Error taking action:', error);
    }
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

//   if (loading && reports.length === 0) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
//         <CircularProgress />
//       </Box>
//     );
//   }

  const LoadingSkeleton = () => (
    <Grid container spacing={isMobile ? 1 : 2} >
      {[...Array(4)].map((_, index) => (
        <Grid item xs={12} sm={6} md={3} lg={3} key={index}>
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
        userName={userName}
    >
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ReportIcon color="error" />
          Reported Posts Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and take action on reported posts
        </Typography>
      </Box>

        {(loading) ?
            <LoadingSkeleton />
            :
            <>
            {/* Statistics */}
            {statistics && (
                <Grid container spacing={ isMobile ? 1 : 2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
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
                    <Grid item xs={12} sm={6} md={3}>
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
                    <Grid item xs={12} sm={6} md={3}>
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
                    <Grid item xs={12} sm={6} md={3}>
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
                                report.post?.postStatus === 'Suspended'
                                ? '#f44336'
                                : report.post?.postStatus === 'Active'
                                ? '#4caf50'
                                : '#ff9800'
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
              <Card sx={{ p: 2, mb: 2 }}>
                <Typography><strong>Title:</strong> {selectedReport.post?.title}</Typography>
                <Typography><strong>Type:</strong> {selectedReport.post?.postType}</Typography>
                <Typography><strong>Category:</strong> {selectedReport.post?.serviceType || selectedReport.post?.categories}</Typography>
                <Typography><strong>Status:</strong> {selectedReport.post?.postStatus}</Typography>
                <Typography><strong>Created:</strong> {new Date(selectedReport.post?.createdAt).toLocaleString()}</Typography>
              </Card>

              <Typography variant="h6" gutterBottom>
                Report Statistics
              </Typography>
              <Card sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography><strong>Total Reports:</strong> {selectedReport.stats.totalReports}</Typography>
                    <Typography><strong>Severity:</strong> {selectedReport.stats.severity}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>Status:</strong> {selectedReport.status}</Typography>
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
                  <Card sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Typography>{selectedReport.adminNotes}</Typography>
                  </Card>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Action Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {action === 'suspend' ? 'Suspend Post' : 'Resolve Report'}
        </DialogTitle>
        <DialogContent>
          {action === 'suspend' && (
            <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
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
            placeholder="Add notes about the action taken..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitAction}
            variant="contained"
            color={action === 'suspend' ? 'error' : 'success'}
          >
            {action === 'suspend' ? 'Suspend Post' : 'Resolve Report'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Layout>
  );
};

export default PostReports;