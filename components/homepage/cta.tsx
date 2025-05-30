import React from 'react';
import Link from 'next/link';

const CallToAction = () => {
  return (
    <>
      {/* First CTA Section - Get Started */}
      <section id="cta_v2" className="py-32 bg-gradient-to-r from-slate-900 to-slate-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/assets/media/bg-shades.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Skyrocket Your <span className="text-orange-400">Social <br /> Media</span> Presence?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
              Join SMMGen today and discover Bangladesh's most affordable and effective social media marketing. 
              Sign up now, select your services, and witness your business flourish. Don't hesitate – revolutionize your online engagement today!
            </p>
            <Link 
              href="/signup" 
              className="inline-block bg-white text-gray-900 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition-all duration-300 hover:-translate-y-1 shadow-lg"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Second CTA Section - Contact Us */}
      <section id="cta_contact" className="py-32 bg-gradient-to-r from-slate-900 to-slate-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/bg-shades.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h4 className="text-xl font-semibold text-white mb-4">Get In Touch</h4>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to take your <span className="text-orange-400">social media</span> <br /> to the next level?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
              We're here to answer all your queries and get you started on your journey to social media success. 
              For more information, detailed inquiries, or to begin your partnership with us, click the button below. 
              Our team at SMMGen is eager to assist you and guide you through our services and processes.
            </p>
            <Link 
              href="/contact" 
              className="inline-block bg-white text-gray-900 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition-all duration-300 hover:-translate-y-1 shadow-lg"
            >
              Contact Us Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default CallToAction;