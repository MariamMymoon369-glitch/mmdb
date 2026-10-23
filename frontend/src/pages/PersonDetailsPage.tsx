import { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { type PersonDetails } from '../types/movie';
import useFetch from '../hooks/useFetch';
import PersonalInfo from '../components/people/PersonalInfo';
import ActingList from '../components/people/ActingList';
import AwardsList from '../components/people/AwardsList';
import PersonDetailsSkeleton from '../components/people/PersonDetailsSkeleton';
import ErrorDialog from '../components/common/ErrorDialog';
import PosterImage from '../components/common/PosterImage';
import { API_BASE_URL } from '../config/api';


const BIOGRAPHY_PREVIEW_LENGTH = 480;

function hasInAppHistory(): boolean {
  const state = window.history.state as { idx?: number } | null;
  return typeof state?.idx === 'number' && state.idx > 0;
}

function PersonDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [expandedBio, setExpandedBio] = useState(false);

  const { data: person, loading, error } = useFetch<PersonDetails>(
    `${API_BASE_URL}/people/${uuid}`,
  );

  const handleBack = () => {
    if (hasInAppHistory()) {
      navigate(-1);
    } else {
      navigate('/homepage');
    }
  };

  if (loading) {
    return <PersonDetailsSkeleton />;
  }

  if (error || !person) {
    return (
      <ErrorDialog
        open
        message="Could not load this person. They may not exist."
      />
    );
  }

  const biography = person.biography ?? '';
  const isTruncated = biography.length > BIOGRAPHY_PREVIEW_LENGTH;
  const visibleBiography =
    isTruncated && !expandedBio
      ? biography.slice(0, BIOGRAPHY_PREVIEW_LENGTH).trimEnd()
      : biography;

  return (
    <Box component="main" sx={{ bgcolor: 'background.default', width: '100%', py: 4 }}>
      <Box sx={{ maxWidth: 1170, mx: 'auto', px: 2 }}>
        <Box
          component="button"
          onClick={handleBack}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            background: 'none',
            border: 'none',
            p: 0,
            mb: 2,
            cursor: 'pointer',
            color: 'primary.main',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: '0.875rem',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 12 }} />
          Back
        </Box>

        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: '16px',
            p: { xs: 2, md: 4 },
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            <Box sx={{ width: { xs: '100%', md: 270 }, flexShrink: 0 }}>
              <PosterImage
                src={person.photoUrl}
                alt={`${person.name} picture`}
                variant="person"
                iconSize={64}
                sx={{
                  width: '100%',
                  aspectRatio: '270 / 360',
                  borderRadius: '12px',
                }}
              />

              <PersonalInfo
                knownFor={person.knownFor}
                gender={person.gender}
                birthdate={person.birthdate}
                deathdate={person.deathdate}
                age={person.age}
                placeOfBirth={person.placeOfBirth}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: '1.75rem', md: '2rem' },
                  fontWeight: 700,
                  color: 'primary.main',
                  lineHeight: 1.15,
                }}
              >
                {person.name}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    color: 'primary.main',
                  }}
                >
                  Biography
                </Typography>
                {person.biography ? (
                  <Typography sx={{ color: 'text.primary', mt: 0.5 }}>
                    {visibleBiography}
                    {isTruncated && (
                      <Box
                        component="span"
                        onClick={() => setExpandedBio((value) => !value)}
                        sx={{
                          color: 'secondary.main',
                          fontWeight: 700,
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {expandedBio ? ' Read less' : ' Read more'}
                      </Box>
                    )}
                  </Typography>
                ) : (
                  <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
                    No biography available.
                  </Typography>
                )}
              </Box>

              <ActingList credits={person.acting} />

              <AwardsList awards={person.awards} />
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default PersonDetailsPage;
