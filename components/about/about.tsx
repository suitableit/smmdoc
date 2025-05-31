'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaArrowRight, 
  FaFacebookF, 
  FaInstagram, 
  FaTwitter, 
  FaYoutube, 
  FaLinkedinIn, 
  FaTiktok, 
  FaTelegramPlane, 
  FaSpotify, 
  FaDiscord, 
  FaPinterestP, 
  FaSoundcloud, 
  FaGlobe 
} from 'react-icons/fa';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl dark:shadow-lg dark:shadow-black/20 hover:dark:shadow-purple-500/10 transition-all duration-300 h-full hover:-translate-y-1 group">
    <div className="mb-4">
      <div className="w-16 h-16 bg-gradient-to-br from-[#5F1DE8] to-[#B131F8] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
        <div className="text-white text-2xl">
          {icon}
        </div>
      </div>
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-200">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed transition-colors duration-200">
      {description}
    </p>
  </div>
);

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  bgColor?: 'white' | 'gray';
}

const Section: React.FC<SectionProps> = ({ children, className = '', bgColor = 'gray' }) => (
  <section className={`pt-[60px] pb-[60px] bg-white dark:bg-[#0d0712] transition-colors duration-200 ${className}`}>
    <div className="max-w-[1200px] mx-auto px-4">
      {children}
    </div>
  </section>
);

const About: React.FC = () => {
  const services = [
    {
      icon: <FaFacebookF />,
      title: 'Facebook SMM Panel',
      description: 'Maximizing engagement and reach.'
    },
    {
      icon: <FaInstagram />,
      title: 'Instagram SMM Panel',
      description: 'Enhancing visibility and follower growth.'
    },
    {
      icon: <FaTwitter />,
      title: 'Twitter SMM Panel',
      description: 'Building influence and brand recognition.'
    },
    {
      icon: <FaYoutube />,
      title: 'YouTube SMM Panel',
      description: 'Increasing views and subscriber numbers.'
    },
    {
      icon: <FaLinkedinIn />,
      title: 'LinkedIn SMM Panel',
      description: 'Professional networking and lead generation.'
    },
    {
      icon: <FaTiktok />,
      title: 'TikTok SMM Panel',
      description: 'Tapping into viral marketing.'
    },
    {
      icon: <FaTelegramPlane />,
      title: 'Telegram SMM Panel',
      description: 'Expanding messaging and community engagement.'
    },
    {
      icon: <FaSpotify />,
      title: 'Spotify SMM Panel',
      description: 'Boosting music streaming and artist visibility.'
    },
    {
      icon: <FaDiscord />,
      title: 'Discord SMM Panel',
      description: 'Community building and interaction.'
    }, 
    {
      icon: <FaPinterestP />,
      title: 'Pinterest SMM Panel',
      description: 'Driving traffic through visual content.'
    },
    {
      icon: <FaSoundcloud />,
      title: 'SoundCloud SMM Panel',
      description: 'Enhancing audio content reach.'
    },
    {
      icon: <FaGlobe />,
      title: 'Website Traffic',
      description: 'Improving online visibility and digital footfall.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero/Banner Section */}
      <Section className="pt-[80px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h4 className="text-2xl font-bold text-[#5F1DE8] dark:text-[#B131F8] mb-2 transition-colors duration-200">
              Company Overview
            </h4>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-200">
              <span className="text-[#5F1DE8] dark:text-[#B131F8] transition-colors duration-200">SMMGen:</span> Pioneering
              Social Media <span className="text-[#5F1DE8] dark:text-[#B131F8] transition-colors duration-200">Marketing</span>
              in Bangladesh and Beyond
            </h1>
            <div className="space-y-4 text-gray-600 dark:text-gray-300 text-lg leading-relaxed transition-colors duration-200">
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              <span>Get Started</span>
              <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="text-center lg:text-right">
            <div className="relative group">
              <Image
                src="/smmgen-about-us.webp"
                alt="smmgen about us"
                width={600}
                height={400}
                className="w-full max-w-lg mx-auto lg:mx-0 rounded-lg shadow-lg transition-all duration-300"
                priority
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Mission Section */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <div className="relative group">
              <Image
                src="/smm-panel-mission.webp"
                alt="smm panel mission"
                width={600}
                height={500}
                className="w-full max-w-lg mx-auto lg:mx-0 rounded-lg shadow-lg transition-all duration-300"
              />
            </div>
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <h4 className="text-2xl font-bold text-[#5F1DE8] dark:text-[#B131F8] mb-2 transition-colors duration-200">
              Mission
            </h4>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-200">
              Empowering Businesses
              with Affordable <span className="text-[#5F1DE8] dark:text-[#B131F8] transition-colors duration-200">Social
              Media</span> Strategies
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed transition-colors duration-200">
              Our mission at SMMGen is straightforward – to provide high-quality, cost-effective
              social media marketing services that drive business growth and enhance online
              visibility. We are committed to helping businesses in Bangladesh and beyond to unlock
              their full potential on social media platforms. By offering the cheapest SMM panels, we
              ensure that even small businesses and startups can compete effectively in the digital
              arena.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              <span>Learn More</span>
              <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </Section>

      {/* Vision Section */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h4 className="text-2xl font-bold text-[#5F1DE8] dark:text-[#B131F8] mb-2 transition-colors duration-200">
              Vision
            </h4>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-200">
              Shaping the Future of
              <span className="text-[#5F1DE8] dark:text-[#B131F8] transition-colors duration-200"> Digital Marketing</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed transition-colors duration-200">
              Our vision extends beyond just being a service provider. We aim to be the harbinger of
              innovation in social media marketing, constantly adapting to the ever-evolving digital
              landscape. We envision a world where every business, regardless of its size, has equal
              opportunity to thrive in the digital marketplace. SMMGen strives to lead the way in
              creating more inclusive, effective, and sustainable social media strategies.
            </p>
            <Link 
              href="/signup" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              <span>Get Started</span>
              <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="text-center lg:text-right">
            <div className="relative group">
              <Image
                src="/smm-panel-in-bd.webp"
                alt="smm panel in bd"
                width={600}
                height={500}
                className="w-full max-w-lg mx-auto lg:mx-0 rounded-lg shadow-lg transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Team Section */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <div className="relative group">
              <Image
                src="/vision-banner-image.webp"
                alt="smmpanel vision banner"
                width={600}
                height={500}
                className="w-full max-w-lg mx-auto lg:mx-0 rounded-lg shadow-lg transition-all duration-300"
              />
            </div>
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <h4 className="text-2xl font-bold text-[#5F1DE8] dark:text-[#B131F8] mb-2 transition-colors duration-200">
              Our Team
            </h4>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-200">
              A Blend of <span className="text-[#5F1DE8] dark:text-[#B131F8] transition-colors duration-200">Expertise</span> and
              Innovation
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed transition-colors duration-200">
              The strength of SMMGen lies in our diverse team of professionals. Comprising seasoned
              digital marketers, creative strategists, and tech-savvy innovators, our team brings a
              wealth of experience and fresh perspectives to the table. We foster a culture of
              continuous learning and improvement, ensuring our strategies are always ahead of the
              curve. Our team's dedication and expertise are the driving forces behind our success and
              the success of our clients.
            </p>
            <Link 
              href="/signup" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              <span>Get Started</span>
              <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </Section>

      {/* Services Section */}
      <Section>
        <div className="text-center mb-16">
          <h4 className="text-2xl font-bold text-[#5F1DE8] dark:text-[#B131F8] mb-2 transition-colors duration-200">
            Our Services
          </h4>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6 transition-colors duration-200">
            Comprehensive Solutions for <br />
            Every <span className="text-[#5F1DE8] dark:text-[#B131F8] transition-colors duration-200">Social Media</span> Need
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto transition-colors duration-200">
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
            />
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 max-w-2xl mx-auto transition-colors duration-200">
            Each service is backed by thorough research and tailored strategies, <br />ensuring
            optimal results and client satisfaction.
          </p>
          <Link 
            href="/services" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            <span>Our All Services</span>
            <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white">
        <div className="text-center max-w-4xl mx-auto">
          <h4 className="text-2xl font-bold text-purple-200 mb-2 transition-colors duration-200">
            Get In Touch
          </h4>
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Connect with Us for <span className="text-yellow-300">Unparalleled <br />
            SMM </span>Solutions
          </h2>
          <p className="text-purple-100 text-lg leading-relaxed mb-8">
            Embark on your journey to social media success with SMMGen. Reach out to us for a
            consultation, to explore our services, or to start a partnership that transforms your
            digital presence. Our team is ready to assist you with tailored solutions that align
            with your business objectives. Connect with us today and take the first step towards
            realizing your social media potential.
          </p>
          <Link 
            href="/contact-us" 
            className="inline-flex items-center gap-2 bg-white text-[#5F1DE8] hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:-translate-y-1"
          >
            <span>Contact Us</span>
            <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </Section>

      {/* Why Different Section */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h4 className="text-2xl font-bold text-[#5F1DE8] dark:text-[#B131F8] mb-2 transition-colors duration-200">
              Why We Are Different from Others
            </h4>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-200">
              Innovative, <span className="text-[#5F1DE8] dark:text-[#B131F8] transition-colors duration-200">Affordable</span>,
              and Client-Focused
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed transition-colors duration-200">
              What sets SMMGen apart is our commitment to affordability without compromising on
              quality. We offer the cheapest SMM panels in the region, making high-quality social
              media marketing accessible to all. Our innovative approach, coupled with personalized
              service, ensures that each campaign we run is uniquely suited to our client's specific
              goals. We believe in transparency, reliability, and ongoing support, making us not just
              a service provider but a partner in our clients' digital growth journey.
            </p>
            <Link 
              href="/signup" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              <span>Get Started</span>
              <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="text-center lg:text-right">
            <div className="relative group">
              <Image
                src="/smm-panel-in-bangladesh.webp"
                alt="smm panel in bangladesh"
                width={600}
                height={500}
                className="w-full max-w-lg mx-auto lg:mx-0 rounded-lg shadow-lg transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default About;