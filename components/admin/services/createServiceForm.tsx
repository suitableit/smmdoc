/* eslint-disable @typescript-eslint/no-explicit-any */
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
import SelectMe from '@/components/ui/select';
import { useGetCategories } from '@/hooks/categories-fetch';
import axiosInstance from '@/lib/axiosInstance';
import {
  createServiceDefaultValues,
  createServiceSchema,
  CreateServiceSchema,
} from '@/lib/validators/admin/services/services.validator';
import { zodResolver } from '@hookform/resolvers/zod';
import JoditEditor from 'jodit-react';
import { useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function CreateServiceForm() {
  const { data, error, isLoading } = useGetCategories();
  const [isPending, startTransition] = useTransition();
  const form = useForm<CreateServiceSchema>({
    mode: 'all',
    resolver: zodResolver(createServiceSchema),
    defaultValues: createServiceDefaultValues,
  });
  const onSubmit: SubmitHandler<CreateServiceSchema> = async (values) => {
    startTransition(() => {
      // handle form submission
      axiosInstance.post('/api/admin/services', values).then((res) => {
        if (res.data.success) {
          form.reset();
          toast.success(res.data.message);
        } else {
          toast.error(res.data.error);
        }
      });
    });
  };
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle></CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <SelectMe {...field} disabled={isPending}>
                      <option value={''} hidden>
                        Select Service Category
                      </option>
                      {data?.data?.map((category: any) => (
                        <option key={category.id} value={category.id}>
                          {category?.category_name}
                        </option>
                      ))}
                    </SelectMe>
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage className="-mt-3" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Service Name"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage className="-mt-3" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Description</FormLabel>
                  <FormControl>
                    <JoditEditor
                      value={field.value}
                      onChange={field.onChange}
                      tabIndex={1}
                    />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage className="-mt-3" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Rate</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Service Rate"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage className="-mt-3" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="min_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Minimum Order"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage className="-mt-3" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Maximum Order"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage className="-mt-3" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avg_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Average Time</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Average Time"
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
