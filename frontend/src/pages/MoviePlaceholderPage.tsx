import { Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

function MoviePlaceholderPage() {
  const { id } = useParams<{ id: string }>();

  return <Typography sx={{ p: 4 }}>Movie ID: {id}</Typography>;
}

export default MoviePlaceholderPage;
