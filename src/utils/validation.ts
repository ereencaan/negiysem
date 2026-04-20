import { z } from 'zod';

const strongPasswordSchema = z
  .string()
  .min(8, 'validation.password_min')
  .regex(/[a-z]/, 'validation.password_lowercase')
  .regex(/[A-Z]/, 'validation.password_uppercase')
  .regex(/[0-9]/, 'validation.password_number')
  .regex(/[^A-Za-z0-9]/, 'validation.password_special');

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'validation.email_required')
    .email('validation.email_invalid'),
  password: z
    .string()
    .min(1, 'validation.password_required'),
});

export const registerUserSchema = z
  .object({
    name: z.string().min(1, 'validation.name_required'),
    email: z
      .string()
      .min(1, 'validation.email_required')
      .email('validation.email_invalid'),
    phone: z.string().optional(),
    password: strongPasswordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'validation.password_mismatch',
    path: ['passwordConfirm'],
  });

export const createStylistProfileSchema = z.object({
  bio: z.string().min(1, 'validation.bio_required'),
  cvText: z.string().optional(),
  instagramUrl: z.string().optional(),
  pricePerOutfit: z
    .number({ error: 'validation.price_required' })
    .min(1, 'validation.price_min'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'validation.email_required')
    .email('validation.email_invalid'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterUserFormData = z.infer<typeof registerUserSchema>;
export type CreateStylistProfileFormData = z.infer<typeof createStylistProfileSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
