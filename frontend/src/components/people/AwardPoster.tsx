import { useState } from 'react';
import { Box } from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';

interface AwardPosterProps {
  posterUrl: string | null;
  alt: string;
}

export function AwardPoster({ posterUrl, alt }: AwardPosterProps) {
  const [failed, setFailed] = useState(false);

  if (!posterUrl || failed) {
    return (
      <Box
        aria-label="No poster available"
        sx={{
          width: 44,
          height: 60,
          borderRadius: '8px',
          bgcolor: 'grey.200',
          color: 'grey.500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <MovieIcon sx={{ fontSize: 22 }} />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={posterUrl}
      alt={alt}
      loading="lazy"
      sx={{
        width: 44,
        height: 60,
        borderRadius: '8px',
        objectFit: 'cover',
        bgcolor: 'grey.100',
        flexShrink: 0,
      }}
      onError={() => setFailed(true)}
    />
  );
}

export default AwardPoster;
