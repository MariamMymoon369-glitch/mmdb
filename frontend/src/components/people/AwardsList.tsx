import { Box, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { type AwardEntry } from '../../types/movie';
import AwardPoster from './AwardPoster';

interface AwardsListProps {
  awards: AwardEntry[];
}

export function AwardsList({ awards }: AwardsListProps) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        sx={{ fontWeight: 700, fontSize: '1.25rem', color: 'primary.main' }}
      >
        Awards &amp; Nominations
      </Typography>
      {awards.length === 0 ? (
        <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
          No awards information available.
        </Typography>
      ) : (
        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
        {awards.map((award, index) => (
          <Box
            key={`${award.awardName}-${award.awardCategory ?? ''}-${award.year ?? ''}-${award.status}-${index}`}
            sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: 'flex-start',
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: '12px',
              p: 1.5,
            }}
          >
            <AwardPoster
              posterUrl={award.posterUrl}
              alt={award.associatedMovieTitle ?? award.awardName}
            />

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: 'primary.main' }}>
                {award.year !== null && (
                  <Typography component="span" sx={{ fontWeight: 700 }}>
                    {award.year}{' '}
                  </Typography>
                )}
                <Typography component="span" sx={{ fontWeight: 700 }}>
                  {award.status}{' '}
                </Typography>
                <Typography component="span" sx={{ color: 'text.secondary' }}>
                  {award.awardName}
                </Typography>
              </Typography>

              {award.awardCategory && (
                <Typography sx={{ color: 'primary.main' }}>
                  {award.awardCategory}
                </Typography>
              )}

              {award.associatedMovieTitle && (
                <Typography sx={{ color: 'secondary.main', fontWeight: 700 }}>
                  {award.movieUuid ? (
                    <Typography
                      component={RouterLink}
                      to={`/movies/${award.movieUuid}`}
                      sx={{
                        color: 'secondary.main',
                        fontWeight: 700,
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {award.associatedMovieTitle}
                    </Typography>
                  ) : (
                    award.associatedMovieTitle
                  )}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Stack>
      )}
    </Box>
  );
}

export default AwardsList;
