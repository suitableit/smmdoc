import z from 'zod';

const createServiceSchema = z.object({
  name: z
    .string()
    .nonempty('Service name is required')
    .min(3, 'Service name must be at least 3 characters long'),
  description: z.string().nonempty('Service description is required'),
  rate: z
    .string()
    .nonempty('Service rate is required')
    .refine(
      (value) => !isNaN(Number(value)) && Number(value) > 0,
      'Service rate must be a positive number'
    ),
  min_order: z
    .string()
    .nonempty('Minimum order is required')
    .refine(
      (value) => !isNaN(Number(value)) && Number(value) > 0,
      'Minimum order must be a positive number'
    ),
  max_order: z
    .string()
    .nonempty('Maximum order is required')
    .refine(
      (value) => !isNaN(Number(value)) && Number(value) > 0,
      'Maximum order must be a positive number'
    ),
  avg_time: z.string().nonempty('Average time is required'),
  categoryId: z.string().nonempty('Category ID is required'),
  updateText: z.optional(z.string()),
});

type CreateServiceSchema = z.infer<typeof createServiceSchema>;

const createServiceDefaultValues: CreateServiceSchema = {
  name: '',
  description: '',
  rate: '',
  min_order: '',
  max_order: '',
  avg_time: '',
  categoryId: '',
  updateText: '',
};

export {
  createServiceDefaultValues,
  createServiceSchema,
  type CreateServiceSchema,
};
