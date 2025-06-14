import ContactUs from '@/components/our-services/page';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Services',
  description:
    'Get in touch with SMMDOC for unparalleled social media marketing support. Reach out to us effortlessly for exceptional service, assistance, and customized SMM solutions. Available 24/7.',
  keywords:
    'Contact SMMDOC, SMM Panel Support, Social Media Marketing Help, Customer Service Bangladesh, SMM Panel Contact, Digital Marketing Support, Get Help SMMDOC, Contact SMM Provider',
};

export default function ContactPage() {
  return <ContactUs />;
}
