import { CssBaseline, ThemeProvider, Box } from '@mui/material';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MoviePlaceholderPage from './pages/MoviePlaceholderPage';
import { NotFoundPage } from './pages/NotFoundPage';
import theme from './theme/theme';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: 'background.default',
            width: '100%',
          }}
        >
          <Header />
          <Box component="main" sx={{ flex: 1, width: '100%' }}>
            <Routes>
              <Route path="/homepage" element={<HomePage />} />
              <Route path="/" element={<Navigate to="/homepage" replace />} />
              <Route path="/home" element={<Navigate to="/homepage" replace />} />
              <Route path="/movies/:id" element={<MoviePlaceholderPage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/login" element={<Navigate to="/login" replace />} />

            </Routes>
          </Box>
          <Footer />
        </Box>
        
      </BrowserRouter>
    </ThemeProvider>
  );
}


export default App;

