import { Alert, Box, Pagination, Stack, Typography, Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import { useState } from 'react';
import MovieGrid from '../components/movies/MovieGrid';
import MovieSort from '../components/movies/MovieSort';
import { type PaginatedMovies } from '../types/movie';
import useFetch from '../hooks/useFetch';

function HomePage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: '8',
    sort: sort,
  });
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
  const { data, loading, error } = useFetch<PaginatedMovies>(
    `${API_BASE_URL}/movies?${queryParams.toString()}`
  );

  const movies = data?.data ?? [];

  return (
    <Box
      component="main"
      sx={{
        padding: '50px 150px',
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
          All Movies
        </Typography>
        <MovieSort
          sort={sort}
          onChange={(value) => {
            setSort(value);
            setPage(1);
          }}
        />
      </Stack>

      {loading && (
        <Typography sx={{ py: 8, textAlign: 'center', color: 'grey.700' }}>
          Loading...
        </Typography>
      )}

      {!loading && !error && movies.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: '12px' }}>
          No movies found.
        </Alert>
      )}

      {!loading && !error && movies.length > 0 && <MovieGrid movies={movies} />}

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

      <Dialog
        open={!!error}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            minWidth: { xs: '300px', sm: '400px' },
            boxShadow: '0px 10px 30px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogContent sx={{ pb: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'red', mb: 2 }}>
            oops!
          </Typography>
          <Typography sx={{ color: 'grey.600', fontSize: '1.1rem', mb: 3 }}>
            Could not load the movies you're looking for.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{
              borderRadius: '8px',
              px: 4,
              py: 1.5,
              fontWeight: 700,
              background: 'green',
              textTransform: 'uppercase',
              boxShadow: 'none',
            }}
          >
            Retry
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default HomePage;
