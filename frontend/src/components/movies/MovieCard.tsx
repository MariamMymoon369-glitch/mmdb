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
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        bgcolor: '#FFFFFF',
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        
      }}
    >
      <CardActionArea
        onClick={() => navigate(`/movies/${movie.id}`)}
        disableRipple 
        sx={{
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            height: '100%',
            justifyContent: 'flex-start',
            
            '&:hover': {
            bgcolor: 'transparent',
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
            bgcolor: '#F1F5F9',
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
                color: '#1a325a',
              }}
            >
              {(movie.rating ?? 0).toFixed(1)}
            </Typography>
          </Stack>

          <Typography
            component="h2"
            noWrap
            sx={{
              fontWeight: 700,
              fontSize: '1.05rem',
              color: '#1A2C59',
              lineHeight: 1.3,
            }}
          >
            {movie.title}
          </Typography>

          <Typography
            sx={{
              fontWeight: 500,
              fontSize: '0.875rem',
              color: '#7C7C7C',
              mt: 0.25,
            }}
          >
            {movie.releaseYear}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default MovieCard;