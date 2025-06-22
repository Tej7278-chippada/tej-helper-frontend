// Layout.js
import React, { useEffect, useState } from 'react';
import Header from './Header';
// import Footer from './Footer';
import MenuBar from './MenuBar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children, username, darkMode, toggleDarkMode, unreadCount, shouldAnimate }) => {
  const [showMenu, setShowMenu] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  // ❗️ Hide MenuBar on login and register pages
  const location = useLocation();
  const hideMenuBarRoutes = ['/login', '/register'];
  const shouldShowMenuBar = !hideMenuBarRoutes.includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY) {
        setShowMenu(true); // scrolling up
      } else if (currentScrollY > lastScrollY) {
        setShowMenu(false); // scrolling down
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // const handleLogout = () => {
  //   localStorage.removeItem('authToken');
  //   localStorage.removeItem('userId');
  //   localStorage.removeItem('activeUser');
  //   localStorage.removeItem('tokenUsername');
  //   localStorage.removeItem('loggedInUsers');
  //   window.location.href = '/login'; // force reload to login page
  // };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column'  }}> {/* minHeight: '100vh' */}
      <Header username={username} darkMode={darkMode} toggleDarkMode={toggleDarkMode} unreadCount={unreadCount} shouldAnimate={shouldAnimate}/>
      <div style={{ flex: 1,  }}> {/* Make space for menu */} {/* paddingBottom: '56px' */}
        {children}
      </div>
      {shouldShowMenuBar && (
        <MenuBar visible={showMenu}  darkMode={darkMode}
          // onLogout={handleLogout} 
        />
      )}
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
