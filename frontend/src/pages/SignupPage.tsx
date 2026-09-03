import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  IconButton,
  InputAdornment,
  Container,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link as RouterLink } from 'react-router-dom';

const SignupPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Signup submitted:', formData);
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
        <Typography variant="h5" color="secondary.main" fontWeight="bold" sx={{ mb: 3 }}>
          MMDB
        </Typography>

        <Typography variant="h6" fontWeight="bold" color="primary" align="left" width="100%" sx={{ mb: 2 }}>
          Create your account
        </Typography>

        <Box component="form" onSubmit={handleSubmit} width="100%">
          <Box display="flex" gap={2} mb={2}>
            <TextField
              fullWidth
              label="First name"
              name="firstName"
              placeholder="Jane"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Last name"
              name="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Box>

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
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 0, mb: 2 }}
          />

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
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ mt: 3, mb: 3, py: 1.2, fontWeight: 'bold', textTransform: 'none', boxShadow: 'none' }}
          >
            Sign up
          </Button>

          <Box display="flex" gap={1} justifyContent="center">
            <Typography variant="body2" color="text.secondary">
              Already have an account?
            </Typography>
            <Link component={RouterLink} to="/login" variant="body2" color="secondary.main" underline="hover" fontWeight="medium">
              Sign in
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default SignupPage;
