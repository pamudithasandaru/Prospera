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
import { navItemsFor } from '../config/access';

/**
 * The link list itself now lives in config/access.js, shared with the router,
 * so the nav can no longer offer a page the router will refuse. All this map
 * adds is the icon for each entry.
 */
const ICONS = {
  dashboard:   <Dashboard />,
  admin:       <AdminPanelSettings />,
  farm:        <Terrain />,
  market:      <ShoppingCart />,
  social:      <People />,
  learning:    <School />,
  ai:          <Psychology />,
  marketplace: <Store />,
  government:  <AccountBalance />,
  weather:     <Cloud />,
  support:     <Support />,
  fintech:     <AccountBalanceWallet />,
};

/** Signed-in-only quick links for the mobile drawer. */
const SOCIAL_LINKS = [
  { path: '/social',        title: 'Social Feed',   icon: <People /> },
  { path: '/messages',      title: 'Messages',      icon: <MessageIcon /> },
  { path: '/notifications', title: 'Notifications', icon: <NotificationsIcon /> },
  { path: '/search',        title: 'Search',        icon: <SearchIcon /> },
];


const listItemSx = (active) => ({
  borderRadius: '12px',
  mb: 0.75,
  ...(active ? neuInset('xs') : { boxShadow: 'none' }),
});

const Navbar = () => {
  const theme = useTheme();
  // The full link bar needs ~1100px; below that (phones, tablets) the hamburger drawer is used.
  const isMobile = useMediaQuery('(max-width:1099.95px)');
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, role, isGuest, logout } = useAuth();

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
    navigate('/');
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Guests get the PUBLIC entries only; admins get everything. The rule lives
  // in config/access.js — see navItemsFor.
  const filteredMenuItems = navItemsFor(role).map((item) => ({ ...item, icon: ICONS[item.icon] }));

  /** Where the logo goes: guests have no dashboard to return to. */
  const homePath = isGuest ? '/' : '/dashboard';
  // How many links fit in the bar depends on width; the rest go into "More".
  const isWide = useMediaQuery('(min-width:1500px)');
  const isMedium = useMediaQuery('(min-width:1200px)');
  const MAX_TOP_LINKS = isWide ? 6 : isMedium ? 5 : 4;
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
      {/* Social quick-links — signed-in users only; each target is an AUTH route */}
      {!isGuest && (
        <List dense sx={{ mt: 0.5 }}>
          {SOCIAL_LINKS.map((link) => (
            <ListItemButton
              key={link.path}
              onClick={() => navigate(link.path)}
              selected={location.pathname === link.path}
              sx={{
                ...listItemSx(location.pathname === link.path),
                '& .MuiListItemIcon-root': {
                  color: location.pathname === link.path ? 'primary.main' : 'text.secondary',
                  minWidth: 40,
                },
              }}
            >
              <ListItemIcon>{link.icon}</ListItemIcon>
              <ListItemText primary={link.title} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          ))}
        </List>
      )}

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

      {isGuest && (
        <Box sx={{ px: 1.5, pb: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button fullWidth onClick={() => navigate('/register')} sx={{ ...neuRaised('sm'), borderRadius: '12px', textTransform: 'none', fontWeight: 700, color: neuColors.primary }}>
            Create account
          </Button>
          <Button fullWidth onClick={() => navigate('/login')} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}>
            Sign in
          </Button>
        </Box>
      )}
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
                  <Box
                    onClick={() => navigate(homePath)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexGrow: isMobile ? 1 : 0, cursor: 'pointer' }}
                  >
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
                              whiteSpace: 'nowrap',
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
                                  whiteSpace: 'nowrap',
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

                        {/* Action Icons — all three lead to AUTH-only pages */}
                        {!isGuest && (
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
                        )}

            {/* Guests get the way in; everyone else gets their account menu. */}
            {isGuest ? (
              <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  onClick={() => navigate('/login')}
                  sx={{ textTransform: 'none', fontWeight: 600, color: 'text.primary', borderRadius: '12px', px: 2, boxShadow: 'none', '&:hover': neuRaised('xs') }}
                >
                  Sign in
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  sx={{ ...neuRaised('sm'), textTransform: 'none', fontWeight: 700, color: neuColors.primary, borderRadius: '12px', px: 2, whiteSpace: 'nowrap', '&:hover': neuInset('xs') }}
                >
                  Create account
                </Button>
              </Box>
            ) : (
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
            )}
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
