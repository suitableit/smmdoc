import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Link from 'next/link';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function ServiceViewModal({
  selected,
  setIsOpen,
  isOpen,
  mode,
}: any) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selected?.name}</DialogTitle>
          <DialogDescription>
            {/* In HTML, <p> cannot be a descendant of <p>. */}
            <span
              dangerouslySetInnerHTML={{
                __html: selected?.description,
              }} /* This is a dangerous method, use with caution. */
            ></span>
          </DialogDescription>
          {mode === 'create' && (
            <Link
              href={`/dashboard/user/new-order?sId=${selected?.id}`}
              className="text-blue-500 hover:underline"
            >
              Create Order
            </Link>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
