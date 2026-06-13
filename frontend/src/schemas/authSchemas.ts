import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().trim().email('Ingrese un correo valido.'),
  password: z.string().min(1, 'Ingrese su contrasena.'),
});

export const registerFormSchema = z
  .object({
    businessName: z.string().trim().min(2, 'Ingrese el nombre del comercio.'),
    firstName: z.string().trim().min(2, 'Ingrese su nombre.'),
    lastName: z.string().trim().min(2, 'Ingrese su apellido.'),
    email: z.string().trim().email('Ingrese un correo valido.'),
    password: z.string().min(8, 'Use al menos 8 caracteres.').max(72),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contrasenas no coinciden.',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
