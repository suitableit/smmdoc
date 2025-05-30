import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FaUser, FaLock } from 'react-icons/fa';

const HeroSection: React.FC = () => {
  return (
    <section className="flex justify-center items-center pt-[120px] pb-[60px] bg-cover bg-top bg-no-repeat">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 2xl:gap-x-20 items-center">
          {/* Left side */}
          <div>
            <div className="text-center lg:text-left">
              <h1
                className="text-5xl lg:text-6xl font-extrabold mb-4 text-gray-900 leading-tight"
                data-aos="fade-down"
                data-aos-duration="500"
              >
                <span className="text-purple-600">SMMDOC - #1</span> <br />
                Cheap SMM Panel
              </h1>
              <p
                className="text-lg mb-6 leading-7 text-gray-600 w-4/5 lg:w-full mx-auto lg:mx-0"
                data-aos="fade-down"
                data-aos-duration="1000"
              >
                Boost your online presence today with our Cheap SMM Panel – the ultimate solution for social media success! Smmdoc is a SMM Panel with more then 3 years on the market and 21 Orders processed successfully until now!
              </p>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-7 py-4 rounded-lg text-lg font-semibold inline-flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-300 mb-4"
                data-aos="fade-down"
                data-aos-duration="1000"
              >
                <span>Sign Up Now</span>
              </Link>
              
              {/* Users count section */}
              <div 
                className="flex items-center gap-3 justify-center lg:justify-start mt-4"
                data-aos="fade-up"
                data-aos-duration="1200"
              >
                <Image
                  src="/smmgen-users.webp"
                  alt="SMMGen Users"
                  width={60}
                  height={40}
                  className="rounded"
                />
                <div className="text-gray-600 font-semibold text-base">
                  <span className="text-purple-600 font-bold">30,175</span>+ Users using our services
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Login Card */}
          <div
            className="flex justify-center"
            data-aos="fade-down"
            data-aos-duration="500"
          >
            <div className="bg-white w-full p-8 rounded-2xl shadow-lg border border-gray-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Login to <span className="text-purple-600">SMMDOC.</span>
                </h2>
                <p className="text-gray-600">
                  New Here? <Link href="/signup" className="text-purple-600 font-bold hover:underline">Create an account.</Link>
                </p>
              </div>
              
              <form className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-lg text-gray-900 font-medium mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      placeholder="Username"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-lg text-gray-900 font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Password"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 text-gray-700">
                    Remember me
                  </label>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Login to Dashboard
                </button>
                
                <div className="text-center mt-4">
                  <p className="text-gray-600">
                    Lost Your Password?{' '}
                    <Link href="/reset-password" className="text-purple-600 hover:underline">
                      Reset now
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;