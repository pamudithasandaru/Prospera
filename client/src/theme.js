import { createTheme, alpha } from '@mui/material/styles';
import { Grow } from '@mui/material';
import { neuColors as c, raised, inset } from './neumorphic';

const font = [
  'Poppins',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
].join(',');

const surface = { backgroundColor: c.base, backgroundImage: 'none' };

// Shared motion tokens: one easing curve so every hover feels the same.
const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
const fast = `.25s ${ease}`;
const smooth = `.4s ${ease}`;

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: c.primary, light: '#4CAF50', dark: '#0B3D0E', contrastText: '#ffffff' },
    secondary: { main: c.secondary, light: '#5472d3', dark: '#002171', contrastText: '#ffffff' },
    success: { main: c.success },
    warning: { main: c.warning },
    error: { main: c.error },
    info: { main: c.info },
    background: { default: c.base, paper: c.base },
    text: { primary: c.text, secondary: c.textMuted },
    divider: alpha(c.dark, 0.35),
  },
  typography: {
    fontFamily: font,
    h1: { fontWeight: 800, letterSpacing: -0.5 },
    h2: { fontWeight: 700, letterSpacing: -0.3 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 20 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: c.base, backgroundImage: 'none', color: c.text },
        '*::selection': { backgroundColor: alpha(c.primary, 0.2) },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-track': { background: c.base, boxShadow: inset('xs'), borderRadius: 8 },
        '*::-webkit-scrollbar-thumb': { backgroundColor: c.dark, borderRadius: 8, border: `2px solid ${c.base}` },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { ...surface, color: c.text, backdropFilter: 'none', border: 'none', boxShadow: `0 8px 18px ${alpha(c.dark, 0.55)}` },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { ...surface, color: c.text },
        elevation0: { boxShadow: raised('md') },
        elevation1: { boxShadow: raised('md') },
        elevation2: { boxShadow: raised('md') },
        elevation3: { boxShadow: raised('lg') },
        elevation4: { boxShadow: raised('lg') },
        outlined: { border: 'none', boxShadow: raised('md') },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          ...surface,
          border: 'none',
          boxShadow: raised('md'),
          borderRadius: 24,
          overflow: 'hidden',
          transition: `box-shadow ${smooth}, transform ${smooth}`,
          '&:hover': { boxShadow: raised('lg'), transform: 'translateY(-4px)' },
          '& .MuiCardMedia-root': { transition: `transform .6s ${ease}` },
          '&:hover .MuiCardMedia-root': { transform: 'scale(1.05)' },
        },
      },
    },
    MuiCardActionArea: {
      styleOverrides: { root: { transition: `background-color ${fast}`, '&:hover .MuiCardActionArea-focusHighlight': { opacity: 0 } } },
    },
    MuiDialog: {
      defaultProps: { TransitionComponent: Grow, transitionDuration: { enter: 380, exit: 220 } },
      styleOverrides: {
        paper: {
          ...surface,
          boxShadow: raised('xl'),
          borderRadius: 28,
          // Keep dialogs inside the viewport on phones.
          '@media (max-width:600px)': { margin: 12, width: 'calc(100% - 24px)', maxWidth: 'calc(100% - 24px)', maxHeight: 'calc(100% - 24px)' },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: { paper: { ...surface, boxShadow: raised('lg'), border: 'none' } },
    },
    MuiBackdrop: {
      styleOverrides: { root: { backgroundColor: alpha('#1f2735', 0.35) } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 16,
          paddingInline: 20,
          border: 'none',
          transition: `box-shadow ${fast}, transform ${fast}, background-color ${fast}, color ${fast}`,
          '&:hover': { transform: 'translateY(-2px)' },
          '&:active': { transform: 'translateY(0)' },
        },
        contained: {
          backgroundColor: c.base,
          color: c.text,
          boxShadow: raised('sm'),
          '&:hover': { backgroundColor: c.base, boxShadow: raised('md') },
          '&:active': { boxShadow: inset('sm') },
          '&.Mui-disabled': { backgroundColor: c.base, boxShadow: 'none', color: alpha(c.text, 0.35) },
        },
        containedPrimary: {
          backgroundColor: c.primary,
          color: '#fff',
          boxShadow: `${raised('sm')}`,
          '&:hover': { backgroundColor: '#17501b', boxShadow: raised('md') },
          '&:active': { backgroundColor: '#17501b', boxShadow: inset('sm') },
        },
        containedSecondary: {
          backgroundColor: c.secondary,
          color: '#fff',
          '&:hover': { backgroundColor: '#0b3b8a', boxShadow: raised('md') },
          '&:active': { backgroundColor: '#0b3b8a', boxShadow: inset('sm') },
        },
        containedError: { backgroundColor: c.error, color: '#fff', '&:hover': { backgroundColor: '#a82020' } },
        containedSuccess: { backgroundColor: c.success, color: '#fff', '&:hover': { backgroundColor: '#276a2b' } },
        outlined: {
          border: 'none',
          backgroundColor: c.base,
          boxShadow: raised('sm'),
          '&:hover': { border: 'none', backgroundColor: c.base, boxShadow: raised('md') },
          '&:active': { boxShadow: inset('sm') },
        },
        text: {
          '&:hover': { backgroundColor: 'transparent', boxShadow: raised('xs') },
          '&:active': { boxShadow: inset('xs') },
        },
      },
    },
    MuiIconButton: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: {
          backgroundColor: c.base,
          boxShadow: raised('xs'),
          transition: `box-shadow ${fast}, transform ${fast}, color ${fast}`,
          '&:hover': { backgroundColor: c.base, boxShadow: raised('sm'), transform: 'scale(1.1)' },
          '&:active': { boxShadow: inset('xs'), transform: 'scale(0.96)' },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: { backgroundColor: c.base, color: c.primary, boxShadow: raised('md'), transition: `box-shadow ${fast}, transform ${fast}`, '&:hover': { backgroundColor: c.base, boxShadow: raised('lg'), transform: 'translateY(-3px) scale(1.05)' }, '&:active': { boxShadow: inset('md') } },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: { root: { ...surface, boxShadow: inset('sm'), borderRadius: 18, padding: 4, gap: 4 }, grouped: { border: 'none', borderRadius: '14px !important' } },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: { border: 'none', color: c.textMuted, transition: `box-shadow ${fast}, color ${fast}`, '&:hover': { color: c.primary }, '&.Mui-selected': { backgroundColor: c.base, color: c.primary, boxShadow: raised('xs'), '&:hover': { backgroundColor: c.base } } },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: c.base,
          borderRadius: 16,
          boxShadow: inset('sm'),
          transition: `box-shadow ${fast}`,
          '& fieldset': { border: 'none' },
          '&:hover fieldset': { border: 'none' },
          '&:hover:not(.Mui-focused)': { boxShadow: inset('md') },
          '&.Mui-focused': { boxShadow: `${inset('sm')}, 0 0 0 2px ${alpha(c.primary, 0.45)}` },
          '&.Mui-focused fieldset': { border: 'none' },
          '&.Mui-error': { boxShadow: `${inset('sm')}, 0 0 0 2px ${alpha(c.error, 0.5)}` },
        },
      },
    },
    MuiFilledInput: {
      defaultProps: { disableUnderline: true },
      styleOverrides: { root: { backgroundColor: c.base, borderRadius: 16, boxShadow: inset('sm'), '&:hover, &.Mui-focused': { backgroundColor: c.base } } },
    },
    MuiInputBase: {
      styleOverrides: { root: { color: c.text } },
    },
    MuiSelect: {
      styleOverrides: { icon: { color: c.textMuted } },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, backgroundColor: c.base, boxShadow: raised('xs'), border: 'none', color: c.text, transition: `box-shadow ${fast}, transform ${fast}` },
        outlined: { border: 'none' },
        filled: { backgroundColor: c.base },
        colorPrimary: { backgroundColor: c.base, color: c.primary },
        colorSecondary: { backgroundColor: c.base, color: c.secondary },
        colorSuccess: { backgroundColor: c.base, color: c.success },
        colorWarning: { backgroundColor: c.base, color: c.warning },
        colorError: { backgroundColor: c.base, color: c.error },
        colorInfo: { backgroundColor: c.base, color: c.info },
        clickable: { '&:hover': { backgroundColor: c.base, boxShadow: raised('sm'), transform: 'translateY(-1px)' }, '&:active': { boxShadow: inset('xs') } },
      },
    },
    MuiAvatar: {
      styleOverrides: { root: { border: 'none', boxShadow: raised('xs'), backgroundColor: c.baseDeep, color: c.textMuted, transition: `transform ${fast}, box-shadow ${fast}`, '&:hover': { transform: 'scale(1.06)', boxShadow: raised('sm') } } },
    },
    MuiBadge: {
      styleOverrides: { badge: { boxShadow: raised('xs') } },
    },
    MuiMenu: {
      defaultProps: { transitionDuration: { enter: 280, exit: 180 } },
      styleOverrides: { paper: { ...surface, borderRadius: 20, border: 'none', boxShadow: raised('lg') } },
    },
    MuiPopover: {
      styleOverrides: { paper: { ...surface, border: 'none', boxShadow: raised('lg') } },
    },
    MuiMenuItem: {
      styleOverrides: { root: { borderRadius: 12, transition: `box-shadow ${fast}, color ${fast}, padding-left ${fast}`, marginInline: 6, '&:hover': { backgroundColor: 'transparent', boxShadow: inset('xs') }, '&.Mui-selected': { backgroundColor: 'transparent', boxShadow: inset('xs'), color: c.primary } } },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          marginInline: 8,
          marginBlock: 3,
          transition: `box-shadow ${fast}, color ${fast}, transform ${fast}`,
          '&:hover': { backgroundColor: 'transparent', boxShadow: raised('xs') },
          '&.Mui-selected': { backgroundColor: 'transparent', color: c.primary, boxShadow: inset('xs'), '&:hover': { backgroundColor: 'transparent' } },
        },
      },
    },
    MuiTabs: {
      styleOverrides: { root: { ...surface, boxShadow: inset('sm'), borderRadius: 18, minHeight: 48, padding: 4 }, indicator: { display: 'none' } },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 14, minHeight: 40, color: c.textMuted, transition: `box-shadow ${fast}, color ${fast}, background-color ${fast}`, '&:hover': { color: c.primary }, '&.Mui-selected': { color: c.primary, backgroundColor: c.base, boxShadow: raised('xs') } },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: { width: 56, height: 32, padding: 0 },
        switchBase: { padding: 4, transition: `transform ${fast}, color ${fast}`, '&.Mui-checked': { transform: 'translateX(24px)', color: c.primary, '& + .MuiSwitch-track': { opacity: 1, backgroundColor: c.base } } },
        thumb: { transition: `box-shadow ${fast}`, width: 24, height: 24, boxShadow: raised('xs'), backgroundColor: c.base },
        track: { borderRadius: 16, backgroundColor: c.base, boxShadow: inset('xs'), opacity: 1 },
      },
    },
    MuiCheckbox: { styleOverrides: { root: { color: c.textMuted } } },
    MuiRadio: { styleOverrides: { root: { color: c.textMuted } } },
    MuiSlider: {
      styleOverrides: {
        rail: { backgroundColor: c.baseDeep, boxShadow: inset('xs'), opacity: 1 },
        track: { border: 'none' },
        thumb: { backgroundColor: c.base, boxShadow: raised('xs'), '&:hover, &.Mui-focusVisible': { boxShadow: raised('sm') } },
      },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { borderRadius: 8, height: 10, backgroundColor: c.base, boxShadow: inset('xs') }, bar: { borderRadius: 8, transition: `transform .8s ${ease}` } },
    },
    MuiCircularProgress: { defaultProps: { thickness: 4 } },
    MuiAlert: {
      styleOverrides: {
        root: { ...surface, borderRadius: 18, boxShadow: raised('sm'), border: 'none' },
        standardSuccess: { backgroundColor: c.base, color: c.success },
        standardInfo: { backgroundColor: c.base, color: c.info },
        standardWarning: { backgroundColor: c.base, color: c.warning },
        standardError: { backgroundColor: c.base, color: c.error },
        filled: { boxShadow: raised('sm') },
        outlined: { border: 'none' },
      },
    },
    MuiSnackbarContent: { styleOverrides: { root: { ...surface, color: c.text, boxShadow: raised('md') } } },
    MuiTooltip: {
      defaultProps: { enterDelay: 250, TransitionProps: { timeout: 250 } },
      styleOverrides: { tooltip: { backgroundColor: c.base, color: c.text, boxShadow: raised('sm'), fontWeight: 500 }, arrow: { color: c.base } },
    },
    MuiAccordion: {
      styleOverrides: { root: { ...surface, boxShadow: raised('md'), borderRadius: '20px !important', transition: `box-shadow ${smooth}, margin ${smooth}`, '&:hover': { boxShadow: raised('lg') }, '&:before': { display: 'none' }, '&.Mui-expanded': { margin: '8px 0' } } },
    },
    MuiTableContainer: { styleOverrides: { root: { ...surface, borderRadius: 20, boxShadow: raised('md') } } },
    MuiTableRow: { styleOverrides: { root: { transition: `background-color ${fast}`, '&.MuiTableRow-hover:hover, tbody &:hover': { backgroundColor: alpha(c.dark, 0.12) } } } },
    MuiTableCell: { styleOverrides: { root: { borderBottom: `1px solid ${alpha(c.dark, 0.3)}` }, head: { fontWeight: 700, color: c.textMuted } } },
    MuiDivider: { styleOverrides: { root: { borderColor: alpha(c.dark, 0.35), borderBottomWidth: 1 } } },
    MuiStepIcon: { styleOverrides: { root: { color: c.baseDeep, '&.Mui-active': { color: c.primary }, '&.Mui-completed': { color: c.primary } } } },
    MuiPaginationItem: {
      styleOverrides: { root: { boxShadow: raised('xs'), '&.Mui-selected': { backgroundColor: c.base, color: c.primary, boxShadow: inset('xs') } } },
    },
    MuiBottomNavigation: { styleOverrides: { root: { ...surface, boxShadow: raised('md') } } },
  },
});

export default theme;
