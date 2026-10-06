import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CardActionArea,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  type MovieDetails,
  type PaginatedReviews,
  type ReviewItem,
} from '../types/movie';
import useFetch from '../hooks/useFetch';
import { authFetch, useAuth } from '../hooks/useAuth';
import RateMovieModal from '../components/movies/RateMovieModal';
import WriteReviewModal from '../components/movies/WriteReviewModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ko: 'Korean',
  ja: 'Japanese',
  ar: 'Arabic',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese',
  hi: 'Hindi',
  tr: 'Turkish',
  nl: 'Dutch',
};

function toLanguageName(value: string | null): string | null {
  if (!value) return null;
  const key = value.trim().toLowerCase();
  return LANGUAGE_NAMES[key] ?? value;
}

function getYouTubeId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match ? match[1] : null;
}

function formatRuntime(minutes: number | null): string | null {
  if (minutes == null) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function formatRelativeDate(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
}

function MovieDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [movieReloadKey, setMovieReloadKey] = useState(0);
  const [reviewsReloadKey, setReviewsReloadKey] = useState(0);
  const {
    data: movie,
    loading,
    error,
  } = useFetch<MovieDetails>(
    `${API_BASE_URL}/movies/${uuid}?_=${movieReloadKey}`,
  );

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [rateOpen, setRateOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [playing, setPlaying] = useState(false);

  const [prevUuid, setPrevUuid] = useState(uuid);
  if (prevUuid !== uuid) {
    setPrevUuid(uuid);
    setReviews([]);
    setReviewsPage(1);
    setPlaying(false);
  }

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setReviewsLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/movies/${uuid}/reviews?page=1&limit=5`,
        );
        if (!res.ok) throw new Error('Failed to load reviews');
        const data = (await res.json()) as PaginatedReviews;
        if (!cancelled) {
          setReviews(data.data);
          setReviewsPage(data.page);
          setReviewsTotalPages(data.totalPages);
        }
      } catch {
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [uuid, reviewsReloadKey]);

  const loadMoreReviews = async () => {
    setLoadingMore(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/movies/${uuid}/reviews?page=${reviewsPage + 1}&limit=5`,
      );
      if (!res.ok) throw new Error('Failed to load reviews');
      const data = (await res.json()) as PaginatedReviews;
      setReviews((prev) => [...prev, ...data.data]);
      setReviewsPage(data.page);
      setReviewsTotalPages(data.totalPages);
    } catch {
      // keep existing reviews on failure
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRate = async (rating: number) => {
    const res = await authFetch(`${API_BASE_URL}/movies/${uuid}/rating`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });
    if (!res.ok) throw new Error('Failed to submit rating');
    setMovieReloadKey((k) => k + 1);
  };

  const handleSubmitReview = async (title: string, body: string) => {
    const res = await authFetch(`${API_BASE_URL}/movies/${uuid}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body }),
    });
    if (res.status === 409) throw new Error('conflict');
    if (!res.ok) throw new Error('Failed to submit review');
    setMovieReloadKey((k) => k + 1);
    setReviewsReloadKey((k) => k + 1);
  };

  const handleRateClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setRateOpen(true);
  };

  const handleWriteReviewClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setReviewOpen(true);
  };

  if (loading) {
    return (
      <Typography sx={{ py: 8, textAlign: 'center', color: 'grey.700' }}>
        Loading...
      </Typography>
    );
  }

  if (error || !movie) {
    return (
      <Dialog
        open
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            minWidth: { xs: '300px', sm: '400px' },
            boxShadow: '0px 10px 30px rgba(0,0,0,0.1)',
          },
        }}
      >
        <DialogContent sx={{ pb: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'red', mb: 2 }}>
            oops!
          </Typography>
          <Typography sx={{ color: 'grey.600', fontSize: '1.1rem', mb: 3 }}>
            Could not load this movie. It may not exist.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{
              borderRadius: '8px',
              px: 4,
              py: 1.5,
              fontWeight: 700,
              background: 'green',
              textTransform: 'uppercase',
              boxShadow: 'none',
            }}
          >
            Retry
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  const youtubeId = getYouTubeId(movie.trailerUrl);

  return (
    <Box component="main" sx={{ bgcolor: 'background.default', width: '100%', py: 4 }}>
      <Box sx={{ maxWidth: 1170, mx: 'auto', mb: 1.5, px: 2 }}>
        <Typography
          component={RouterLink}
          to="/homepage"
          sx={{ color: 'text.secondary', fontSize: '12px', textDecoration: 'none' }}
        >
          Home&nbsp;|&nbsp;{movie.title}
        </Typography>
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
          <Box
            component="img"
            src={movie.posterUrl || '/favicon.svg'}
            alt={`${movie.title} poster`}
            sx={{
              width: { xs: '100%', md: 308 },
              height: { xs: 'auto', md: 416 },
              aspectRatio: { xs: '2 / 3', md: '308 / 416' },
              borderRadius: '12px',
              objectFit: 'cover',
            }}
            onError={(e) => {
              e.currentTarget.src = '/favicon.svg';
            }}
          />

          <Box sx={{ flex: 1 }}>
            {youtubeId && playing ? (
              <Box sx={{ width: '100%', maxWidth: 768, aspectRatio: '768 / 415', borderRadius: '12px', overflow: 'hidden' }}>
                <Box
                  component="iframe"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={`${movie.title} trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  sx={{ width: '100%', height: '100%', border: 0 }}
                />
              </Box>
            ) : (
              <Box
                onClick={() => youtubeId && setPlaying(true)}
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 768,
                  aspectRatio: '768 / 415',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  bgcolor: 'grey.100',
                  cursor: youtubeId ? 'pointer' : 'default',
                }}
              >
                <Box
                  component="img"
                  src={
                    youtubeId
                      ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                      : movie.posterUrl || '/favicon.svg'
                  }
                  alt={`${movie.title} trailer`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src = movie.posterUrl || '/favicon.svg';
                  }}
                />
                {youtubeId && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.25)',
                    }}
                  >
                    <Box
                      sx={{
                        width: 90,
                        height: 90,
                        borderRadius: '50%',
                        bgcolor: 'rgba(0,0,0,0.55)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PlayArrowIcon sx={{ color: 'white', fontSize: 45 }} />
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Stack>

        <Typography component="h1" sx={{ mt: 3, fontSize: '1.75rem', fontWeight: 700, color: 'primary.main' }}>
          {movie.title}{' '}
          <Typography component="span" sx={{ color: 'text.secondary', fontSize: '1.25rem' }}>
            ({movie.releaseYear})
          </Typography>
        </Typography>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
          <StarIcon sx={{ fontSize: 18, color: 'star' }} />
          <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: '16px' }}>
            {Number(movie.rating).toFixed(1)}
          </Typography>
          <Typography sx={{ color: 'grey.600', fontSize: '16px', fontWeight: 500 }}>
            Reviews ({movie.reviewCount})
          </Typography>
          <Typography sx={{ color: 'grey.600', fontSize: '16px', fontWeight: 500 }}>|</Typography>
          {movie.myRating != null ? (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <StarIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
              <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: '16px' }}>
                {movie.myRating}
              </Typography>
              <Typography sx={{ color: 'grey.600', fontSize: '16px', fontWeight: 500 }}>Your rating</Typography>
              <Typography
                component="span"
                onClick={handleRateClick}
                sx={{ color: 'secondary.main', cursor: 'pointer' }}
              >
                Edit
              </Typography>
            </Stack>
          ) : (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: 'center', cursor: 'pointer' }}
              onClick={handleRateClick}
            >
              <StarBorderIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
              <Typography sx={{ color: 'secondary.main' }}>Rate</Typography>
            </Stack>
          )}
        </Stack>

        <Typography sx={{ color: 'text.secondary', mt: 1, fontSize: '0.875rem' }}>
          {[formatRuntime(movie.runtimeMinutes), movie.genres.join(', ')]
            .filter(Boolean)
            .join(' • ')}
        </Typography>

        {movie.overview && (
          <>
            <Typography sx={{ mt: 3, fontWeight: 700, color: 'primary.main' }}>
              Overview
            </Typography>
            <Typography sx={{ color: 'text.primary' }}>{movie.overview}</Typography>
          </>
        )}

        <Typography sx={{ mt: 2, fontWeight: 700, color: 'primary.main' }}>
          Director: {movie.directors.map((d) => d.name).join(', ') || '—'}
        </Typography>
        <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>
          Writer: {movie.writers.map((w) => w.name).join(', ') || '—'}
        </Typography>
        <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>
          Language:{' '}
          <Typography component="span" sx={{ fontWeight: 400 }}>
            {toLanguageName(movie.language) ?? '—'}
          </Typography>
        </Typography>

        <Typography sx={{ mt: 3, fontWeight: 700, color: 'primary.main' }}>
          Cast
        </Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {movie.cast.map((member) => (
            <Grid key={`${member.uuid}-${member.characterName}`} size={{ xs: 12, sm: 6, md: 3 }}>
              <CardActionArea
                onClick={() => navigate(`/people/${member.uuid}`)}
                sx={{
                  borderRadius: '12px',
                  bgcolor: 'background.paper',
                  border: '1px solid',
          borderColor: 'grey.200',
                  p: 1.5,
                  '&:hover': { bgcolor: 'grey.50' },
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Box
                    component="img"
                    src={member.photoUrl || '/favicon.svg'}
                    alt={member.name}
                    sx={{ width: 48, height: 48, borderRadius: '8px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = '/favicon.svg';
                    }}
                  />
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.3, color: 'primary.main' }}>
                      {member.name}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      {member.characterName}
                    </Typography>
                  </Box>
                </Stack>
              </CardActionArea>
            </Grid>
          ))}
          {movie.cast.length === 0 && (
            <Alert severity="info" sx={{ borderRadius: '12px' }}>
              No cast information available.
            </Alert>
          )}
        </Grid>

        <Stack
          direction="row"
          sx={{ mt: 4, mb: 2, justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>
            User Reviews
          </Typography>
          {reviewsPage < reviewsTotalPages && (
            <Typography
              onClick={() => void loadMoreReviews()}
              sx={{ color: 'secondary.main', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              View more
            </Typography>
          )}
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          sx={{
            border: '1px solid',
          borderColor: 'grey.200',
            borderRadius: '12px',
            alignItems: 'center',
            px: 2,
            py: 1,
            mb: 3,
            height: 56,
          }}
        >
          <Avatar src={user?.profilePictureUrl || undefined} alt={user?.displayName ?? 'You'} sx={{ width: 32, height: 32 }} />
          <Typography
            onClick={handleWriteReviewClick}
            sx={{ flex: 1, color: 'text.secondary', cursor: 'pointer' }}
          >
            Share your thoughts on {movie.title}...
          </Typography>
          <Button
            variant="contained"
            onClick={handleWriteReviewClick}
            sx={{
              backgroundColor: 'secondary.main',
              textTransform: 'none',
              borderRadius: '8px',
              fontWeight: 700,
            }}
          >
            Write a review
          </Button>
        </Stack>

        {reviewsLoading && (
          <Typography sx={{ py: 4, textAlign: 'center', color: 'grey.700' }}>
            Loading reviews...
          </Typography>
        )}

        {!reviewsLoading && reviews.length === 0 && (
          <Alert severity="info" sx={{ borderRadius: '12px' }}>
            No reviews yet. Be the first to share your thoughts!
          </Alert>
        )}

        <Grid container spacing={2}>
          {reviews.map((review) => (
            <Grid key={review.uuid} size={{ xs: 12, md: 4 }}>
              <Box sx={{ bgcolor: 'grey.100', borderRadius: '12px', p: 2, height: '100%' }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
                  <Avatar src={review.reviewer.profilePictureUrl || undefined} alt={review.reviewer.displayName} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {review.reviewer.displayName}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      {formatRelativeDate(review.createdAt)}
                    </Typography>
                  </Box>
                </Stack>
                {review.rating != null && (
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      {review.rating}
                    </Typography>
                    <StarIcon sx={{ fontSize: 16, color: 'star' }} />
                  </Stack>
                )}
                {review.title && (
                  <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{review.title}</Typography>
                )}
                {review.body && (
                  <Typography sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                    {review.body}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>

        {loadingMore && (
          <Typography sx={{ py: 2, textAlign: 'center', color: 'grey.700' }}>
            Loading more...
          </Typography>
        )}
      </Box>

      {rateOpen && (
        <RateMovieModal
          open={rateOpen}
          onClose={() => setRateOpen(false)}
        posterUrl={movie.posterUrl}
        title={movie.title}
        initialRating={movie.myRating}
          onSubmit={handleRate}
        />
      )}
      {reviewOpen && (
        <WriteReviewModal
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          posterUrl={movie.posterUrl}
          title={movie.title}
          onSubmit={handleSubmitReview}
        />
      )}
    </Box>
  );
}

export default MovieDetailsPage;
