import Image from 'next/image';
import Link from 'next/link';
import heroImage from '../../public/header-hero.png';

const HeroSection = () => {
  return (
    <section className="main-container min-h-screen flex justify-center items-center mt-24 md:mt-20 lg:mt-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 2xl:gap-x-20 items-center">
        {/* Left side */}
        <div>
          <div className="text-center lg:text-left">
            <h1
              className="text-5xl font-medium mb-4 dark:text-gray-300"
              data-aos="fade-down"
              data-aos-duration="500"
            >
              The Best Social Media Panel in The Market!
            </h1>
            <p
              className="text-lg mb-6 leading-7 dark:text-gray-400"
              data-aos="fade-down"
              data-aos-duration="1000"
            >
              Manage all social media networks from a single panel, quality and
              cheap. We provide services on todays most popular social networks.
              We have Instagram, Twitter, Facebook, Youtube, TikTok, Spotify,
              and many more services.
            </p>
            <Link
              href="/sign-in"
              className="bg-blue text-white w-7/12 2xl:w-4/12 px-2 py-2.5 lg:py-3 rounded-md mx-auto lg:mx-0 text-md font-medium flex items-center justify-center space-x-2"
              data-aos="fade-down"
              data-aos-duration="1000"
            >
              <span className="dark:text-gray-300">GET START NOW</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M12 19l7-7-7-7" />
                <path d="M5 12h14" />
              </svg>
            </Link>
          </div>
        </div>
        {/* Right side */}
        <div
          className="flex justify-center"
          data-aos="fade-down"
          data-aos-duration="500"
        >
          <Image
            src={heroImage}
            alt="Hero Image"
            placeholder="blur"
            className="rounded-lg"
          />
        </div>
        <div></div>
      </div>
    </section>
  );
};

export default HeroSection;
