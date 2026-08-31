import './App.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';

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
         <Route path="/" element={<div style={{ padding: '425px', textAlign: 'center' }}>Home Page </div>} />
        </Routes>
      <Footer />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;