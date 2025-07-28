import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const HomePage = dynamic(() => import('@/components/frontend/homepage/page'));
const WhyChooseUs = dynamic(() => import('@/components/frontend/homepage/why-choose-us'));

export const metadata: Metadata = {
  description: 'Discover the cheapest SMM panel in Bangladesh – a cost-effective solution for amazing business growth. Save money, gain new followers, and easily boost your online presence',
  keywords: 'SMM Panel, Cheapest SMM Panel, SMM Panel Bangladesh, Social Media Marketing, Facebook likes, Instagram followers, YouTube views',
};

export default function Home() {
  return (
    <>
      <HomePage />
      <WhyChooseUs />
    </> 
  );
}