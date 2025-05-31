"use client";

import { useState, useEffect } from 'react';
import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Testimonial {
  id: number;
  name: string;
  position: string;
  company: string;
  content: string;
  rating: number;
}

const WhatPeopleSays = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Tahmid Rahman",
      position: "CEO",
      company: "Dhaka Tech Solutions",
      content: "Teaming up with SMMGen has been a game-changer for our online presence. Their budget-friendly SMM panels have amplified our engagement and notably expanded our customer base. The team's expertise and personalized strategies are precisely what we require. Highly recommended for any business aiming to make a mark on social media!",
      rating: 5
    },
    {
      id: 2,
      name: "Priya Singh",
      position: "Marketing Director",
      company: "MCA",
      content: "SMMGen has transformed our social media strategy. Their Instagram and Facebook marketing approach has elevated our brand's visibility to new heights. The results have been outstanding – more engagement, followers, and conversions. Their service is top-notch and incredibly budget-friendly.",
      rating: 5
    },
    {
      id: 3,
      name: "Anwar Hussain",
      position: "Founder",
      company: "Karachi Digital Studio",
      content: "As a small business, we sought cost-effective yet impactful social media marketing, and SMMGen delivered beyond our expectations. Their YouTube and TikTok SMM panels have greatly helped increase our online influence. The team's professionalism and quick response to our needs make them a valuable partner.",
      rating: 5
    },
    {
      id: 4,
      name: "Sarah Ahmed",
      position: "Marketing Manager",
      company: "Creative Agency BD",
      content: "Working with SMMGen has exceeded our expectations. Their comprehensive social media solutions have helped us achieve remarkable growth across all platforms. The ROI we've seen from their services is exceptional, and their customer support is always responsive and helpful.",
      rating: 5
    },
    {
      id: 5,
      name: "Mohammad Ali",
      position: "Business Owner",
      company: "Tech Innovations Ltd",
      content: "SMMGen's expertise in social media marketing is unmatched. They've helped us build a strong online community and significantly increase our brand awareness. Their strategic approach and attention to detail have made them an invaluable partner for our business growth.",
      rating: 5
    },
    {
      id: 6,
      name: "Fatima Khan",
      position: "Digital Marketing Lead",
      company: "E-commerce Solutions",
      content: "The results speak for themselves - since partnering with SMMGen, our social media engagement has tripled, and our conversion rates have improved dramatically. Their team understands our industry and delivers tailored solutions that drive real business results.",
      rating: 5
    }
  ];

  const itemsPerPage = 3;
  const maxSlide = testimonials.length - itemsPerPage;

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = prev + 1;
        return nextSlide > maxSlide ? 0 : nextSlide;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, maxSlide]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const nextSlide = prev + 1;
      return nextSlide > maxSlide ? 0 : nextSlide;
    });
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const prevSlideIndex = prev - 1;
      return prevSlideIndex < 0 ? maxSlide : prevSlideIndex;
    });
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 transition-colors duration-200 ${
          index < rating 
            ? 'text-[#5F1DE8] dark:text-[#B131F8]' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const getCurrentTestimonials = () => {
    const startIndex = currentSlide * itemsPerPage;
    return testimonials.slice(startIndex, startIndex + itemsPerPage);
  };

  return (
    <section id="testimonials_v2" className="pt-[60px] pb-[60px] relative bg-white dark:bg-[#0d0712] transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h4 className="text-2xl font-bold text-[#5F1DE8] dark:text-[#B131F8] mb-2 transition-colors duration-200">
              Success Stories
            </h4>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
              Transforming <span className="text-[#5F1DE8] dark:text-[#B131F8] transition-colors duration-200">Social Media</span> Landscapes
            </h2>
          </div>
          
          {/* Navigation Buttons */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-800/70 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-all duration-200 group"
              aria-label="Previous testimonial"
            >
              <FaChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-[#5F1DE8] dark:group-hover:text-[#B131F8] transition-colors duration-200" />
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-800/70 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-all duration-200 group"
              aria-label="Next testimonial"
            >
              <FaChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-[#5F1DE8] dark:group-hover:text-[#B131F8] transition-colors duration-200" />
            </button>
          </div>
        </div>

        {/* Testimonials Slider */}
        <div className="overflow-hidden mb-8 -mx-4">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * (100 / itemsPerPage)}%)` }}
          >
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="w-1/3 flex-shrink-0 px-4">
                <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 h-80 flex flex-col justify-between hover:shadow-2xl dark:hover:shadow-lg dark:hover:shadow-purple-500/10 transition-all duration-300 group hover:-translate-y-1">
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed line-clamp-6 transition-colors duration-200">
                      "{testimonial.content}"
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-auto">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-0 transition-colors duration-200">
                        {testimonial.name}
                      </h4>
                      <small className="text-gray-500 dark:text-gray-400 text-xs transition-colors duration-200">
                        ~{testimonial.position} of {testimonial.company}
                      </small>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-white dark:bg-gray-700/50 shadow-sm px-3 py-1 rounded-full border border-gray-100 dark:border-gray-600 transition-all duration-200">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots with Shadow */}
        <div className="flex justify-center mt-8 gap-3">
          {Array.from({ length: maxSlide + 1 }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-[#5F1DE8] dark:bg-[#B131F8] scale-110 shadow-lg shadow-[#5F1DE8]/40 dark:shadow-[#B131F8]/40' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 shadow-md hover:shadow-lg hover:scale-105'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden justify-center gap-4 mt-6">
          <button
            onClick={prevSlide}
            className="w-10 h-10 rounded-full bg-white dark:bg-gray-800/70 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-all duration-200 group"
            aria-label="Previous testimonial"
          >
            <FaChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-[#5F1DE8] dark:group-hover:text-[#B131F8] transition-colors duration-200" />
          </button>
          <button
            onClick={nextSlide}
            className="w-10 h-10 rounded-full bg-white dark:bg-gray-800/70 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-all duration-200 group"
            aria-label="Next testimonial"
          >
            <FaChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-[#5F1DE8] dark:group-hover:text-[#B131F8] transition-colors duration-200" />
          </button>
          </div>
      </div>
    </section>
  );
};

export default WhatPeopleSays;