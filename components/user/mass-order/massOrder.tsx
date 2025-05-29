'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useState } from 'react';
import { toast } from 'sonner';

export default function MassOrder() {
  const user = useCurrentUser();
  const { currency, rate: currencyRate } = useCurrency();
  const [orders, setOrders] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  // Parse and validate the orders text
  const parseOrders = (text: string) => {
    if (!text.trim()) {
      setTotalOrders(0);
      setTotalPrice(0);
      return;
    }

    const lines = text.trim().split('\n');
    let validLines = 0;
    let totalAmount = 0;

    lines.forEach(line => {
      const parts = line.trim().split('|');
      if (parts.length >= 3) {
        const serviceId = parts[0].trim();
        const link = parts[1].trim();
        const quantity = parseInt(parts[2].trim(), 10);

        // TODO: In a real implementation, we would fetch the service price
        // For now, let's use a placeholder price
        const price = 0.5; // Placeholder price per 1000 units
        
        if (!isNaN(quantity) && link.startsWith('http')) {
          validLines++;
          totalAmount += (price * quantity / 1000);
        }
      }
    });

    // Apply currency conversion if needed
    if (currency === 'BDT' && currencyRate) {
      totalAmount *= currencyRate;
    }

    setTotalOrders(validLines);
    setTotalPrice(totalAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (totalOrders === 0) {
      toast.error("No valid orders found. Please check your input format.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real implementation, you would send the orders to your API
      // const response = await axiosInstance.post('/api/user/orders/mass', {
      //   orders: orders.trim().split('\n'),
      //   userId: user?.id
      // });

      toast.success(`Successfully submitted ${totalOrders} orders!`);
      setOrders('');
      setTotalOrders(0);
      setTotalPrice(0);
    } catch (error) {
      toast.error("Failed to submit orders. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Mass Order</CardTitle>
        <CardDescription>
          Submit multiple orders at once using the format: service_id|link|quantity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="orders">Orders (One per line)</Label>
            <Textarea
              id="orders"
              placeholder="service_id|link|quantity
100|https://example.com/post1|500
101|https://example.com/post2|1000"
              className="min-h-[200px] font-mono"
              value={orders}
              onChange={(e) => {
                setOrders(e.target.value);
                parseOrders(e.target.value);
              }}
              required
            />
            <p className="text-sm text-gray-500">
              Format each line as: <code>service_id|link|quantity</code>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="text-sm font-medium">Total Orders</div>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="text-sm font-medium">Total Price</div>
              <div className="text-2xl font-bold">
                {currency === 'USD' ? '$' : '৳'}{totalPrice.toFixed(2)}
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || totalOrders === 0}
          >
            {isSubmitting ? 'Processing...' : 'Submit Orders'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 