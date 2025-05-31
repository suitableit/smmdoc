'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  alt: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description, alt }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
    <div className="flex justify-center mb-4">
      <Image 
        src={icon} 
        alt={alt} 
        width={64} 
        height={64} 
        className="w-16 h-16 object-contain"
      />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">{title}</h3>
    <p className="text-gray-600 text-center">{description}</p>
  </div>
);

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  bgColor?: 'white' | 'gray';
}

const Section: React.FC<SectionProps> = ({ children, className = '', bgColor = 'gray' }) => (
  <section className={`py-16 ${bgColor === 'white' ? 'bg-white' : 'bg-gray-50'} ${className}`}>
    <div className="container mx-auto px-4">
      {children}
    </div>
  </section>
);

const About: React.FC = () => {
  const services = [
    {
      icon: '/images/facebook-smm-panel.png',
      title: 'Facebook SMM Panel',
      description: 'Maximizing engagement and reach.',
      alt: 'facebook smm panel'
    },
    {
      icon: '/images/instagram-smm-panel.png',
      title: 'Instagram SMM Panel',
      description: 'Enhancing visibility and follower growth.',
      alt: 'instagram smm panel'
    },
    {
      icon: '/images/twitter-smm-panel.png',
      title: 'Twitter SMM Panel',
      description: 'Building influence and brand recognition.',
      alt: 'twitter smm panel'
    },
    {
      icon: '/images/youtube-smm-panel.png',
      title: 'YouTube SMM Panel',
      description: 'Increasing views and subscriber numbers.',
      alt: 'youtube smm panel'
    },
    {
      icon: '/images/linkedin-smm-panel.png',
      title: 'LinkedIn SMM Panel',
      description: 'Professional networking and lead generation.',
      alt: 'linkedin smm panel'
    },
    {
      icon: '/images/tiktok-smm-panel.png',
      title: 'TikTok SMM Panel',
      description: 'Tapping into viral marketing.',
      alt: 'tiktok smm panel'
    },
    {
      icon: '/images/telegram-smm-panel.png',
      title: 'Telegram SMM Panel',
      description: 'Expanding messaging and community engagement.',
      alt: 'telegram smm panel'
    },
    {
      icon: '/images/spotify-smm-panel.png',
      title: 'Spotify SMM Panel',
      description: 'Boosting music streaming and artist visibility.',
      alt: 'spotify smm panel'
    },
    {
      icon: '/images/discord-smm-panel.png',
      title: 'Discord SMM Panel',
      description: 'Community building and interaction.',
      alt: 'discord smm panel'
    },
    {
      icon: '/images/pinterest-smm-panel.png',
      title: 'Pinterest SMM Panel',
      description: 'Driving traffic through visual content.',
      alt: 'pinterest smm panel'
    },
    {
      icon: '/images/soundcloud-smm-panel.png',
      title: 'SoundCloud SMM Panel',
      description: 'Enhancing audio content reach.',
      alt: 'soundcloud smm panel'
    },
    {
      icon: '/images/website-smm-panel.png',
      title: 'Website Traffic',
      description: 'Improving online visibility and digital footfall.',
      alt: 'website smm panel'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero/Banner Section */}
      <Section className="py-20" bgColor="gray">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-blue-600 uppercase tracking-wide">
              Company Overview
            </h4>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              <span className="text-blue-600">SMMGen:</span> Pioneering
              Social Media Marketing
              in Bangladesh and Beyond
            </h1>
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>
                Founded in 2018, SMMGen has swiftly risen to prominence as a leading provider of social
                media marketing (SMM) services in Bangladesh and neighboring regions. With a focus on
                offering the most affordable yet effective SMM panels, we have revolutionized the way
                businesses approach their online presence. Our extensive range of services, including
                platforms like Facebook, Instagram, Twitter, YouTube, LinkedIn, TikTok, Telegram,
                Spotify, Discord, Pinterest, and SoundCloud, cater to diverse digital marketing needs.
              </p>
              <p>
                Our journey began with a vision to democratize social media marketing, making it
                accessible and affordable for businesses of all sizes. We recognized the immense
                potential of social media in reshaping brand-customer interactions and set out to
                harness this power for our clients. Today, SMMGen stands as a testament to innovative
                solutions, customer-centric approaches, and results-driven strategies in the world of
                social media marketing.
              </p>
            </div>
            <Link 
              href="/signup" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300"
            >
              Get Started
            </Link>
          </div>
          <div className="flex justify-center lg:justify-end">
            <Image
              src="/images/smmgen-about-us.webp"
              alt="smmgen about us"
              width={600}
              height={400}
              className="w-full max-w-lg h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </Section>

      {/* Mission Section */}
      <Section bgColor="white">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <Image
              src="/images/smm-panel-mission.webp"
              alt="smm panel mission"
              width={500}
              height={400}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <h4 className="text-lg font-medium text-blue-600 uppercase tracking-wide">
              Mission
            </h4>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              Empowering Businesses
              with Affordable Social
              Media Strategies
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Our mission at SMMGen is straightforward – to provide high-quality, cost-effective
              social media marketing services that drive business growth and enhance online
              visibility. We are committed to helping businesses in Bangladesh and beyond to unlock
              their full potential on social media platforms. By offering the cheapest SMM panels, we
              ensure that even small businesses and startups can compete effectively in the digital
              arena.
            </p>
            <Link 
              href="/" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </Section>

      {/* Vision Section */}
      <Section bgColor="gray">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-blue-600 uppercase tracking-wide">
              Vision
            </h4>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              Shaping the Future of
              Digital Marketing
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Our vision extends beyond just being a service provider. We aim to be the harbinger of
              innovation in social media marketing, constantly adapting to the ever-evolving digital
              landscape. We envision a world where every business, regardless of its size, has equal
              opportunity to thrive in the digital marketplace. SMMGen strives to lead the way in
              creating more inclusive, effective, and sustainable social media strategies.
            </p>
            <Link 
              href="/signup" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300"
            >
              Get Started
            </Link>
          </div>
          <div>
            <Image
              src="/images/smm-panel-in-bd.webp"
              alt="smm panel in bd"
              width={500}
              height={400}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </Section>

      {/* Team Section */}
      <Section bgColor="white">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <Image
              src="/images/vision-banner-image.webp"
              alt="smmpanel vision banner"
              width={500}
              height={400}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <h4 className="text-lg font-medium text-blue-600 uppercase tracking-wide">
              Our Team
            </h4>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              A Blend of Expertise and
              Innovation
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              The strength of SMMGen lies in our diverse team of professionals. Comprising seasoned
              digital marketers, creative strategists, and tech-savvy innovators, our team brings a
              wealth of experience and fresh perspectives to the table. We foster a culture of
              continuous learning and improvement, ensuring our strategies are always ahead of the
              curve. Our team's dedication and expertise are the driving forces behind our success and
              the success of our clients.
            </p>
            <Link 
              href="/signup" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </Section>

      {/* Services Section */}
      <Section bgColor="gray">
        <div className="text-center mb-16">
          <h4 className="text-lg font-medium text-blue-600 uppercase tracking-wide mb-4">
            Our Services
          </h4>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-6">
            Comprehensive Solutions for <br />
            Every <span className="text-blue-600">Social Media</span> Need
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto">
            At SMMGen, we offer a broad spectrum of social media marketing services. <br /> Our
            solutions are designed to cater to the unique requirements of each platform:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              alt={service.alt}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-700 text-lg mb-6 max-w-2xl mx-auto">
            Each service is backed by thorough research and tailored strategies, <br />ensuring
            optimal results and client satisfaction.
          </p>
          <Link 
            href="/services" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300"
          >
            Our All Services
          </Link>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="text-center max-w-4xl mx-auto">
          <h4 className="text-lg font-medium text-blue-200 uppercase tracking-wide mb-4">
            Get In Touch
          </h4>
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-6">
            Connect with Us for <span className="text-yellow-300">Unparalleled <br />
            SMM </span>Solutions
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            Embark on your journey to social media success with SMMGen. Reach out to us for a
            consultation, to explore our services, or to start a partnership that transforms your
            digital presence. Our team is ready to assist you with tailored solutions that align
            with your business objectives. Connect with us today and take the first step towards
            realizing your social media potential.
          </p>
          <Link 
            href="/contact-us" 
            className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg transition-colors duration-300"
          >
            Contact Us
          </Link>
        </div>
      </Section>

      {/* Why Different Section */}
      <Section bgColor="white">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-blue-600 uppercase tracking-wide">
              Why We Are Different from Others
            </h4>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              Innovative, Affordable,
              and Client-Focused
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              What sets SMMGen apart is our commitment to affordability without compromising on
              quality. We offer the cheapest SMM panels in the region, making high-quality social
              media marketing accessible to all. Our innovative approach, coupled with personalized
              service, ensures that each campaign we run is uniquely suited to our client's specific
              goals. We believe in transparency, reliability, and ongoing support, making us not just
              a service provider but a partner in our clients' digital growth journey.
            </p>
            <Link 
              href="/signup" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300"
            >
              Get Started
            </Link>
          </div>
          <div>
            <Image
              src="/images/smm-panel-in-bangladesh.webp"
              alt="smm panel in bangladesh"
              width={500}
              height={400}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </Section>
    </div>
  );
};

export default About;