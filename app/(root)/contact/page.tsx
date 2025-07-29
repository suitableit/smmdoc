import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const Hero = dynamic(() => import('@/components/frontend/contact/hero'));
const HowToContact = dynamic(() => import('@/components/frontend/contact/how-to-contact'));

export const metadata: Metadata = {
  title: 'Contact Us - SMMDOC',
  description: 'Get in touch with SMMDOC for all your social media marketing needs. We\'re here to help you grow your online presence.',
};

export default function ContactPage() {
  return (
    <>
      <Hero />
      <HowToContact />
    </>
  );
}
