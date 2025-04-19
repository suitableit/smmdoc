/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { PriceDisplay } from '@/components/PriceDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetServices } from '@/hooks/service-fetch';
import axiosInstance from '@/lib/axiosInstance';
import { Pencil, Trash } from 'lucide-react';
import Link from 'next/link';
import { Fragment, useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import ServiceViewModal from './serviceViewModal';

export default function ServiceTable() {
  const { data, error, isLoading } = useGetServices();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState({});
  // delete category
  const deleteService = async (id: string) => {
    toast.custom((t) => (
      <div className="flex flex-col items-center justify-center p-5 text-center z-50 bg-white dark:bg-black rounded-lg shadow-lg">
        <p className="text-sm font-semibold">
          Are you sure you want to delete this Service?
        </p>
        <div className="flex items-center justify-center space-x-2 pt-5">
          <button
            onClick={() => {
              toast.dismiss(t);
            }}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                await axiosInstance.delete(
                  `/api/admin/services/delete-services?id=${id}`
                );
                toast.success('Services deleted successfully');
                mutate('/api/admin/services/get-services');
              } catch (error) {
                toast.error('Failed to delete services' + error);
              }
              toast.dismiss(t);
            }}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;
  return (
    <Fragment>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Rate per 1000</TableHead>
            <TableHead>Min order</TableHead>
            <TableHead>Max order</TableHead>
            <TableHead>Avg time</TableHead>
            <TableHead>Description</TableHead>
            {/* <TableHead className="text-right">Status</TableHead> */}
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data?.map((service: any, i: number) => (
            <TableRow key={i}>
              <TableCell className="font-medium ">
                <Badge
                  variant="outline"
                  className={`${service?.updateText ? 'bg-yellow-500' : ''}`}
                >
                  {i + 1} {service?.updateText ? 'Updated' : 'New'}
                </Badge>
              </TableCell>
              <TableCell className="text-ellipsis whitespace-nowrap text-wrap max-w-[400px] overflow-hidden">
                {service?.name}
              </TableCell>
              <TableCell>
                <PriceDisplay
                  amount={service?.rate}
                  originalCurrency={'BDT'}
                  className=" font-bold"
                />
              </TableCell>
              <TableCell>{service?.min_order}</TableCell>
              <TableCell>{service?.max_order}</TableCell>
              <TableCell>{service?.avg_time}</TableCell>
              <TableCell>
                <Button
                  variant="link"
                  size="sm"
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => {
                    setSelected(service);
                    setIsOpen(true);
                  }}
                >
                  View
                </Button>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Link href={`/dashboard/admin/services/${service?.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteService(service?.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* view Modal */}
      {isOpen && (
        <ServiceViewModal
          selected={selected}
          setIsOpen={setIsOpen}
          isOpen={isOpen}
        />
      )}
    </Fragment>
  );
}
