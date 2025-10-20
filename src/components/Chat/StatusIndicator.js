import React from 'react';
import { Box, Typography } from "@mui/material";

// StatusIndicator component for showing different status types
const StatusIndicator = ({ status }) => {
    const getStatusConfig = (status) => {
      switch (status) {
        case 'inChat':
          return {
            color: '#4CAF50', // Green
            text: 'In Chat',
            tooltip: 'User is currently in this chat'
          };
        case 'online':
          return {
            color: '#2196F3', // Blue
            text: 'Online',
            tooltip: 'User is online but not in this chat'
          };
        case 'offline':
          return {
            color: '#9E9E9E', // Grey
            text: 'Offline',
            tooltip: 'User is offline'
          };
        default:
          return {
            color: '#9E9E9E',
            text: 'Offline-Null',
            tooltip: 'User is offline'
          };
      }
    };

    const config = getStatusConfig(status);

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: config.color,
            animation: status === 'inChat' ? 'pulse 1.5s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 }
            }
          }}
        />
        <Typography
          variant="caption" 
          sx={{ 
            color: config.color,
            fontWeight: status === 'inChat' ? 'bold' : 'normal'
          }}
        >
          {config.text}
        </Typography>
      </Box>
    );
  };

export default StatusIndicator;