import z from 'zod';

const orderSchema = z.object({
  link: z.string().nonempty('Link is required!').url(),
  qty: z
    .number()
    .nonnegative('Quantity is required!')
    .int('Quantity must be an integer!')
    .positive('Quantity must be a positive number!'),
  price: z
    .number()
    .nonnegative('Price is required!')
    .int('Price must be an integer!')
    .positive('Price must be a positive number!'),
});

type OrderSchema = z.infer<typeof orderSchema>;

const oderDefaultValues: OrderSchema = {
  link: '',
  qty: 0,
  price: 0,
};

export { oderDefaultValues, orderSchema, type OrderSchema };
