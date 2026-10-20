import { Box, Typography } from '@mui/material';

interface PersonalInfoProps {
  knownFor: string | null;
  gender: string | null;
  birthdate: string | null;
  deathdate: string | null;
  age: number | null;
  placeOfBirth: string | null;
}

function formatDate(value: string): string | null {
  const parts = value.split('-');
  if (parts.length !== 3) return null;
  const [year, month, day] = parts;
  if (!year || !month || !day) return null;
  return `${day}-${month}-${year}`;
}

export function PersonalInfo({
  knownFor,
  gender,
  birthdate,
  deathdate,
  age,
  placeOfBirth,
}: PersonalInfoProps) {
  const formattedBirthdate = birthdate ? formatDate(birthdate) : null;
  const formattedDeathdate = deathdate ? formatDate(deathdate) : null;

  const birthdateLabel = formattedBirthdate
    ? `${formattedBirthdate}${age === null ? '' : ` (${age} years old)`}`
    : null;

  const rows: { label: string; value: string | null }[] = [
    { label: 'Known For', value: knownFor },
    { label: 'Gender', value: gender },
    { label: 'Birthdate', value: birthdateLabel },
    { label: 'Date of Death', value: formattedDeathdate },
    { label: 'Place of Birth', value: placeOfBirth },
  ];

  const visibleRows = rows.filter((row) => row.value !== null);
  if (visibleRows.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: '1.25rem',
          color: 'primary.main',
          mb: 1.5,
        }}
      >
        Personal information
      </Typography>
      {visibleRows.map((row) => (
        <Box key={row.label} sx={{ mb: 1 }}>
          <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>
            {row.label}
          </Typography>
          <Typography sx={{ color: 'primary.main' }}>{row.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export default PersonalInfo;
