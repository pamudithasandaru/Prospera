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
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Agriculture sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight="bold">
          Prospera
        </Typography>
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
            <ListItemText primary={item.title} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Mobile Menu Icon */}
            {isMobile && (
              <IconButton
                size="large"
                onClick={toggleDrawer(true)}
                color="inherit"
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Agriculture sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/dashboard"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              PROSPERA
            </Typography>

            {/* Mobile Logo */}
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/dashboard"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              PROSPERA
            </Typography>

            {/* Desktop Menu */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 3 }}>
                {filteredMenuItems.slice(0, 6).map((item) => (
                  <Button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    sx={{
                      my: 2,
                      color: 'white',
                      display: 'block',
                      textTransform: 'none',
                      borderBottom: location.pathname === item.path ? '2px solid white' : 'none',
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
                  <Avatar alt={user?.name} src={user?.profile?.profilePicture}>
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
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => { handleLogout(); handleCloseUserMenu(); }}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
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
