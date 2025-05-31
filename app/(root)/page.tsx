import FAQ from '@/components/homepage/faq';
import HeroSection from '@/components/homepage/hero';
import HowItWorks from '@/components/homepage/howitworks';
import Platform from '@/components/homepage/platforms';
import Statistics from '@/components/homepage/stat';
import WhatPeopleSays from '@/components/homepage/whatpeoplesays';
import WhoWeAre from '@/components/homepage/whoweare';
import WhyChooseUs from '@/components/homepage/whychooseus';
import { Metadata } from 'next';

export const metadata: Metadata = {
  //title: 'Home',
  description: 'Discover the cheapest SMM panel in Bangladesh – a cost-effective solution for amazing business growth. Save money, gain new followers, and easily boost your online presence',
  keywords: 'SMM Panel, Cheapest SMM Panel, SMM Panel Bangladesh, Social Media Marketing, Facebook likes, Instagram followers, YouTube views',
};

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Statistics />
      <WhoWeAre />
      <Platform />
      <WhyChooseUs />
      <HowItWorks />
      <WhatPeopleSays />
      <FAQ />
    </main>
  );
}