import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MoviePlaceholderPage from './pages/MoviePlaceholderPage';
import { NotFoundPage } from './pages/NotFoundPage';
import theme from './theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>

        <Routes>
          {['/', '/homepage', '/home'].map((path) => (
           <Route key={path} path={path} element={<HomePage />} />
        ))}
          <Route path="/movies/:id" element={<MoviePlaceholderPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
