import { Grid } from '@mui/material';
import MovieCard, { type Movie } from './MovieCard';

interface MovieGridProps {
  movies: Movie[];
}

function MovieGrid({ movies }: MovieGridProps) {
  return (
    <Grid container spacing={3}>
      {movies.map((movie) => (
        <Grid
          key={movie.id}
          size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
        >
          <MovieCard movie={movie} />
        </Grid>
      ))}
    </Grid>
  );
}

export default MovieGrid;