import React from 'react';
import { BRAND_NAME, BRAND_TAGLINE, LOGO_HORIZONTAL } from '../brand';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { neuColors, neuRaised, neuInset, neuCircle } from '../neumorphic';
import {
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

const sectionTitleSx = {
  color: neuColors.primary,
  fontWeight: 700,
  fontSize: '0.7rem',
  letterSpacing: '0.12em',
  mb: 2.5,
  display: 'block',
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        ...neuRaised('lg'),
        color: 'text.primary',
        mt: 'auto',
        borderRadius: '32px 32px 0 0',
      }}
    >
      <Container maxWidth="xl" sx={{ pt: 7, pb: 4 }}>
        <Grid container spacing={5}>
          <Grid item xs={12} md={4} lg={3.5}>
            <Box sx={{ mb: 2.5 }}>
              <Box component="img" src={LOGO_HORIZONTAL} alt={BRAND_NAME} sx={{ height: 64, width: 'auto', display: 'block' }} />
            </Box>

            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', lineHeight: 1.85, mb: 3, maxWidth: 300, fontSize: '0.82rem' }}
            >
              Empowering farmers with cutting-edge technology, AI-driven insights, and a connected
              agricultural ecosystem to build a prosperous future for Indian agriculture.
            </Typography>

            <Chip
              label="Trusted by 50,000+ Farmers"
              size="small"
              sx={{
                mb: 3.5,
                color: neuColors.primary,
                fontWeight: 600,
                fontSize: '0.72rem',
                '& .MuiChip-label': { px: 1.5 },
              }}
            />

            <Stack spacing={1.5}>
              {contactInfo.map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ color: neuColors.primary, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>

          {footerSections.map((section) => (
            <Grid item xs={6} sm={4} md={2.5} lg={2} key={section.title}>
              <Typography variant="overline" sx={sectionTitleSx}>
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
                      color: 'text.secondary',
                      fontSize: '0.82rem',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400,
                      transition: 'color 0.2s ease, gap 0.2s ease',
                      '&:hover': {
                        color: neuColors.primary,
                        gap: 1.5,
                        '& .arrow-icon': { opacity: 1 },
                      },
                    }}
                  >
                    <Box sx={{ color: neuColors.primary, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
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

          <Grid item xs={12} sm={12} md={3} lg={2.5}>
            <Typography variant="overline" sx={sectionTitleSx}>
              Follow Us
            </Typography>

            <Stack direction="row" spacing={1.5} sx={{ mb: 4 }}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  size="small"
                  sx={{
                    ...neuCircle(36, 'xs'),
                    color: 'text.secondary',
                    '& svg': { fontSize: 17 },
                    '&:hover': { color: neuColors.primary, boxShadow: neuRaised('sm').boxShadow },
                    '&:active': { boxShadow: neuInset('xs').boxShadow },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>

            <Box sx={{ p: 2.5, borderRadius: '16px', ...neuInset('sm') }}>
              <Typography
                variant="subtitle2"
                sx={{ color: 'text.primary', fontWeight: 600, mb: 0.75, fontSize: '0.82rem' }}
              >
                Stay Connected
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', lineHeight: 1.7 }}>
                Get the latest agri news, market prices, and crop alerts directly to your account.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 6,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontSize: '0.75rem', textAlign: { xs: 'center', sm: 'left' } }}
          >
            © {currentYear} {BRAND_NAME} {BRAND_TAGLINE}. All rights reserved.
          </Typography>

          <Stack
            direction="row"
            spacing={0.5}
            divider={
              <Box component="span" sx={{ color: 'text.secondary', alignSelf: 'center', fontSize: '0.7rem' }}>
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
                  color: 'text.secondary',
                  fontSize: '0.73rem',
                  fontFamily: 'Poppins, sans-serif',
                  transition: 'color 0.2s',
                  '&:hover': { color: neuColors.primary },
                }}
              >
                {item}
              </Link>
            ))}
          </Stack>

          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontSize: '0.73rem', textAlign: { xs: 'center', sm: 'right' } }}
          >
            Built with ❤️ for Farmers
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
