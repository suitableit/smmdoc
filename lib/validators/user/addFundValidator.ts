import z from 'zod';

const addFundSchema = z.object({
  method: z.string().min(1, 'Payment method is required'),
  amountUSD: z.string().optional(), // For USD display
  amountBDT: z.string().min(1, 'Amount is required'), // Primary amount in BDT
  amountBDTConverted: z.string().optional(), // For BDT display when USD is primary
  phone: z.string().min(1, 'Phone number is required'),
  totalAmount: z.string(),
  amount: z.string().nonempty('Amount is required'), // Amount in BDT or USD based on the selected currency
});

type AddFundSchema = z.infer<typeof addFundSchema>;

const addFundDefaultValues: AddFundSchema = {
  method: 'uddoktapay',
  amountUSD: '',
  amountBDT: '',
  amountBDTConverted: '',
  phone: '',
  totalAmount: '',
  // totalAmount is calculated based on the selected currency and amount
  amount: '', // Amount in BDT or USD based on the selected currency
};

export { addFundDefaultValues, addFundSchema, type AddFundSchema };
