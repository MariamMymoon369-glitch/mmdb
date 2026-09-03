import React from 'react';
import { Box, Typography } from '@mui/material';
import {  useNavigate, useLocation } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.location.reload();
    } else {
      navigate('/');
    }
  };
  return (
    <Box  
      component="footer"
      sx={{
        background: (theme) => `linear-gradient(272.5deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100.67%)`,        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        width: '100%',
        height: '214px', 
        boxSizing: 'border-box',
        margin: '0 auto',
        position: 'fixed',
        bottom: 0,
        left: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        padding: '44px 112px 58px 70px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          height: '124px',
          gap: '24px',
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
           onClick={handleLogoClick}
           component="span"
            sx={{
              cursor: 'pointer',
              textDecoration: 'none',
              color: 'secondary.main',
              fontFamily: 'Rubik, sans-serif',
              fontWeight: 700,
              maxWidth: '84px', 
              height: '32px',
              fontSize: '26.76px',
            }}
          >
            MMDB
          </Typography>
        </Box>
        
        <Box
          sx={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            maxWidth: '354px', 
            height: '24px',
          }}
        >
          {['About', 'Terms Of Use', 'Privacy Policy', 'Help'].map((text) => (
            <Typography
              key={text}
              component="span"
              onClick={() => navigate(`/${text.toLowerCase().replace(/\s+/g, '-')}`)}
              sx={{
                color: 'common.white',
                fontSize: '16px',
                cursor: 'pointer',
                fontFamily: 'Public Sans, sans-serif',
                '&:hover': { color: 'secondary.main' },
              }}

            >
              {text}
            </Typography>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            sx={{
              color: 'grey.400',
              fontSize: '14px',
              fontFamily: 'Public Sans, sans-serif',
              maxWidth: '226px', 
              height: '20px',
            }}
          >
            © {new Date().getFullYear()} MMDB. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
