import React from 'react';
import { Box } from '@mui/material';

/**
 * AgriBackgroundDecor
 * Renders decorative SVG agricultural elements in the page background:
 * - Ambient gradient glows (emerald and golden morning hues)
 * - Topographic contour field lines
 * - Floating botanical leaf SVGs with gentle floating animations
 */
const AgriBackgroundDecor = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Ambient Radial Color Washes */}
      <Box
        sx={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '55vw',
          height: '55vw',
          maxWidth: 700,
          maxHeight: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46, 125, 50, 0.14) 0%, rgba(46, 125, 50, 0.04) 45%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '50vw',
          height: '50vw',
          maxWidth: 650,
          maxHeight: 650,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.03) 45%, transparent 70%)',
          filter: 'blur(45px)',
        }}
      />

      {/* Topographic Field Contour SVG Pattern */}
      <Box
        component="svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.35,
        }}
      >
        <path
          d="M -100 250 C 300 120, 600 380, 1000 220 C 1250 120, 1400 260, 1600 180"
          stroke="#1B5E20"
          strokeWidth="1.2"
          strokeDasharray="6 8"
          fill="none"
        />
        <path
          d="M -100 320 C 250 200, 650 450, 1050 290 C 1300 200, 1450 340, 1600 260"
          stroke="#1B5E20"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M -100 500 C 350 420, 700 680, 1100 520 C 1350 420, 1500 560, 1600 480"
          stroke="#2E7D32"
          strokeWidth="1.2"
          strokeDasharray="4 6"
          fill="none"
        />
        <path
          d="M -100 650 C 300 580, 750 820, 1150 670 C 1380 580, 1520 710, 1600 630"
          stroke="#2E7D32"
          strokeWidth="1.5"
          fill="none"
        />
      </Box>

      {/* Floating Botanical Leaf 1 (Top Right) */}
      <Box
        component="svg"
        viewBox="0 0 120 120"
        sx={{
          position: 'absolute',
          top: { xs: 20, md: 50 },
          right: { xs: '3%', md: '6%' },
          width: { xs: 55, md: 90 },
          height: { xs: 55, md: 90 },
          opacity: 0.7,
          animation: 'floatSlow 7s ease-in-out infinite alternate',
          '@keyframes floatSlow': {
            '0%': { transform: 'translate(0, 0) rotate(0deg)' },
            '100%': { transform: 'translate(-12px, -18px) rotate(12deg)' },
          },
        }}
      >
        <path
          d="M 60 10 C 25 35 20 80 60 110 C 100 80 95 35 60 10 Z"
          fill="url(#floatingLeafGrad1)"
          filter="drop-shadow(3px 5px 8px rgba(27, 94, 32, 0.18))"
        />
        <path d="M 60 12 Q 60 60 60 105" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
        <path d="M 60 40 Q 42 35 34 28" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <path d="M 60 55 Q 78 50 86 42" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <path d="M 60 70 Q 45 68 38 60" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <defs>
          <linearGradient id="floatingLeafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
        </defs>
      </Box>

      {/* Floating Botanical Leaf 2 (Bottom Left) */}
      <Box
        component="svg"
        viewBox="0 0 100 100"
        sx={{
          position: 'absolute',
          bottom: { xs: 40, md: 80 },
          left: { xs: '2%', md: '4%' },
          width: { xs: 45, md: 75 },
          height: { xs: 45, md: 75 },
          opacity: 0.65,
          animation: 'floatGentle 8.5s ease-in-out infinite alternate',
          '@keyframes floatGentle': {
            '0%': { transform: 'translate(0, 0) rotate(0deg)' },
            '100%': { transform: 'translate(14px, -15px) rotate(-14deg)' },
          },
        }}
      >
        <path
          d="M 50 10 C 20 30 15 70 50 95 C 85 70 80 30 50 10 Z"
          fill="url(#floatingLeafGrad2)"
          filter="drop-shadow(3px 4px 6px rgba(46, 125, 50, 0.15))"
        />
        <path d="M 50 14 Q 50 55 50 92" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M 50 42 Q 35 38 28 32" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <path d="M 50 62 Q 65 58 72 52" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <defs>
          <linearGradient id="floatingLeafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="60%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
      </Box>

      {/* Golden Sprout accent in top left */}
      <Box
        component="svg"
        viewBox="0 0 60 60"
        sx={{
          position: 'absolute',
          top: { xs: 80, md: 110 },
          left: { xs: '4%', md: '8%' },
          width: { xs: 30, md: 45 },
          height: { xs: 30, md: 45 },
          opacity: 0.5,
          animation: 'pulseSlow 6s ease-in-out infinite alternate',
          '@keyframes pulseSlow': {
            '0%': { transform: 'scale(1) rotate(0deg)' },
            '100%': { transform: 'scale(1.1) rotate(6deg)' },
          },
        }}
      >
        <circle cx="30" cy="30" r="18" fill="#FBBF24" opacity="0.25" />
        <circle cx="30" cy="30" r="10" fill="#F59E0B" opacity="0.4" />
      </Box>
    </Box>
  );
};

export default AgriBackgroundDecor;
