import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BRAND_NAME, LOGO_HORIZONTAL } from '../brand';
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
  AdminPanelSettings,
  ExpandMore,
  Logout,
  Person,
  Search as SearchIcon,
  Message as MessageIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { neuColors, neuRaised, neuInset, neuCircle } from '../neumorphic';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { resolveAvatar } from '../utils/avatarUtils';

const ALL_ROLES = ['farmer', 'buyer', 'expert', 'consultant', 'admin', 'government'];

const menuItems = [
  { title: 'Dashboard',        path: '/dashboard', icon: <Dashboard />,           roles: ALL_ROLES },
  { title: 'Admin Panel',      path: '/admin',     icon: <AdminPanelSettings />,  roles: ['admin'] },
  { title: 'Farm Management',  path: '/farm',      icon: <Terrain />,             roles: ['farmer'] },
  { title: 'Wholesale Market', path: '/market',    icon: <ShoppingCart />,        roles: ['farmer', 'buyer'] },
  // Social is open to all authenticated users
  { title: 'AgriLink Social',  path: '/social',    icon: <People />,              roles: ALL_ROLES },
  { title: 'Learning Hub',     path: '/learning',  icon: <School />,              roles: ALL_ROLES },
  { title: 'AI Tools Lab',     path: '/ai-tools',  icon: <Psychology />,          roles: ['farmer', 'expert', 'consultant'] },
  { title: 'Marketplace',      path: '/marketplace',icon: <Store />,             roles: ['farmer', 'buyer'] },
  { title: 'Government Portal',path: '/government',icon: <AccountBalance />,      roles: ['farmer', 'government', 'admin'] },
  { title: 'Weather',          path: '/weather',   icon: <Cloud />,               roles: ['farmer'] },
  { title: 'Support',          path: '/support',   icon: <Support />,             roles: ALL_ROLES },
  { title: 'AgriFinTech',      path: '/fintech',   icon: <AccountBalanceWallet />,roles: ['farmer'] },
];

// Social quick-links shown in the mobile drawer for all roles — defined inline in drawer JSX


const listItemSx = (active) => ({
  borderRadius: '12px',
  mb: 0.75,
  ...(active ? neuInset('xs') : { boxShadow: 'none' }),
});

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, defaultUser } = useAuth();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreAnchor, setMoreAnchor] = useState(null);

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
  // Admins see every page; everyone else only the pages their role allows.
  const filteredMenuItems = menuItems.filter(
    (item) => currentUser?.role === 'admin' || !item.roles || item.roles.includes(currentUser?.role)
  );
  const MAX_TOP_LINKS = 6;
  const topLinks = filteredMenuItems.slice(0, MAX_TOP_LINKS);
  const overflowLinks = filteredMenuItems.slice(MAX_TOP_LINKS);

  const drawerContent = (
    <Box
      sx={{ width: 280, p: 1.5 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1 }}>
        <Box component="img" src={LOGO_HORIZONTAL} alt={BRAND_NAME} sx={{ height: 40, width: 'auto' }} />
      </Box>
      {/* Social quick-links — always visible to all logged-in users */}
      <List dense sx={{ mt: 0.5 }}>
        <ListItemButton
          onClick={() => navigate('/social')}
          selected={location.pathname === '/social'}
          sx={{ ...listItemSx(location.pathname === '/social'), '& .MuiListItemIcon-root': { color: location.pathname === '/social' ? 'primary.main' : 'text.secondary', minWidth: 40 } }}
        >
          <ListItemIcon><People /></ListItemIcon>
          <ListItemText primary="Social Feed" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItemButton>
        <ListItemButton
          onClick={() => navigate('/messages')}
          selected={location.pathname === '/messages'}
          sx={{ ...listItemSx(location.pathname === '/messages'), '& .MuiListItemIcon-root': { color: location.pathname === '/messages' ? 'primary.main' : 'text.secondary', minWidth: 40 } }}
        >
          <ListItemIcon><MessageIcon /></ListItemIcon>
          <ListItemText primary="Messages" />
        </ListItemButton>
        <ListItemButton
          onClick={() => navigate('/notifications')}
          selected={location.pathname === '/notifications'}
          sx={{ ...listItemSx(location.pathname === '/notifications'), '& .MuiListItemIcon-root': { color: location.pathname === '/notifications' ? 'primary.main' : 'text.secondary', minWidth: 40 } }}
        >
          <ListItemIcon><NotificationsIcon /></ListItemIcon>
          <ListItemText primary="Notifications" />
        </ListItemButton>
        <ListItemButton
          onClick={() => navigate('/search')}
          selected={location.pathname === '/search'}
          sx={{ ...listItemSx(location.pathname === '/search'), '& .MuiListItemIcon-root': { color: location.pathname === '/search' ? 'primary.main' : 'text.secondary', minWidth: 40 } }}
        >
          <ListItemIcon><SearchIcon /></ListItemIcon>
          <ListItemText primary="Search" />
        </ListItemButton>
      </List>

      {/* Role-based main navigation */}
      <List sx={{ mt: 1 }}>
        {filteredMenuItems.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              ...listItemSx(location.pathname === item.path),
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
          ...neuRaised('md'),
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
            {/* Mobile Menu Icon */}
                  {isMobile && (
                    <IconButton
                    size="medium"
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
                      src={LOGO_HORIZONTAL}
                      alt={BRAND_NAME}
                      sx={{ height: { xs: 32, sm: 46 }, width: 'auto', display: 'block' }}
                    />
                  </Box>

                  
                        {!isMobile && (
                          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 3, justifyContent: 'center' }}>
                          {topLinks.map((item) => (
                            <Button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            sx={{
                              my: 1,
                              color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                              display: 'block',
                              textTransform: 'none',
                              borderRadius: '12px',
                              px: 2,
                              ...(location.pathname === item.path ? neuInset('sm') : { boxShadow: 'none', backgroundColor: 'transparent' }),
                              transition: 'box-shadow 0.2s ease, color 0.2s ease',
                              '&:hover': {
                                ...(location.pathname === item.path ? neuInset('sm') : neuRaised('xs')),
                              },
                            }}
                            >
                            {item.title}
                            </Button>
                          ))}
                          {overflowLinks.length > 0 && (
                            <>
                              <Button
                                onClick={(e) => setMoreAnchor(e.currentTarget)}
                                endIcon={<ExpandMore />}
                                sx={{
                                  my: 1,
                                  color: overflowLinks.some((i) => i.path === location.pathname) ? 'primary.main' : 'text.primary',
                                  display: 'flex',
                                  textTransform: 'none',
                                  borderRadius: '12px',
                                  px: 2,
                                  boxShadow: 'none',
                                  backgroundColor: 'transparent',
                                  '&:hover': neuRaised('xs'),
                                }}
                              >
                                More
                              </Button>
                              <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)}>
                                {overflowLinks.map((item) => (
                                  <MenuItem
                                    key={item.path}
                                    selected={location.pathname === item.path}
                                    onClick={() => { navigate(item.path); setMoreAnchor(null); }}
                                  >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <Typography>{item.title}</Typography>
                                  </MenuItem>
                                ))}
                              </Menu>
                            </>
                          )}
                          </Box>
                        )}

                        {/* Action Icons */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: { xs: 0.5, sm: 1 } }}>
                          <Tooltip title="Search">
                            <IconButton color="inherit" onClick={() => navigate('/search')} size="small">
                              <SearchIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Messages">
                            <IconButton color="inherit" onClick={() => navigate('/messages')} size="small">
                              <MessageIcon />
                            </IconButton>
                          </Tooltip>
                          <NotificationBell />
                        </Box>

                        {/* User Menu */}
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar 
                    alt={currentUser?.name} 
                    src={resolveAvatar(currentUser)}
                    sx={{ ...neuCircle(38, 'sm'), color: neuColors.primary }}
                  >
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
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{ sx: { backgroundColor: neuColors.base } }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;
