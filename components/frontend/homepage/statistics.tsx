import React from 'react';
import { FaShoppingCart, FaServer, FaUsers, FaShareAlt } from 'react-icons/fa';
import { CounterItem, counterData } from '@/data/frontend/homepage/statistics';

// Icon mapping
const iconMap = {
  FaShoppingCart: FaShoppingCart,
  FaServer: FaServer,
  FaUsers: FaUsers,
  FaShareAlt: FaShareAlt,
};

export default function Statistics() {
  return (
    <section className="pt-[30px] pb-[30px] lg:pt-[60px] lg:pb-[60px] transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {counterData.map((item, index) => {
            const IconComponent = iconMap[item.iconName as keyof typeof iconMap];
            return (
              <div
                key={index}
                className="text-center group"
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay={index * 100}
              >
                <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg hover:shadow-xl dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:scale-105 group-hover:-translate-y-1">
                  {IconComponent && (
                    <IconComponent className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  )}
                </div>
                <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 font-semibold mb-1 transition-colors duration-200">
                  {item.title}
                </p>
                <h4 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                  {item.count}
                </h4>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}