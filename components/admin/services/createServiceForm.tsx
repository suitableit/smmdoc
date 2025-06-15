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
import axiosInstance from '@/lib/axiosInstance';
import {
  createServiceDefaultValues,
  createServiceSchema,
  CreateServiceSchema,
} from '@/lib/validators/admin/services/services.validator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FaExclamationTriangle, FaPlus, FaSpinner } from 'react-icons/fa';
import { toast } from 'sonner';

export function CreateServiceForm() {
  const { data, error, isLoading } = useGetCategories();
  const [isPending, startTransition] = useTransition();
  const form = useForm<CreateServiceSchema>({
    mode: 'all',
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      ...createServiceDefaultValues,
      mode: 'manual', // Set default mode to manual
    },
  });

  // Watch refill field to control readonly state of refill days and display
  const refillValue = form.watch('refill');

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
        <p className="text-gray-500 text-sm mt-1">
          Please add categories first
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Name - 100% width - REQUIRED */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Service Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <input
                      type="text"
                      placeholder="Enter service name"
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      {...field}
                      disabled={isPending}
                      required
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Service Category - 50% width - REQUIRED */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Service Category <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <select
                      className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                      {...field}
                      disabled={isPending}
                      required
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

            {/* Service Type - 50% width - REQUIRED */}
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Service Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <select
                      className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                      {...field}
                      disabled={isPending}
                      required
                    >
                      <option value="">Select Service Type</option>
                      <option value="followers">Followers</option>
                      <option value="likes">Likes</option>
                      <option value="views">Views</option>
                      <option value="comments">Comments</option>
                      <option value="shares">Shares</option>
                      <option value="other">Other</option>
                    </select>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Mode - 100% width - REQUIRED with default manual, no "Select Mode" option */}
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Mode <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <select
                      className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                      {...field}
                      disabled={isPending}
                      required
                    >
                      <option value="manual">Manual</option>
                      <option value="auto">Auto (API)</option>
                    </select>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Service Price - 33% width - special grid - REQUIRED */}
            <div className="md:col-span-2 grid grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Service Price{' '}
                      <span className="text-red-500">* (Always USD Price)</span>
                    </FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        placeholder="Enter service price"
                        className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-nonew-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        {...field}
                        disabled={isPending}
                        required
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              {/* Minimum Order - 33% width - REQUIRED */}
              <FormField
                control={form.control}
                name="min_order"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Minimum Order <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        min={0}
                        placeholder="Enter minimum order"
                        className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-nonew-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        {...field}
                        disabled={isPending}
                        required
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              {/* Maximum Order - 33% width - REQUIRED */}
              <FormField
                control={form.control}
                name="max_order"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Maximum Order <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        min={0}
                        placeholder="Enter maximum order"
                        className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-nonew-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        {...field}
                        disabled={isPending}
                        required
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            {/* Refill - 100% width - REQUIRED */}
            <FormField
              control={form.control}
              name="refill"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Refill <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <select
                      className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                      {...field}
                      disabled={isPending}
                      required
                    >
                      <option value="off">Off</option>
                      <option value="on">On</option>
                    </select>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Refill Days - 50% width (readonly if refill is off) - REQUIRED */}
            <FormField
              control={form.control}
              name="refillDays"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Refill Days <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      min={0}
                      placeholder="Enter refill days"
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-nonew-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      {...field}
                      disabled={isPending || refillValue === 'off'}
                      readOnly={refillValue === 'off'}
                      required
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Refill Display - 50% width (readonly if refill is off) - REQUIRED */}
            <FormField
              control={form.control}
              name="refillDisplay"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Refill Display (in hours){' '}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      min={0}
                      placeholder="Enter refill display hours"
                      className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-nonew-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      {...field}
                      disabled={isPending || refillValue === 'off'}
                      readOnly={refillValue === 'off'}
                      required
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Cancel - 50% width - REQUIRED */}
            <FormField
              control={form.control}
              name="cancel"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Cancel <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <select
                      className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                      {...field}
                      disabled={isPending}
                      required
                    >
                      <option value="off">Off</option>
                      <option value="on">On</option>
                    </select>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Personalized Service - 50% width - REQUIRED */}
            <FormField
              control={form.control}
              name="personalizedService"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Personalized Service <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <select
                      className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                      {...field}
                      disabled={isPending}
                      required
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Order Link - 50% width - REQUIRED */}
            <FormField
              control={form.control}
              name="orderLink"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Order Link <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <select
                      className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                      {...field}
                      disabled={isPending}
                      required
                    >
                      <option value="link">Link</option>
                      <option value="username">Username</option>
                    </select>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Service Speed - 50% width - REQUIRED */}
            <FormField
              control={form.control}
              name="serviceSpeed"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Service Speed <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <select
                      className="form-field w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                      {...field}
                      disabled={isPending}
                      required
                    >
                      <option value="">Select Service Speed</option>
                      <option value="slow">Slow</option>
                      <option value="sometimes_slow">Sometimes Slow</option>
                      <option value="normal">Normal</option>
                      <option value="fast">Fast</option>
                    </select>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />
          </div>

          {/* Service Description - 100% width - REQUIRED */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Service Description <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Enter service description"
                    className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    {...field}
                    disabled={isPending}
                    required
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
