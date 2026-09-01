import React from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Stack,
  Typography,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import { type Movie } from '../../types/movie';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = React.memo(({ movie }) => {
  const navigate = useNavigate();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        bgcolor: 'background.paper',
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        
      }}
    >
      <CardActionArea
        onClick={() => navigate(`/movies/${movie.uuid}`)}
        disableRipple 
        sx={{
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            height: '100%',
            justifyContent: 'flex-start',
            
            '&:hover': {
              bgcolor: '#F8FAFC', 
              transform: 'translateY(-2px)', 
            },
            
            '& .MuiCardActionArea-focusHighlight': {
            bgcolor: 'transparent',
            },
        }}
        >
        <Box
          sx={{
            width: '100%',
            aspectRatio: '2 / 3',
            borderRadius: '12px',
            overflow: 'hidden',
            bgcolor: 'grey.100',
          }}
        >
          <CardMedia
            component="img"
            image={movie.posterUrl || '/favicon.svg'}
            alt={`${movie.title} poster`}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              e.currentTarget.src = '/favicon.svg';
            }}
          />
        </Box>

        <CardContent sx={{ px: 0, pt: 1.5, pb: '0 !important', flexGrow: 1 }}>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              mb: 0.5,
              alignItems: 'center',
            }}
          >
            <StarIcon sx={{ fontSize: 18, color: '#FFB800' }} />
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.95rem',
                color: 'primary.dark',
              }}
            >
              {Number(movie.rating).toFixed(1)}
            </Typography>
          </Stack>

          <Typography
            component="h2"
            noWrap
            sx={{
              fontWeight: 700,
              fontSize: '1.05rem',
              color: 'primary.dark',
              lineHeight: 1.3,
            }}
          >
            {movie.title}
          </Typography>

          <Typography
            sx={{
              fontWeight: 500,
              fontSize: '0.875rem',
              color: 'text.secondary',
              mt: 0.25,
            }}
          >
            {movie.releaseYear}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
});

MovieCard.displayName = 'MovieCard';

export default MovieCard;
