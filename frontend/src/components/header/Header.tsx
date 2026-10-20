import React from 'react';
import { Avatar, Box, Button, Menu, MenuItem, Typography, } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import { type Genre } from '../../types/movie';
import profileSvg from '../../assets/profile.svg';
import SearchBar from './SearchBar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoggedIn, logout } = useAuth();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);
    const [genreAnchorEl, setGenreAnchorEl] = React.useState<null | HTMLElement>(null);
    const [searchParams] = useSearchParams();
    const { data: genres } = useFetch<Genre[]>(`${API_BASE_URL}/genres`);

    const selectedGenre = searchParams.get('genre');

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleGenreOpen = (event: React.MouseEvent<HTMLElement>) => {
      setGenreAnchorEl(event.currentTarget);
    };

    const handleGenreClose = () => {
      setGenreAnchorEl(null);
    };

    const handleGenreSelect = (genre: string | null) => {
      setGenreAnchorEl(null);
      const next = new URLSearchParams();
      if (genre !== null) {
        next.set('genre', genre);
      }
      navigate({ pathname: '/homepage', search: next.toString() });
    };

    const handleLogout = async () => {
      await logout();
      handleMenuClose();
      navigate('/homepage');
    };

    const handleLogoClick = () => {
      if (location.pathname === '/homepage') {
        window.location.reload();
      } else {
        navigate('/homepage');
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
          fontWeight: 700,
          fontSize: '34px',
          lineHeight: 1,
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
          onClick={handleGenreOpen}
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
        <Menu
          anchorEl={genreAnchorEl}
          open={Boolean(genreAnchorEl)}
          onClose={handleGenreClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <MenuItem
            selected={!selectedGenre}
            onClick={() => handleGenreSelect(null)}
          >
            All Genres
          </MenuItem>
          {(genres ?? []).map((genre) => (
            <MenuItem
              key={genre.id}
              selected={selectedGenre === genre.name}
              onClick={() => handleGenreSelect(genre.name)}
            >
              {genre.name}
            </MenuItem>
          ))}
        </Menu>
      </Box>
</Box>

      <Box sx={{ display: 'flex',
                 alignItems: 'center',
                 gap: '12px',
            }}>
        <SearchBar />

        {isLoggedIn && user ? (
          <>
            <Box
              onClick={handleMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <Avatar src={profileSvg} alt={user.displayName} />
              <Typography
                sx={{
                  color: 'primary.main',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '16px',
                  letterSpacing: '-0.025em',
                }}
              >
                {user.firstName}
              </Typography>
              <ArrowDropDownIcon fontSize="medium" sx={{ color: 'text.secondary' }} />
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
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
