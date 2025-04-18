/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useGetCategories } from '@/hooks/categories-fetch';
import { useCurrentUser } from '@/hooks/use-current-user';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { BsExclamationCircleFill } from 'react-icons/bs';
import { toast } from 'sonner';

export default function NewOrder() {
  const user = useCurrentUser();
  const {
    data: category,
    error: categoryError,
    isLoading: categoryLoading,
  } = useGetCategories();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [qty, setQty] = useState(0);
  const [link, setLink] = useState('');
  const [services, setServices] = useState<
    {
      id: string;
      name: string;
      description?: string;
      min_order?: number;
      max_order?: number;
      rate?: number;
      avg_time?: string;
    }[]
  >([]);
  const [selectedService, setSelectedService] = useState<string>('');
  useEffect(() => {
    if (selectedCategory) {
      axios
        .post('/api/admin/services/catId-by-services', {
          categoryId: selectedCategory,
        })
        .then((res) => {
          const fetchedServices = res?.data?.data || [];
          setServices(fetchedServices);
          if (fetchedServices.length > 0) {
            setSelectedService(fetchedServices[0].id);
          } else {
            setSelectedService('');
          }
        })
        .catch(() => {
          toast.error('Error fetching services');
        });
    }
  }, [selectedCategory]);
  function decodeHTML(html: string) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  const orderData = {
    link: link || '',
    qty: qty || 0,
    price: (services?.find((s) => s.id === selectedService)?.rate ?? 0) * qty,
    serviceId: selectedService,
    categoryId: selectedCategory,
    userId: user?.id,
    avg_time: services?.find((s) => s.id === selectedService)?.avg_time || '',
  };

  // Handle form submission
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(orderData);
  };
  if (categoryError) return <div>Error loading</div>;
  if (categoryLoading) return <div>Loading...</div>;
  if (!category) return <div>No data available</div>;
  return (
    <Card className="w-full max-w-2xl space-y-4 gap-0">
      <CardHeader>
        <CardTitle>Create Order</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search Mockups, Logos..."
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                defaultValue=""
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedService('');
                  setQty(0);
                }}
              >
                {category?.data?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="services">Services</Label>
              <select
                id="services"
                className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                defaultValue=""
                onChange={(e) => {
                  setSelectedService(e.target.value);
                  setQty(0);
                }}
                disabled={!selectedCategory}
                required
              >
                {services?.map((service: any) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <div
                dangerouslySetInnerHTML={{
                  __html: decodeHTML(
                    services?.find((s) => s.id === selectedService)
                      ?.description || ''
                  ),
                }}
                className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                id="description"
              ></div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="link">Link</Label>
              <input
                type="url"
                id="link"
                className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
                required
                onChange={(e) => {
                  setLink(e.target.value);
                }}
                pattern="https?://.+"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="qty">Quantity</Label>
              <input
                type="number"
                id="qty"
                className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Quantity"
                onChange={(e) =>
                  e.target.value ? setQty(parseInt(e.target.value)) : setQty(0)
                }
                min={
                  services?.find((s) => s.id === selectedService)?.min_order ||
                  0
                }
                max={
                  services?.find((s) => s.id === selectedService)?.max_order ||
                  0
                }
                step={1}
                value={qty}
              />
              <span className="text-xs">
                Min:{' '}
                {services?.find((s) => s.id === selectedService)?.min_order ||
                  0}{' '}
                - Max:{' '}
                {services?.find((s) => s.id === selectedService)?.max_order ||
                  0}
              </span>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="avg_time">
                Average time
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <BsExclamationCircleFill className="text-gray-500 ms-1" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs text-justify w-48">
                        The average completion time is calculated based on the
                        completion times of the latest orders.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <input
                type="text"
                id="avg_time"
                readOnly
                disabled
                className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
                value={
                  services?.find((s) => s.id === selectedService)?.avg_time ||
                  ''
                }
                placeholder="Average time"
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="price">Charge</Label>
              <input
                type="text"
                id="price"
                readOnly
                disabled
                className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
                value={
                  qty
                    ? `৳${
                        (services?.find((s) => s.id === selectedService)
                          ?.rate || 0) * qty
                      }`
                    : ''
                }
                placeholder="Charge"
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Button className="w-full" variant="default" type="submit">
                Create Order
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="w-full flex justify-between"></CardFooter>
    </Card>
  );
}
