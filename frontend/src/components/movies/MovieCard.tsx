import { Box, Card, CardActionArea, CardContent, CardMedia, Rating, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export interface Movie {
  id: number;
  uuid: string;
  title: string;
  releaseYear: number;
  posterUrl: string | null;
  rating?: number;
}

interface MovieCardProps {
  movie: Movie;
}

function MovieCard({ movie }: MovieCardProps) {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: '100%', bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,.07)', boxShadow: 'none', transition: 'transform .2s ease, border-color .2s ease', '&:hover': { transform: 'translateY(-6px)', borderColor: 'primary.main' } }}>
      <CardActionArea onClick={() => navigate(`/movies/${movie.id}`)} sx={{ height: '100%', display: 'flex', alignItems: 'stretch', flexDirection: 'column' }}>
        <Box sx={{ width: '100%', aspectRatio: '2 / 3', overflow: 'hidden', bgcolor: '#252529' }}>
          <CardMedia
            component="img"
            image={movie.posterUrl || '/favicon.svg'}
            alt={`${movie.title} poster`}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(event) => { event.currentTarget.src = '/favicon.svg'; }}
          />
        </Box>
        <CardContent sx={{ width: '100%', boxSizing: 'border-box', p: 2 }}>
          <Stack direction="row" sx={{ mb: 1, alignItems: 'center', justifyContent: 'space-between' }}>
            <Rating value={movie.rating ?? 0} precision={0.1} readOnly size="small" sx={{ color: 'primary.main' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{movie.releaseYear}</Typography>
          </Stack>
          <Typography variant="h6" component="h2" sx={{ fontSize: 16, lineHeight: 1.25, fontWeight: 700 }}>
            {movie.title}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default MovieCard;