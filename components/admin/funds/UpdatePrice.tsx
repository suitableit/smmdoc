'use client';

import ButtonLoader from '@/components/button-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCurrency } from '@/contexts/CurrencyContext';
import axiosInstance from '@/lib/axiosInstance';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  dollarRate: z.string().min(1, { message: "Dollar rate is required" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function UpdatePrice() {
  const [loading, setLoading] = useState(false);
  const { rate, setCurrency } = useCurrency();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dollarRate: rate ? rate.toString() : '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      
      const response = await axiosInstance.post('/api/admin/settings/update-rate', {
        dollarRate: parseFloat(data.dollarRate),
      });
      
      if (response.data.success) {
        toast.success('Dollar rate updated successfully');
        // Update the global currency context
        await setCurrency('USD'); // Force refresh the rate
      } else {
        toast.error(response.data.message || 'Failed to update dollar rate');
      }
    } catch (error) {
      console.error('Error updating dollar rate:', error);
      toast.error('Failed to update dollar rate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Update Dollar Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dollarRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dollar Rate (BDT)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Write Dollar Rate in BDT"
                      type="number"
                      step="0.01"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? <ButtonLoader /> : 'Update'}
            </Button>
          </form>
        </Form>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Current Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Dollar Rate (BDT)</span>
                  <span className="text-lg">{rate?.toFixed(2) || 'Loading...'}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">১ BDT = USD</span>
                  <span className="text-lg">{rate ? (1 / rate).toFixed(6) : 'Loading...'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 