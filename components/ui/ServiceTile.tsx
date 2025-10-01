import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface ServiceTileProps {
  id: number;
  title: string;
  description?: string;
  price: string | number;
  badge?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  image?: string;
  name?: string;
  discount?: number;
  icon?: React.ReactNode;
  bgColor?: string;
}

export const ServiceTile: React.FC<ServiceTileProps> = ({
  title,
  description,
  price,
  badge,
  href,
  onClick,
  className,
  image,
  name,
  discount,
}) => {

  const CardContent = () => (
    <>
      <div className="relative group">
        <div className="aspect-square overflow-hidden rounded-lg">
          <Image
            src={image || '/images/service-placeholder.jpg'}
            alt={name || title}
            width={300}
            height={300}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
          />
          {discount && discount > 0 && (
            <div className="absolute top-3 right-3 bg-mainColor/20 text-white text-xs rounded-full px-2 py-1">
              -{discount}%
            </div>
          )}
        </div>
        {badge && (
          <div className="absolute top-3 right-3 bg-black/20 text-white text-xs rounded-full px-2 py-1">
            {badge}
          </div>
        )}
      </div>
      <div className="p-4">
        <h4 className="font-medium text-base mb-1 truncate">{title}</h4>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
            {description}
          </p>
        )}
        <div className="flex justify-between items-center">
          <span className="font-bold text-primary">
            {typeof price === 'number' ? `$${price.toFixed(2)}` : price}
          </span>
          <button className="bg-primary hover:bg-primary/90 text-white py-1 px-3 rounded text-sm">
            Order Now
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow transition-all hover:shadow-lg relative',
        className
      )}
    >
      {href ? (
        <Link href={href}>
          <CardContent />
        </Link>
      ) : (
        <div onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>
          <CardContent />
        </div>
      )}
    </div>
  );
};
