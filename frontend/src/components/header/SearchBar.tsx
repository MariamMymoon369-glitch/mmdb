import { useMemo, useRef, useState } from 'react';
import {
  Box,
  CircularProgress,
  InputBase,
  ListItemButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { type SearchResults } from '../../types/movie';
import useFetch from '../../hooks/useFetch';
import useDebouncedValue from '../../hooks/useDebouncedValue';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const RESULT_LIMIT = 5;

type SearchItem = {
  type: 'movie' | 'person';
  uuid: string;
  label: string;
  meta: string;
  posterUrl: string | null;
};

function SearchBar() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);
  const term = debouncedQuery.trim();
  const enabled = term.length >= MIN_QUERY_LENGTH;

  const url = enabled
    ? `${API_BASE_URL}/search?q=${encodeURIComponent(term)}&limit=${RESULT_LIMIT}`
    : '';

  const { data, loading, error } = useFetch<SearchResults>(url, { enabled });

  const items = useMemo<SearchItem[]>(
    () => [
      ...(data?.movies ?? []).map((movie) => ({
        type: 'movie' as const,
        uuid: movie.uuid,
        label: movie.title,
        meta: String(movie.releaseYear),
        posterUrl: movie.posterUrl,
      })),
      ...(data?.people ?? []).map((person) => ({
        type: 'person' as const,
        uuid: person.uuid,
        label: person.name,
        meta: 'Actor',
        posterUrl: person.photoUrl,
      })),
    ],
    [data],
  );

  const open = focused && query.trim().length >= MIN_QUERY_LENGTH;

  const handleSelect = (item: SearchItem) => {
    setQuery('');
    setFocused(false);
    navigate(
      item.type === 'movie' ? `/movies/${item.uuid}` : `/people/${item.uuid}`,
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, items.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = items[activeIndex];
      if (item) {
        handleSelect(item);
      }
    } else if (event.key === 'Escape') {
      setFocused(false);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && containerRef.current?.contains(next)) {
      return;
    }
    setFocused(false);
  };

  let lastType: SearchItem['type'] | null = null;

  return (
    <Box
      ref={containerRef}
      onBlur={handleBlur}
      sx={{ position: 'relative', width: '227px' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '227px',
          height: '48px',
          border: (theme) => `1px solid ${theme.palette.grey[200]}`,
          borderRadius: '60px',
          padding: '12px 16px',
          gap: '12px',
        }}
      >
        <SearchIcon sx={{ color: 'text.secondary' }} />
        <InputBase
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search"
          inputProps={{ 'aria-label': 'Search movies and people' }}
          sx={{
            color: 'text.secondary',
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            width: '100%',
          }}
        />
      </Box>

      {open && (
        <Paper
          elevation={6}
          sx={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '340px',
            maxWidth: '90vw',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'grey.200',
            overflow: 'hidden',
            zIndex: (theme) => theme.zIndex.modal,
          }}
        >
          {loading && (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', p: 2 }}>
              <CircularProgress size={18} />
              <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                Searching...
              </Typography>
            </Stack>
          )}

          {!loading && error && (
            <Typography sx={{ p: 2, color: 'grey.600', fontSize: '0.875rem' }}>
              Search failed. Please try again.
            </Typography>
          )}

          {!loading && !error && items.length === 0 && (
            <Typography sx={{ p: 2, color: 'grey.600', fontSize: '0.875rem' }}>
              No results found
            </Typography>
          )}

          {!loading && !error && items.length > 0 && (
            <Box sx={{ maxHeight: '360px', overflowY: 'auto', py: 0.5 }}>
              {items.map((item, index) => {
                const showHeading = item.type !== lastType;
                lastType = item.type;
                return (
                  <Box key={`${item.type}-${item.uuid}`}>
                    {showHeading && (
                      <Typography
                        sx={{
                          px: 2,
                          pt: 1,
                          pb: 0.5,
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.type === 'movie' ? 'Movies' : 'People'}
                      </Typography>
                    )}
                    <ListItemButton
                      selected={index === activeIndex}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => handleSelect(item)}
                      sx={{ py: 1, px: 2, borderRadius: 0 }}
                    >
                      <Box
                        component="img"
                        src={item.posterUrl || '/favicon.svg'}
                        alt={item.label}
                        sx={{
                          width: 30,
                          height: 40,
                          borderRadius: '6px',
                          objectFit: 'cover',
                          bgcolor: 'grey.100',
                          mr: 1.5,
                          flexShrink: 0,
                        }}
                        onError={(event) => {
                          event.currentTarget.src = '/favicon.svg';
                        }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: 'primary.main',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                          {item.meta}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  </Box>
                );
              })}
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}

export default SearchBar;
