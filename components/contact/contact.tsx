'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaArrowRight, 
  FaEnvelope, 
  FaFacebookF, 
  FaTwitter, 
  FaYoutube, 
  FaLinkedinIn, 
  FaTelegramPlane, 
  FaPinterestP
} from 'react-icons/fa';

const ContactUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0712] transition-colors duration-200">
      {/* Page Banner Section */}
      <section className="pt-[60px] pb-[60px] bg-white dark:bg-[#0d0712] transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <h4 className="text-2xl font-bold text-[#5F1DE8] dark:text-[#B131F8] mb-2 transition-colors duration-200">
                Contact Us
              </h4>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-200">
                Reach Out to <span className="text-[#5F1DE8] dark:text-[#B131F8] transition-colors duration-200">SMMGen</span>
                for Your Social Media Solutions
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed transition-colors duration-200">
                At SMMGen, we're always eager to connect with you and discuss how we can elevate your
                social media presence. Whether you have questions about our services, need assistance in
                choosing the right strategy, or want to discuss a customized plan, we're here to help.
                Learn more about our journey and ethos on our About Us page.
              </p>
              <Link 
                href="/signup" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <span>Get Started</span>
                <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Image */}
            <div className="text-center lg:text-right">
              <div className="relative group">
                <Image
                  src="/smm-panel-provider-in-bd.webp"
                  alt="smm panel provider in bd"
                  width={600}
                  height={500}
                  className="w-full max-w-lg mx-auto lg:mx-0 rounded-lg shadow-lg transition-all duration-300"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Contact Section */}
      <section className="pt-[60px] pb-[60px] bg-white dark:bg-[#0d0712] transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-200">
              How to <span className="text-[#5F1DE8] dark:text-[#B131F8] transition-colors duration-200">Contact</span> Us
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Email Card */}
            <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl dark:shadow-lg dark:shadow-black/20 hover:dark:shadow-purple-500/10 transition-all duration-300 h-full hover:-translate-y-1 group">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#5F1DE8] to-[#B131F8] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                  <FaEnvelope className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-200">
                Email
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed transition-colors duration-200">
                For detailed inquiries, feedback, or support, email us at{' '}
                <Link href="mailto:support@smmgen.com" className="text-[#5F1DE8] dark:text-[#B131F8] hover:underline">
                  support@smmgen.com
                </Link>
                . Our team is committed to providing timely and helpful responses.
              </p>
            </div>

            {/* Social Media Card */}
            <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl dark:shadow-lg dark:shadow-black/20 hover:dark:shadow-purple-500/10 transition-all duration-300 h-full hover:-translate-y-1 group">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#5F1DE8] to-[#B131F8] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                  <div className="flex space-x-1">
                    <FaFacebookF className="w-3 h-3 text-white" />
                    <FaTwitter className="w-3 h-3 text-white" />
                    <FaYoutube className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-200">
                Social Media
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed transition-colors duration-200">
                Follow us, engage with us, and reach out through our social media channels. We're
                active and responsive on platforms like Facebook, Twitter, Instagram, LinkedIn, and more.
                It's not just a way to contact us; it's a window into the work we do for our clients.
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 max-w-2xl mx-auto transition-colors duration-200">
              We value every interaction and are dedicated to providing you with the information and
              support you need. At SMMGen, your digital marketing success is our priority, and we
              look forward to playing a part in your journey to social media excellence.
            </p>
            <Link 
              href="/about-us" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              <span>More About Us</span>
              <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Follow Social Media Section */}
      <section className="pt-[80px] pb-[80px] bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Follow Us on <span className="text-yellow-300">Social Media</span>
            </h2>
            
            <div className="flex justify-center mb-6">
              <div className="flex space-x-4">
                <Link 
                  href="https://www.facebook.com/smmgen.co" 
                  target="_blank"
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <FaFacebookF className="w-6 h-6 text-white" />
                </Link>
                <Link 
                  href="https://twitter.com/smm_gen" 
                  target="_blank"
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <FaTwitter className="w-6 h-6 text-white" />
                </Link>
                <Link 
                  href="https://www.youtube.com/@SMMGen-yv7lq" 
                  target="_blank"
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <FaYoutube className="w-6 h-6 text-white" />
                </Link>
                <Link 
                  href="https://www.linkedin.com/company/smmgen/" 
                  target="_blank"
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <FaLinkedinIn className="w-6 h-6 text-white" />
                </Link>
                <Link 
                  href="https://t.me/smmgenannouncement" 
                  target="_blank"
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <FaTelegramPlane className="w-6 h-6 text-white" />
                </Link>
                <Link 
                  href="https://www.pinterest.com.au/smmgen/" 
                  target="_blank"
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <FaPinterestP className="w-6 h-6 text-white" />
                </Link>
              </div>
            </div>
            
            <p className="text-purple-100 text-lg leading-relaxed mb-8">
              Get in touch with SMMGen today and take the first step towards transforming
              your brand's social media narrative. We're more than just a service
              provider; we're your partner in digital growth!
            </p>
            
            <Link 
              href="/signup" 
              className="inline-flex items-center gap-2 bg-white text-[#5F1DE8] hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:-translate-y-1"
            >
              <span>Signup Now</span>
              <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;