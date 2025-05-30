import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaFacebook, 
  FaTelegram, 
  FaWhatsapp,
  FaEnvelope,
  FaHeart,
  FaPhone
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Facebook',
      icon: FaFacebook,
      url: '#'
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      url: '#'
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      url: '#'
    }
  ];

  const companyLinks = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'Services', href: '/services' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' }
  ];

  const supportLinks = [
    { name: 'Tickets Support', href: '/support' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'WhatsApp Community', href: '#' },
    { name: 'Telegram Channel', href: '#' }
  ];

  const serviceLinks = [
    { name: 'Facebook Services', href: '/services/facebook' },
    { name: 'Instagram Services', href: '/services/instagram' },
    { name: 'Twitter Services', href: '/services/twitter' },
    { name: 'Telegram Services', href: '/services/telegram' },
    { name: 'YouTube Services', href: '/services/youtube' },
    { name: 'TikTok Services', href: '/services/tiktok' }
  ];

  const bottomLinks = [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms', href: '/terms' },
  ];

  return (
    <footer className="bg-slate-900 relative pt-16 pb-8">
      {/* Top Logo */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-20 h-20 bg-slate-900 border-2 border-primary rounded-full flex items-center justify-center">
          <Image
            src="/favicon.png"
            alt="SMMDOC favicon"
            width={50}
            height={50}
            className="w-12 h-12"
          />
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-4 pr-8">
            <div className="footer_txt">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="SMMGen White Logo"
                  width={200}
                  height={60}
                  className="footer_logo mb-4 max-w-[200px] h-auto hover:opacity-80 transition-opacity cursor-pointer"
                />
              </Link>
              <p className="text-white text-sm leading-relaxed mb-4">
                Boost your online presence today with our Cheap SMM Panel – the ultimate solution for social media success! Smmdoc is a SMM Panel with more then 3 years on the market and 21 Orders processed successfully until now!
              </p>
              
              {/* Social Links */}
              <ul className="social_media_links flex gap-2 list-none p-0 m-0">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <li key={index}>
                      <Link 
                        href={social.url} 
                        className="social_link w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 text-slate-900"
                        aria-label={social.name}
                      >
                        <IconComponent className="w-5 h-5" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Company Links */}
              <div className="footer_link_wrap">
                <h4 className="text-xl font-bold text-white mb-4">Company</h4>
                <ul className="footer_menu list-none p-0 m-0">
                  {companyLinks.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.href}
                        className="footer_menu_item block text-white font-semibold text-base py-1 hover:text-primary transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support Links */}
              <div className="footer_link_wrap">
                <h4 className="text-xl font-bold text-white mb-4">Support</h4>
                <ul className="footer_menu list-none p-0 m-0">
                  {supportLinks.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.href}
                        className="footer_menu_item block text-white font-semibold text-base py-1 hover:text-primary transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3">
            <div className="footer_link_wrap">
              <h4 className="text-xl font-bold text-white mb-4">Reach Out</h4>
              <ul className="footer_contact list-none p-0 m-0">
                <li className="flex items-center gap-2 mb-3">
                  <div className="icon w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <FaWhatsapp className="w-4 h-4 text-slate-900" />
                  </div>
                  <Link 
                    href="https://wa.me/8801723139610" 
                    className="footer_menu_item text-white font-semibold text-sm hover:text-primary transition-colors duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    +880 1723-139610
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <div className="icon w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <FaEnvelope className="w-4 h-4 text-slate-900" />
                  </div>
                  <Link 
                    href="mailto:support@smmdoc.com" 
                    className="footer_menu_item text-white font-semibold text-sm hover:text-primary transition-colors duration-300"
                  >
                    support@smmdoc.com
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-8 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <div>
              <p className="text-white text-sm text-center lg:text-left">
                © {currentYear} All Rights Reserved by{' '}
                <Link href="/" className="text-white font-bold hover:text-primary transition-colors duration-300">
                  SMMDOC
                </Link>.
              </p>
            </div>
            <div className="footer_links_middle flex flex-wrap justify-center gap-4 text-sm">
              {bottomLinks.map((link, index) => (
                <React.Fragment key={index}>
                  <Link 
                    href={link.href}
                    className="text-white font-semibold hover:text-primary transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                  {index < bottomLinks.length - 1 && (
                    <span className="text-white/50">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="text-center lg:text-right">
              <p className="text-white text-sm">
                Developed by{' '}
                <Link 
                  href="https://www.suitableit.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-bold hover:text-primary transition-colors duration-300"
                >
                  Suitable IT
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;