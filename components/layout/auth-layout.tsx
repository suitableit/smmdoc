// components/layouts/auth-layout.tsx
import Header from '@/components/shared/header';
import Footer from '@/components/footer';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Full Width with Box Styling */}
      <div className="w-full bg-white border-b border-gray-200 shadow-sm">
        <Header />
      </div>
      
      {/* Main Content - Takes remaining space */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        {children}
      </main>
      
      {/* Footer - Full Width with Box Styling */}
      <div className="w-full bg-white border-t border-gray-200 shadow-sm">
        <Footer />
      </div>
    </div>
  );
}