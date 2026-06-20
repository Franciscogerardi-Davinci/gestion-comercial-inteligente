import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router';

import { getApiErrorMessage } from '../api/apiError';
import { useAuth } from '../features/auth/useAuth';
import { useNotifications } from '../features/notifications/useNotifications';
import { loginFormSchema, type LoginFormValues } from '../schemas/authSchemas';

export function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const { login } = useAuth();
  const { notify } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    try {
      await login(values);
      notify('Sesión iniciada correctamente.');
      const destination =
        (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';
      navigate(destination, { replace: true });
    } catch (error) {
      const message = getApiErrorMessage(error);
      setServerError(message);
      notify(message, 'error');
    }
  });

  return (
    <Stack component="form" spacing={2.5} onSubmit={onSubmit} noValidate>
      <Stack spacing={0.75} sx={{ mb: 1 }}>
        <Typography variant="h4">Bienvenido</Typography>
        <Typography color="text.secondary">
          Ingrese sus credenciales para acceder al panel de gestión.
        </Typography>
      </Stack>
      {serverError && <Alert severity="error">{serverError}</Alert>}
      <TextField
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
        {isSubmitting ? 'Ingresando...' : 'Ingresar'}
      </Button>
      <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center' }}>
        ¿No tiene una cuenta?{' '}
        <Link component={RouterLink} to="/register">
          Registrarse
        </Link>
      </Typography>
    </Stack>
  );
}
