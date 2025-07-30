import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const Hero = dynamic(() => import('@/components/frontend/our-services/hero'));
const Services = dynamic(() => import('@/components/frontend/our-services/services'));

export const metadata: Metadata = {
  title: 'Our Services',
  description: 'Explore our comprehensive social media marketing services.',
};

export default function OurServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <Hero />
      <Services />
    </div>
  );
}
