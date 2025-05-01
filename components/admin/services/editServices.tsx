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
import { useGetCategories } from '@/hooks/categories-fetch';
import { useGetServicesId } from '@/hooks/service-fetch-id';
import axiosInstance from '@/lib/axiosInstance';
import {
  createServiceDefaultValues,
  createServiceSchema,
  CreateServiceSchema,
} from '@/lib/validators/admin/services/services.validator';
import { zodResolver } from '@hookform/resolvers/zod';
import JoditEditor from 'jodit-react';
import { useTheme } from 'next-themes';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { mutate } from 'swr';

export function EditServiceForm() {
  const isDark = useTheme().theme === 'dark';
  const { id } = useParams();
  const { push } = useRouter();
  const { data, error, isLoading } = useGetCategories();
  // fetch service data
  const {
    data: serviceData,
    error: serviceError,
    isLoading: serviceLoading,
  } = useGetServicesId(id as string);
  const [isPending, startTransition] = useTransition();
  const form = useForm<CreateServiceSchema>({
    mode: 'all',
    resolver: zodResolver(createServiceSchema),
    defaultValues: createServiceDefaultValues,
  });
  const { reset } = form;
  useEffect(() => {
    if (serviceData?.data && data?.data) {
      reset({
        categoryId: serviceData.data.categoryId || '',
        name: serviceData.data.name || '',
        description: serviceData.data.description || '',
        rate: String(serviceData.data.rate) || '',
        perqty: String(serviceData.data.perqty) || '0',
        min_order: String(serviceData.data.min_order) ?? 0,
        max_order: String(serviceData.data.max_order) ?? 0,
        avg_time: String(serviceData.data.avg_time) || '',
        updateText: serviceData.data.updateText || '',
      });
    }
  }, [data, reset, serviceData]);

  const onSubmit: SubmitHandler<CreateServiceSchema> = async (values) => {
    startTransition(() => {
      // handle form submission update
      axiosInstance
        .put(`/api/admin/services/update-services?id=${id}`, {
          ...values,
        })
        .then((res) => {
          if (res.data.success) {
            toast.success(res.data.message);
            mutate(`/api/admin/services/update-services?id=${id}`);
            push('/dashboard/admin/services');
          } else {
            toast.error(res.data.error);
          }
        });
    });
  };
  if (isLoading || serviceLoading || !serviceData?.data)
    return <div>Loading...</div>;
  if (error || serviceError) return <div>Error: {error}</div>;
  if (!data || !serviceData) return <div>No data</div>;
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
                    <select
                      className="w-full h-10 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      {...field}
                      disabled={isPending}
                    >
                      <option value={''} hidden>
                        Select Service Category
                      </option>
                      {data?.data?.map((category: any) => (
                        <option key={category.id} value={category.id}>
                          {category?.category_name}
                        </option>
                      ))}
                    </select>
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
                      ref={field.ref}
                      className={`${isDark ? 'jodit-wysiwyg' : ''}`}
                      onBlur={(newContent) => field.onChange(newContent)}
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
                  <FormLabel>
                    Service Rate (
                    <span className="text-red-500">Always USD Price Input</span>
                    )
                  </FormLabel>
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
              name="perqty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Per Quantity (
                    <span className="text-red-500">Like 1000 per 5 usd</span>)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="1000 per 5 usd"
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
            <FormField
              control={form.control}
              name="updateText"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Update Text (Describe the changes made to the service)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Update Text"
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
