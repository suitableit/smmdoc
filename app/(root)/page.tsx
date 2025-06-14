import HomePage from '@/components/homepage/page';
import { Metadata } from 'next';

export const metadata: Metadata = {
  //title: 'Home',
  description: 'Discover the cheapest SMM panel in Bangladesh – a cost-effective solution for amazing business growth. Save money, gain new followers, and easily boost your online presence',
  keywords: 'SMM Panel, Cheapest SMM Panel, SMM Panel Bangladesh, Social Media Marketing, Facebook likes, Instagram followers, YouTube views',
};  

export default function Home() {
  return <HomePage />;
}