import { Alert, Box, Pagination, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieGrid from '../components/movies/MovieGrid';
import MovieSort from '../components/movies/MovieSort';
import MovieGridSkeleton from '../components/movies/MovieGridSkeleton';
import { type PaginatedMovies } from '../types/movie';
import useFetch from '../hooks/useFetch';
import { API_BASE_URL } from '../config/api';
import ErrorDialog from '../components/common/ErrorDialog';

function HomePage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [searchParams] = useSearchParams();
  const genre = searchParams.get('genre');

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: '8',
    sort: sort,
  });
  if (genre) {
    queryParams.set('genre', genre);
  }
  const { data, loading, error } = useFetch<PaginatedMovies>(
    `${API_BASE_URL}/movies?${queryParams.toString()}`
  );

  const movies = data?.data ?? [];

  return (
    <Box
      component="main"
      sx={{
        padding: { xs: '24px 16px', md: '50px 150px' },
        width: '100%',
        mx: 'auto',
       
      }}
    >
      <Stack
        direction="row"
        sx={{
          mb: 4,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          component="h1"
          sx={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          {genre ? `${genre} Movies` : 'All Movies'}
        </Typography>
        <MovieSort
          sort={sort}
          onChange={(value) => {
            setSort(value);
            setPage(1);
          }}
        />
      </Stack>
      <Box sx={{ minHeight: '930px' }}>
            {loading && <MovieGridSkeleton />}

            {!loading && !error && movies.length === 0 && (
              <Alert severity="info" sx={{ borderRadius: '12px' }}>
                No movies found.
              </Alert>
            )}

            {!loading && !error && movies.length > 0 && <MovieGrid movies={movies} />}
      </Box>
      {data && data.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
         
          <Pagination
            count={data.totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            variant="outlined"
            shape="rounded"
            color="primary"
            boundaryCount={1}
            siblingCount={0}
          />
        </Box>
      )}

      <ErrorDialog
        open={!!error}
        message="Could not load the movies you're looking for."
      />
    </Box>
  );
}

export default HomePage;
