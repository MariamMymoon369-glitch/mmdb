import './App.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './components/header/Header';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f0f1f2',
      paper: '#ffffff',
    },
    text: {
      primary: '#003055',
      secondary: '#7c7c7c',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
      <Header />
        <Routes>
          <Route path="/" element={<div style={{ padding: '40px', textAlign: 'center' }}>Home Page </div>} />
          <Route path="/login" element={<div style={{ padding: '40px', textAlign: 'center' }}>Login Page </div>} />
          <Route path="/signup" element={<div style={{ padding: '40px', textAlign: 'center' }}>Sign Up Page </div>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;