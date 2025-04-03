import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function ServiceViewModal({ selected, setIsOpen, isOpen }: any) {
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
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
