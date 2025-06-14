import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

const WhoWeAre: React.FC = () => {
  return (
    <section
      id="default_sections_v2"
      className="about-us pt-[60px] pb-[60px] bg-white dark:bg-[#0d0712] transition-colors duration-200"
    >
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="default__text__content">
            <h4 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--secondary)] mb-2 transition-colors duration-200">
              About Us
            </h4>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight transition-colors duration-200">
              Leaders in Social <br />
              Media{' '}
              <span className="text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200">
                Enhancement
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed transition-colors duration-200">
              At SMMGen, we revolutionize digital success through our
              budget-friendly and top-notch social media marketing solutions.
              Since our inception in 2018 in Bangladesh, we have emerged as the
              preferred choice for the most affordable SMM panels, seamlessly
              combining cost-effectiveness with outstanding business expansion
              strategies. Our devoted team is dedicated to delivering
              tailor-made services that save you money and enhance your online
              engagement and presence to the fullest. We specialize in
              transforming your social media channels and provide unparalleled
              growth opportunities on platforms such as Facebook, YouTube, and
              more. Join us on this journey of affordable excellence, where each
              click brings you closer to your audience and propels you a step
              ahead in the competitive digital world.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              <span>Learn More</span>
              <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Image */}
          <div className="default_image text-center lg:text-right">
            <div className="relative group">
              <Image
                src="/cheapest-smmpanel-in-bangladesh.webp"
                alt="Cheapest SMM Panel in Bangladesh"
                width={600}
                height={500}
                className="w-full max-w-lg mx-auto lg:mx-0 rounded-lg transition-all duration-300"
                priority
              />
              {/* Optional: Add a subtle overlay for dark mode */}
              <div className="w-full max-w-lg mx-auto lg:mx-0 rounded-lg transition-all duration-300"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;