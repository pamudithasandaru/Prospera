import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpaIcon from '@mui/icons-material/Spa';
import StorefrontIcon from '@mui/icons-material/Storefront';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import SensorsIcon from '@mui/icons-material/Sensors';
import { neuRaised } from '../../neumorphic';
import { BRAND_NAME, brandFont } from '../../brand';

/**
 * AgriHeroArt
 * A custom-crafted, theme-aligned vector illustration showcasing Haritha Bhoomi's
 * vision: lush terraced fields, morning sun, flowing waters, flourishing crops,
 * and smart IoT AgriTech connectivity.
 */
const AgriHeroArt = ({
  badge = "Next-Gen AgriTech Platform",
  title = "Cultivating Sustainable Futures with Smart Technology",
  subtitle = "Empowering Sri Lankan farmers with real-time AI crop diagnostics, direct marketplace trade, hyperlocal weather intelligence, and a connected community of agronomy experts.",
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 620,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        p: { xs: 2, md: 4 },
      }}
    >
      {/* Brand Header & Headline */}
      <Box sx={{ mb: 3 }}>
        <Chip
          icon={<SpaIcon sx={{ fontSize: '1.1rem !important', color: '#1B5E20' }} />}
          label={badge}
          size="small"
          sx={{
            bgcolor: 'rgba(46, 125, 50, 0.12)',
            color: '#1B5E20',
            fontWeight: 700,
            fontSize: '0.8rem',
            mb: 1.5,
            border: '1px solid rgba(46, 125, 50, 0.25)',
          }}
        />

        <Typography
          variant="h3"
          sx={{
            fontFamily: brandFont,
            fontWeight: 800,
            fontSize: { xs: '1.8rem', md: '2.4rem' },
            color: '#1B5E20',
            lineHeight: 1.2,
            mb: 1,
            letterSpacing: '-0.02em',
          }}
        >
          {BRAND_NAME}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: '#2b3445',
            fontSize: { xs: '1.1rem', md: '1.35rem' },
            mb: 1.2,
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#5b667a',
            fontSize: { xs: '0.85rem', md: '0.95rem' },
            lineHeight: 1.6,
            maxWidth: 520,
          }}
        >
          {subtitle}
        </Typography>
      </Box>

      {/* Hero Illustration Container with Framed Glass / Neumorphic Backing */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          borderRadius: '28px',
          overflow: 'hidden',
          ...neuRaised('lg'),
          background: 'linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 40%, #E3E8F0 100%)',
          p: { xs: 1.5, md: 2.5 },
          border: '1px solid rgba(255, 255, 255, 0.75)',
        }}
      >
        {/* SVG Landscape Art */}
        <Box
          component="svg"
          viewBox="0 0 600 380"
          sx={{
            width: '100%',
            height: 'auto',
            display: 'block',
            filter: 'drop-shadow(0 4px 12px rgba(27, 94, 32, 0.08))',
          }}
        >
          <defs>
            {/* Sky Gradient */}
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="35%" stopColor="#ecfdf5" />
              <stop offset="100%" stopColor="#fef3c7" />
            </linearGradient>

            {/* Sun Glow */}
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="1" />
              <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.8" />
              <stop offset="85%" stopColor="#FDE68A" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FFFBEB" stopOpacity="0" />
            </radialGradient>

            {/* Hill Gradients */}
            <linearGradient id="farHillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="midHillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="60%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>

            <linearGradient id="frontTerraceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="40%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>

            <linearGradient id="deepFieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#166534" />
              <stop offset="100%" stopColor="#0E4D2C" />
            </linearGradient>

            {/* River Gradient */}
            <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Sprout Leaf Gradient */}
            <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bbf7d0" />
              <stop offset="40%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>

            {/* Gold Crop Gradient */}
            <linearGradient id="goldCropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>

          {/* Sky Backdrop */}
          <rect width="600" height="380" rx="16" fill="url(#skyGrad)" />

          {/* Distant Central Highlands Mountain Silhouettes */}
          <path
            d="M 0 170 Q 70 115 150 145 T 320 135 T 480 150 Q 540 130 600 160 L 600 240 L 0 240 Z"
            fill="#a7f3d0"
            opacity="0.55"
          />
          <path
            d="M 60 165 Q 160 110 260 140 T 450 120 Q 530 110 600 145 L 600 250 L 0 250 Z"
            fill="#6ee7b7"
            opacity="0.45"
          />

          {/* Rising Sun and Radiant Corona Rings */}
          <circle cx="430" cy="115" r="75" fill="url(#sunGlow)" opacity="0.6" />
          <circle cx="430" cy="115" r="46" fill="url(#sunGlow)" opacity="0.9" />
          <circle cx="430" cy="115" r="28" fill="#F59E0B" />
          <circle cx="430" cy="115" r="24" fill="#FCD34D" />

          {/* Sunbeams (gentle diagonal light vectors) */}
          <line x1="430" y1="115" x2="250" y2="280" stroke="#fef08a" strokeWidth="1.5" opacity="0.3" strokeDasharray="4 8" />
          <line x1="430" y1="115" x2="330" y2="310" stroke="#fef08a" strokeWidth="2" opacity="0.35" strokeDasharray="6 6" />
          <line x1="430" y1="115" x2="490" y2="290" stroke="#fef08a" strokeWidth="1.5" opacity="0.25" strokeDasharray="5 7" />

          {/* Morning Birds In Flight */}
          <g stroke="#166534" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.75">
            <path d="M 230 75 Q 238 68 246 75 Q 254 68 262 75" />
            <path d="M 270 90 Q 276 84 282 90 Q 288 84 294 90" />
            <path d="M 205 95 Q 210 90 215 95 Q 220 90 225 95" />
          </g>

          {/* Midground Terraced Paddy Ridges Layer 1 */}
          <path
            d="M 0 205 Q 120 180 270 195 T 600 185 L 600 380 L 0 380 Z"
            fill="url(#midHillGrad)"
          />

          {/* Terraced Paddy Ridges Layer 2 */}
          <path
            d="M 0 230 Q 150 205 320 225 T 600 210 L 600 380 L 0 380 Z"
            fill="url(#frontTerraceGrad)"
          />

          {/* Curving Irrigation Stream / River */}
          <path
            d="M 410 210 Q 380 240 330 255 T 220 295 T 90 380 L 170 380 Q 270 305 370 270 T 430 210 Z"
            fill="url(#riverGrad)"
            opacity="0.85"
          />
          {/* River Water Highlight Curves */}
          <path
            d="M 390 225 Q 350 250 310 265 T 210 315"
            stroke="#ffffff"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
            strokeLinecap="round"
          />

          {/* Foreground Terraces & Cultivated Land Layer 3 */}
          <path
            d="M 0 260 Q 140 245 230 270 Q 340 260 480 255 Q 540 250 600 260 L 600 380 L 0 380 Z"
            fill="url(#deepFieldGrad)"
          />

          {/* Rice Paddy Contour Ridge Accents (Sri Lankan Wella / Niyara) */}
          <path d="M 0 232 Q 130 210 280 226 T 600 212" stroke="#86efac" strokeWidth="2.5" fill="none" opacity="0.6" />
          <path d="M 0 262 Q 140 246 230 272 Q 340 262 480 257 Q 540 252 600 262" stroke="#4ade80" strokeWidth="3" fill="none" opacity="0.8" />
          <path d="M 0 295 Q 160 280 340 305 Q 480 290 600 300" stroke="#22c55e" strokeWidth="2.5" fill="none" opacity="0.7" />

          {/* Cultivated Crop Rows (Dotted Golden and Emerald Shoots) */}
          <g fill="#fef08a" opacity="0.85">
            <circle cx="50" cy="275" r="3" />
            <circle cx="80" cy="273" r="3" />
            <circle cx="110" cy="272" r="3.2" />
            <circle cx="140" cy="273" r="3" />
            <circle cx="170" cy="276" r="3.2" />
            <circle cx="200" cy="281" r="3" />

            <circle cx="360" cy="285" r="3.5" />
            <circle cx="395" cy="281" r="3.5" />
            <circle cx="430" cy="277" r="3.5" />
            <circle cx="465" cy="275" r="3.5" />
            <circle cx="500" cy="276" r="3.5" />
            <circle cx="535" cy="279" r="3.5" />
            <circle cx="570" cy="284" r="3.5" />
          </g>

          {/* Smart IoT AgriTech Station (Antenna, Solar Panel, Sensor Signals) */}
          <g transform="translate(480, 160)">
            {/* Pulsing IoT Radio / Sensor Waves */}
            <circle cx="30" cy="25" r="22" stroke="#22c55e" strokeWidth="1.2" fill="none" opacity="0.35" strokeDasharray="3 3" />
            <circle cx="30" cy="25" r="38" stroke="#38bdf8" strokeWidth="1.2" fill="none" opacity="0.25" strokeDasharray="4 4" />

            {/* Mast */}
            <line x1="30" y1="25" x2="30" y2="95" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            <line x1="20" y1="95" x2="40" y2="95" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="23" y1="80" x2="30" y2="60" stroke="#475569" strokeWidth="1.5" />
            <line x1="37" y1="80" x2="30" y2="60" stroke="#475569" strokeWidth="1.5" />

            {/* Solar mini-panel */}
            <polygon points="18,48 42,42 44,52 20,58" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1" />

            {/* Sensor Pod & Blinking LED */}
            <rect x="23" y="24" width="14" height="18" rx="3" fill="#0f172a" />
            <circle cx="30" cy="30" r="3" fill="#22c55e" />
            <circle cx="30" cy="30" r="5" stroke="#4ade80" strokeWidth="1" fill="none" opacity="0.8" />

            {/* Anemometer / Wind Cups */}
            <line x1="30" y1="12" x2="30" y2="24" stroke="#475569" strokeWidth="2" />
            <line x1="18" y1="14" x2="42" y2="14" stroke="#475569" strokeWidth="1.5" />
            <circle cx="18" cy="14" r="3.5" fill="#f59e0b" />
            <circle cx="42" cy="14" r="3.5" fill="#f59e0b" />
            <circle cx="30" cy="9" r="3.5" fill="#f59e0b" />
          </g>

          {/* IoT Telemetry Data Nodes Connected Across the Landscape */}
          <g>
            {/* Tech Node 1 (Soil Moisture) */}
            <circle cx="160" cy="275" r="5" fill="#38bdf8" />
            <circle cx="160" cy="275" r="10" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.6" />

            {/* Tech Node 2 (Crop Vigor Sensor) */}
            <circle cx="380" cy="285" r="5" fill="#4ade80" />
            <circle cx="380" cy="285" r="11" stroke="#4ade80" strokeWidth="1" fill="none" opacity="0.6" />

            {/* Tech Node 3 (Weather Station Hub) */}
            <circle cx="510" cy="185" r="5" fill="#f59e0b" />

            {/* Connecting Telemetry Network Lines */}
            <line x1="160" y1="275" x2="380" y2="285" stroke="#38bdf8" strokeWidth="1.2" opacity="0.5" strokeDasharray="3 4" />
            <line x1="380" y1="285" x2="510" y2="185" stroke="#4ade80" strokeWidth="1.2" opacity="0.5" strokeDasharray="3 4" />
          </g>

          {/* Hero Foreground Sprouting Rice Plant / Foliage (Prominent artistic focal point) */}
          <g transform="translate(40, 240)">
            {/* Main stem */}
            <path d="M 45 130 Q 42 70 38 10" stroke="#15803d" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M 45 130 Q 55 80 75 35" stroke="#16a34a" strokeWidth="3.5" fill="none" strokeLinecap="round" />

            {/* Left Lush Leaf */}
            <path
              d="M 43 90 C 20 85 2 65 0 35 C 18 42 38 65 42 85 Z"
              fill="url(#leafGrad)"
              stroke="#15803d"
              strokeWidth="1.5"
            />
            {/* Leaf Vein */}
            <path d="M 40 85 C 24 72 12 55 2 37" stroke="#86efac" strokeWidth="1.2" fill="none" opacity="0.75" />

            {/* Right Upward Leaf */}
            <path
              d="M 40 60 C 45 35 65 15 95 8 C 88 32 68 50 42 58 Z"
              fill="url(#leafGrad)"
              stroke="#15803d"
              strokeWidth="1.5"
            />
            <path d="M 42 58 C 58 42 74 28 92 10" stroke="#86efac" strokeWidth="1.2" fill="none" opacity="0.75" />

            {/* Golden Ripening Rice Grains Head (Paddy / වී කරල්) */}
            <g fill="url(#goldCropGrad)" stroke="#a16207" strokeWidth="0.8">
              <ellipse cx="78" cy="30" rx="4.5" ry="8" transform="rotate(35 78 30)" />
              <ellipse cx="86" cy="22" rx="4.5" ry="8" transform="rotate(40 86 22)" />
              <ellipse cx="96" cy="16" rx="4.5" ry="8" transform="rotate(45 96 16)" />
              <ellipse cx="106" cy="14" rx="4.5" ry="8" transform="rotate(50 106 14)" />
              <ellipse cx="116" cy="15" rx="4" ry="7" transform="rotate(55 116 15)" />
            </g>

            {/* Dew Drop with Light Reflection */}
            <circle cx="16" cy="48" r="3" fill="#ffffff" opacity="0.9" />
            <circle cx="15.2" cy="47.2" r="1.2" fill="#38bdf8" />
          </g>
        </Box>
      </Box>

      {/* Floating AgriTech Feature Cards / Highlights */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{
          mt: 2.5,
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        {/* Card 1: AI Diagnostics */}
        <Box
          sx={{
            flex: 1,
            p: 1.5,
            borderRadius: '16px',
            ...neuRaised('sm'),
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 8px 16px rgba(46, 125, 50, 0.15)',
            },
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: 'rgba(46, 125, 50, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1B5E20',
              flexShrink: 0,
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: '1.25rem' }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1B5E20' }}>
              AI Crop Diagnostics
            </Typography>
            <Typography variant="caption" sx={{ color: '#5b667a', display: 'block', lineHeight: 1.2 }}>
              Instant pest & disease scan
            </Typography>
          </Box>
        </Box>

        {/* Card 2: Direct Marketplace */}
        <Box
          sx={{
            flex: 1,
            p: 1.5,
            borderRadius: '16px',
            ...neuRaised('sm'),
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 8px 16px rgba(245, 158, 11, 0.15)',
            },
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D97706',
              flexShrink: 0,
            }}
          >
            <StorefrontIcon sx={{ fontSize: '1.25rem' }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#B45309' }}>
              Direct Marketplace
            </Typography>
            <Typography variant="caption" sx={{ color: '#5b667a', display: 'block', lineHeight: 1.2 }}>
              Fair pricing, zero middleman
            </Typography>
          </Box>
        </Box>

        {/* Card 3: Hyperlocal Weather */}
        <Box
          sx={{
            flex: 1,
            p: 1.5,
            borderRadius: '16px',
            ...neuRaised('sm'),
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 8px 16px rgba(2, 132, 199, 0.15)',
            },
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: 'rgba(2, 132, 199, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284C7',
              flexShrink: 0,
            }}
          >
            <WbSunnyIcon sx={{ fontSize: '1.25rem' }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0369A1' }}>
              Micro-Weather & IoT
            </Typography>
            <Typography variant="caption" sx={{ color: '#5b667a', display: 'block', lineHeight: 1.2 }}>
              Hyperlocal rain & soil alerts
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default AgriHeroArt;
