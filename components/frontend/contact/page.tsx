'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import {
    FaArrowRight,
    FaCheckCircle,
    FaEnvelope,
    FaExclamationTriangle,
    FaFacebookF,
    FaLock,
    FaPhone,
    FaTwitter,
    FaUser,
    FaYoutube
} from 'react-icons/fa';

// Contact Form Component
const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Basic phone validation - should contain country code and numbers
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number with country code';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate form submission - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Here you would typically send the data to your backend
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...formData, adminEmail: 'support@smmdoc.com' })
      // });

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-lg dark:shadow-black/20 transition-all duration-300">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
          Send us a Message
        </h3>
        <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
          We'll get back to you as soon as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Field */}
        <div>
          <label
            htmlFor="name"
            className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200"
          >
            Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={isSubmitting}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
            />
          </div>
          {errors.name && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-200">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email and Phone Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                disabled={isSubmitting}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-200">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label
              htmlFor="phone"
              className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200"
            >
              Phone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                disabled={isSubmitting}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-200">
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Subject Field */}
        <div>
          <label
            htmlFor="subject"
            className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200"
          >
            Subject or Issue
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
            </div>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="What can we help you with?"
              disabled={isSubmitting}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
            />
          </div>
          {errors.subject && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-200">
              {errors.subject}
            </p>
          )}
        </div>

        {/* Message Field */}
        <div>
          <label
            htmlFor="message"
            className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            placeholder="Describe your message..."
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-vertical"
          />
          {errors.message && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-200">
              {errors.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white py-3 px-4 rounded-lg text-lg font-semibold hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <GradientSpinner size="w-4 h-4" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>Send Message</span>
              <FaArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Form Status */}
        {submitStatus === 'success' && (
          <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
            <FaCheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Thank you! Your message has been sent successfully. We'll get back
              to you soon.
            </p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            <FaExclamationTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Sorry, there was an error sending your message. Please try again
              or contact us directly at support@smmdoc.com.
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

const ContactUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0712] transition-colors duration-200">
      {/* Page Banner Section */}
      <section className="pt-[60px] pb-[60px] bg-white dark:bg-[#0d0712] transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <h4 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--secondary)] mb-2 transition-colors duration-200">
                Contact Us
              </h4>
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 dark:text-white leading-tight transition-colors duration-200">
                Reach Out to{' '}
                <span className="text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200">
                  SMMDOC{' '}
                </span>
                for Your Social Media Solutions
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg text-justify mb-6 leading-relaxed transition-colors duration-200">
                At SMMDOC, we're always eager to connect with you and discuss
                how we can elevate your social media presence. Whether you have
                questions about our services, need assistance in choosing the
                right strategy, or want to discuss a customized plan, we're here
                to help. Learn more about our journey and ethos on our About Us
                page.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <span>Get Started</span>
                <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Image */}
            <div className="text-center lg:text-right">
              <div className="relative">
                <Image
                  src="/smm-panel-provider-in-bd.webp"
                  alt="smm panel provider in bd"
                  width={600}
                  height={500}
                  className="w-full max-w-lg mx-auto lg:mx-0 rounded-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Contact & Contact Form Section */}
      <section className="pt-[60px] pb-[120px] bg-white dark:bg-[#0d0712] transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-200">
              How to{' '}
              <span className="text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200">
                Contact
              </span>{' '}
              Us
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: How to Contact */}
            <div>
              <div className="space-y-6 mb-8">
                {/* Email Card */}
                <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl dark:shadow-lg dark:shadow-black/20 hover:dark:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 group">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                      <FaEnvelope className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-200">
                    Email
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed transition-colors duration-200">
                    For detailed inquiries, feedback, or support, email us at{' '}
                    <Link
                      href="mailto:support@smmdoc.com"
                      className="text-[var(--primary)] dark:text-[var(--secondary)] hover:underline"
                    >
                      support@smmdoc.com
                    </Link>
                    . Our team is committed to providing timely and helpful
                    responses.
                  </p>
                </div>

                {/* Social Media Card */}
                <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl dark:shadow-lg dark:shadow-black/20 hover:dark:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 group">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
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
                    Follow us, engage with us, and reach out through our social
                    media channels. We're active and responsive on platforms
                    like Facebook, Twitter, Instagram, LinkedIn, and more. It's
                    not just a way to contact us; it's a window into the work we
                    do for our clients.
                  </p>
                </div>
              </div>

              <div className="text-left">
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 transition-colors duration-200">
                  We value every interaction and are dedicated to providing you
                  with the information and support you need. At SMMDOC, your
                  digital marketing success is our priority, and we look forward
                  to playing a part in your journey to social media excellence.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <span>More About Us</span>
                  <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
