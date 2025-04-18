import z from 'zod';

const addFundSchema = z.object({
  method: z.string().nonempty('Method is required!'),
  phone: z
    .string()
    .nonempty('Phone number is required!')
    .regex(/^(?:\+?88)?01[3-9]\d{8}$/, 'Invalid phone number!')
    .min(11, 'Phone number must be at least 11 digits long!')
    .max(14, 'Phone number must be at most 14 digits long!'),
  amount: z
    .string()
    .nonempty('Amount is required!')
    .regex(/^\d+$/, 'Amount must be a number!'),
});

type AddFundSchema = z.infer<typeof addFundSchema>;

const addFundDefaultValues: AddFundSchema = {
  method: 'uddoktapay',
  phone: '',
  amount: '',
};

export { addFundDefaultValues, addFundSchema, type AddFundSchema };
