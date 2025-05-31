'use client';

import { PriceDisplay } from '@/components/PriceDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    rate: number;
    min_order: number;
    max_order: number;
    avg_time: string;
    description: string;
    category: {
      category_name: string;
      id: string;
    };
    isFavorite?: boolean;
  };
  toggleFavorite: (serviceId: string) => void;
}

export default function ServiceCard({ service, toggleFavorite }: ServiceCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleBuyNow = () => {
    router.push(`/dashboard/user/new-order?sId=${service.id}`);
  };

  return (
    <>
      <Card className="w-full h-full flex flex-col">
        <CardContent className="pt-4 flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-lg">{service.name}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(service.id)}
              className="h-8 w-8"
            >
              <Star
                className={`h-4 w-4 ${
                  service.isFavorite
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </Button>
          </div>
          
          <div className="space-y-1 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate per 1000:</span>
              <PriceDisplay amount={service.rate} originalCurrency={'USD'} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min order:</span>
              <span>{service.min_order}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max order:</span>
              <span>{service.max_order}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average time:</span>
              <span>{service.avg_time}</span>
            </div>
          </div>
          
          <div className="line-clamp-2 text-sm text-muted-foreground">
            <span dangerouslySetInnerHTML={{ __html: service.description }}></span>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4">
          <Button 
            onClick={() => setIsOpen(true)} 
            variant="outline" 
            className="w-full"
          >
            Details
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="mb-4">{service.name}</DialogTitle>
            <DialogDescription>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Rate per 1000:</span>
                      <PriceDisplay amount={service.rate} originalCurrency={'USD'} />
                    </div>
                    <div>
                      <span className="font-medium">Min order:</span> {service.min_order}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Max order:</span> {service.max_order}
                    </div>
                    <div>
                      <span className="font-medium">Average time:</span> {service.avg_time}
                    </div>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium">Description:</span>
                  <div className="mt-2 text-sm">
                    <span dangerouslySetInnerHTML={{ __html: service.description }}></span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button onClick={handleBuyNow} className="w-full">
                    Buy Now
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}