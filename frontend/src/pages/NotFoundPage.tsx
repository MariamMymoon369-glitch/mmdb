import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        textAlign: 'center',
        gap: 2,
        px: 2
      }}
    >
      <Typography variant="h1" sx={{ fontWeight: 800, color: 'text.primary' }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ color: 'grey.600' }}>
        Oops! I ate the page you're looking for.
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => navigate('/')}
        sx={{ mt: 2, borderRadius: '8px', px: 4, py: 1.5, fontWeight: 700 }}
      >
        Back to Home
      </Button>
    </Box>
  );
}