import Image from 'next/image';
import { AiOutlineStar } from 'react-icons/ai';
import { BiSupport } from 'react-icons/bi';
import { BsPersonHearts } from 'react-icons/bs';
import { GrSecure, GrUpdate } from 'react-icons/gr';
import { TbApiOff } from 'react-icons/tb';
import whatWeOfferImage from '../../public/what-we-offer.png';

const WhatWeOffer = () => {
  return (
    <section className="py-16 lg:py-28 w-full bg-[#0d1399] mt-10 lg:mt-0">
      <div className="main-container">
        {/* titles */}
        <div className="w-full text-center">
          <button
            className="bg-blue text-white dark:bg-gray-500 dark:text-gray-400 px-8 py-2 rounded-md uppercase"
            data-aos="fade-down"
            data-aos-duration="1500"
          >
            What we offer
          </button>
          <h3
            className="text-3xl lg:text-4xl lg:w-7/12 lg:mx-auto mt-4 text-white dark:text-gray-400"
            data-aos="fade-down"
            data-aos-duration="2000"
          >
            We are help dominate social media with the largest social media
            panel
          </h3>
        </div>
        {/* content */}
        <div className="grid grid-cols-12 gap-y-4 lg:mt-24">
          {/* image */}
          <div className="col-span-12 lg:col-span-5">
            <Image
              src={whatWeOfferImage}
              alt="Platform"
              placeholder="blur"
              width={400}
              height={400}
              className="rounded-lg size-72 md:size-96 mx-auto lg:mx-0 my-3 lg:mt-0"
              data-aos="fade-down"
              data-aos-duration="1500"
            />
          </div>
          {/* text */}
          <div className="col-span-12 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-y-10 lg:gap-y-4 lg:gap-8">
            {/* item 1 */}
            <div
              className="flex gap-x-6"
              data-aos="fade-down"
              data-aos-duration="1500"
            >
              <div className="bg-blue rounded-full size-12 lg:size-16 p-3 lg:p-4 flex-shrink-0 flex justify-center items-center">
                <BsPersonHearts className="text-4xl text-white dark:text-gray-400" />
              </div>
              <div>
                <h4 className="text-white dark:text-gray-400 text-2xl font-semibold mb-2">
                  Resellers
                </h4>
                <p className="text-gray-50 dark:text-gray-400 leading-normal">
                  You can resell our services and grow your profit easily,
                  Resellers are important part of SMM PANEL
                </p>
              </div>
            </div>
            {/* item 2 */}
            <div
              className="flex gap-x-6"
              data-aos="fade-down"
              data-aos-duration="1500"
            >
              <div className="bg-blue rounded-full size-12 lg:size-16 p-3 lg:p-4 flex-shrink-0 flex justify-center items-center">
                <AiOutlineStar className="text-4xl text-white dark:text-gray-400" />
              </div>
              <div>
                <h4 className="text-white dark:text-gray-400 text-2xl font-semibold mb-2">
                  High quality services
                </h4>
                <p className="text-gray-50 dark:text-gray-400 leading-normal">
                  Get the best high quality services and in less time here
                </p>
              </div>
            </div>
            {/* item 3 */}
            <div
              className="flex gap-x-6"
              data-aos="fade-down"
              data-aos-duration="1500"
            >
              <div className="bg-blue rounded-full size-12 lg:size-16 p-3 lg:p-4 flex-shrink-0 flex justify-center items-center">
                <TbApiOff className="text-4xl text-white dark:text-gray-400" />
              </div>
              <div>
                <h4 className="text-white dark:text-gray-400 text-2xl font-semibold mb-2">
                  Api support
                </h4>
                <p className="text-gray-50 dark:text-gray-400 leading-normal">
                  We have API Support For panel owners so you can resell our
                  services easily
                </p>
              </div>
            </div>
            {/* item 4 */}
            <div
              className="flex gap-x-6"
              data-aos="fade-down"
              data-aos-duration="1500"
            >
              <div className="bg-blue rounded-full size-12 lg:size-16 p-3 lg:p-4 flex-shrink-0 flex justify-center items-center">
                <BiSupport className="text-4xl text-white dark:text-gray-400" />
              </div>
              <div>
                <h4 className="text-white dark:text-gray-400 text-2xl font-semibold mb-2">
                  Supports
                </h4>
                <p className="text-gray-50 dark:text-gray-400 leading-normal">
                  Technical support for all our services 24/7 to help you
                </p>
              </div>
            </div>
            {/* item 5 */}
            <div
              className="flex gap-x-6"
              data-aos="fade-down"
              data-aos-duration="1500"
            >
              <div className="bg-blue rounded-full size-12 lg:size-16 p-3 lg:p-4 flex-shrink-0 flex justify-center items-center">
                <GrUpdate className="text-4xl text-white dark:text-gray-400" />
              </div>
              <div>
                <h4 className="text-white dark:text-gray-400 text-2xl font-semibold mb-2">
                  Updates
                </h4>
                <p className="text-gray-50 dark:text-gray-400 leading-normal">
                  Services are updated daily In order to be further improved and
                  to provide you with best experience
                </p>
              </div>
            </div>
            {/* item 6 */}
            <div
              className="flex gap-x-6"
              data-aos="fade-down"
              data-aos-duration="1500"
            >
              <div className="bg-blue rounded-full size-12 lg:size-16 p-3 lg:p-4 flex-shrink-0 flex justify-center items-center">
                <GrSecure className="text-4xl text-white dark:text-gray-400" />
              </div>
              <div>
                <h4 className="text-white dark:text-gray-400 text-2xl font-semibold mb-2">
                  Secure Payments
                </h4>
                <p className="text-gray-50 dark:text-gray-400 leading-normal">
                  We have a Popular methods as PayPal and many more can be
                  enabled upon request
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeOffer;
