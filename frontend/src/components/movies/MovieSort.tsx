import { useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

interface MovieSortProps {
  sort: 'newest' | 'oldest';
  onChange: (value: 'newest' | 'oldest') => void;
}

function MovieSort({ sort, onChange }: MovieSortProps) {

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (value?: 'newest' | 'oldest') => {
    setAnchorEl(null);
    if (value) {
      onChange(value);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        startIcon={<FilterListIcon sx={{ color: 'grey.600' }} />}
        sx={{
          borderRadius: '60px',
          color: 'grey.600',
          borderColor: 'grey.200',
          bgcolor: 'background.default',
          textTransform: 'none',
          fontWeight: 500,
          height: '40px',
          px: 2,
          '&:hover': {
            borderColor: 'grey.300',
            bgcolor: 'grey.50',
          },
        }}
      >
        Sort by
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          selected={sort === 'newest'} 
          onClick={() => handleClose('newest')}
        >
          Newest first
        </MenuItem>
        <MenuItem 
          selected={sort === 'oldest'} 
          onClick={() => handleClose('oldest')}
        >
          Oldest first
        </MenuItem>
      </Menu>
    </>
  );
}

export default MovieSort;
