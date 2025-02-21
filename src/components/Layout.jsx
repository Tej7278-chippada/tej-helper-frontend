// Layout.js
import React from 'react';
import Header from './Header';
// import Footer from './Footer';

const Layout = ({ children, username }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column',  }}> {/* minHeight: '100vh' */}
      <Header username={username} />
      <div style={{ flex: 0 }}>
        {children}
      </div>
      {/* <Footer /> */}
    </div>
    // <Box display="flex" flexDirection="column" height="100vh">
    //   {/* Upper Toolbar */}
    //   <Box
    //     display="flex"
    //     justifyContent="space-around"
    //     alignItems="center"
    //     p={1}
    //     bgcolor={theme.palette.background.paper}
    //     boxShadow={2}
    //   >
    //     <IconButton color="primary">
    //       <HomeIcon />
    //     </IconButton>
    //     <IconButton color="primary">
    //       <SettingsIcon />
    //     </IconButton>
    //   </Box>

    //   {/* Content Area */}
    //   <Box flexGrow={1} display="flex" justifyContent="center" alignItems="center">
    //     {/* Main Content Goes Here */}
    //   </Box>

    //   {/* Bottom Toolbar */}
    //   <Box
    //     display="flex"
    //     justifyContent="space-around"
    //     alignItems="center"
    //     p={1}
    //     bgcolor={theme.palette.background.paper}
    //     boxShadow={2}
    //   >
    //     <IconButton color="primary">
    //       <InfoIcon />
    //     </IconButton>
    //     <IconButton color="primary">
    //       <HelpIcon />
    //     </IconButton>
    //   </Box>
    // </Box>
  );
};

export default Layout;
