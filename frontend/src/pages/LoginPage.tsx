import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  IconButton,
  InputAdornment,
  Container,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
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
    console.log('Login submitted:', formData);

    try {
      const response = await fetch('${API_BASE_URL}/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          keepMeSignedIn: formData.keepMeSignedIn,
        }),
      });

      if (!response.ok) {
        // If status is 401, show invalid credentials
        throw new Error('Invalid email or password');
      }

      const data: { accessToken: string; user: unknown } = await response.json();
      
      // Destructure the token and user data from your backend response
      const { accessToken, user } = data;

      // Acceptance Criteria: "Keep me signed in" logic
      if (formData.keepMeSignedIn) {
        localStorage.setItem('accessToken', accessToken); // Survives browser restarts
      } else {
        sessionStorage.setItem('accessToken', accessToken); // Cleared when tab is closed
      }
      
      // Store user details for the Header (Profile picture, name)
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to homepage
      navigate('/');
      
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    }
  };


  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8, mb: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '2px solid',
          borderColor: 'secondary.main',
          borderRadius: 1,
          p: 4,
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h5" color="secondary.main" sx={{ mb: 3, fontWeight: 'bold' }}>
          MMDB
        </Typography>

        <Typography
          variant="h6"
          color="primary"
          align="left"
          sx={{ mb: 2, width: '100%', fontWeight: 'bold' }}
        >
          Sign in
        </Typography>

          {error && (
                    <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                      {error}
                    </Typography>
                  )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={handleInputChange}
            required
            margin="normal"
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              mt: 1,
            }}
          >
            <Link href="#" variant="caption" color="secondary.main" underline="hover" sx={{ ml: 'auto', mb: 0.5 }}>
              Forgot password?
            </Link>
          </Box>
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            required
            size="small"
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ mt: 3, mb: 1, py: 1.2, fontWeight: 'bold', textTransform: 'none', boxShadow: 'none' }}
          >
            Sign in
          </Button>

          <FormControlLabel
            control={
              <Checkbox
                name="keepMeSignedIn"
                checked={formData.keepMeSignedIn}
                onChange={handleInputChange}
                color="secondary"
                size="small"
              />
            }
            label={<Typography variant="body2" color="text.secondary">Keep me signed in</Typography>}
            sx={{ mt: 1, mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              New to MMDB?
            </Typography>
            <Link
              component={RouterLink}
              to="/signup"
              variant="body2"
              color="secondary.main"
              underline="hover"
              sx={{ fontWeight: 'medium' }}
            >
              Sign up
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
