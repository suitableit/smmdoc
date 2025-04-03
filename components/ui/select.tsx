import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { forwardRef } from 'react';

export default forwardRef<
  HTMLSelectElement,
  React.HTMLProps<HTMLSelectElement>
>(function SelectMe({ className, ...props }, ref) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-10 w-full appearance-none truncate rounded-md border border-input bg-background py-2 pl-3 pr-8 text-sm ring-offset-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
      <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50" />
    </div>
  );
});
