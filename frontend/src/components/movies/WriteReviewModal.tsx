import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface WriteReviewModalProps {
  open: boolean;
  onClose: () => void;
  posterUrl: string | null;
  title: string;
  onSubmit: (title: string, body: string) => Promise<void>;
}

export default function WriteReviewModal({
  open,
  onClose,
  posterUrl,
  title,
  onSubmit,
}: WriteReviewModalProps) {
  const [reviewTitle, setReviewTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = reviewTitle.trim().length > 0 && body.trim().length > 0;

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(reviewTitle.trim(), body.trim());
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'conflict') {
        setError('You have already reviewed this movie.');
      } else {
        setError('Could not submit your review. Please try again.');
      }
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
          width: 540,
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
              WRITE A REVIEW
            </Typography>
            <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>
              {title}
            </Typography>
          </Box>
        </Stack>

        <Typography sx={{ fontWeight: 600, color: 'primary.main', mb: 1, fontSize: '14px' }}>
          Title
        </Typography>
        <OutlinedInput
          fullWidth
          placeholder="Sum up your review in a line"
          value={reviewTitle}
          onChange={(e) => setReviewTitle(e.target.value)}
          sx={{ mb: 2, borderRadius: '8px', height: 42 }}
          inputProps={{ maxLength: 200 }}
        />

        <Typography sx={{ fontWeight: 600, color: 'primary.main', mb: 1, fontSize: '14px' }}>
          Review
        </Typography>
        <OutlinedInput
          fullWidth
          multiline
          rows={5}
          placeholder={`Share your thoughts on ${title}...`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          sx={{ mb: 2, borderRadius: '8px', height: 130 }}
          inputProps={{ maxLength: 1000 }}
        />

        {error && (
          <Typography sx={{ color: 'red', mb: 2 }}>{error}</Typography>
        )}

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
          <Button
            onClick={handleClose}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!isValid || submitting}
            onClick={handleSubmit}
            sx={{
              backgroundColor: 'secondary.main',
              color: 'common.white',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              px: 4,
              width: 103,
              height: 42,
            }}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
