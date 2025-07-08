// src/components/AdminPage.js
import React, { useState } from "react";
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
  useMediaQuery
} from "@mui/material";
import Layout from "../Layout";
import { searchUsers, updateAccountStatus } from "../api/adminApi";
import { useTheme } from "@emotion/react";

const AdminPage = ({ darkMode, toggleDarkMode, unreadCount, shouldAnimate, userName }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusUpdates, setStatusUpdates] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
          />
          <Button 
            variant="contained" 
            onClick={handleSearch}
            disabled={searchQuery.trim() === '' || loading}
            sx={{borderRadius: '12px', m: '6px', backgroundColor: '#4f46e5', width: '100px'}}
          >
            {loading ? <CircularProgress size={24} /> : "Search"}
          </Button>
        </Box>

        {users.length > 0 ? (
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
              Users not found!
            </Typography>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default AdminPage;