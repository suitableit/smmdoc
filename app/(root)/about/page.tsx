import About from '@/components/about/about';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Founded in 2018, SMMGen is a leading provider of affordable and effective social media marketing services in Bangladesh. Discover our mission, vision, and comprehensive SMM solutions.',
  keywords: 'About SMMGen, SMM Panel Bangladesh, Social Media Marketing Company, Affordable SMM Services, Digital Marketing Bangladesh, Facebook Instagram Twitter YouTube LinkedIn TikTok',
};

export default function AboutPage() {
  return <About/>;
}