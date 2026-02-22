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
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
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
import { alpha } from '@mui/material/styles';
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
  const { user, logout, defaultUser } = useAuth();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/login');
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const currentUser = user || defaultUser;

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(currentUser?.role)
  );

  const drawerContent = (
    <Box
      sx={{ width: 280, p: 1.5 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1 }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Prospera Logo"
          sx={{ height: 42 }}
        />
        <Typography variant="subtitle1" fontWeight={700}>
        </Typography>
      </Box>
      <Divider />
      <List sx={{ mt: 1 }}>
        {filteredMenuItems.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '& .MuiListItemIcon-root': {
                color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                minWidth: 40,
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky"
        elevation={0}
        sx={{
          color: theme.palette.text.primary,
          background: `
            radial-gradient(circle at 10% 20%, ${alpha(theme.palette.primary.light, 0.16)} 0%, ${alpha(theme.palette.primary.light, 0)} 40%),
            radial-gradient(circle at 90% 80%, ${alpha(theme.palette.secondary.light, 0.12)} 0%, ${alpha(theme.palette.secondary.light, 0)} 45%),
            linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.96)} 0%, ${alpha(theme.palette.grey[50], 0.94)} 100%)
          `,
          borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.65)}`,
          boxShadow: `0 6px 16px ${alpha(theme.palette.common.black, 0.08)}`,
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexGrow: isMobile ? 1 : 0 }}>
                    <Box
                      component="img"
                      src="/logo.png"
                      alt="Prospera Logo"
                      sx={{ height: { xs: 38, sm: 44 } }}
                    />
                    {!isMobile && (
                      <Typography variant="subtitle1" fontWeight={700}>
                        
                      </Typography>
                    )}
                  </Box>

                  
                        {!isMobile && (
                          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 3, justifyContent: 'center' }}>
                          {filteredMenuItems.slice(0, 6).map((item) => (
                            <Button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            sx={{
                              my: 1,
                              color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                              display: 'block',
                              textTransform: 'none',
                              borderBottom: location.pathname === item.path ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
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
                  <Avatar alt={currentUser?.name} src={currentUser?.profile?.profilePicture} sx={{ width: 36, height: 36 }}>
                    {currentUser?.name?.charAt(0)}
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
                  <Typography variant="subtitle1" fontWeight="bold">
                    {currentUser?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {currentUser?.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <Typography>Profile</Typography>
                </MenuItem>
                <MenuItem onClick={() => { handleLogout(); handleCloseUserMenu(); }}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <Typography>Logout</Typography>
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
