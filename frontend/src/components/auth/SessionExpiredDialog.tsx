import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SESSION_EXPIRED_EVENT } from '../../hooks/useAuth';

export default function SessionExpiredDialog() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(SESSION_EXPIRED_EVENT, show);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, show);
    };
  }, []);

  const handleLoginAgain = () => {
    setOpen(false);
    navigate('/login');
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
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
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          Session expired
        </Typography>
        <Typography sx={{ color: 'grey.600', fontSize: '1rem', mb: 3 }}>
          Your session has expired. Please log in again to continue.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          variant="contained"
          onClick={handleLoginAgain}
          sx={{
            borderRadius: '8px',
            px: 4,
            py: 1.5,
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: 'none',
          }}
        >
          Login Again
        </Button>
      </DialogActions>
    </Dialog>
  );
}
