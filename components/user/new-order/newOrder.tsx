/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { PriceDisplayAnother } from '@/components/PriceDisplayAnother';
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
import { useCurrency } from '@/contexts/CurrencyContext';
import { useGetCategories } from '@/hooks/categories-fetch';
import { useCurrentUser } from '@/hooks/use-current-user';
import axiosInstance from '@/lib/axiosInstance';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BsExclamationCircleFill } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

export default function NewOrder() {
  const user = useCurrentUser();
  const searchParams = useSearchParams();
  const serviceIdFromUrl = searchParams.get('sId');
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const {
    data: category,
    error: categoryError,
    isLoading: categoryLoading,
  } = useGetCategories();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [qty, setQty] = useState(0);
  const [link, setLink] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [favoriteCategories, setFavoriteCategories] = useState<any[]>([]);
  const [combinedCategories, setCombinedCategories] = useState<any[]>([]);
  const [categoriesWithServices, setCategoriesWithServices] = useState<any[]>(
    []
  );

  // Fetch price and per quantity values for the selected service
  const selected = services?.find((s) => s.id === selectedService);
  const perQty = Number(selected?.perqty) || 1;
  const price = Number(selected?.rate) || 0;
  // Get currency rate
  const { rate: currencyRate, currency } = useCurrency();

  // Calculate total price
  let totalPrice = 0;
  if (user?.currency === 'USD') {
    totalPrice = (price / perQty) * qty;
  } else {
    totalPrice = (price / perQty) * qty * (currencyRate || 121.52);
  }

  // Fetch favorite categories
  useEffect(() => {
    if (user?.id) {
      axiosInstance
        .get('/api/user/services/favorites')
        .then((res) => {
          setFavoriteCategories(res?.data?.data || []);
        })
        .catch(() => {
          toast.error('Error fetching favorite categories');
        });
    }
  }, [user?.id]);
  // Check which favorite categories have services
  useEffect(() => {
    const checkFavoriteCategories = async () => {
      const checkedFavorites = await Promise.all(
        favoriteCategories.map(async (favCat) => {
          try {
            const res = await axios.post('/api/user/services/favserviceById', {
              favrouteCatId: favCat.id,
            });
            return {
              ...favCat,
              hasServices: res?.data?.data?.length > 0,
            };
          } catch (error) {
            return {
              ...favCat,
              hasServices: false,
            };
          }
        })
      );
      return checkedFavorites.filter((fav) => fav.hasServices);
    };

    if (favoriteCategories.length > 0) {
      checkFavoriteCategories().then((validFavorites) => {
        if (category?.data) {
          const combined = [
            // Only include favorite categories that have services
            ...validFavorites.map((favCat) => ({
              ...favCat,
              isFavorite: true,
              category_name: `⭐ ${favCat.name}`,
            })),
            // Regular categories
            ...category.data.map((regCat: any) => ({
              ...regCat,
              isFavorite: false,
            })),
          ];
          setCombinedCategories(combined);
          setCategoriesWithServices(combined);
        }
      });
    } else if (category?.data) {
      // No favorite categories, just use regular ones
      const regularCategories = category.data.map((regCat: any) => ({
        ...regCat,
        isFavorite: false,
      }));
      setCombinedCategories(regularCategories);
      setCategoriesWithServices(regularCategories);
    }
  }, [category, favoriteCategories]);

  // Fetch services based on selected category (both favorite and regular)
  useEffect(() => {
    if (selectedCategory) {
      const selectedCat = combinedCategories?.find(
        (cat) => cat?.id === selectedCategory
      );
      if (!selectedCat) return;

      if (selectedCat?.isFavorite) {
        // Fetch services from favorite category
        axios
          .post('/api/user/services/favserviceById', {
            favrouteCatId: selectedCategory,
          })
          .then((res) => {
            const fetchedServices = res?.data?.data || [];

            setServices(fetchedServices);
            setSelectedService(selectedCategory);
            handleServiceSelection(fetchedServices);
          })
          .catch(() => {
            toast.error('Error fetching favorite category services');
          });
      } else {
        // Fetch services from regular category
        axios
          .post('/api/admin/services/catId-by-services', {
            categoryId: selectedCategory,
          })
          .then((res) => {
            const fetchedServices = res?.data?.data || [];
            setServices(fetchedServices);
            handleServiceSelection(fetchedServices);
          })
          .catch(() => {
            toast.error('Error fetching services');
          });
      }
    }
  }, [selectedCategory, combinedCategories]);

  const handleServiceSelection = (fetchedServices: any[]) => {
    if (serviceIdFromUrl && isInitializing) {
      const serviceFromUrl = fetchedServices.find(
        (s: any) => s.id === serviceIdFromUrl
      );
      if (serviceFromUrl) {
        setSelectedService(serviceIdFromUrl);
        setSearch(serviceFromUrl.name);
      }
    } else if (fetchedServices?.length > 0) {
      setSelectedService(fetchedServices[0]?.id);
    } else {
      setSelectedService('');
    }
    setIsInitializing(false);
  };
  // Initialize with service from URL if provided
  useEffect(() => {
    if (serviceIdFromUrl && !selectedService && category?.data) {
      // First try to find the service in our existing data
      const allServices = category?.data?.flatMap(
        (cat: any) => cat.services || []
      );
      const serviceFromUrl = allServices.find(
        (s: any) => s.id === serviceIdFromUrl
      );

      if (serviceFromUrl) {
        setSelectedCategory(serviceFromUrl.categoryId);
        setSelectedService(serviceIdFromUrl);
        setSearch(serviceFromUrl.name);
      } else {
        // If not found, fetch the specific service
        fetchServiceById(serviceIdFromUrl);
      }
    }
  }, [serviceIdFromUrl, category]);

  // Fetch service details by ID
  const fetchServiceById = async (serviceId: string) => {
    try {
      const res = await axiosInstance.get(
        `/api/user/services/serviceById?svId=${serviceId}`
      );
      const service = res?.data?.data;
      if (service) {
        setSelectedCategory(service.categoryId);
        setSelectedService(service.id);
        setSearch(service.name);
      }
    } catch (error) {
      toast.error('Error fetching service details');
    }
  };

  // Fetch services based on search input
  async function getServices() {
    try {
      const res = await axiosInstance.get(
        `/api/user/services/neworderservice?search=${search}`
      );
      const fetchedServices = res?.data?.data || [];
      setServicesData(fetchedServices);
    } catch (error) {
      toast.error('Error fetching services');
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        getServices();
      } else {
        setServicesData([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function decodeHTML(html: string) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  const orderData = {
    link,
    qty,
    price: parseFloat(totalPrice.toFixed(4)),
    currencyWisePrice: {
      USD:
        user?.currency === 'USD'
          ? totalPrice
          : totalPrice / (currencyRate || 121.52),
      BDT:
        user?.currency === 'USD'
          ? totalPrice * (currencyRate || 121.52)
          : totalPrice,
      currency: user?.currency,
    },
    serviceId: selectedService,
    categoryId: selectedCategory,
    userId: user?.id,
    avg_time: selected?.avg_time || '',
  };

  const userData = useSelector((state: any) => state.userDetails);
  // Handle form submission
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // check if user has enough balance
    const userBalance =
      userData?.currency === 'USD'
        ? `${userData?.addFunds[0]?.amount}`
        : `${(userData?.addFunds[0]?.amount * (currencyRate || 121.52)).toFixed(
            4
          )}`;

    const userBalanceAmount = parseFloat(userBalance.replace(/,/g, ''));
    totalPrice = parseFloat(totalPrice.toFixed(4));
    if (userBalanceAmount < totalPrice) {
      toast.error('Insufficient balance to create this order');
      return;
    }

    // Check if quantity is valid
    if (qty < 1) {
      toast.error('Please enter a valid quantity');
      return;
    }
    // Check if link is valid
    if (!link || !link.startsWith('https')) {
      toast.error('Please enter a valid link');
      return;
    }
    if (!link || !qty || !price) {
      toast.error('Please fill all the fields');
      return;
    }
    console.log('Order Data:', orderData);
  };

  // Handle search select
  const handleSearchSelect = (serviceId: string, categoryId: string) => {
    const selected = servicesData.find((s) => s.id === serviceId);

    if (selected) {
      setServicesData([]);
      setSelectedCategory(categoryId);
      setSelectedService(serviceId);
      setQty(0);
      setSearch(selected.name);
      setShowDropdown(false);
    }
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
            {/* Search Input with Dropdown */}
            <div className="relative" ref={searchRef}>
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
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search services..."
                autoComplete="off"
              />

              {/* Search Dropdown */}
              {showDropdown && servicesData.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {servicesData.map((service) => (
                    <div
                      key={service.id}
                      className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        handleSearchSelect(service.id, service.categoryId)
                      }
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{service.name}</span>
                        {/* <span className="text-xs text-gray-500">
                          {service.category_name}
                        </span> */}
                      </div>
                      {/* <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {service.description && decodeHTML(service.description)}
                      </div> */}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Combined Category Dropdown */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedService('');
                  setQty(0);
                }}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {/* Only show favorites group if there are favorite categories with services */}
                {categoriesWithServices.some((cat) => cat.isFavorite) && (
                  <optgroup label="Favorites">
                    {categoriesWithServices
                      .filter((cat) => cat.isFavorite)
                      .map((favCat) => (
                        <option key={`fav-${favCat.id}`} value={favCat.id}>
                          {favCat.category_name}
                        </option>
                      ))}
                  </optgroup>
                )}
                {/* Regular categories */}
                <optgroup label="All Categories">
                  {categoriesWithServices
                    .filter((cat) => !cat.isFavorite)
                    .map((cat: any) => (
                      <option key={`reg-${cat.id}`} value={cat.id}>
                        {cat.category_name}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* Service Dropdown */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="services">Services</Label>

              <select
                id="services"
                className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                value={selectedService}
                onChange={(e) => {
                  setSelectedService(e.target.value);
                  setQty(0);
                }}
                disabled={!selectedCategory || services.length === 0}
                required
              >
                {/* <option value="">Select a service</option> */}
                {services?.map((service: any, i) => (
                  <option
                    style={{
                      backgroundColor:
                        selectedService === service.id ? '#e0f7fa' : 'white',
                      color: selectedService === service.id ? '#000' : '#000',
                    }}
                    key={service.id}
                    value={service.id}
                  >
                    {/* {service.id} - */}
                    {service.name} -{' '}
                    <PriceDisplayAnother
                      amount={service.rate}
                      originalCurrency={user?.currency || ('USD' as any)}
                      className="text-current bg-gray-50 px-2 rounded"
                    />{' '}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Description */}
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

            {/* Link */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="link">Link</Label>
              <input
                type="url"
                id="link"
                className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
                required
                onChange={(e) => setLink(e.target.value)}
                pattern="https?://.+"
              />
            </div>

            {/* Quantity */}
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

            {/* Average Time */}
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

            {/* Price */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="price">
                Charge ({selected?.perQty} per ={' '}
                {user?.currency === 'USD' ? '$' : '৳'})
              </Label>
              <div className="">
                <input
                  type="text"
                  id="price"
                  readOnly
                  disabled
                  className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
                  // value always shows bdt
                  value={
                    user?.currency === 'USD'
                      ? `$ ${((price * qty) / perQty).toFixed(4)}`
                      : `৳ ${(
                          (price * qty * (currencyRate || 121.52)) /
                          perQty
                        ).toFixed(4)}`
                  }
                  placeholder="Charge"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
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
