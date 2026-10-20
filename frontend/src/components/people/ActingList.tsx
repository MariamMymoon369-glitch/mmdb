import { Box, List, ListItem, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { type ActingCredit } from '../../types/movie';

interface ActingListProps {
  credits: ActingCredit[];
}

export function ActingList({ credits }: ActingListProps) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        sx={{ fontWeight: 700, fontSize: '1.25rem', color: 'primary.main' }}
      >
        Acting
      </Typography>
      {credits.length === 0 ? (
        <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
          No acting credits available.
        </Typography>
      ) : (
        <List disablePadding sx={{ mt: 1 }}>
        {credits.map((credit) => (
          <ListItem
            key={`${credit.title}-${credit.characterName}`}
            disableGutters
            sx={{
              display: 'list-item',
              listStyleType: 'disc',
              pl: 2.5,
              '&::marker': { color: 'primary.main' },
            }}
          >
            <Typography sx={{ color: 'primary.main' }}>
              {credit.movieUuid ? (
                <Typography
                  component={RouterLink}
                  to={`/movies/${credit.movieUuid}`}
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {credit.title}
                </Typography>
              ) : (
                <Typography component="span" sx={{ fontWeight: 700 }}>
                  {credit.title}
                </Typography>
              )}{' '}
              <Typography component="span" sx={{ color: 'grey.600' }}>
                as
              </Typography>{' '}
              {credit.characterName}
            </Typography>
          </ListItem>
        ))}
      </List>
      )}
    </Box>
  );
}

export default ActingList;
