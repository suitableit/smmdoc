import { PriceDisplay } from '@/components/PriceDisplay';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import Link from 'next/link';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function ServiceViewModal({
  service,
  setIsOpen,
  isOpen,
}: any) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-4">{service?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Rate per 1000:</span>{' '}
                <PriceDisplay amount={service?.rate} originalCurrency={'USD'} />
              </div>
              <div>
                <span className="font-medium">Min order:</span> {service?.min_order}
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Max order:</span> {service?.max_order}
              </div>
              <div>
                <span className="font-medium">Average time:</span> {service?.avg_time}
              </div>
            </div>
          </div>
          
          <div>
            <span className="font-medium">Description:</span>
            <div className="mt-2 text-sm">
              <span
                dangerouslySetInnerHTML={{
                  __html: service?.description,
                }}
              ></span>
            </div>
          </div>
          
          <div className="pt-4">
            <Link href={`/dashboard/user/new-order?sId=${service?.id}`}>
              <Button className="w-full">Buy Now</Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
