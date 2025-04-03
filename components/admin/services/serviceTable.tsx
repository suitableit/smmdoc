/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetServices } from '@/hooks/service-fetch';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { Fragment, useState } from 'react';
import ServiceViewModal from './serviceViewModal';

export default function ServiceTable() {
  const { data, error, isLoading } = useGetServices();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState({});
  // delete category
  // const deleteCategory = async (id: string) => {}
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
              <TableCell className="font-medium">{i + 1}</TableCell>
              <TableCell className="text-ellipsis whitespace-nowrap text-wrap max-w-[400px] overflow-hidden">
                {service?.name}
              </TableCell>
              <TableCell>{service?.rate}</TableCell>
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}></TableCell>
            <TableCell className="text-right"></TableCell>
          </TableRow>
        </TableFooter>
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
