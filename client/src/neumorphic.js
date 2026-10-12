// Neumorphic design tokens + helpers — single source of truth for the Prospera UI.
// Every surface shares ONE base colour; depth comes only from a light + dark shadow pair.
// Use these helpers in `sx` props instead of hard-coding colours / shadows.

export const neuColors = {
  base: '#e3e8f0',        // the one surface colour
  baseDeep: '#d8dee9',    // slightly recessed areas (wells, tracks)
  light: '#ffffff',       // highlight shadow
  dark: '#a9b4c8',        // cast shadow
  text: '#2b3445',
  textMuted: '#5b667a',
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  secondary: '#0D47A1',
  success: '#2e7d32',
  warning: '#9a4507',
  error: '#c62828',
  info: '#0277bd',
};

const { light, dark } = neuColors;

const sizes = { xs: 3, sm: 5, md: 8, lg: 12, xl: 18 };
const px = (s) => sizes[s] ?? sizes.md;

/** Raised (extruded) shadow. */
export const raised = (size = 'md') => {
  const d = px(size);
  return `${d}px ${d}px ${d * 2}px ${dark}, -${d}px -${d}px ${d * 2}px ${light}`;
};

/** Inset (pressed / input well) shadow. */
export const inset = (size = 'md') => {
  const d = px(size);
  return `inset ${d}px ${d}px ${d * 2}px ${dark}, inset -${d}px -${d}px ${d * 2}px ${light}`;
};

/** Flat shadow-free surface. */
export const flat = { backgroundColor: neuColors.base, boxShadow: 'none' };

/** Ready-made sx fragments. */
export const neuRaised = (size = 'md') => ({
  backgroundColor: neuColors.base,
  boxShadow: raised(size),
  border: 'none',
});

export const neuInset = (size = 'md') => ({
  backgroundColor: neuColors.base,
  boxShadow: inset(size),
  border: 'none',
});

/** Raised that flips to inset when pressed / selected. */
export const neuInteractive = (size = 'md') => ({
  backgroundColor: neuColors.base,
  boxShadow: raised(size),
  border: 'none',
  transition: 'box-shadow .2s ease, transform .2s ease, color .2s ease',
  '&:hover': { boxShadow: raised('lg') },
  '&:active, &.Mui-selected, &.Mui-active': { boxShadow: inset(size) },
});

/** Circular icon button / avatar ring. */
export const neuCircle = (diameter = 40, size = 'sm') => ({
  width: diameter,
  height: diameter,
  borderRadius: '50%',
  ...neuRaised(size),
});

/** Semantic tint for status chips etc. — soft text colour on the neumorphic surface. */
export const neuTone = (tone = 'primary') => neuColors[tone] || neuColors.primary;
