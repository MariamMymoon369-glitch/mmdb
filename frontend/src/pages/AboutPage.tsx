import { Box, Stack, Typography } from '@mui/material';
import ContentPage from '../components/common/ContentPage';

const sectionHeadingSx = {
  fontSize: '1.25rem',
  fontWeight: 700,
  color: 'primary.main',
  mb: 1,
} as const;

const bodySx = {
  color: 'text.primary',
  lineHeight: 1.7,
} as const;

export default function AboutPage() {
  return (
    <ContentPage title="About MMDB">
      <Stack spacing={2.5}>
        <Typography sx={bodySx}>
          MMDB is a movie database website for browsing a catalogue of films and
          the people who make them.
        </Typography>

        <Box>
          <Typography component="h2" sx={sectionHeadingSx}>
            What you can do
          </Typography>
          <Box
            component="ul"
            sx={{
              m: 0,
              pl: 3,
              color: 'text.primary',
              lineHeight: 1.7,
            }}
          >
            <li>Browse the movie catalogue page by page.</li>
            <li>Search for movies and actors from the header search field.</li>
            <li>Filter movies by genre and sort them by newest or oldest.</li>
            <li>
              View movie details such as the cast, directors, writers, runtime,
              language, rating, and user reviews.
            </li>
            <li>
              Open actor details to see personal information, acting credits,
              and awards.
            </li>
            <li>
              Create an account to rate a movie out of 10 and write a review.
            </li>
          </Box>
        </Box>

        <Box>
          <Typography component="h2" sx={sectionHeadingSx}>
            Where the information comes from
          </Typography>
          <Typography sx={bodySx}>
            Movie and people information, including images, is imported from
            TMDB. Award information is sourced from Wikidata. Ratings and
            reviews shown on MMDB are created by registered users.
          </Typography>
        </Box>

        <Typography sx={{ ...bodySx, color: 'text.secondary', fontSize: '0.875rem' }}>
          This page describes the current behaviour of the MMDB project.
        </Typography>
      </Stack>
    </ContentPage>
  );
}
