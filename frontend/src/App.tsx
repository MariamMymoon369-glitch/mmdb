import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MoviePlaceholderPage from './pages/MoviePlaceholderPage';
import { NotFoundPage } from './pages/NotFoundPage';
import theme from './theme/theme';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
          <Header />
            <Routes>
              <Route path="/homepage" element={<HomePage />} />
              <Route path="/" element={<Navigate to="/homepage" replace />} />
              <Route path="/home" element={<Navigate to="/homepage" replace />} />
              <Route path="/movies/:id" element={<MoviePlaceholderPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          <Footer />
      </BrowserRouter>
    </ThemeProvider>
  );
}


export default App;

