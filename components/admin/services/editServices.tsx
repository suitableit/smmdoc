/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useGetCategories } from '@/hooks/categories-fetch';
import { useGetServicesId } from '@/hooks/service-fetch-id';
import axiosInstance from '@/lib/axiosInstance';
import {
  createServiceDefaultValues,
  createServiceSchema,
  CreateServiceSchema,
} from '@/lib/validators/admin/services/services.validator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'next-themes';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FaExclamationTriangle, FaSave, FaSpinner } from 'react-icons/fa';
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
            push('/admin/services');
          } else {
            toast.error(res.data.error);
          }
        });
    });
  };

  if (isLoading || serviceLoading || !serviceData?.data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2">
          <FaSpinner className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-lg font-medium">Loading service data...</span>
        </div>
      </div>
    );
  }

  if (error || serviceError) {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600 font-medium">Error loading service data</p>
        <p className="text-gray-500 text-sm mt-1">{error || serviceError}</p>
      </div>
    );
  }

  if (!data || !serviceData) {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">No service data available</p>
        <p className="text-gray-500 text-sm mt-1">
          Service not found or data unavailable
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Selection */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Category Name
                  </FormLabel>
                  <FormControl>
                    <select
                      className="form-select w-full"
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
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Service Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Service Name
                  </FormLabel>
                  <FormControl>
                    <input
                      type="text"
                      placeholder="Enter service name"
                      className="form-field w-full"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Service Rate */}
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Service Rate{' '}
                    <span className="text-red-500">(Always USD Price)</span>
                  </FormLabel>
                  <FormControl>
                    <input
                      type="text"
                      placeholder="Enter service rate"
                      className="form-field w-full"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Per Quantity */}
            <FormField
              control={form.control}
              name="perqty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Per Quantity{' '}
                    <span className="text-red-500">(Like 1000 per 5 USD)</span>
                  </FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      min={0}
                      placeholder="1000"
                      className="form-field w-full"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Minimum Order */}
            <FormField
              control={form.control}
              name="min_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Minimum Order
                  </FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      min={0}
                      placeholder="Enter minimum order"
                      className="form-field w-full"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Maximum Order */}
            <FormField
              control={form.control}
              name="max_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Maximum Order
                  </FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      min={0}
                      placeholder="Enter maximum order"
                      className="form-field w-full"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Average Time */}
            <FormField
              control={form.control}
              name="avg_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Average Time
                  </FormLabel>
                  <FormControl>
                    <input
                      type="text"
                      placeholder="Enter average time (e.g., 24-48 hours)"
                      className="form-field w-full"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Update Text */}
            <FormField
              control={form.control}
              name="updateText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Update Text
                  </FormLabel>
                  <FormControl>
                    <input
                      type="text"
                      placeholder="Describe the changes made to the service"
                      className="form-field w-full"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />
          </div>

          {/* Service Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Service Description
                </FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Enter service description"
                    className="form-field w-full min-h-[120px] resize-y"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary flex items-center gap-2 px-8 py-3 text-sm font-medium"
            >
              {isPending ? (
                <>
                  <FaSpinner className="h-4 w-4 animate-spin" />
                  Updating Service...
                </>
              ) : (
                <>
                  <FaSave className="h-4 w-4" />
                  Update Service
                </>
              )}
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
