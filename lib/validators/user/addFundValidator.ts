import z from 'zod';

const addFundSchema = z.object({
  method: z.string().min(1, 'Payment method is required'),
  amountUSD: z.string().optional(), // For USD display
  amountBDT: z.string().min(1, 'Amount is required'), // Primary amount in BDT
  amountBDTConverted: z.string().optional(), // For BDT display when USD is primary
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(14, 'Phone number must not exceed 14 digits')
    .refine((value) => /^\d{10,14}$/.test(value.replace(/\D/g, '')), {
      message: 'Please enter a valid phone number (digits only)',
    }),
  amount: z.string().nonempty('Amount is required'), // Amount in BDT or USD based on the selected currency
});

type AddFundSchema = z.infer<typeof addFundSchema>;

const addFundDefaultValues: AddFundSchema = {
  method: 'uddoktapay',
  amountUSD: '',
  amountBDT: '',
  amountBDTConverted: '',
  phone: '',
  amount: '', // Amount in BDT or USD based on the selected currency
};

export { addFundDefaultValues, addFundSchema, type AddFundSchema };

