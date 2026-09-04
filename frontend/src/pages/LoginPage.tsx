import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Container,
  OutlinedInput,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AUTH_CHANGE_EVENT } from '../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keepMeSignedIn: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          keepMeSignedIn: formData.keepMeSignedIn,
        }),
      });

      if (!response.ok) throw new Error('Invalid email or password');

      const data: { accessToken: string; user: unknown } = await response.json();
      const { accessToken, user } = data;

      if (formData.keepMeSignedIn) {
        localStorage.setItem('accessToken', accessToken);
      } else {
        sessionStorage.setItem('accessToken', accessToken);
      }
      
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
      navigate('/');
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 10, mb: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <Typography variant="h4" color="secondary" sx={{ mb: 2, fontWeight: 900 }}>
          MMDB
        </Typography>

        <Box
          sx={{
            width: '100%',
            p: 4,
            borderRadius: 3,
            backgroundColor: 'background.paper',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          <Typography variant="h5" color="primary.main" sx={{ mb: 3, fontWeight: 'bold' }}>
            Sign in
          </Typography>

          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            
            <Typography variant="body2" color="primary.main" sx={{ mb: 1, fontWeight: 600 }}>
              Email
            </Typography>
            <OutlinedInput
              fullWidth
              name="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              size="small"
              sx={{ mb: 3, borderRadius: 2 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                Password
              </Typography>
              <Link href="#" variant="body2" color="secondary.main" underline="hover">
                Forgot password?
              </Link>
            </Box>
            <OutlinedInput
              fullWidth
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              required
              size="small"
              sx={{ mb: 3, borderRadius: 2 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              disableElevation
              sx={{ py: 1.2, mb: 2, borderRadius: 2, fontWeight: 'bold', textTransform: 'none', fontSize: '1rem' }}
            >
              Sign in
            </Button>

            <FormControlLabel
              control={
                <Checkbox
                  name="keepMeSignedIn"
                  checked={formData.keepMeSignedIn}
                  onChange={handleInputChange}
                  color="primary"
                  size="small"
                />
              }
              label={<Typography color="text.secondary">Keep me signed in</Typography>}
            />

            <Typography variant="body2" color="text.secondary">
              New to MMDB?{' '}
              <Link component={RouterLink} to="/signup" color="secondary.main" underline="hover">
                Sign up
              </Link>
            </Typography>

          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;

