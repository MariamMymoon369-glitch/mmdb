import PosterImage from '../common/PosterImage';

interface AwardPosterProps {
  posterUrl: string | null;
  alt: string;
}

export function AwardPoster({ posterUrl, alt }: AwardPosterProps) {
  return (
    <PosterImage
      src={posterUrl}
      alt={alt}
      iconSize={22}
      loading="lazy"
      sx={{
        width: 44,
        height: 60,
        borderRadius: '8px',
        bgcolor: 'grey.200',
        flexShrink: 0,
      }}
    />
  );
}

export default AwardPoster;
