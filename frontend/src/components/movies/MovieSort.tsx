import { FormControl, MenuItem, Select, Box, Typography } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

interface MovieSortProps {
  sort: 'newest' | 'oldest';
  onChange: (value: 'newest' | 'oldest') => void;
}

function MovieSort({ sort, onChange }: MovieSortProps) {
  return (
    <FormControl size="small" sx={{ width: 107 }}>
      <Select
        value={sort}
        IconComponent={() => null}
        onChange={(e) => onChange(e.target.value as 'newest' | 'oldest')}
        displayEmpty
        renderValue={() => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <FilterListIcon
              sx={{
                fontSize: 20,
                color: '#697586',
              }}
            />
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#697586',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              Sort by
            </Typography>
          </Box>
        )}
        sx={{
          width: '107px',
          height: '40px',
          borderRadius: '60px',
          bgcolor: '#f0f1f2',
          border: '1px solid #E5E5E5',
          boxSizing: 'border-box',
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 !important',
          },
        }}
      >
        <MenuItem value="newest">Newest first</MenuItem>
        <MenuItem value="oldest">Oldest first</MenuItem>
      </Select>
    </FormControl>
  );
}

export default MovieSort;