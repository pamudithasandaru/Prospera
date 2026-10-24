// Single source of truth for the app's name and wordmark styling.
// When the new logo is ready, swap the wordmark usages for an <img> here-and-there
// (Navbar, Footer, Login, Register) — the name itself only needs changing in this file.
export const BRAND_NAME = 'හරිත භූමි';
export const BRAND_TAGLINE = 'AgriTech Platform';

// Logo files live in client/public/images.
export const LOGO_HORIZONTAL = '/images/haritha-bhoomi-horizontal_1.png'; // navbar, footer (light backgrounds)
export const LOGO_HORIZONTAL_DARK = '/images/haritha-bhoomi-horizontal-dark.png'; // for dark backgrounds
export const LOGO_SQUARE = '/images/haritha-bhoomi-square.png'; // login / register

// Abhaya Libre has both Sinhala and Latin glyphs; Noto Serif Sinhala is the fallback.
export const brandFont = '"Abhaya Libre", "Noto Serif Sinhala", "Iskoola Pota", serif';

// Shared sx for wordmark text — spread into a Typography's sx.
export const brandTextSx = {
  fontFamily: brandFont,
  fontWeight: 800,
  letterSpacing: '0.01em',
  lineHeight: 1.15,
};
