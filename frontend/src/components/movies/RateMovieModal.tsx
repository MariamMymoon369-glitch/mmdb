import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloseIcon from '@mui/icons-material/Close';

interface RateMovieModalProps {
  open: boolean;
  onClose: () => void;
  posterUrl: string | null;
  title: string;
  initialRating?: number | null;
  onSubmit: (rating: number) => Promise<void>;
}

export default function RateMovieModal({
  open,
  onClose,
  posterUrl,
  title,
  initialRating = null,
  onSubmit,
}: RateMovieModalProps) {
  const [selected, setSelected] = useState<number | null>(initialRating);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (submitting) return;
    setSelected(initialRating);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (selected == null || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(selected);
      onClose();
    } catch {
      setError('Could not submit your rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '16px',
          padding: '28px',
          width: 440,
          maxWidth: '90vw',
          boxShadow: '0px 10px 30px rgba(0,0,0,0.1)',
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ position: 'absolute', top: 0, right: 0 }}
          aria-label="Close"
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Box
            component="img"
            src={posterUrl || '/favicon.svg'}
            alt={`${title} poster`}
            sx={{ width: 56, height: 80, borderRadius: '8px', objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.src = '/favicon.svg';
            }}
          />
          <Box>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.08em' }}>
              RATE THIS
            </Typography>
            <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>
              {title}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.25} sx={{ justifyContent: 'center', mb: 1 }}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => {
            const highlighted = selected != null && value <= selected;
            return (
              <IconButton
                key={value}
                size="small"
                onClick={() => setSelected(value)}
                aria-label={`Rate ${value}`}
                sx={{ p: 0 }}
              >
                {highlighted ? (
                  <StarIcon sx={{ color: 'secondary.main', fontSize: 30 }} />
                ) : (
                  <StarBorderIcon sx={{ color: 'grey.400', fontSize: 30 }} />
                )}
              </IconButton>
            );
          })}
        </Stack>

        <Typography sx={{ textAlign: 'center', color: 'text.secondary', mb: 3, fontSize: '14px' }}>
          {selected != null ? `${selected} / 10` : 'Click a star to rate'}
        </Typography>

        {error && (
          <Typography sx={{ color: 'red', textAlign: 'center', mb: 2 }}>
            {error}
          </Typography>
        )}

        <Stack spacing={1.5}>
          <Button
            variant="contained"
            disabled={selected == null || submitting}
            onClick={handleSubmit}
            sx={{
              backgroundColor: 'secondary.main',
              color: 'common.white',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              height: 45,
              width: 384,
              maxWidth: '100%',
              alignSelf: 'center',
              '&.Mui-disabled': { backgroundColor: 'grey.300', color: 'grey.600' },
            }}
          >
            {submitting ? 'Submitting...' : 'Rate'}
          </Button>
          <Button
            onClick={handleClose}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Cancel
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
