import * as z from 'zod';

export const ticketSchema = z.object({
  subject: z.string().min(5, {
    message: 'Subject must be at least 5 characters',
  }),
  message: z.string().min(20, {
    message: 'Message must be at least 20 characters',
  }),
  file: z.any().optional(),
});

export type TicketSchema = z.infer<typeof ticketSchema>;

export const DefaultValues: Partial<TicketSchema> = {
  subject: '',
  message: '',
  file: undefined,
}; 