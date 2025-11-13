import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#f6741b',
      light: '#f6a871',
      dark: '#e44205',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6b7280',
      light: '#9ca3af',
      dark: '#4b5563',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
  },
  typography: {
    fontFamily: "'Montserrat', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          padding: '0.5rem 1rem',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            transform: 'scale(1.05)',
            transition: 'transform 0.2s',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
        sizeSmall: {
          padding: '0.375rem 0.75rem',
          fontSize: '0.875rem',
        },
        sizeLarge: {
          padding: '0.75rem 1.5rem',
          fontSize: '1.125rem',
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    },
  },
})

