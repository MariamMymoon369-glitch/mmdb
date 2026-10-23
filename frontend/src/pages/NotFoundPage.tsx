import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      component="main"
      sx={{ bgcolor: 'background.default', width: '100%', py: 8, px: 2 }}
    >
      <Box
        sx={{
          maxWidth: 600,
          mx: 'auto',
          bgcolor: 'background.paper',
          borderRadius: '16px',
          p: { xs: 3, md: 5 },
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Typography
          sx={{
            fontFamily: 'Rubik, sans-serif',
            fontWeight: 700,
            fontSize: { xs: '4rem', md: '5rem' },
            lineHeight: 1,
            color: 'secondary.main',
          }}
        >
          404
        </Typography>
        <Typography
          component="h1"
          sx={{
            mt: 2,
            fontSize: { xs: '1.5rem', md: '1.75rem' },
            fontWeight: 700,
            color: 'primary.main',
          }}
        >
          Page not found
        </Typography>
        <Typography sx={{ mt: 1, color: 'text.secondary' }}>
          The page you are looking for does not exist or may have moved.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/homepage')}
          sx={{
            mt: 3,
            backgroundColor: 'secondary.main',
            color: 'common.white',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 700,
            px: 4,
            height: 45,
            boxShadow: 'none',
          }}
        >
          Back to home
        </Button>
      </Box>
    </Box>
  );
};
