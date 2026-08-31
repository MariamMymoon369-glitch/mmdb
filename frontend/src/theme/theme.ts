import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#003055',
      dark: '#1A2C59',
    },
    secondary: {
      main: '#418cf8',
    },
    background: {
      default: '#f0f1f2',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#003055',
      secondary: '#7C7C7C',
    },
    grey: {
      100: '#F1F5F9', 
      200: '#E5E5E5', 
      300: '#CBD5E1', 
      500: '#7C7C7C', 
      600: '#697586', 
      700: '#64748B', 
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
});

theme = responsiveFontSizes(theme);

export default theme;
