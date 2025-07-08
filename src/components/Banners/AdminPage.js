// src/components/AdminPage.js
import React, { useEffect, useRef, useState } from "react";
import { 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  MenuItem, 
  Select,
  Box,
  CircularProgress,
  useMediaQuery,
  Tabs,
  Tab,
  Badge,
  Pagination,
  Stack,
  InputAdornment,
  IconButton
} from "@mui/material";
import Layout from "../Layout";
import { filterUsersByStatus, getUserCounts, searchUsers, updateAccountStatus } from "../api/adminApi";
import { useTheme } from "@emotion/react";
import ClearIcon from '@mui/icons-material/Clear';

const AdminPage = ({ darkMode, toggleDarkMode, unreadCount, shouldAnimate, userName }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusUpdates, setStatusUpdates] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeTab, setActiveTab] = useState('all');
  // const [filterStatus, setFilterStatus] = useState('');
  const [userCounts, setUserCounts] = useState({
    all: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    deleted: 0
  });
  const inputRef = useRef(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false
  });
  const [searchMode, setSearchMode] = useState(false);

  // Fetch user counts on component mount
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await getUserCounts();
        setUserCounts(response.data);
      } catch (error) {
        console.error("Error fetching user counts:", error);
      }
    };
    fetchCounts();
  }, []);

  // Load users based on active tab
  useEffect(() => {
    const loadUsers = async () => {
      // if (activeTab === 'search') return;
      
      setLoading(true);
      try {
        let response;
        if (searchQuery.trim() && activeTab === 'all') {
          setSearchMode(true);
          response = await searchUsers(searchQuery, pagination.page, pagination.limit);
        } else {
          setSearchMode(false);
          response = await filterUsersByStatus(
          activeTab === 'all' ? '' : activeTab,
          pagination.page,
          pagination.limit,
          searchQuery
          );
        }
        setUsers(response.data.users);
        setPagination({
          page: response.data.currentPage,
          limit: pagination.limit,
          total: response.data.total,
          pages: response.data.pages,
          hasNext: response.data.hasNextPage,
          hasPrev: response.data.hasPrevPage
        });
        // Initialize status updates
        const updates = {};
        response.data.users.forEach(user => {
          updates[user._id] = user.accountStatus;
        });
        setStatusUpdates(updates);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [activeTab, pagination.page, pagination.limit, searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClearClick = () => {
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
    inputRef.current?.focus();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on tab change
  };

  const handleStatusChange = (userId, newStatus) => {
    setStatusUpdates(prev => ({
      ...prev,
      [userId]: newStatus
    }));
  };

  const handleSaveStatus = async (userId) => {
    try {
      const newStatus = statusUpdates[userId];
       const currentStatus = users.find(u => u._id === userId)?.accountStatus;
      
      if (!newStatus || newStatus === currentStatus) return;
      await updateAccountStatus(userId, newStatus);
      // Update the user in local state
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, accountStatus: newStatus } : user
      ));

      // Update counts if status changed
      // if (users.find(u => u._id === userId)?.accountStatus !== newStatus) {
        const response = await getUserCounts();
        setUserCounts(response.data);
      // }
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert the status change in UI
      setStatusUpdates(prev => ({
        ...prev,
        [userId]: users.find(u => u._id === userId)?.accountStatus
      }));
    }
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setPagination(prev => ({ 
      ...prev, 
      limit: newLimit, 
      page: 1 // Always reset to page 1 when changing limit
    }));
  };
  
  return (
    <Layout 
      darkMode={darkMode} 
      toggleDarkMode={toggleDarkMode} 
      unreadCount={unreadCount} 
      shouldAnimate={shouldAnimate}
      userName={userName}
    >
      <Box sx={{ m: isMobile ? '12px' : '18px' }}>
        <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
          User Management
        </Typography>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }} variant={isMobile ? "scrollable" : "standard"}
          // scrollButtons={isMobile ? "auto" : false}
          // allowScrollButtonsMobile
        >
          <Tab
            label={<Badge badgeContent={userCounts.all} color="primary">All Users</Badge>} 
            value="all" 
          />
          <Tab 
            label={<Badge badgeContent={userCounts.active} color="success">Active</Badge>} 
            value="active" 
          />
          <Tab 
            label={<Badge badgeContent={userCounts.inactive} color="warning">Inactive</Badge>} 
            value="inactive" 
          />
          <Tab 
            label={<Badge badgeContent={userCounts.suspended} color="error">Suspended</Badge>} 
            value="suspended" 
          />
          <Tab 
            label={<Badge badgeContent={userCounts.deleted} color="secondary">Deleted</Badge>} 
            value="deleted" 
          />
          {/* <Tab label="Search" value="search" /> */}
        </Tabs>

        {activeTab === 'all' && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end',gap: 0, mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Search Users"
            value={searchQuery} size="small"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username, email, user code, or ID"
            sx={{ 
              width: '400px', m: '6px',
              '& .MuiInputBase-root': {
                borderRadius: '20px',
              },
              '& .MuiOutlinedInput-root': { 
                borderRadius: '12px',
                '&:hover fieldset': {
                  borderColor: '#4361ee',
                  borderWidth: '1px',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4361ee',
                  borderWidth: '2px',
                },
              },
              '& .MuiInputLabel-root': {
                '&.Mui-focused': {
                  color: '#4361ee',
                },
              },
            }}
            InputProps={{
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={handleClearClick}
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    <ClearIcon color="action" fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button 
            variant="contained" 
            onClick={handleSearch}
            disabled={searchQuery.trim() === '' || loading}
            sx={{borderRadius: '12px', m: '6px', backgroundColor: '#4f46e5', width: '100px'}}
          >
            {/* {loading ? <CircularProgress size={24} /> : " */}
            Search
            {/* "} */}
          </Button>
        </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1">
            Showing {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            {searchMode && searchQuery.trim() && ` (search results)`}
          </Typography>
          <Select
            value={pagination.limit}
            onChange={handleLimitChange}
            size="small"
            sx={{ width: 100 }}
          >
            <MenuItem value={10}>10 per page</MenuItem>
            <MenuItem value={20}>20 per page</MenuItem>
            <MenuItem value={50}>50 per page</MenuItem>
            <MenuItem value={100}>100 per page</MenuItem>
          </Select>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : users.length > 0 ? (
          <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead >
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>User Code</TableCell>
                  <TableCell>Current Status</TableCell>
                  <TableCell>New Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.userCode}</TableCell>
                    <TableCell>{user.accountStatus}</TableCell>
                    <TableCell>
                      <Select
                        value={statusUpdates[user._id] || user.accountStatus}
                        onChange={(e) => handleStatusChange(user._id, e.target.value)}
                        size="small"
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="suspended">Suspended</MenuItem>
                        <MenuItem value="deleted">Deleted</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleSaveStatus(user._id)}
                        disabled={statusUpdates[user._id] === user.accountStatus}
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

           <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
            <Pagination
              count={pagination.pages}
              page={pagination.page}
              onChange={handlePageChange}
              shape="rounded"
              showFirstButton
              showLastButton
              siblingCount={1}
              boundaryCount={1}
            />
          </Stack>
          </>
        ) : (
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '50vh',
            textAlign: 'center',
          }}>
            <img 
              src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" 
              alt="No posts found" 
              style={{ width: '100px', opacity: 0.7, marginBottom: '16px' }}
            />
            <Typography variant="body1" color="text.secondary">
              No Users found!
            </Typography>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default AdminPage;