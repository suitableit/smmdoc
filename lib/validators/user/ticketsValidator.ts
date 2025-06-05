import * as z from 'zod';

export const Ticketchema = z.object({
  subject: z.string().min(5, {
    message: 'Subject must be at least 5 characters',
  }),
  message: z.string().min(20, {
    message: 'Message must be at least 20 characters',
  }),
  file: z.any().optional(),
});

export type Ticketchema = z.infer<typeof Ticketchema>;

export const DefaultValues: Partial<Ticketchema> = {
  subject: '',
  message: '',
  file: undefined,
};
