import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Agriculture,
  Dashboard,
  Terrain,
  ShoppingCart,
  People,
  School,
  Psychology,
  Store,
  AccountBalance,
  Cloud,
  Support,
  AccountBalanceWallet,
  Logout,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { title: 'Dashboard', path: '/dashboard', icon: <Dashboard />, roles: ['farmer', 'buyer', 'expert', 'admin'] },
  { title: 'Farm Management', path: '/farm', icon: <Terrain />, roles: ['farmer'] },
  { title: 'Wholesale Market', path: '/market', icon: <ShoppingCart />, roles: ['farmer', 'buyer'] },
  { title: 'AgriLink Social', path: '/social', icon: <People />, roles: ['farmer', 'buyer', 'expert'] },
  { title: 'Learning Hub', path: '/learning', icon: <School />, roles: ['farmer', 'buyer', 'expert'] },
  { title: 'AI Tools Lab', path: '/ai-tools', icon: <Psychology />, roles: ['farmer', 'expert'] },
  { title: 'Marketplace', path: '/marketplace', icon: <Store />, roles: ['farmer', 'buyer'] },
  { title: 'Government Portal', path: '/government', icon: <AccountBalance />, roles: ['farmer', 'government', 'admin'] },
  { title: 'Weather', path: '/weather', icon: <Cloud />, roles: ['farmer'] },
  { title: 'Support', path: '/support', icon: <Support />, roles: ['farmer', 'buyer', 'expert'] },
  { title: 'AgriFinTech', path: '/fintech', icon: <AccountBalanceWallet />, roles: ['farmer'] },
];

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Prospera Logo"
          sx={{ height: 40 }}
        />
      </Box>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.title} sx={{ color: 'black' }} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky"
        sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
            {/* Mobile Menu Icon */}
                  {isMobile && (
                    <IconButton
                    size="large"
                    onClick={toggleDrawer(true)}
                    color="inherit"
                    
                    >
                    <MenuIcon />
                    </IconButton>
                  )}

                  {/* Logo */}
                  <Box
                    component="img"
                    src="/logo.png"
                    alt="Prospera Logo"
                    sx={{
                    height: { xs: 40, sm: 50 },
                  
                    flexGrow: isMobile ? 1 : 0,
                    }}
                  />

                  
                        {!isMobile && (
                          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 3, justifyContent: 'center' }}>
                          {filteredMenuItems.slice(0, 6).map((item) => (
                            <Button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            sx={{
                              my: 1,
                              color: 'black',
                              display: 'block',
                              textTransform: 'none',
                              borderBottom: location.pathname === item.path ? '2px solid black' : 'none',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.08)',
                              transform: 'translateY(-2px)',
                              },
                            }}
                            >
                            {item.title}
                            </Button>
                          ))}
                          </Box>
                        )}

                        {/* User Menu */}
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={user?.name} src={user?.profile?.profilePicture} sx={{ width: 36, height: 36 }}>
                    {user?.name?.charAt(0)}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'black' }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ color: 'black' }}>
                    {user?.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <Typography sx={{ color: 'black' }}>Profile</Typography>
                </MenuItem>
                <MenuItem onClick={() => { handleLogout(); handleCloseUserMenu(); }}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <Typography sx={{ color: 'black' }}>Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;
