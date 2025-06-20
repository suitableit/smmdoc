'use client';

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
      {/* How to Contact & Contact Form Section */}
      <section className="pt-[60px] pb-[120px] bg-white dark:bg-[#0d0712] transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16">
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
      {/* Extended Form Fields Section */}
      <section className="pt-[60px] pb-[120px] transition-colors duration-200">
        <div className="w-[1200px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-200">
              Complete{' '}
              <span className="text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200">
                Form
              </span>{' '}
              Controls
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg mt-4 transition-colors duration-200">
              Explore all available form input types and controls
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-lg dark:shadow-black/20 transition-all duration-300">
            <form className="space-y-8">
              {/* Text Input Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Text Field */}
                <div>
                  <label className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                    Text Input
                  </label>
                  <input
                    type="text"
                    placeholder="Enter text here"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                    Email Input
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                    Password Input
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Number and Specialized Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Number Field */}
                <div>
                  <label className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                    Number Input
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-nonew-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                {/* Tel Field */}
                <div>
                  <label className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                    Phone Input
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  />
                </div>

                {/* URL Field */}
                <div>
                  <label className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                    URL Input
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Search Field */}
              <div>
                <label className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                  Search Input
                </label>
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>

              {/* Date and Time Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Date Field */}
                <div>
                  <label className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                    Date Input
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200"
                  />
                </div>

                {/* Time Field */}
                <div>
                  <label className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                    Time Input
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200"
                  />
                </div>

                {/* Month Field */}
                <div>
                  <label className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                    Month Input
                  </label>
                  <input
                    type="month"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200"
                  />
                </div>

                {/* Week Field */}
                <div>
                  <label className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                    Week Input
                  </label>
                  <input
                    type="week"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200"
                  />
                </div>
              </div>

              {/* DateTime Local Field */}
              <div>
                <label className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                  DateTime Local Input
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200"
                />
              </div>

              {/* Color and Range Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Color Field */}
                <div>
                  <label className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                    Color Input
                  </label>
                  <input
                    type="color"
                    defaultValue="#5F1DE8"
                    className="w-full h-12 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm transition-all duration-200"
                  />
                </div>

                {/* Range Field */}
                <div>
                  <label className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                    Range Input
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="50"
                    className="w-full h-12 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm transition-all duration-200"
                  />
                </div>
              </div>

              {/* File Input */}
              <div>
                <label className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                  File Input
                </label>
                <input
                  type="file"
                  multiple
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[var(--primary)] file:to-[var(--secondary)] file:text-white hover:file:from-[#4F0FD8] hover:file:to-[#A121E8] transition-all duration-200"
                />
              </div>

              {/* Radio Buttons */}
              <div>
                <label className="block text-lg text-gray-900 dark:text-white font-medium mb-4 transition-colors duration-200">
                  Radio Buttons
                </label>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="radio-group"
                      value="option1"
                      className="w-4 h-4 text-[var(--primary)] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:ring-2 transition-all duration-200"
                    />
                    <span className="ml-2 text-gray-900 dark:text-white transition-colors duration-200">
                      Option 1
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="radio-group"
                      value="option2"
                      className="w-4 h-4 text-[var(--primary)] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:ring-2 transition-all duration-200"
                    />
                    <span className="ml-2 text-gray-900 dark:text-white transition-colors duration-200">
                      Option 2
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="radio-group"
                      value="option3"
                      className="w-4 h-4 text-[var(--primary)] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:ring-2 transition-all duration-200"
                    />
                    <span className="ml-2 text-gray-900 dark:text-white transition-colors duration-200">
                      Option 3
                    </span>
                  </label>
                </div>
              </div>

              {/* Checkboxes */}
              <div>
                <label className="block text-lg text-gray-900 dark:text-white font-medium mb-4 transition-colors duration-200">
                  Checkboxes
                </label>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[var(--primary)] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:ring-2 transition-all duration-200"
                    />
                    <span className="ml-2 text-gray-900 dark:text-white transition-colors duration-200">
                      Checkbox 1
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[var(--primary)] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:ring-2 transition-all duration-200"
                    />
                    <span className="ml-2 text-gray-900 dark:text-white transition-colors duration-200">
                      Checkbox 2
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-[var(--primary)] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:ring-2 transition-all duration-200"
                    />
                    <span className="ml-2 text-gray-900 dark:text-white transition-colors duration-200">
                      Checkbox 3 (checked)
                    </span>
                  </label>
                </div>
              </div>

              {/* Select Dropdown */}
              <div>
                <label className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                  Select Dropdown
                </label>
                <select className="w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer">
                  <option value="">Choose an option</option>
                  <option value="option1">Option 1</option>
                  <option value="option2">Option 2</option>
                  <option value="option3">Option 3</option>
                  <option value="option4">Option 4</option>
                </select>
              </div>

              {/* Multiple Select */}
              <div>
                <label className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                  Multiple Select
                </label>
                <select
                  multiple
                  size={4}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white transition-all duration-200"
                >
                  <option value="item1">Item 1</option>
                  <option value="item2">Item 2</option>
                  <option value="item3">Item 3</option>
                  <option value="item4">Item 4</option>
                  <option value="item5">Item 5</option>
                  <option value="item6">Item 6</option>
                </select>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Hold Ctrl (or Cmd) to select multiple options
                </p>
              </div>

              {/* Image Input */}
              <div>
                <label className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                  Image Input (Submit Button)
                </label>
                <input
                  type="image"
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='40' viewBox='0 0 120 40'%3E%3Crect width='120' height='40' rx='8' fill='%235F1DE8'/%3E%3Ctext x='60' y='25' text-anchor='middle' fill='white' font-family='Arial' font-size='14' font-weight='bold'%3ESubmit%3C/text%3E%3C/svg%3E"
                  alt="Submit"
                  className="border border-gray-300 dark:border-gray-600 rounded-lg hover:shadow-lg transition-all duration-200"
                />
              </div>

              {/* Hidden Input (for demonstration) */}
              <input type="hidden" name="hidden-field" value="hidden-value" />

              {/* Action Buttons Row */}
              <div className="flex flex-wrap gap-4 pt-6">
                {/* Submit Button */}
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold px-8 py-3 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] transition-all duration-300 hover:-translate-y-1"
                >
                  <span>Submit Form</span>
                  <FaArrowRight className="w-4 h-4" />
                </button>

                {/* Reset Button */}
                <button
                  type="reset"
                  className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <span>Reset Form</span>
                </button>

                {/* Regular Button */}
                <button
                  type="button"
                  className="flex items-center gap-2 bg-white dark:bg-gray-700 border-2 border-[var(--primary)] dark:border-[var(--secondary)] text-[var(--primary)] dark:text-[var(--secondary)] font-semibold px-8 py-3 rounded-lg hover:bg-[var(--primary)] hover:text-white dark:hover:bg-[var(--secondary)] dark:hover:text-white transition-all duration-300 hover:-translate-y-1"
                >
                  <span>Custom Button</span>
                </button>
              </div>

              {/* Note about hidden field */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-700 dark:text-blue-400 text-sm">
                  <strong>Note:</strong> This form includes a hidden input field
                  (not visible) with name="hidden-field" and
                  value="hidden-value". Hidden fields are commonly used to store
                  data that needs to be submitted with the form but shouldn't be
                  visible to users.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
