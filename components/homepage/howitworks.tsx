import Link from 'next/link';
import React from 'react';
import { FaUserPlus, FaSearch, FaWallet, FaRocket } from 'react-icons/fa';

interface Step {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const HowItWorks: React.FC = () => {
  const steps: Step[] = [
    {
      number: '01',
      icon: <FaUserPlus className="w-12 h-12 text-purple-600" />,
      title: 'Free Sign Up',
      description: 'Swiftly create your SMMGen account to embark on your social media enhancement journey.'
    },
    {
      number: '02',
      icon: <FaSearch className="w-12 h-12 text-purple-600" />,
      title: 'Explore Our Services',
      description: 'Effortlessly browse our extensive SMM services, customized to meet your specific needs.'
    },
    {
      number: '03',
      icon: <FaWallet className="w-12 h-12 text-purple-600" />,
      title: 'Add Our Funds',
      description: 'Conveniently add funds to your account using our secure and diverse payment options.'
    },
    {
      number: '04',
      icon: <FaRocket className="w-12 h-12 text-purple-600" />,
      title: 'Order and Unwind',
      description: 'Place your order and relax while we handle your social media growth professionally.'
    }
  ];

  return (
    <section className="py-0 pb-[60px]">
      <div className="bg-purple-600 py-20">
        <div className="container mx-auto px-4 text-center max-w-7xl">
          <h2 
            className="text-4xl lg:text-5xl font-extrabold text-white mb-4"
            data-aos="fade-up"
            data-aos-duration="600"
          >
            How to Order
          </h2>
          <p 
            className="text-xl text-purple-100 mb-16"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            Our Simple 4-Step Work Order Process
          </p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="container mx-auto px-4 -mt-16 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 relative pb-16"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay={index * 150}
            >
              {/* Step Number Badge */}
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                <div className="w-20 h-20 bg-orange-500 rounded-full flex flex-col items-center justify-center text-white border-4 border-white shadow-lg">
                  <span className="text-lg font-bold">{step.number}</span>
                  <span className="text-xs font-medium">STEP</span>
                </div>
              </div>

              {/* Step Icon */}
              <div className="text-center mt-12 mb-6">
                <div className="mx-auto flex justify-center items-center w-16 h-16">
                  {step.icon}
                </div>
              </div>

              {/* Step Content */}
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 text-center mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center -mt-8">
          <Link
            href="/sign-up"
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-10 py-4 rounded-lg text-xl font-bold inline-flex items-center hover:shadow-lg transition-all duration-300"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            Create An Account
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;