import { Box, Skeleton, Stack } from '@mui/material';

const INFO_ROWS = 6;
const BIOGRAPHY_LINES = 5;
const ACTING_LINES = 3;

export default function PersonDetailsSkeleton() {
  return (
    <Box
      component="main"
      aria-hidden="true"
      sx={{ bgcolor: 'background.default', width: '100%', py: 4 }}
    >
      <Box sx={{ maxWidth: 1170, mx: 'auto', px: 2 }}>
        <Skeleton variant="text" width={54} height={20} sx={{ mb: 2 }} />

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
              <Skeleton
                variant="rectangular"
                sx={{
                  width: '100%',
                  height: 'auto',
                  aspectRatio: '270 / 360',
                  borderRadius: '12px',
                }}
              />

              <Box sx={{ mt: 3 }}>
                <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1.5 }} />
                {Array.from({ length: INFO_ROWS }, (_, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Skeleton variant="text" width="38%" height={20} />
                    <Skeleton variant="text" width="58%" height={20} />
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Skeleton variant="text" width="55%" height={40} />

              <Skeleton variant="text" width={110} height={28} sx={{ mt: 2 }} />
              <Skeleton variant="text" width="100%" height={20} sx={{ mt: 0.5 }} />
              {Array.from({ length: BIOGRAPHY_LINES }, (_, index) => (
                <Skeleton
                  key={index}
                  variant="text"
                  width={index === BIOGRAPHY_LINES - 1 ? '62%' : '100%'}
                  height={20}
                />
              ))}

              <Skeleton variant="text" width={70} height={28} sx={{ mt: 3 }} />
              {Array.from({ length: ACTING_LINES }, (_, index) => (
                <Skeleton key={index} variant="text" width="72%" height={22} sx={{ mt: 1 }} />
              ))}

              <Skeleton variant="text" width={190} height={28} sx={{ mt: 3 }} />
              <Skeleton
                variant="rectangular"
                height={80}
                sx={{ mt: 1.5, borderRadius: '12px' }}
              />
              <Skeleton
                variant="rectangular"
                height={80}
                sx={{ mt: 1.5, borderRadius: '12px' }}
              />
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
