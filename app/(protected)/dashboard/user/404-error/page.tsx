'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NotFoundPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  
  useEffect(() => {
    // Start countdown for auto-redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard/user/transactions');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [router]);
  
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="flex justify-center">
          <div className="text-[12rem] font-bold text-blue-500 leading-none">404</div>
        </div>
        
        <h1 className="text-3xl font-bold mt-4 mb-2">Page Not Found</h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-8">
          <p className="text-gray-500 dark:text-gray-400">
            Redirecting to transactions page in <span className="font-bold">{countdown}</span> seconds...
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
          
          <Button asChild>
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
          
          <Button asChild variant="default">
            <Link href="/dashboard/user/add-funds">
              Add Funds
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 