import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#38BDF8',
      light: '#7DD3FC',
      dark: '#0284C7'
    },
    background: {
      default: '#0F172A',
      paper: 'rgba(30, 41, 59, 0.98)'
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8'
    }
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #001B3D 0%, #0A4D94 100%)',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            background: 'linear-gradient(135deg, #002152 0%, #0A5BAE 100%)',
            boxShadow: '0 8px 25px rgba(10,77,148,0.3)',
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            color: '#F8FAFC',
            '& fieldset': {
              borderColor: 'rgba(148, 163, 184, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: '#38BDF8',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#38BDF8',
            }
          },
          '& .MuiInputLabel-root': {
            color: '#94A3B8'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)',
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #001B3D 0%, #0A4D94 100%)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            background: 'linear-gradient(135deg, #002152 0%, #0A5BAE 100%)',
            boxShadow: '0 8px 25px rgba(10,77,148,0.3)',
          }
        }
      }
    }
  }
});