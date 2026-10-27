import React from 'react';
import { Box } from '@mui/material';

/**
 * Agri404Art
 * A friendly agricultural 404 vector illustration:
 * rolling green hills, a winding farm trail, curious seedling sprout,
 * morning sun, and a wooden farm milestone.
 */
export const Agri404Art = ({ width = 360, height = 240 }) => (
  <Box
    component="svg"
    viewBox="0 0 400 260"
    sx={{
      width: '100%',
      maxWidth: width,
      height: 'auto',
      maxHeight: height,
      display: 'block',
      mx: 'auto',
      filter: 'drop-shadow(0 8px 18px rgba(27, 94, 32, 0.12))',
    }}
  >
    <defs>
      <linearGradient id="art404Sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e0f2fe" />
        <stop offset="60%" stopColor="#dcfce7" />
        <stop offset="100%" stopColor="#fef3c7" />
      </linearGradient>
      <linearGradient id="art404Sun" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#fbbf24" />
      </linearGradient>
      <linearGradient id="art404HillFar" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#86efac" />
        <stop offset="100%" stopColor="#22c55e" />
      </linearGradient>
      <linearGradient id="art404HillNear" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#16a34a" />
        <stop offset="100%" stopColor="#0e4d2c" />
      </linearGradient>
      <linearGradient id="art404Sprout" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4ade80" />
        <stop offset="100%" stopColor="#15803d" />
      </linearGradient>
    </defs>

    {/* Backdrop */}
    <rect width="400" height="260" rx="20" fill="url(#art404Sky)" />

    {/* Sun and Glow */}
    <circle cx="310" cy="70" r="38" fill="#fde68a" opacity="0.5" />
    <circle cx="310" cy="70" r="24" fill="url(#art404Sun)" />

    {/* Birds */}
    <path d="M 120 50 Q 126 44 132 50 Q 138 44 144 50" stroke="#15803d" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.6" />
    <path d="M 155 62 Q 160 57 165 62 Q 170 57 175 62" stroke="#15803d" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.55" />

    {/* Far rolling hills */}
    <path d="M 0 140 Q 110 100 230 130 T 400 120 L 400 260 L 0 260 Z" fill="url(#art404HillFar)" />

    {/* Near terrace hill */}
    <path d="M 0 165 Q 150 140 280 170 T 400 150 L 400 260 L 0 260 Z" fill="url(#art404HillNear)" />

    {/* Winding Trail */}
    <path d="M 200 260 Q 210 220 225 195 Q 235 175 240 160" stroke="#fcd34d" strokeWidth="18" fill="none" strokeLinecap="round" opacity="0.75" />
    <path d="M 200 260 Q 210 220 225 195 Q 235 175 240 160" stroke="#fef08a" strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.85" />

    {/* Wooden Signpost: "404" */}
    <g transform="translate(90, 140)">
      {/* Post */}
      <rect x="26" y="25" width="8" height="50" rx="2" fill="#78350f" />
      {/* Board */}
      <rect x="0" y="0" width="60" height="30" rx="5" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
      <text x="30" y="21" fontFamily="Poppins, sans-serif" fontSize="16" fontWeight="bold" fill="#fef3c7" textAnchor="middle">
        404
      </text>
      {/* Little green leaf on top of signpost */}
      <path d="M 52 0 C 45 -12 60 -15 62 -2 C 60 4 55 2 52 0 Z" fill="#22c55e" />
    </g>

    {/* Curious Cute Plant Sprout Looking Around */}
    <g transform="translate(235, 175)">
      {/* Mound */}
      <ellipse cx="25" cy="42" rx="14" ry="4" fill="#3f2305" opacity="0.6" />
      {/* Stem */}
      <path d="M 25 40 Q 22 25 24 10" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Left Leaf */}
      <path d="M 23 24 C 8 20 2 10 4 0 C 14 2 22 15 23 24 Z" fill="url(#art404Sprout)" />
      {/* Right Leaf */}
      <path d="M 25 18 C 38 12 44 2 40 -6 C 30 -4 25 8 25 18 Z" fill="url(#art404Sprout)" />
      {/* Question mark bubble */}
      <circle cx="34" cy="-14" r="10" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
      <text x="34" y="-9" fontFamily="Poppins, sans-serif" fontSize="12" fontWeight="bold" fill="#15803d" textAnchor="middle">?</text>
    </g>
  </Box>
);

/**
 * Agri403Art
 * An agricultural permission / access denied illustration:
 * a rustic wooden farm gate with an emerald leaf padlock,
 * protective sun rays, and a serene green orchard.
 */
export const Agri403Art = ({ width = 360, height = 240 }) => (
  <Box
    component="svg"
    viewBox="0 0 400 260"
    sx={{
      width: '100%',
      maxWidth: width,
      height: 'auto',
      maxHeight: height,
      display: 'block',
      mx: 'auto',
      filter: 'drop-shadow(0 8px 18px rgba(27, 94, 32, 0.12))',
    }}
  >
    <defs>
      <linearGradient id="art403Sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ecfdf5" />
        <stop offset="70%" stopColor="#d1fae5" />
        <stop offset="100%" stopColor="#fef3c7" />
      </linearGradient>
      <linearGradient id="art403Shield" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1b5e20" />
        <stop offset="50%" stopColor="#2e7d32" />
        <stop offset="100%" stopColor="#4caf50" />
      </linearGradient>
    </defs>

    <rect width="400" height="260" rx="20" fill="url(#art403Sky)" />

    {/* Soft morning sun */}
    <circle cx="200" cy="80" r="45" fill="#fde68a" opacity="0.6" />
    <circle cx="200" cy="80" r="28" fill="#f59e0b" />

    {/* Orchard hills */}
    <path d="M 0 150 Q 120 115 240 140 T 400 130 L 400 260 L 0 260 Z" fill="#86efac" opacity="0.8" />
    <path d="M 0 175 Q 160 145 320 170 T 400 160 L 400 260 L 0 260 Z" fill="#22c55e" />

    {/* Rustic Wooden Farm Gate */}
    <g stroke="#78350f" strokeWidth="4" strokeLinecap="round" fill="none">
      {/* Posts */}
      <line x1="110" y1="140" x2="110" y2="245" strokeWidth="8" />
      <line x1="290" y1="140" x2="290" y2="245" strokeWidth="8" />

      {/* Horizontal Rails */}
      <line x1="108" y1="165" x2="292" y2="165" strokeWidth="6" stroke="#92400e" />
      <line x1="108" y1="195" x2="292" y2="195" strokeWidth="6" stroke="#92400e" />
      <line x1="108" y1="225" x2="292" y2="225" strokeWidth="6" stroke="#92400e" />

      {/* Cross Brace */}
      <line x1="114" y1="225" x2="286" y2="165" strokeWidth="4" stroke="#78350f" opacity="0.8" />
    </g>

    {/* Central Security Shield & Leaf Padlock Badge */}
    <g transform="translate(165, 145)">
      {/* Shield Background */}
      <path
        d="M 35 0 C 58 0 70 8 70 24 C 70 52 35 68 35 72 C 35 68 0 52 0 24 C 0 8 12 0 35 0 Z"
        fill="url(#art403Shield)"
        stroke="#ffffff"
        strokeWidth="2.5"
        filter="drop-shadow(0 4px 10px rgba(0,0,0,0.2))"
      />

      {/* Padlock Icon Inside */}
      <rect x="22" y="28" width="26" height="22" rx="4" fill="#ffffff" />
      <path
        d="M 27 28 L 27 20 C 27 14 43 14 43 20 L 43 28"
        stroke="#ffffff"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Padlock Keyhole */}
      <circle cx="35" cy="37" r="3" fill="#1b5e20" />
      <path d="M 35 37 L 35 44" stroke="#1b5e20" strokeWidth="2" strokeLinecap="round" />
    </g>
  </Box>
);

/**
 * AgriDashboardBannerArt
 * A sleek, panoramic vector banner of sunrise over agricultural terraces,
 * smart telemetry signals, and golden crops for dashboard headers.
 */
export const AgriDashboardBannerArt = () => (
  <Box
    component="svg"
    viewBox="0 0 600 130"
    preserveAspectRatio="none"
    sx={{
      width: '100%',
      height: '100%',
      display: 'block',
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      opacity: 0.85,
      pointerEvents: 'none',
    }}
  >
    <defs>
      <linearGradient id="dashBannerGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4ade80" stopOpacity="0" />
        <stop offset="60%" stopColor="#22c55e" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#15803d" stopOpacity="0.6" />
      </linearGradient>
      <linearGradient id="dashSun" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>

    {/* Sun and radiating ring */}
    <circle cx="510" cy="40" r="30" fill="#fef08a" opacity="0.3" />
    <circle cx="510" cy="40" r="18" fill="url(#dashSun)" opacity="0.8" />

    {/* Flying Birds */}
    <g stroke="#166534" strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round">
      <path d="M 430 25 Q 435 20 440 25 Q 445 20 450 25" />
      <path d="M 458 35 Q 462 31 466 35 Q 470 31 474 35" />
    </g>

    {/* Terraced Hills */}
    <path d="M 200 130 Q 340 70 470 85 T 600 75 L 600 130 Z" fill="url(#dashBannerGrad1)" />
    <path d="M 280 130 Q 400 95 500 100 T 600 95 L 600 130 Z" fill="#166534" opacity="0.45" />

    {/* Smart Farm Sensor Station Silhouette */}
    <g transform="translate(540, 50)" opacity="0.7">
      <line x1="15" y1="10" x2="15" y2="45" stroke="#1e293b" strokeWidth="2" />
      <circle cx="15" cy="10" r="3" fill="#22c55e" />
      <circle cx="15" cy="10" r="8" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.6" strokeDasharray="2 2" />
    </g>
  </Box>
);

/**
 * AgriSectionDivider
 * A smooth, organic landscape contour wave divider for separating page sections.
 */
export const AgriSectionDivider = ({ flip = false, height = 45 }) => (
  <Box
    component="svg"
    viewBox="0 0 1440 80"
    preserveAspectRatio="none"
    sx={{
      width: '100%',
      height,
      display: 'block',
      transform: flip ? 'rotate(180deg)' : 'none',
    }}
  >
    <path
      d="M 0 35 C 320 70, 580 5, 880 40 C 1180 75, 1340 20, 1440 35 L 1440 80 L 0 80 Z"
      fill="#e3e8f0"
      opacity="0.9"
    />
    <path
      d="M 0 45 C 360 85, 620 15, 920 50 C 1220 85, 1360 30, 1440 45 L 1440 80 L 0 80 Z"
      fill="#d8dee9"
      opacity="0.5"
    />
  </Box>
);

/**
 * AgriSproutBadge
 * A clean, cheerful seedling sprout vector icon with soft green/gold accents.
 */
export const AgriSproutBadge = ({ size = 48 }) => (
  <Box
    component="svg"
    width={size}
    height={size}
    viewBox="0 0 48 48"
    sx={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <circle cx="24" cy="24" r="22" fill="rgba(46, 125, 50, 0.12)" />
    <path
      d="M 24 38 Q 23 24 23 14"
      stroke="#1b5e20"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 23 24 C 12 21 6 13 8 5 C 16 7 22 17 23 24 Z"
      fill="#4caf50"
    />
    <path
      d="M 24 18 C 34 13 38 5 36 -2 C 28 0 24 10 24 18 Z"
      fill="#81c784"
    />
    <ellipse cx="24" cy="38" rx="8" ry="2.5" fill="#a9b4c8" />
  </Box>
);
