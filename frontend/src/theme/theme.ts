import { alpha, createTheme, type Shadows } from '@mui/material/styles';

const primary = '#3157A4';
const secondary = '#0F8B8D';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primary,
      light: '#5D7BC0',
      dark: '#203C78',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: secondary,
      light: '#42A5A6',
      dark: '#086467',
      contrastText: '#FFFFFF',
    },
    success: { main: '#1F8A5B' },
    warning: { main: '#D98524' },
    error: { main: '#D14343' },
    info: { main: '#2878B5' },
    background: {
      default: '#F3F6FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#172033',
      secondary: '#667085',
    },
    divider: '#E4E9F1',
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 750, letterSpacing: '-0.04em' },
    h2: { fontWeight: 750, letterSpacing: '-0.035em' },
    h3: { fontWeight: 750, letterSpacing: '-0.03em' },
    h4: { fontWeight: 750, letterSpacing: '-0.025em' },
    h5: { fontWeight: 700, letterSpacing: '-0.015em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: 0 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.55 },
  },
  shape: {
    borderRadius: 14,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(16, 24, 40, 0.04)',
    '0 2px 8px rgba(16, 24, 40, 0.06)',
    '0 4px 14px rgba(16, 24, 40, 0.07)',
    '0 8px 24px rgba(16, 24, 40, 0.08)',
    '0 12px 32px rgba(16, 24, 40, 0.09)',
    '0 16px 40px rgba(16, 24, 40, 0.10)',
    '0 20px 48px rgba(16, 24, 40, 0.11)',
    '0 24px 56px rgba(16, 24, 40, 0.12)',
    ...Array(16).fill('0 24px 56px rgba(16, 24, 40, 0.12)'),
  ] as Shadows,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minWidth: 320,
          backgroundColor: '#F3F6FA',
        },
        '*': {
          boxSizing: 'border-box',
        },
        '::selection': {
          backgroundColor: alpha(primary, 0.18),
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #E4E9F1',
          boxShadow: '0 2px 10px rgba(16, 24, 40, 0.045)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 10,
          paddingInline: 18,
          transition: 'transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&.MuiButton-containedPrimary': {
            boxShadow: `0 6px 16px ${alpha(primary, 0.22)}`,
            '&:hover': {
              boxShadow: `0 8px 20px ${alpha(primary, 0.28)}`,
            },
          },
        },
        outlined: {
          borderColor: '#D7DEE9',
          '&:hover': {
            borderColor: primary,
            backgroundColor: alpha(primary, 0.04),
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: 'background-color 150ms ease, transform 150ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            backgroundColor: alpha(primary, 0.08),
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },
    MuiFormControl: {
      defaultProps: { size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          transition: 'box-shadow 150ms ease, background-color 150ms ease',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#AAB7C9',
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 3px ${alpha(primary, 0.11)}`,
          },
        },
        notchedOutline: {
          borderColor: '#D7DEE9',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F7F9FC',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#E9EDF3',
          paddingBlock: 14,
        },
        head: {
          color: '#475467',
          fontSize: '0.75rem',
          fontWeight: 750,
          letterSpacing: '0.045em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 140ms ease',
          '&.MuiTableRow-hover:hover': {
            backgroundColor: alpha(primary, 0.035),
          },
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          boxShadow: '0 24px 70px rgba(16, 24, 40, 0.18)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontSize: '1.25rem', fontWeight: 750, padding: '24px 24px 12px' },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: { paddingInline: 24 },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: { padding: 24, paddingTop: 16 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid',
          boxShadow: 'none',
          '&.MuiAlert-standardError': { borderColor: alpha('#D14343', 0.18) },
          '&.MuiAlert-standardSuccess': { borderColor: alpha('#1F8A5B', 0.18) },
          '&.MuiAlert-standardWarning': { borderColor: alpha('#D98524', 0.2) },
          '&.MuiAlert-standardInfo': { borderColor: alpha('#2878B5', 0.18) },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 700 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { borderRadius: 8, fontSize: '0.75rem' },
      },
    },
  },
});
