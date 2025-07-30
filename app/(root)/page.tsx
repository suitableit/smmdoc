import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const Hero = dynamic(() => import('@/components/frontend/homepage/hero'));
const Statistics = dynamic(() => import('@/components/frontend/homepage/statistics'));
const About = dynamic(() => import('@/components/frontend/homepage/about'));
const Platforms = dynamic(() => import('@/components/frontend/homepage/platforms'));
const WhyChooseUs = dynamic(() => import('@/components/frontend/homepage/why-choose-us'));
const HowItWorks = dynamic(() => import('@/components/frontend/homepage/how-it-works'));
const Testimonials = dynamic(() => import('@/components/frontend/homepage/testimonials'));
const FAQs = dynamic(() => import('@/components/frontend/homepage/faqs'));

export const metadata: Metadata = {
  description: 'Discover the cheapest SMM panel in Bangladesh - a cost-effective solution for amazing business growth. Save money, gain new followers, and easily boost your online presence',
  keywords: 'SMM Panel, Cheapest SMM Panel, SMM Panel Bangladesh, Social Media Marketing, Facebook likes, Instagram followers, YouTube views',
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Statistics />
      <About />
      <Platforms />
      <WhyChooseUs />
      <HowItWorks />
      <Testimonials />
      <FAQs />
    </main>
  );
}