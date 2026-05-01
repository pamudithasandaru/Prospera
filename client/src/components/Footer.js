import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import {
  Agriculture,
  Facebook,
  Twitter,
  LinkedIn,
  YouTube,
  Instagram,
  Email,
  Phone,
  LocationOn,
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
  Dashboard,
  ArrowForward,
} from '@mui/icons-material';

const footerSections = [
  {
    title: 'Platform',
    links: [
      { label: 'Dashboard', path: '/dashboard', icon: <Dashboard sx={{ fontSize: 14 }} /> },
      { label: 'Farm Management', path: '/farm', icon: <Terrain sx={{ fontSize: 14 }} /> },
      { label: 'Wholesale Market', path: '/market', icon: <ShoppingCart sx={{ fontSize: 14 }} /> },
      { label: 'AgriLink Social', path: '/social', icon: <People sx={{ fontSize: 14 }} /> },
      { label: 'Marketplace', path: '/marketplace', icon: <Store sx={{ fontSize: 14 }} /> },
    ],
  },
  {
    title: 'Tools & Resources',
    links: [
      { label: 'Learning Hub', path: '/learning', icon: <School sx={{ fontSize: 14 }} /> },
      { label: 'AI Tools Lab', path: '/ai-tools', icon: <Psychology sx={{ fontSize: 14 }} /> },
      { label: 'Weather Dashboard', path: '/weather', icon: <Cloud sx={{ fontSize: 14 }} /> },
      { label: 'Government Portal', path: '/government', icon: <AccountBalance sx={{ fontSize: 14 }} /> },
      { label: 'AgriFinTech', path: '/fintech', icon: <AccountBalanceWallet sx={{ fontSize: 14 }} /> },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', path: '/support', icon: <Support sx={{ fontSize: 14 }} /> },
      { label: 'Contact Us', path: '/support', icon: <Email sx={{ fontSize: 14 }} /> },
      { label: 'Documentation', path: '/support', icon: <School sx={{ fontSize: 14 }} /> },
    ],
  },
];

const socialLinks = [
  { icon: <Facebook />, label: 'Facebook', href: '#' },
  { icon: <Twitter />, label: 'Twitter', href: '#' },
  { icon: <LinkedIn />, label: 'LinkedIn', href: '#' },
  { icon: <YouTube />, label: 'YouTube', href: '#' },
  { icon: <Instagram />, label: 'Instagram', href: '#' },
];

const contactInfo = [
  { icon: <Email sx={{ fontSize: 16 }} />, text: 'support@prospera.agri' },
  { icon: <Phone sx={{ fontSize: 16 }} />, text: '+94 71 234 5678' },
  { icon: <LocationOn sx={{ fontSize: 16 }} />, text: 'Galle, Sri Lanka' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #0B2710 0%, #0D1F0E 40%, #0A1628 100%)',
        color: 'white',
        mt: 'auto',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #1B5E20, #4CAF50, #0D47A1, #5472d3)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '-180px',
          right: '-180px',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: alpha('#4CAF50', 0.04),
          pointerEvents: 'none',
        },
      }}
    >
      {/* Decorative blobs */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: alpha('#0D47A1', 0.06),
          pointerEvents: 'none',
        }}
      />

      {/* Main Footer Content */}
      <Container maxWidth="xl" sx={{ pt: 7, pb: 4, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={5}>
          {/* Brand Column */}
          <Grid item xs={12} md={4} lg={3.5}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1B5E20, #4CAF50)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(76, 175, 80, 0.35)',
                }}
              >
                <Agriculture sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1,
                    background: 'linear-gradient(135deg, #4CAF50, #81C784)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.3px',
                  }}
                >
                  Prospera
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: alpha('#ffffff', 0.45), letterSpacing: '0.05em', fontSize: '0.65rem' }}
                >
                  AgriTech Platform
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: alpha('#ffffff', 0.55),
                lineHeight: 1.85,
                mb: 3,
                maxWidth: 300,
                fontSize: '0.82rem',
              }}
            >
              Empowering farmers with cutting-edge technology, AI-driven insights, and a connected
              agricultural ecosystem to build a prosperous future for Indian agriculture.
            </Typography>

            <Chip
              label="Trusted by 50,000+ Farmers"
              size="small"
              sx={{
                mb: 3.5,
                bgcolor: alpha('#4CAF50', 0.12),
                color: '#81C784',
                border: `1px solid ${alpha('#4CAF50', 0.25)}`,
                fontWeight: 600,
                fontSize: '0.72rem',
                '& .MuiChip-label': { px: 1.5 },
              }}
            />

            {/* Contact Info */}
            <Stack spacing={1.5}>
              {contactInfo.map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      color: '#4CAF50',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: 0.85,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.5), fontSize: '0.8rem' }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>

          {/* Navigation Columns */}
          {footerSections.map((section) => (
            <Grid item xs={6} sm={4} md={2.5} lg={2} key={section.title}>
              <Typography
                variant="overline"
                sx={{
                  color: '#4CAF50',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  letterSpacing: '0.12em',
                  mb: 2.5,
                  display: 'block',
                }}
              >
                {section.title}
              </Typography>
              <Stack spacing={1.4}>
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    component={RouterLink}
                    to={link.path}
                    underline="none"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: alpha('#ffffff', 0.48),
                      fontSize: '0.82rem',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400,
                      transition: 'color 0.2s ease, gap 0.2s ease',
                      '&:hover': {
                        color: '#81C784',
                        gap: 1.5,
                        '& .arrow-icon': { opacity: 1 },
                      },
                    }}
                  >
                    <Box sx={{ color: alpha('#4CAF50', 0.6), display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      {link.icon}
                    </Box>
                    {link.label}
                    <ArrowForward
                      className="arrow-icon"
                      sx={{ fontSize: 11, ml: 'auto', opacity: 0, transition: 'opacity 0.2s ease' }}
                    />
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}

          {/* Social & App Column */}
          <Grid item xs={12} sm={12} md={3} lg={2.5}>
            <Typography
              variant="overline"
              sx={{
                color: '#4CAF50',
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                mb: 2.5,
                display: 'block',
              }}
            >
              Follow Us
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  size="small"
                  sx={{
                    color: alpha('#ffffff', 0.45),
                    bgcolor: alpha('#ffffff', 0.05),
                    border: `1px solid ${alpha('#ffffff', 0.08)}`,
                    borderRadius: '10px',
                    width: 36,
                    height: 36,
                    transition: 'all 0.25s ease',
                    '& svg': { fontSize: 17 },
                    '&:hover': {
                      color: '#4CAF50',
                      bgcolor: alpha('#4CAF50', 0.12),
                      borderColor: alpha('#4CAF50', 0.35),
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 16px rgba(76, 175, 80, 0.2)',
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>

            <Box
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: `1px solid ${alpha('#4CAF50', 0.18)}`,
                bgcolor: alpha('#4CAF50', 0.05),
                backdropFilter: 'blur(8px)',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: alpha('#ffffff', 0.85), fontWeight: 600, mb: 0.75, fontSize: '0.82rem' }}
              >
                Stay Connected
              </Typography>
              <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.4), fontSize: '0.75rem', lineHeight: 1.7 }}>
                Get the latest agri news, market prices, and crop alerts directly to your account.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider
          sx={{
            mt: 5,
            mb: 3,
            borderColor: alpha('#ffffff', 0.07),
          }}
        />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'center' },
            gap: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: alpha('#ffffff', 0.3), fontSize: '0.75rem', textAlign: { xs: 'center', sm: 'left' } }}
          >
            © {currentYear} Prospera AgriTech Platform. All rights reserved.
          </Typography>

          <Stack
            direction="row"
            spacing={0.5}
            divider={
              <Box component="span" sx={{ color: alpha('#ffffff', 0.2), alignSelf: 'center', fontSize: '0.7rem' }}>
                ·
              </Box>
            }
            flexWrap="wrap"
            justifyContent="center"
            sx={{ gap: 0.5 }}
          >
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility'].map((item) => (
              <Link
                key={item}
                href="#"
                underline="none"
                sx={{
                  color: alpha('#ffffff', 0.3),
                  fontSize: '0.73rem',
                  fontFamily: 'Poppins, sans-serif',
                  transition: 'color 0.2s',
                  '&:hover': { color: '#81C784' },
                }}
              >
                {item}
              </Link>
            ))}
          </Stack>

          <Typography
            variant="caption"
            sx={{ color: alpha('#ffffff', 0.2), fontSize: '0.73rem', textAlign: { xs: 'center', sm: 'right' } }}
          >
            Built with ❤️ for Farmers
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
