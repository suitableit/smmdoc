/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
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
import { 
  FaPlus,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2">
          <FaSpinner className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-lg font-medium">Loading categories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600 font-medium">Error loading categories</p>
        <p className="text-gray-500 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">No categories available</p>
        <p className="text-gray-500 text-sm mt-1">Please add categories first</p>
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
                  <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
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
                  <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Service Name
                  </FormLabel>
                  <FormControl>
                    <input
                      type="text"
                      placeholder="Enter service name"
                      className="form-input w-full"
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
                  <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Service Rate <span className="text-red-500">(Always USD Price)</span>
                  </FormLabel>
                  <FormControl>
                    <input
                      type="text"
                      placeholder="Enter service rate"
                      className="form-input w-full"
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
                  <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Per Quantity <span className="text-red-500">(Like 1000 per 5 USD)</span>
                  </FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      min={0}
                      placeholder="1000"
                      className="form-input w-full"
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
                  <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Minimum Order
                  </FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      min={0}
                      placeholder="Enter minimum order"
                      className="form-input w-full"
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
                  <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Maximum Order
                  </FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      min={0}
                      placeholder="Enter maximum order"
                      className="form-input w-full"
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
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Average Time
                  </FormLabel>
                  <FormControl>
                    <input
                      type="text"
                      placeholder="Enter average time (e.g., 24-48 hours)"
                      className="form-input w-full"
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
                <FormLabel className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Service Description
                </FormLabel>
                <FormControl>
                  <div className="border border-gray-300 rounded-md overflow-hidden">
                    <JoditEditor
                      value={field.value}
                      onChange={field.onChange}
                      tabIndex={1}
                    />
                  </div>
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
                  Creating Service...
                </>
              ) : (
                <>
                  <FaPlus className="h-4 w-4" />
                  Create Service
                </>
              )}
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}