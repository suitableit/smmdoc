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
import { fetcher } from '@/lib/utils';
import {
  createCategoryDefaultValues,
  createCategorySchema,
  CreateCategorySchema,
} from '@/lib/validators/admin/categories/categories.validator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';

export default function EditCategory({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const { push } = useRouter();
  // fetch category data
  const { data, error, isLoading } = useSWR(
    `/api/admin/categories/update-categories?id=${id}`,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
    }
  );
  const form = useForm<CreateCategorySchema>({
    mode: 'all',
    resolver: zodResolver(createCategorySchema),
    defaultValues: createCategoryDefaultValues,
  });
  const { reset } = form;
  useEffect(() => {
    if (data?.data) {
      reset({
        category_name: data?.data?.category_name,
      });
    }
  }, [data, reset]);
  const onSubmit: SubmitHandler<CreateCategorySchema> = async (values) => {
    startTransition(() => {
      // handle form submission update
      axiosInstance
        .put(`/api/admin/categories/update-categories?id=${id}`, {
          ...values,
        })
        .then((res) => {
          if (res.data.success) {
            toast.success(res.data.message);
            mutate(`/api/admin/categories/update-categories?id=${id}`);
            push('/dashboard/admin/categories');
          } else {
            toast.error(res.data.error);
          }
        });
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching category</div>;
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
