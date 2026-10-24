import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface ContentPageProps {
  title: string;
  children: ReactNode;
}

export default function ContentPage({ title, children }: ContentPageProps) {
  return (
    <Box
      component="main"
      sx={{ bgcolor: 'background.default', width: '100%', py: 4 }}
    >
      <Box sx={{ maxWidth: 1170, mx: 'auto', px: 2 }}>
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: '16px',
            p: { xs: 2, md: 4 },
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: '1.75rem', md: '2rem' },
              fontWeight: 700,
              color: 'primary.main',
              lineHeight: 1.15,
              mb: 3,
            }}
          >
            {title}
          </Typography>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
