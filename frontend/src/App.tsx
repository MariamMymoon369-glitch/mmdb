import { CssBaseline, ThemeProvider, Box } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MoviePlaceholderPage from './pages/MoviePlaceholderPage';
import { NotFoundPage } from './pages/NotFoundPage';
import theme from './theme/theme';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';

const HOME_ROUTES = ['/', '/homepage', '/home'];

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
            alignItems: 'center',
          }}
        >
        <Header />
        <Box component="main" sx={{ flex: 1, width: '100%', maxWidth: '1440px' }}>
        <Routes>
          {HOME_ROUTES.map((path) => (
           <Route key={path} path={path} element={<HomePage />} />
        ))}
          <Route path="/movies/:id" element={<MoviePlaceholderPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
       </Box>
          <Footer />
      </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
