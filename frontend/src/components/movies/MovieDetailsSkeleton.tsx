import { Box, Grid, Skeleton, Stack } from '@mui/material';

const CAST_SKELETON_ITEMS = 4;
const REVIEW_SKELETON_ITEMS = 3;

export default function MovieDetailsSkeleton() {
  return (
    <Box
      component="main"
      aria-hidden="true"
      sx={{ bgcolor: 'background.default', width: '100%', py: 4 }}
    >
      <Box sx={{ maxWidth: 1170, mx: 'auto', mb: 1.5, px: 2 }}>
        <Skeleton variant="text" width={140} height={18} />
      </Box>

      <Box
        sx={{
          maxWidth: 1170,
          mx: 'auto',
          bgcolor: 'background.paper',
          borderRadius: '16px',
          p: 4,
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
          <Skeleton
            variant="rectangular"
            sx={{
              width: { xs: '100%', md: 308 },
              height: { xs: 'auto', md: 416 },
              aspectRatio: { xs: '2 / 3', md: '308 / 416' },
              borderRadius: '12px',
              flexShrink: 0,
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton
              variant="rectangular"
              sx={{
                width: '100%',
                maxWidth: 768,
                height: 'auto',
                aspectRatio: '768 / 415',
                borderRadius: '12px',
              }}
            />
          </Box>
        </Stack>

        <Skeleton variant="text" width="45%" height={42} sx={{ mt: 3 }} />

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
          <Skeleton variant="circular" width={18} height={18} />
          <Skeleton variant="text" width={40} height={24} />
          <Skeleton variant="text" width={100} height={24} />
        </Stack>

        <Skeleton variant="text" width="35%" height={22} sx={{ mt: 1 }} />

        <Skeleton variant="text" width={100} height={24} sx={{ mt: 3 }} />
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="92%" height={20} />
        <Skeleton variant="text" width="70%" height={20} />

        <Skeleton variant="text" width="55%" height={24} sx={{ mt: 2 }} />
        <Skeleton variant="text" width="48%" height={24} />
        <Skeleton variant="text" width="40%" height={24} />

        <Skeleton variant="text" width={60} height={24} sx={{ mt: 3 }} />
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {Array.from({ length: CAST_SKELETON_ITEMS }, (_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: '12px',
                  p: 1.5,
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Skeleton
                    variant="rectangular"
                    width={48}
                    height={48}
                    sx={{ borderRadius: '8px', flexShrink: 0 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="text" width="55%" height={18} />
                  </Box>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Stack
          direction="row"
          sx={{ mt: 4, mb: 2, justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Skeleton variant="text" width={110} height={24} />
        </Stack>

        <Skeleton
          variant="rectangular"
          height={56}
          sx={{ borderRadius: '12px', mb: 3 }}
        />

        <Grid container spacing={2}>
          {Array.from({ length: REVIEW_SKELETON_ITEMS }, (_, index) => (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <Box sx={{ bgcolor: 'grey.100', borderRadius: '12px', p: 2 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Skeleton variant="text" width="65%" height={20} />
                    <Skeleton variant="text" width="35%" height={16} />
                  </Box>
                </Stack>
                <Skeleton variant="text" width="100%" height={18} />
                <Skeleton variant="text" width="80%" height={18} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
