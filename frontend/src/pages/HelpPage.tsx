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

export default function HelpPage() {
  return (
    <ContentPage title="Help">
      <Stack spacing={2.5}>
        <Box>
          <Typography component="h2" sx={sectionHeadingSx}>
            Browsing and searching
          </Typography>
          <Typography sx={bodySx}>
            Use the search field in the header to find movies and actors. Search
            starts after at least two characters. Choose a genre from the Genre
            menu to filter the catalogue, and use the sort control on the home
            page to switch between newest and oldest releases.
          </Typography>
        </Box>

        <Box>
          <Typography component="h2" sx={sectionHeadingSx}>
            Ratings and reviews
          </Typography>
          <Typography sx={bodySx}>
            Sign in to rate a movie from 1 to 10 or to write a review. Each
            account can submit one review per movie. If you have already
            reviewed a movie, submitting another review for the same movie is
            not allowed.
          </Typography>
        </Box>

        <Box>
          <Typography component="h2" sx={sectionHeadingSx}>
            Signed-in session
          </Typography>
          <Typography sx={bodySx}>
            If your session expires, MMDB asks you to sign in again. Signing out
            clears the stored authentication state on the device.
          </Typography>
        </Box>

        <Box>
          <Typography component="h2" sx={sectionHeadingSx}>
            Missing or incomplete information
          </Typography>
          <Typography sx={bodySx}>
            Movie and people details are imported from external sources, so some
            fields, images, or awards may be missing. A neutral placeholder is
            shown when an image is unavailable.
          </Typography>
        </Box>

        <Box>
          <Typography component="h2" sx={sectionHeadingSx}>
            Contact
          </Typography>
          <Typography sx={bodySx}>
            Support contact details are not configured in the repository and
            will be added by the site owner.
          </Typography>
        </Box>
      </Stack>
    </ContentPage>
  );
}
