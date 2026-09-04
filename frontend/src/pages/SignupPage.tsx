import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Link,
  Container,
  OutlinedInput,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AUTH_CHANGE_EVENT } from '../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email.toLowerCase().trim(),
          displayName: `${formData.firstName} ${formData.lastName}`.trim(),
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        const message =
          typeof data === 'object' && data !== null && 'message' in data
            ? (data as { message: string | string[] }).message
            : 'Unable to sign up';
        throw new Error(
          Array.isArray(message) ? message.join(', ') : message,
        );
      }

      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        }),
      });

      if (!loginResponse.ok) {
        navigate('/login');
        return;
      }

      const loginData: { accessToken: string; user: unknown } =
        await loginResponse.json();
      sessionStorage.setItem('accessToken', loginData.accessToken);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to sign up');
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
            Create your account
          </Typography>

          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>

            <Typography variant="body2" color="primary.main" sx={{ mb: 1, fontWeight: 600 }}>
              First name
            </Typography>
            <OutlinedInput
              fullWidth
              name="firstName"
              placeholder="Jane"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              size="small"
              sx={{ mb: 3, borderRadius: 2 }}
            />

            <Typography variant="body2" color="primary.main" sx={{ mb: 1, fontWeight: 600 }}>
              Last name
            </Typography>
            <OutlinedInput
              fullWidth
              name="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              size="small"
              sx={{ mb: 3, borderRadius: 2 }}
            />

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

            <Typography variant="body2" color="primary.main" sx={{ mb: 1, fontWeight: 600 }}>
              Password
            </Typography>
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
              Sign up
            </Button>

            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" color="secondary.main" underline="hover">
                Sign in
              </Link>
            </Typography>

          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default SignupPage;
