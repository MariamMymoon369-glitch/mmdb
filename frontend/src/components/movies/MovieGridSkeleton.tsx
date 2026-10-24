import { Card, CardContent, Grid, Skeleton, Stack } from '@mui/material';

const SKELETON_CARDS = 8;

export default function MovieGridSkeleton() {
  return (
    <Grid container spacing={3} aria-hidden="true">
      {Array.from({ length: SKELETON_CARDS }, (_, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '16px',
              bgcolor: 'background.paper',
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Skeleton
              variant="rectangular"
              sx={{
                width: '100%',
                height: 'auto',
                aspectRatio: '2 / 3',
                borderRadius: '12px',
              }}
            />
            <CardContent sx={{ px: 0, pt: 1.5, pb: '0 !important', flexGrow: 1 }}>
              <Stack direction="row" spacing={0.5} sx={{ mb: 0.5, alignItems: 'center' }}>
                <Skeleton variant="circular" width={18} height={18} />
                <Skeleton variant="text" width={42} height={24} />
              </Stack>
              <Skeleton variant="text" width="85%" height={26} />
              <Skeleton variant="text" width={56} height={22} sx={{ mt: 0.25 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
