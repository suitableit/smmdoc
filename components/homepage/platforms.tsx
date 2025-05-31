"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaFacebook, 
  FaInstagram, 
  FaTwitter, 
  FaYoutube, 
  FaLinkedin, 
  FaTiktok, 
  FaTelegram, 
  FaSpotify, 
  FaDiscord, 
  FaPinterest, 
  FaGlobe, 
  FaSoundcloud 
} from 'react-icons/fa';

const Platform = () => {
  const [activeTab, setActiveTab] = useState('facebook');

  const platforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'facebook',
      title: 'Facebook SMM Panel',
      description: 'Optimize your Facebook presence with our Facebook SMM Panel. This service boosts your brand\'s visibility, increases engagement, and drives more sales through customized Facebook marketing strategies. It is ideal for businesses looking to dominate this vast social platform. We make sure your content reaches your target audience on time every time.'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: 'instagram',
      title: 'Instagram SMM Panel',
      description: 'Enhance your Instagram game with our specialized Instagram SMM Panel. We focus on more than just increasing followers, enhancing engagement, and improving your brand\'s visual appeal. Our Instagram marketing experts use the latest strategies to show off your brand\'s story creatively and effectively.'
    },
    {
      id: 'twitter',
      name: 'X/Twitter',
      icon: 'twitter',
      title: 'X/Twitter SMM Panel',
      description: 'Spread your influence on Twitter with our unique Twitter SMM Panel. We specialize in building your follower base, boosting tweet engagement, and spreading your brand\'s reach. Our strategic approach ensures your message hits your target audience, keeping you trending in your industry.'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: 'youtube',
      title: 'YouTube SMM Panel',
      description: 'Amplify your YouTube channel\'s impact with our YouTube SMM Panel. We focus on increasing views, subscribers, comments, shares, and more. We ensure your content stands out every time. Our YouTube marketing experts use targeted strategies custom-made to raise your channel\'s visibility and keep your viewers hooked.'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: 'linkedin',
      title: 'LinkedIn SMM Panel',
      description: 'Transform your professional networking with our LinkedIn SMM Panel. This panel enhances your brand\'s corporate presence, builds connections, and generates leads. Our strategies are designed to put your brand at the top as an industry leader on this professional platform.'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: 'tiktok',
      title: 'TikTok SMM Panel',
      description: 'Capture the dynamic TikTok audience with our TikTok SMM Panel. Our service is tailored to boost your visibility, engagement, and viral potential on this rapidly growing platform. We craft strategies that resonate with the youthful and diverse TikTok community.'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: 'telegram',
      title: 'Telegram SMM Panel',
      description: 'Expand your reach with our Telegram SMM Panel. We specialize in growing your channel subscribers and engagement, making sure your content reaches a wider audience. Our targeted approach helps you leverage Telegram\'s unique messaging platform for effective communication and marketing.'
    },
    {
      id: 'spotify',
      name: 'Spotify',
      icon: 'spotify',
      title: 'Spotify SMM Panel',
      description: 'Boost your musical presence with our Spotify SMM Panel. We focus on increasing your tracks\' plays, followers, and playlist inclusion. Our strategies are designed to enhance your visibility and listenership on this leading music streaming platform.'
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: 'discord',
      title: 'Discord SMM Panel',
      description: 'Enhance your community engagement with our Discord SMM Panel. We specialize in growing your server\'s membership and activity, creating a vibrant community around your brand. Our service is perfect for brands looking to build a loyal and engaged community.'
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      icon: 'pinterest',
      title: 'Pinterest SMM Panel',
      description: 'Revolutionize your visual marketing with our Pinterest SMM Panel. We focus on increasing your pins\' visibility, driving traffic to your website, and boosting engagement. Our Pinterest strategies are perfect for brands that captivate audiences through compelling visual content.'
    },
    {
      id: 'website',
      name: 'Website Traffic',
      icon: 'globe',
      title: 'Website Traffic',
      description: 'Enhance your website\'s prominence and attract more visitors through our Website Traffic service. Utilizing strategic SEO and cutting-edge digital marketing techniques, we elevate your site\'s traffic, amplifying your online visibility and the potential for business growth.'
    },
    {
      id: 'soundcloud',
      name: 'Sound Cloud',
      icon: 'soundcloud',
      title: 'SoundCloud SMM Panel',
      description: 'Amplify your SoundCloud presence with our SoundCloud SMM Panel. We specialize in increasing your tracks\' plays, likes, and reposts, enhancing your reach in the music community. Our service is tailored for artists seeking to grow their audience and influence.'
    }
  ];

  const renderIcon = (iconName: string) => {
    const iconClass = "w-6 h-6 text-primary";
    
    switch (iconName) {
      case 'facebook':
        return <FaFacebook className={iconClass} />;
      case 'instagram':
        return <FaInstagram className={iconClass} />;
      case 'twitter':
        return <FaTwitter className={iconClass} />;
      case 'youtube':
        return <FaYoutube className={iconClass} />;
      case 'linkedin':
        return <FaLinkedin className={iconClass} />;
      case 'tiktok':
        return <FaTiktok className={iconClass} />;
      case 'telegram':
        return <FaTelegram className={iconClass} />;
      case 'spotify':
        return <FaSpotify className={iconClass} />;
      case 'discord':
        return <FaDiscord className={iconClass} />;
      case 'pinterest':
        return <FaPinterest className={iconClass} />;
      case 'globe':
        return <FaGlobe className={iconClass} />;
      case 'soundcloud':
        return <FaSoundcloud className={iconClass} />;
      default:
        return <FaGlobe className={iconClass} />;
    }
  };

  const activePlatform = platforms.find(p => p.id === activeTab) || platforms[0];

  return (
    <section id="our_services" className="bg-white pt-[60px] pb-[60px]">
      <div className="container mx-auto px-4 max-w-[1200px]">
        <div className="text-center mb-12">
          <h4 className="text-2xl font-bold text-primary mb-2">Our Services</h4>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Comprehensive <span className="text-secondary">SMM</span> Solutions
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            At SMMGen, we revolutionize digital success through our budget-friendly and top-notch social media marketing solutions. Since our inception in 2018 in Bangladesh, we have emerged as the preferred choice for the most affordable SMM panels.
          </p>
        </div>

        {/* Platform Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-200 max-w-full overflow-x-auto">
            <div className="flex flex-wrap justify-center gap-2 min-w-max">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setActiveTab(platform.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-300 whitespace-nowrap ${
                    activeTab === platform.id
                      ? 'bg-white border-primary shadow-lg text-gray-900'
                      : 'border-gray-300 hover:border-primary hover:shadow-md'
                  }`}
                >
                  {renderIcon(platform.icon)}
                  {activeTab === platform.id && (
                    <span className="font-semibold text-sm">
                      {platform.name}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-8">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {activePlatform.title}
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {activePlatform.description}
            </p>
            <Link 
              href="/services" 
              className="bg-gradient-to-r from-purple-600 to-purple-700 inline-block bg-primary text-white font-semibold px-8 py-4 rounded-lg hover:bg-primary/90 transition-all duration-300 hover:-translate-y-1"
            >
              Our Services
            </Link>
          </div>
          
          <div className="flex justify-end">
            <Image
              src="/smm-panel-services.webp"
              alt="SMM Panel Services"
              width={500}
              height={400}
              className="w-full max-w-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Platform;