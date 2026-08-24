import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

interface MovieSortProps {
  sort: 'newest' | 'oldest';
  onChange: (value: 'newest' | 'oldest') => void;
}

function MovieSort({ sort, onChange }: MovieSortProps) {
  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel id="movie-sort-label">Sort</InputLabel>
      <Select
        sx={{ bgcolor: 'background.paper', borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,.14)' } }}
        labelId="movie-sort-label"
        value={sort}
        label="Sort"
        onChange={(event) =>
          onChange(event.target.value as 'newest' | 'oldest')
        }
      >
        <MenuItem value="newest">Newest first</MenuItem>
        <MenuItem value="oldest">Oldest first</MenuItem>
      </Select>
    </FormControl>
  );
}

export default MovieSort;