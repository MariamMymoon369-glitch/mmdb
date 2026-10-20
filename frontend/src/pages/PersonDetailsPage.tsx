import { Avatar, Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { type Person } from '../types/movie';
import useFetch from '../hooks/useFetch';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function PersonDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { data: person, loading, error } = useFetch<Person>(
    `${API_BASE_URL}/people/${uuid}`,
  );

  if (loading) {
    return (
      <Typography sx={{ py: 8, textAlign: 'center', color: 'grey.700' }}>
        Loading...
      </Typography>
    );
  }

  if (error || !person) {
    return (
      <Typography sx={{ p: 4, color: 'grey.700' }}>
        Could not load this person.
      </Typography>
    );
  }

  return (
    <Box sx={{ padding: '50px 150px' }}>
      <Avatar
        src={person.photoUrl || undefined}
        alt={person.name}
        sx={{ width: 96, height: 96, mb: 2 }}
      />
      <Typography component="h1" sx={{ fontSize: '1.75rem', fontWeight: 700, color: 'primary.main' }}>
        {person.name}
      </Typography>
      {person.knownFor && (
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          Known for {person.knownFor}
        </Typography>
      )}
      {person.biography && (
        <Typography sx={{ color: 'text.primary' }}>{person.biography}</Typography>
      )}
    </Box>
  );
}

export default PersonDetailsPage;
