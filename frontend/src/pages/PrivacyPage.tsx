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

export default function PrivacyPage() {
  return (
    <ContentPage title="Privacy Policy">
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
            data handling in the current MMDB repository. It is not a completed
            privacy policy.
          </Typography>
        </Box>

        <Box>
          <Typography component="h2" sx={sectionHeadingSx}>
            Account information
          </Typography>
          <Typography sx={bodySx}>
            When you create an account, MMDB stores your first name, last name,
            email address, and display name. Passwords are stored as bcrypt
            hashes rather than plain text. A profile picture URL is stored when
            one is set; the seeded demo accounts use images from ui-avatars.com.
          </Typography>
        </Box>

        <Box>
          <Typography component="h2" sx={sectionHeadingSx}>
            Ratings and reviews
          </Typography>
          <Typography sx={bodySx}>
            Ratings and reviews you submit are stored in the MMDB database and
            are displayed publicly together with your display name.
          </Typography>
        </Box>

        <Box>
          <Typography component="h2" sx={sectionHeadingSx}>
            Browser storage
          </Typography>
          <Typography sx={bodySx}>
            The current frontend stores the access token in localStorage when
            &quot;keep me signed in&quot; is selected, and in sessionStorage
            otherwise. Basic account details are stored in localStorage so the
            header can show the signed-in user. Logging out clears this stored
            authentication state.
          </Typography>
        </Box>

        <Box>
          <Typography component="h2" sx={sectionHeadingSx}>
            Service providers and external content
          </Typography>
          <Typography sx={bodySx}>
            Movie and people data and images come from TMDB, award data comes
            from Wikidata, trailer previews and playback use YouTube, fonts are
            loaded from Google Fonts, and seeded demo profile images come from
            ui-avatars.com. Requests to these services may share technical
            information such as your IP address with them.
          </Typography>
        </Box>

        <Box>
          <Typography component="h2" sx={sectionHeadingSx}>
            Sections that require owner review
          </Typography>
          <Typography sx={bodySx}>
            The site owner must review and complete the following before this
            policy is treated as final: data retention periods, account and data
            deletion requests, access and correction requests, cookie and
            analytics use, legal bases for processing, international data
            transfers, security incident handling, and contact details.
          </Typography>
        </Box>
      </Stack>
    </ContentPage>
  );
}
