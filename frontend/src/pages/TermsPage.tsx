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

export default function TermsPage() {
  return (
    <ContentPage title="Terms of Use">
      <Stack spacing={2.5}>
        <Box
          sx={{
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'grey.200',
            borderRadius: '12px',
            p: 2,
          }}
        >
          <Typography
            sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}
          >
            Draft content — pending owner review. This page describes verified
            behaviour in the current MMDB repository. It is not a completed
            legal agreement.
          </Typography>
        </Box>

        <Box>
          <Typography component="h2" sx={sectionHeadingSx}>
            Using MMDB
          </Typography>
          <Typography sx={bodySx}>
            You can browse movies, people, and reviews without an account.
            Creating an account is required to rate a movie or submit a review.
            Keep your account credentials secure and do not use another
            person&apos;s account.
          </Typography>
        </Box>

        <Box>
          <Typography component="h2" sx={sectionHeadingSx}>
            Ratings and reviews
          </Typography>
          <Typography sx={bodySx}>
            Ratings use a scale from 1 to 10. Each account can submit one review
            per movie. Reviews should be relevant to the movie, written in your
            own words, and must not contain unlawful or harmful content.
          </Typography>
        </Box>

        <Box>
          <Typography component="h2" sx={sectionHeadingSx}>
            Third-party content
          </Typography>
          <Typography sx={bodySx}>
            Movie and people information, including images, is imported from
            TMDB. Award information is sourced from Wikidata. Trailer previews
            and playback use YouTube. These services are governed by their own
            terms and policies.
          </Typography>
        </Box>

        <Box>
          <Typography component="h2" sx={sectionHeadingSx}>
            Sections that require owner review
          </Typography>
          <Typography sx={bodySx}>
            The site owner must review and complete the following before these
            terms are treated as final: eligibility and account rules,
            acceptable-use rules, content ownership and moderation, account
            suspension or termination, disclaimers and limitation of liability,
            governing law, and contact details.
          </Typography>
        </Box>
      </Stack>
    </ContentPage>
  );
}
