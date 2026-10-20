import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import PersonDetailsPage from './pages/PersonDetailsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import theme from './theme/theme';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import SessionExpiredDialog from './components/auth/SessionExpiredDialog';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'grid', gridTemplateRows: '72px 1fr 214px', minHeight: '100vh' }}>
        <BrowserRouter>
          <Header />
          <Box component="main" sx={{ width: '100%' }}>
            <Routes>
              <Route path="/homepage" element={<HomePage />} />
              <Route path="/" element={<Navigate to="/homepage" replace />} />
              <Route path="/home" element={<Navigate to="/homepage" replace />} />
              <Route path="/movies/:uuid" element={<MovieDetailsPage />} />
              <Route path="/people/:uuid" element={<PersonDetailsPage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/login" element={<Navigate to="/login" replace />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/auth/signup" element={<Navigate to="/signup" replace />} />
            </Routes>
          </Box>
          <SessionExpiredDialog />
          <Footer />
        </BrowserRouter>
      </Box>
    </ThemeProvider>
  );
}


export default App;

