import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';

interface ErrorDialogProps {
  open: boolean;
  message: string;
}

export default function ErrorDialog({ open, message }: ErrorDialogProps) {
  return (
    <Dialog
      open={open}
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
          {message}
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
