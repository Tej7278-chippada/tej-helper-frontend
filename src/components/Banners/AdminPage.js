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
      if (activeTab === 'search') return;
      
      setLoading(true);
      try {
        let response;
        if (activeTab === 'all') {
          response = await filterUsersByStatus('');
        } else {
          response = await filterUsersByStatus(activeTab);
        }
        setUsers(response.data);
        // Initialize status updates
        const updates = {};
        response.data.forEach(user => {
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
  }, [activeTab]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await searchUsers(searchQuery);
      setUsers(response.data);
      // Initialize status updates
      const updates = {};
      response.data.forEach(user => {
        updates[user._id] = user.accountStatus;
      });
      setStatusUpdates(updates);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearClick = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchQuery('');
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
      await updateAccountStatus(userId, newStatus);
      // Update the user in local state
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, accountStatus: newStatus } : user
      ));

      // Update counts if status changed
      if (users.find(u => u._id === userId)?.accountStatus !== newStatus) {
        const response = await getUserCounts();
        setUserCounts(response.data);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
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

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : users.length > 0 ? (
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