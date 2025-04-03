import Image from 'next/image';
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa';
import platformImage from '../../public/platform.png';

const Platform = () => {
  return (
    <section className="main-container py-20 lg:py-28 w-full">
      {/* titles */}
      <div className="w-full text-center">
        <button
          className="bg-blue text-white px-8 py-2 rounded-md uppercase dark:text-gray-300"
          data-aos="fade-down"
          data-aos-duration="1500"
        >
          SOCIAL MEDIA IS OUR BUSINESS
        </button>
        <h3
          className="text-3xl lg:text-4xl lg:w-7/12 lg:mx-auto mt-4 dark:text-gray-300"
          data-aos="fade-down"
          data-aos-duration="2000"
        >
          Providing Service in All Social Networks
        </h3>
      </div>
      {/* content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 mt-8 lg:mt-12">
        {/* text */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 lg:gap-8">
          <div
            className="bg-white dark:bg-gray-500 dark:text-gray-300 shadow rounded-md py-6 lg:py-1 px-4 flex justify-center lg:justify-start items-center gap-x-3"
            data-aos="fade-down"
            data-aos-duration="1500"
          >
            <FaInstagram className="text-2xl" />
            <span className="font-semibold text-lg">Instagram</span>
          </div>
          <div
            className="bg-white dark:bg-gray-500 dark:text-gray-300 shadow rounded-md py-6 lg:py-1 px-4 flex justify-center lg:justify-start items-center gap-x-3"
            data-aos="fade-down"
            data-aos-duration="1500"
          >
            <FaFacebook className="text-2xl" />
            <span className="font-semibold text-lg">Facebook</span>
          </div>
          <div
            className="bg-white dark:bg-gray-500 dark:text-gray-300 shadow rounded-md py-6 lg:py-1 px-4 flex justify-center lg:justify-start items-center gap-x-3"
            data-aos="fade-down"
            data-aos-duration="1500"
          >
            <FaYoutube className="text-2xl" />
            <span className="font-semibold text-lg">Youtube</span>
          </div>
          <div
            className="bg-white dark:bg-gray-500 dark:text-gray-300 shadow rounded-md py-6 lg:py-1 px-4 flex justify-center lg:justify-start items-center gap-x-3"
            data-aos="fade-down"
            data-aos-duration="1500"
          >
            <FaTiktok className="text-2xl" />
            <span className="font-semibold text-lg">Tiktok</span>
          </div>
          <div
            className="bg-white dark:bg-gray-500 dark:text-gray-300 shadow rounded-md py-6 lg:py-1 px-4 flex justify-center lg:justify-start items-center gap-x-3"
            data-aos="fade-down"
            data-aos-duration="1500"
          >
            <FaTwitter className="text-2xl" />
            <span className="font-semibold text-lg">Twitter</span>
          </div>
          <div
            className="bg-white dark:bg-gray-500 dark:text-gray-300 shadow rounded-md py-6 lg:py-1 px-4 flex justify-center lg:justify-start items-center gap-x-3"
            data-aos="fade-down"
            data-aos-duration="1500"
          >
            <FaLinkedin className="text-2xl" />
            <span className="font-semibold text-lg">LinkedIn</span>
          </div>
        </div>
        {/* image */}
        <Image
          src={platformImage}
          alt="Platform"
          placeholder="blur"
          width={500}
          height={500}
          className="rounded-lg md:mx-auto lg:ml-auto"
          data-aos="fade-down"
          data-aos-duration="1500"
        />
      </div>
    </section>
  );
};

export default Platform;
