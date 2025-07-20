import z from 'zod';

const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Username or Email is required')
    .refine((value) => {
      // Allow either email format or username format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const usernameRegex = /^[a-zA-Z0-9._-]+$/;

      // If it contains @, validate as email
      if (value.includes('@')) {
        return emailRegex.test(value);
      }

      // Otherwise validate as username
      return usernameRegex.test(value) && value.length >= 3;
    }, {
      message: (val) => {
        if (val.input.includes('@')) {
          return 'Please enter a valid email address';
        }
        return 'Username must be at least 3 characters and contain only letters, numbers, dots, underscores, and hyphens';
      }
    }),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(5, 'Password must be at least 5 characters'),
  code: z.optional(z.string()),
});

type SignInSchema = z.infer<typeof signInSchema>;

const signInDefaultValues: SignInSchema = {
  email: '',
  password: '',
  code: '',
};

export { signInDefaultValues, signInSchema, type SignInSchema };

const signUpSchema = z
  .object({
    username: z.string().nonempty('Username is required'),
    name: z.string().nonempty('Name is required'),
    email: z
      .string()
      .nonempty('Email is required')
      .email('Invalid email address'),
    password: z
      .string()
      .nonempty('Password is required')
      .min(5, 'Password must be at least 5 characters'),
    confirmPassword: z
      .string()
      .nonempty('Confirm password is required')
      .min(5, 'Confirm password must be at least 5 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignUpSchema = z.infer<typeof signUpSchema>;

const signUpDefaultValues: SignUpSchema = {
  username: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export { signUpDefaultValues, signUpSchema, type SignUpSchema };

const resetSchema = z.object({
  email: z
    .string()
    .nonempty('Email is required')
    .email('Invalid email address'),
});

type ResetSchema = z.infer<typeof resetSchema>;

const resetDefaultValues: ResetSchema = {
  email: '',
};

export { resetDefaultValues, resetSchema, type ResetSchema };

const newPasswordSchema = z.object({
  password: z
    .string()
    .nonempty('Password is required')
    .min(5, 'Password must be at least 5 characters'),
});

type NewPasswordSchema = z.infer<typeof newPasswordSchema>;

const newPasswordDefaultValues: NewPasswordSchema = {
  password: '',
};

// Zod schema for password validation
const passwordSchema = z
  .object({
    currentPass: z.string().min(1, 'Current password is required'),
    newPass: z.string().min(5, 'New password must be at least 5 characters'),
    confirmNewPass: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPass === data.confirmNewPass, {
    message: 'Passwords do not match',
    path: ['confirmNewPass'],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export {
    newPasswordDefaultValues,
    newPasswordSchema,
    passwordSchema,
    type NewPasswordSchema,
    type PasswordForm
};

