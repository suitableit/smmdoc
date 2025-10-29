import z from 'zod';

const createServiceSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  rate: z.string().optional(),
  min_order: z.string().optional(),
  max_order: z.string().optional(),
  perqty: z.string().optional(),
  avg_time: z.string().optional(),
  categoryId: z.string().optional(),
  serviceTypeId: z.string().optional(),
  updateText: z.string().optional(),
  refill: z.boolean().default(false),
  cancel: z.boolean().default(false),
  refillDays: z.number().optional().default(30),
  refillDisplay: z.number().optional().default(24),
  serviceSpeed: z.enum(['slow', 'sometimes_slow', 'normal', 'fast']).default('normal'),
  mode: z.enum(['manual', 'auto']).default('manual'),
  orderLink: z.enum(['username', 'link']).optional().default('username'),
  providerId: z.string().optional(),
  apiServiceId: z.string().optional(),
});

// Edit service schema with optional fields
const editServiceSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  rate: z.string().optional(),
  min_order: z.string().optional(),
  max_order: z.string().optional(),
  perqty: z.string().optional(),
  avg_time: z.string().optional(),
  categoryId: z.string().optional(),
  serviceTypeId: z.string().optional(),
  updateText: z.string().optional(),
  refill: z.boolean().optional(),
  cancel: z.boolean().optional(),
  refillDays: z.number().optional(),
  refillDisplay: z.number().optional(),
  serviceSpeed: z.enum(['slow', 'sometimes_slow', 'normal', 'fast']).optional(),
  mode: z.enum(['manual', 'auto']).optional(),
  orderLink: z.enum(['username', 'link']).optional(),
  providerId: z.string().optional(),
  apiServiceId: z.string().optional(),
});

type CreateServiceSchema = z.infer<typeof createServiceSchema>;
type EditServiceSchema = z.infer<typeof editServiceSchema>;

const createServiceDefaultValues: CreateServiceSchema = {
  name: '',
  description: '',
  rate: '',
  min_order: '',
  max_order: '',
  perqty: '1000',  // Default value 1000 for per quantity
  avg_time: '',
  categoryId: '',
  serviceTypeId: '',
  updateText: '',
  refill: false,
  cancel: false,
  refillDays: 30,
  refillDisplay: 24,
  serviceSpeed: 'normal',
  mode: 'manual',
  orderLink: 'username',
  providerId: '',
  apiServiceId: '',
};

export {
  createServiceDefaultValues,
  createServiceSchema,
  editServiceSchema,
  type CreateServiceSchema,
  type EditServiceSchema
};

