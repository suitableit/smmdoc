'use client';

import ButtonLoader from '@/components/button-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCurrency } from '@/contexts/CurrencyContext';
import axiosInstance from '@/lib/axiosInstance';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  userId: z.string().min(1, { message: 'User ID is required' }),
  amount: z.string().min(1, { message: 'Amount is required' }),
  currency: z.string().min(1, { message: 'Currency is required' }),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddUserFund() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{ id: number; name: string; email: string; username: string }>
  >([]);
  const [searching, setSearching] = useState(false);
  const { rate, availableCurrencies, currentCurrencyData } = useCurrency();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
      amount: '',
      currency: currentCurrencyData?.code || 'USD',
      note: '',
    },
  });

  const searchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const response = await axiosInstance.get(
        `/api/admin/users/search?q=${searchQuery}`
      );
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const selectUser = (user: { id: number; name: string; email: string; username: string }) => {
    form.setValue('userId', user.id.toString());
    setSearchResults([]);
    setSearchQuery(user.username || user.name);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const amountValue = parseFloat(data.amount);
      const selectedCurrency = availableCurrencies?.find(c => c.code === data.currency);
      const currencyRate = selectedCurrency?.rate || 1;
      let amountInUSD = amountValue;
      if (data.currency !== 'USD') {
        amountInUSD = amountValue / currencyRate;
      }
      const amountInBDT = amountInUSD * (rate || 121.45);

      const payload = {
        userId: data.userId,
        amountUSD: amountInUSD.toFixed(2),
        amountBDT: amountInBDT.toFixed(2),
        note: data.note || 'Added by admin',
        status: 'COMPLETED',
      };

      const response = await axiosInstance.post(
        '/api/admin/funds/add',
        payload
      );

      if (response.data.success) {
        toast.success('Funds added successfully');
        form.reset();
        setSearchQuery('');
      } else {
        toast.error(response.data.message || 'Failed to add funds');
      }
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error('Failed to add funds');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Add User Fund</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <form onSubmit={searchUsers} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search-user">Search User</Label>
              <Input
                id="search-user"
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="mt-auto"
              disabled={searching || !searchQuery.trim()}
            >
              {searching ? <ButtonLoader /> : 'Search'}
            </Button>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-2 border rounded-md max-h-48 overflow-y-auto">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => selectUser(user)}
                >
                  <div className="font-medium">{user.username || user.name}</div>
                  <div className="text-sm text-gray-500">{user.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter amount"
                      type="number"
                      step="0.01"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCurrencies?.filter(c => c.enabled).map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Add a note" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !form.getValues().userId}
            >
              {loading ? <ButtonLoader /> : 'Add Funds'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
