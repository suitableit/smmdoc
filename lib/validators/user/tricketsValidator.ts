import z from 'zod';

const tricketSchema = z.object({
  subject: z
    .string()
    .nonempty('Subject is required!')
    .min(5, 'Subject must be at least 5 characters!')
    .max(300, 'Subject must be less than 300 characters!'),
  message: z
    .string()
    .nonempty('Message is required!')
    .min(10, 'Message must be at least 10 characters!')
    .max(5000, 'Message must be less than 5000 characters!'),

  file: z
    .any()
    .optional()
    .refine((file) => file?.size <= 5 * 1024 * 1024, {
      message: 'File size must be less than 5MB!',
    })
    .refine(
      (file) =>
        ['image/jpg', 'image/jpeg', 'image/png', 'application/pdf'].includes(
          file?.type
        ),
      {
        message: 'File type must be JPG, JPEG, PNG, or PDF!',
      }
    ),
});

type TricketSchema = z.infer<typeof tricketSchema>;

const DefaultValues: TricketSchema = {
  subject: '',
  message: '',
  file: undefined,
};

export { DefaultValues, tricketSchema, type TricketSchema };

