import React from 'react';
import { Box, Button, Typography, InputBase, } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useNavigate, useLocation} from 'react-router-dom';

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isLoggedIn = false;

    const handleLogoClick = () => {
      if (location.pathname === '/') {
        window.location.reload();
      } else {
        navigate('/');
      }
    };
  

 return (
 <Box  
  component="header"
    sx={{
        backgroundColor: 'background.paper',
        display: 'flex', 
        justifyContent: 'center', 
        width: '100%',
        height: '72px', 
        alignItems: 'center', 
        px: 4,
        margin: '0 auto',
}}>
   

   <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '110px',
        height: '48px',
      }}
    >
     <Box sx={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
    <Typography
        onClick={handleLogoClick}
        sx={{
          cursor: 'pointer',
          color: 'secondary.main',
          fontFamily: 'Rubik, sans-serif',
          fontStyle: 'Bold',
          fontWeight: 700,
          fontSize: '26.76px',
        }}
      >
        MMDB
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '34px',}}>
        <Typography
            onClick={handleLogoClick}
                sx={{
                    color: 'primary.main',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '16px',
                    letterSpacing: '-0.025em',
                    cursor: 'pointer',
                    
                    
                }}
            >
          Home
        </Typography>

        <Typography
          sx={{
            color: 'text.secondary',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '16px',
            letterSpacing: '-0.025em',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',

          }}
        >
          Genre <ArrowDropDownIcon fontSize="medium" />
        </Typography>
      </Box>
</Box>
    
      <Box sx={{ display: 'flex',
                 alignItems: 'center',
                 gap: '12px',
            }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '227px',
            height: '48px',
            border: (theme) => `1px solid ${theme.palette.grey[200]}`,
            borderRadius: '60px',
            padding: '12px 16px',
            gap:'12px'
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', }} />
          <InputBase
            placeholder="Search"
            sx={{
              color: 'text.secondary',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              width: '100%',
            }}
          />
        </Box>

        {!isLoggedIn && (
          <>
            <Button
             onClick={() => navigate('/signup')}
              sx={{
                color: 'secondary.main',
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 500,
                fontSize: '16px',
                textTransform: 'none',
                cursor: 'pointer',
                height: '19px',
              }}
            >
              Sign up
            </Button>

            <Button
             variant="contained"
             onClick={() => navigate('/login')}
              sx={{
                backgroundColor: 'secondary.main',
                color: 'common.white',
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 500,
                fontSize: '16px',
                textTransform: 'none',
                borderRadius: '8px',           
                padding: '10px 26px',
                cursor: 'pointer',
                maxWidth: '92px', 
                height: '39px',
              }}
            >
              Login
            </Button>
          </>
        )}
      </Box>
    </Box>
 </Box>
  );
};

export default Header;
