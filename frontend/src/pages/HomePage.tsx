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
    <Box
      component="main"
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 5 },
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
            color: '#003055',
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
        <Typography sx={{ py: 8, textAlign: 'center', color: '#64748B' }}>
          Loading...
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          Could not load movies. Please try again.
        </Alert>
      )}

      {!loading && !error && movies.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: '12px' }}>
          No movies found.
        </Alert>
      )}

      {!loading && !error && movies.length > 0 && <MovieGrid movies={movies} />}

      {!!data && data.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination
            count={data.totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            boundaryCount={1}
            siblingCount={0}

            sx={{
                '& .MuiPagination-ul': {
                gap: '8px',
                },

                '& .MuiPaginationItem-root': {
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#1E293B',
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '4px',
                width: 32,
                height: 32,
                minWidth: 32,
                margin: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                    bgcolor: '#F8FAFC',
                    borderColor: '#CBD5E1',
                },
                },

                '& .MuiPaginationItem-page.Mui-selected': {
                bgcolor: '#FFFFFF !important',
                color: '#418CFB',
                borderColor: '#418CFB',
                borderWidth: '1.5px',
                fontWeight: 700,
                },

                '& .MuiPaginationItem-previousNext': {
                bgcolor: '#FFFFFF',
                color: '#64748B',
                border: '1px solid #E2E8F0',
                borderRadius: 0,
                '&:hover': {
                    bgcolor: '#F8FAFC',
                    color: '#0F172A',
                },
                '&.Mui-disabled': {
                    opacity: 0.5,
                    bgcolor: '#697586',
                    color: '#E5E5E5',
                },
                },

                '& .MuiPaginationItem-ellipsis': {
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 0,
                color: '#64748B',
                fontWeight: 600,
                lineHeight: '32px',
                },
            }}
            />
        </Box>
        )}
    </Box>
  );
}

export default HomePage;