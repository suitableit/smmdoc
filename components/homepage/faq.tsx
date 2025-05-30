"use client";

import { useState } from 'react';
import React from 'react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const FAQ = () => {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const faqData: FAQ[] = [
    {
      id: 1,
      question: "What Exactly is an SMM Panel?",
      answer: "A Social Media Marketing (SMM) Panel is a website that offers different social media marketing services. These services help you get more followers and likes and increase your engagement and visibility on social media. SMM Panels, like SMMGen, are made to be easy to use. They let businesses and people straightforwardly improve their social media presence."
    },
    {
      id: 2,
      question: "How Safe is Using an SMM Panel for My Business?",
      answer: "Safety is a major focus at SMMGen. Our SMM Panel is entirely secure and follows all terms of service of social media platforms. We employ genuine marketing methods to guarantee that your accounts stay safe and your social media growth is natural and lasting."
    },
    {
      id: 3,
      question: "What services does SMMGen offer?",
      answer: "We provide various social media marketing services, covering platforms like Facebook, Instagram, Twitter, YouTube, LinkedIn, TikTok, Telegram, Spotify, Discord, Pinterest, and SoundCloud. Additionally, we offer Website Traffic enhancement."
    },
    {
      id: 4,
      question: "How do I get started with SMMGen?",
      answer: "Starting is simple! Just sign up for a free account on our website, check out our services, add funds to your account, and make your order. Our team will handle the growth of your social media from there."
    },
    {
      id: 5,
      question: "Is SMMGen suitable for small businesses?",
      answer: "Certainly! Our services are crafted to be budget-friendly and impactful for businesses of all sizes. We provide custom-made solutions to small businesses' specific needs, guaranteeing they receive the best return on investment (ROI)."
    },
    {
      id: 6,
      question: "How affordable are your services?",
      answer: "We take pride in providing the most competitive and budget-friendly SMM services. Our pricing is structured to accommodate various budgets, offering cost-effective solutions for your social media marketing requirements."
    },
    {
      id: 7,
      question: "Can I follow the progress of my social media campaigns?",
      answer: "Certainly! You can follow the progress of your social media campaigns with our detailed reports and analytics. This transparency enables you to see the real-time effectiveness of our strategies."
    },
    {
      id: 8,
      question: "What makes SMMGen different from other SMM service providers?",
      answer: "Our distinctive mix of affordability, personalized strategies, skilled team, extensive range of services, and unwavering customer support makes us stand out. Our commitment goes beyond delivering results; we aim to provide our clients with a smooth and satisfying experience."
    },
    {
      id: 9,
      question: "Is There a Refund Policy if I am Dissatisfied with the Services?",
      answer: "At SMMGen, customer satisfaction is our top priority. If, for any reason, you are not content with our services, we provide a clear refund policy. Don't hesitate to contact our customer support with any concerns, and we will strive to address them, including issuing a refund if applicable."
    },
    {
      id: 10,
      question: "Do You Provide 24/7 Customer Support?",
      answer: "Certainly! We offer 24/7 customer support to ensure assistance is available whenever needed. Our committed team is always prepared to help with any queries or issues you may have, ensuring a smooth and hassle-free experience with our SMM Panel."
    }
  ];

  const toggleItem = (id: number) => {
    setOpenItem(prev => prev === id ? null : id);
  };

  return (
    <section id="faq_v2" className="pt-[60px] pb-[120px]">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-12">
          <h4 className="text-2xl font-bold text-primary mb-2">FAQ's</h4>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
            People Also Asked to <span className="text-primary">SMMGen</span>
          </h2>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {faqData.map((faq, index) => (
              <div 
                key={faq.id} 
                className="bg-white rounded-lg shadow-lg border border-gray-200 mb-4"
              >
                <button
                  className={`w-full text-left p-4 font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    openItem === faq.id ? 'bg-primary/10 text-primary' : ''
                  }`}
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={openItem === faq.id}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm lg:text-base pr-4">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 transform transition-transform duration-200 flex-shrink-0 ${
                        openItem === faq.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                {openItem === faq.id && (
                  <div className="px-4 pb-4">
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;