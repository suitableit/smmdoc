import React from 'react';
import { FaShoppingCart, FaServer, FaUsers, FaShareAlt } from 'react-icons/fa';

interface CounterItem {
  icon: React.ReactNode;
  title: string;
  count: string;
}

const Statistics: React.FC = () => {
  const counterData: CounterItem[] = [
    {
      icon: <FaShoppingCart className="w-10 h-10 text-white" />,
      title: "Order Completed",
      count: "2,757,280"
    },
    {
      icon: <FaServer className="w-10 h-10 text-white" />,
      title: "Active Services",
      count: "4,917"
    },
    {
      icon: <FaUsers className="w-10 h-10 text-white" />,
      title: "Active Users",
      count: "30,175"
    },
    {
      icon: <FaShareAlt className="w-10 h-10 text-white" />,
      title: "Paid to Affiliate User",
      count: "236,456"
    }
  ];

  return (
    <section className="pt-[60px] pb-[60px] bg-white">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {counterData.map((item, index) => (
            <div 
              key={index}
              className="text-center"
              data-aos="fade-up"
              data-aos-duration="500"
              data-aos-delay={index * 100}
            >
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                {item.icon}
              </div>
              <p className="text-lg lg:text-xl text-gray-600 font-semibold mb-1">
                {item.title}
              </p>
              <h4 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {item.count}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics;