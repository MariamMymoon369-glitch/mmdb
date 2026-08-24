import { Alert, Box, Pagination, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import MovieGrid from '../components/movies/MovieGrid';
import MovieSort from '../components/movies/MovieSort';
import type { Movie } from '../components/movies/MovieCard';
import useFetch from '../hooks/useFetch';

interface MoviesResponse {
  data: Movie[];
  totalPages: number;
}

function HomePage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const { data, loading, error } = useFetch<MoviesResponse>(
    `/movies?page=${page}&limit=8&sort=${sort}`,
  );

  const movies = data?.data ?? [];

  return (
    <Box component="main" sx={{ maxWidth: 1180, mx: 'auto', px: { xs: 2, md: 5 }, py: { xs: 3, md: 6 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          mb: { xs: 3, md: 5 },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography sx={{ color: 'primary.main', fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', mb: 1 }}>
            MMDB / Cinema archive
          </Typography>
          <Typography component="h1" variant="h1" sx={{ fontSize: { xs: 38, md: 54 }, lineHeight: 1 }}>
            All Movies
          </Typography>
        </Box>
        <MovieSort
          sort={sort}
          onChange={(value) => {
            setSort(value);
            setPage(1);
          }}
        />
      </Stack>

      {loading && (
        <Typography sx={{ py: 8, textAlign: 'center' }}>Loading...</Typography>
      )}
      {error && (
        <Alert severity="error" sx={{ bgcolor: 'rgba(211, 75, 75, .12)' }}>
          Could not load movies.
          <br />
          Please try again.
        </Alert>
      )}
      {!loading && !error && movies.length === 0 && (
        <Alert severity="info" sx={{ bgcolor: 'background.paper' }}>No movies found.</Alert>
      )}
      {!loading && !error && movies.length > 0 && <MovieGrid movies={movies} />}

      {!!data && data.totalPages > 1 && (
        <Pagination
          count={data.totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
        />
      )}
    </Box>
  );
}

export default HomePage;