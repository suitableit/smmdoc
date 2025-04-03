import FAQ from '@/components/homepage/faq';
import HeroSection from '@/components/homepage/hero';
import HowItWorks from '@/components/homepage/howitworks';
import Platform from '@/components/homepage/platforms';
import Statistics from '@/components/homepage/stat';
import WhatPeopleSays from '@/components/homepage/whatpeoplesays';
import WhatWeOffer from '@/components/homepage/whatweoffer';
import WhoWeAre from '@/components/homepage/whoweare';
import WhyChooseUs from '@/components/homepage/whychooseus';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Home',
};

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Statistics />
      <WhyChooseUs />
      <WhoWeAre />
      <Platform />
      <WhatWeOffer />
      <HowItWorks />
      <FAQ />
      <WhatPeopleSays />
    </main>
  );
}
