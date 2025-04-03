import z from 'zod';

const createCategorySchema = z.object({
  category_name: z
    .string()
    .nonempty('Category name is required')
    .min(5, { message: 'Category name must be at least 5 characters long' }),
});

type CreateCategorySchema = z.infer<typeof createCategorySchema>;

const createCategoryDefaultValues: CreateCategorySchema = {
  category_name: '',
};

export {
  createCategoryDefaultValues,
  createCategorySchema,
  type CreateCategorySchema,
};
