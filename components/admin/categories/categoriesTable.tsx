/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useGetCategories } from '@/hooks/categories-fetch';
import axiosInstance from '@/lib/axiosInstance';

import { Loader2, Pencil, Trash } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { mutate } from 'swr';

export default function CategoriesTable() {
  const { data, error, isLoading } = useGetCategories();
  // delete category
  const deleteCategory = async (id: string) => {
    toast.custom((t) => (
      <div className="flex flex-col items-center justify-center p-5 text-center z-50 bg-white dark:bg-black rounded-lg shadow-lg">
        <p className="text-sm font-semibold">
          Are you sure you want to delete this category?
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
                  `/api/admin/categories/delete-categories?id=${id}`
                );
                toast.success('Category deleted successfully');
                mutate('/api/admin/categories/get-categories');
              } catch (error) {
                toast.error('Failed to delete category' + error);
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
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-5 text-center z-50 bg-white dark:bg-mainColor rounded-lg shadow-lg">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground">Loading categories...</p>
    </div>
  );
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No categories found</div>;
  if (!data.success) return <div>{data.error}</div>;
  if (data.data.length === 0) return <div>No categories found</div>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead className="text-right">Created At</TableHead>
          <TableHead className="text-right">Updated At</TableHead>
          {/* <TableHead className="text-right">Status</TableHead> */}
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.data?.map((cat: any, i: number) => (
          <TableRow key={i}>
            <TableCell className="font-medium">{i + 1}</TableCell>
            <TableCell>{cat?.category_name}</TableCell>
            <TableCell>{cat?.user?.name}</TableCell>
            <TableCell className="text-right">
              {new Date(cat?.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
            </TableCell>
            <TableCell className="text-right">
              {new Date(cat?.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Link href={`/dashboard/admin/categories/${cat?.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => deleteCategory(cat?.id)}
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
  );
}
