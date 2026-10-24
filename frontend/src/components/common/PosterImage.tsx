import { useState } from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import MovieIcon from '@mui/icons-material/Movie';
import PersonIcon from '@mui/icons-material/Person';

type PosterImageVariant = 'poster' | 'person';

interface PosterImageProps {
  src: string | null;
  alt: string;
  variant?: PosterImageVariant;
  iconSize?: number;
  fallbackSrc?: string | null;
  loading?: 'eager' | 'lazy';
  sx?: SxProps<Theme>;
}

export default function PosterImage({
  src,
  alt,
  variant = 'poster',
  iconSize = 40,
  fallbackSrc = null,
  loading,
  sx,
}: PosterImageProps) {
  const [trackedSrc, setTrackedSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  if (trackedSrc !== src) {
    setTrackedSrc(src);
    setFailed(false);
    setUsingFallback(false);
  }

  const effectiveSrc = usingFallback ? fallbackSrc : src;
  const showFallback = !effectiveSrc || failed;
  const Icon = variant === 'person' ? PersonIcon : MovieIcon;

  const handleError = () => {
    if (!usingFallback && fallbackSrc && fallbackSrc !== src) {
      setUsingFallback(true);
      return;
    }
    setFailed(true);
  };

  return (
    <Box
      sx={[
        {
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {showFallback ? (
        <Box
          role="img"
          aria-label={alt}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            color: 'text.secondary',
          }}
        >
          <Icon sx={{ fontSize: iconSize }} />
        </Box>
      ) : (
        <Box
          component="img"
          src={effectiveSrc}
          alt={alt}
          loading={loading}
          onError={handleError}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}
    </Box>
  );
}
