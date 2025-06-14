import {
  FaBullseye,
  FaCogs,
  FaDollarSign,
  FaHeadset,
  FaTrophy,
  FaUsers,
} from 'react-icons/fa';

const WhyChooseUs = () => {
  const features = [
    {
      icon: FaDollarSign,
      title: 'Unmatched Affordability',
      description:
        'At SMMGen, we take pride in offering the most budget-friendly SMM services. Our competitive prices ensure that businesses of all sizes can get high-quality social media marketing solutions without exceeding their budgets. We are dedicated to delivering exceptional value without compromising quality, making us the perfect choice for cost-conscious yet ambitious brands.',
    },
    {
      icon: FaBullseye,
      title: 'Customized Strategies',
      description:
        'Every brand is unique, and so should its social media strategy. We at SMMGen specialize in creating tailor-made strategies that match your business goals and target audience. Our personalized approach ensures that each campaign we run is as unique as your brand, maximizing impact and engagement.',
    },
    {
      icon: FaTrophy,
      title: 'Proven Results',
      description:
        'Our track record speaks to our expertise. With years of experience and many success stories, SMMGen has demonstrated its ability to generate substantial results across various social media platforms. Our clients experience heightened visibility, engagement, and conversions, leading to tangible business growth.',
    },
    {
      icon: FaUsers,
      title: 'Expert Team',
      description:
        'Our team of social media experts is the backbone of our success. With deep insights into the ever-evolving digital landscape, they bring much knowledge and innovation. Their expertise ensures that your social media presence is vibrant and strategically aligned with the latest trends and best practices.',
    },
    {
      icon: FaCogs,
      title: 'Comprehensive Service Range',
      description:
        'SMMGen provides a wide array of services encompassing major social media platforms such as Facebook, Instagram, Twitter, YouTube, and more. This comprehensive service spectrum ensures a one-stop solution for all your social media marketing needs, promoting consistency and convenience.',
    },
    {
      icon: FaHeadset,
      title: 'Dedicated Customer Support',
      description:
        'We focus on creating long-term relationships with our clients. Our committed customer support team is always ready to assist, ensuring your experience with us is smooth and satisfactory. We value your feedback and are committed to continuous improvement, making us a reliable partner in your social media journey.',
    },
  ];

  return (
    <section
      id="whyChooseUs_v2"
      className="py-24 pb-[120px] bg-white dark:bg-[#0d0712] transition-colors duration-200"
    >
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-12">
          <h4 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--secondary)] mb-2 transition-colors duration-200">
            Why Choose Us?
          </h4>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
            Unparalleled Quality in <br />
            <span className="text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200">
              SMM Service
            </span>{' '}
            and Customer Satisfaction
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl dark:shadow-lg dark:shadow-black/20 hover:dark:shadow-purple-500/10 transition-all duration-300 h-full hover:-translate-y-1 group"
              >
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed transition-colors duration-200">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
