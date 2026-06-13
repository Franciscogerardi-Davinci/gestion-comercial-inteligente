import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router';

import { getApiErrorMessage } from '../api/apiError';
import { useAuth } from '../features/auth/useAuth';
import { useNotifications } from '../features/notifications/useNotifications';
import { registerFormSchema, type RegisterFormValues } from '../schemas/authSchemas';

export function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const { register: registerUser } = useAuth();
  const { notify } = useNotifications();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      businessName: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    try {
      await registerUser({
        businessName: values.businessName,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });
      notify('Comercio y usuario creados correctamente.');
      navigate('/', { replace: true });
    } catch (error) {
      const message = getApiErrorMessage(error);
      setServerError(message);
      notify(message, 'error');
    }
  });

  return (
    <Stack component="form" spacing={2} onSubmit={onSubmit} noValidate>
      <Stack spacing={0.75} sx={{ mb: 1 }}>
        <Typography variant="h4">Crear cuenta</Typography>
        <Typography color="text.secondary">
          Configure su comercio y comience a organizar la operación.
        </Typography>
      </Stack>
      {serverError && <Alert severity="error">{serverError}</Alert>}
      <TextField
        label="Nombre del comercio"
        error={Boolean(errors.businessName)}
        helperText={errors.businessName?.message}
        {...register('businessName')}
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          label="Nombre"
          error={Boolean(errors.firstName)}
          helperText={errors.firstName?.message}
          {...register('firstName')}
        />
        <TextField
          fullWidth
          label="Apellido"
          error={Boolean(errors.lastName)}
          helperText={errors.lastName?.message}
          {...register('lastName')}
        />
      </Stack>
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
        autoComplete="new-password"
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        {...register('password')}
      />
      <TextField
        label="Confirmar contraseña"
        type="password"
        autoComplete="new-password"
        error={Boolean(errors.confirmPassword)}
        helperText={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
        {isSubmitting ? 'Creando cuenta...' : 'Registrarse'}
      </Button>
      <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center' }}>
        ¿Ya tiene una cuenta?{' '}
        <Link component={RouterLink} to="/login">
          Iniciar sesión
        </Link>
      </Typography>
    </Stack>
  );
}
