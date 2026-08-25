import './App.css';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MoviePlaceholderPage from './pages/MoviePlaceholderPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f0f1f2',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#003055',
      secondary: '#7C7C7C',
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
        <Routes>
          <Route path="/movies/:id" element={<MoviePlaceholderPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;