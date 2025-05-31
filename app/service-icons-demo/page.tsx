import { ServiceIconsExample } from '@/components/ui/ServiceIconsExample';

export default function ServiceIconsDemo() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">সার্ভিস আইকন ডেমো</h1>
      <p className="text-center mb-8 text-gray-600 dark:text-gray-400">
        এসএমএম প্যানেলের জন্য কালারফুল সার্ভিস আইকন
      </p>
      <ServiceIconsExample />
    </div>
  );
} 