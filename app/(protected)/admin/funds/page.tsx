'use client';

import AddUserFund from '@/components/admin/funds/AddUserFund';
import AllTransactions from '@/components/admin/funds/AllTransactions';
import PendingTransactions from '@/components/admin/funds/PendingTransactions';
import UpdatePrice from '@/components/admin/funds/UpdatePrice';
import BreadCrumb from '@/components/shared/BreadCrumb';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminFundsPage() {
  const breadcrumbItems = [
    { title: 'Admin', link: '/admin' },
    { title: 'Funds', link: '/admin/funds' },
  ];

  return (
    <div className="h-full">
      <div className="flex items-center justify-between py-1">
        <BreadCrumb items={breadcrumbItems} />
      </div>
      <Separator />
      <div className="py-4">
        <h1 className="text-2xl font-bold">Funds Management</h1>
        <p className="text-muted-foreground">
          Manage user funds, transactions, and pricing
        </p>
      </div>

      <Tabs defaultValue="pending-transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending-transactions">
            Pending Transactions
          </TabsTrigger>
          <TabsTrigger value="all-transactions">All Transactions</TabsTrigger>
          <TabsTrigger value="add-user-fund">Add User Fund</TabsTrigger>
          <TabsTrigger value="update-price">Update Price</TabsTrigger>
        </TabsList>
        <TabsContent value="pending-transactions">
          <PendingTransactions />
        </TabsContent>
        <TabsContent value="all-transactions">
          <AllTransactions />
        </TabsContent>
        <TabsContent value="add-user-fund">
          <AddUserFund />
        </TabsContent>
        <TabsContent value="update-price">
          <UpdatePrice />
        </TabsContent>
      </Tabs>
    </div>
  );
}
