'use client';
import ButtonLoader from '@/components/button-loader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import axiosInstance from '@/lib/axiosInstance';
import {
  createCategoryDefaultValues,
  createCategorySchema,
  CreateCategorySchema,
} from '@/lib/validators/admin/categories/categories.validator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function CreateCategoryForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<CreateCategorySchema>({
    mode: 'all',
    resolver: zodResolver(createCategorySchema),
    defaultValues: createCategoryDefaultValues,
  });
  const onSubmit: SubmitHandler<CreateCategorySchema> = async (values) => {
    startTransition(() => {
      // handle form submission
      axiosInstance.post('/api/admin/categories', values).then((res) => {
        if (res.data.success) {
          form.reset();
          toast.success(res.data.message);
        } else {
          toast.error(res.data.error);
        }
      });
    });
  };
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle></CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="category_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Category Name"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage className="-mt-3" />
                </FormItem>
              )}
            />
            <Button
              disabled={isPending}
              className="w-full inline-flex items-center cursor-pointer"
              type="submit"
            >
              {isPending ? <ButtonLoader /> : 'Submit'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between"></CardFooter>
    </Card>
  );
}
